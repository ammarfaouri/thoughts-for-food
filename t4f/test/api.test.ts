import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { AuthService } from "../src/application/auth/AuthService";
import { TokenService } from "../src/application/auth/TokenService";
import { RecipeService } from "../src/application/recipes/RecipeService";
import { UserProfileService } from "../src/application/users/UserProfileService";
import {
  InMemoryRefreshTokenRepository,
  InMemoryRecipeRepository,
  InMemoryUserRepository,
} from "./support/inMemoryRepositories";

function createTestApp() {
  const users = new InMemoryUserRepository();
  const recipes = new InMemoryRecipeRepository(users);
  const refreshTokens = new InMemoryRefreshTokenRepository(users);

  return createApp({
    enableLogger: false,
    enableRateLimit: false,
    services: {
      authService: new AuthService(users),
      tokenService: new TokenService(refreshTokens),
      recipeService: new RecipeService(recipes),
      userProfileService: new UserProfileService(users, recipes),
    },
  });
}

const userPayload = {
  firstName: "Ammar",
  lastName: "Faouri",
  username: "ammar",
  email: "ammar@example.com",
  password: "password123",
};

const recipePayload = {
  name: "Pizza",
  author: "client-author-is-ignored",
  description: "Simple pizza",
  prepTime: 45,
  difficulty: 3,
  ingredients: [{ amount: 500, unit: "g", name: "Flour" }],
  method: ["Mix dough", "Bake pizza"],
  tags: ["Dinner", "Italian", "italian"],
};

async function register(agent: request.SuperAgentTest, payload = userPayload) {
  const response = await agent.post("/api/auth/register").send(payload).expect(201);
  return response.body.data.accessToken as string;
}

describe("API", () => {
  it("exposes health and readiness routes", async () => {
    const app = createTestApp();

    const response = await request(app).get("/health").expect(200, {
      status: "ok",
      service: "thoughts-for-food-api",
    });

    expect(response.headers["x-request-id"]).toBeTruthy();
  });

  it("exposes the OpenAPI contract", async () => {
    const response = await request(createTestApp()).get("/openapi.json").expect(200);

    expect(response.body.info.title).toBe("Thoughts for Food API");
    expect(response.body.paths).toHaveProperty("/api/recipes");
    expect(response.body.components.schemas).toHaveProperty("Recipe");
  });

  it("exposes basic HTTP metrics", async () => {
    const app = createTestApp();

    await request(app).get("/health").expect(200);
    const response = await request(app).get("/metrics").expect(200);

    expect(response.text).toContain("t4f_http_requests_total");
    expect(response.text).toContain('method="GET"');
    expect(response.text).toContain('status="200"');
  });

  it("returns a structured 404 for unknown routes", async () => {
    const response = await request(createTestApp())
      .get("/missing")
      .set("x-request-id", "test-request-id")
      .expect(404);

    expect(response.body).toMatchObject({
      code: "NOT_FOUND",
      message: "Route GET /missing was not found",
      requestId: "test-request-id",
    });
    expect(response.headers["x-request-id"]).toBe("test-request-id");
  });

  it("registers a user, returns an access token, and hides profile email", async () => {
    const agent = request.agent(createTestApp());

    const accessToken = await register(agent);

    const me = await agent
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(200);
    expect(me.body.data.user.username).toBe("ammar");

    const profile = await agent.get("/api/users/ammar").expect(200);
    expect(profile.body.data).toMatchObject({
      firstName: "Ammar",
      lastName: "Faouri",
      recipes: [],
    });
    expect(profile.body.data.email).toBeUndefined();
  });

  it("requires authentication before creating recipes", async () => {
    await request(createTestApp()).post("/api/recipes").send(recipePayload).expect(401);
  });

  it("creates and reads recipes using the access token user as author", async () => {
    const agent = request.agent(createTestApp());
    const accessToken = await register(agent);

    const created = await agent
      .post("/api/recipes")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(recipePayload)
      .expect(201);
    const recipe = await agent.get(`/api/recipes/${created.body.data.id}`).expect(200);

    expect(recipe.body.data).toMatchObject({
      id: created.body.data.id,
      name: "Pizza",
      author: "ammar",
      description: "Simple pizza",
      prepTime: 45,
      difficulty: 3,
      tags: ["dinner", "italian"],
    });
  });

  it("updates and deletes recipes through the clean API", async () => {
    const agent = request.agent(createTestApp());

    const registerResponse = await agent
      .post("/api/auth/register")
      .send(userPayload)
      .expect(201);

    const accessToken = registerResponse.body.data.accessToken as string;

    const created = await agent
      .post("/api/recipes")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(recipePayload)
      .expect(201);

    expect(created.body.data).toMatchObject({
      id: expect.any(String),
      name: "Pizza",
      author: "ammar",
      tags: ["dinner", "italian"],
    });
    expect(created.body.data._id).toBeUndefined();

    const recipe = await agent.get(`/api/recipes/${created.body.data.id}`).expect(200);

    expect(recipe.body.data).toMatchObject({
      id: created.body.data.id,
      name: "Pizza",
      author: "ammar",
    });

    const updated = await agent
      .put(`/api/recipes/${created.body.data.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ ...recipePayload, name: "Updated Pizza" })
      .expect(200);

    expect(updated.body.data.name).toBe("Updated Pizza");

    await agent
      .delete(`/api/recipes/${created.body.data.id}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);
  });

  it("does not expose legacy product routes", async () => {
    const app = createTestApp();

    await request(app).get("/recipes").expect(404);
    await request(app)
      .post("/login")
      .send({ username: "ammar", password: "password123" })
      .expect(404);
    await request(app).post("/auth/register").send(userPayload).expect(404);
    await request(app).get("/auth/me").expect(404);
    await request(app).get("/logged").expect(404);
    await request(app).get("/users/ammar").expect(404);
    await request(app).get("/api/v1/recipes").expect(404);
  });

  it("filters recipe lists by query params", async () => {
    const agent = request.agent(createTestApp());
    const accessToken = await register(agent);

    await agent
      .post("/api/recipes")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(recipePayload)
      .expect(201);
    await agent
      .post("/api/recipes")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ...recipePayload,
        name: "Slow Stew",
        description: "Long cooked dinner",
        prepTime: 120,
        difficulty: 5,
        tags: ["Dinner", "Comfort"],
      })
      .expect(201);

    const response = await agent
      .get("/api/recipes")
      .query({ search: "pizza", difficulty: 3, maxPrepTime: 60, tag: "Italian" })
      .expect(200);

    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      name: "Pizza",
      author: "ammar",
      tags: ["dinner", "italian"],
    });
  });

  it("rejects invalid recipe list query params", async () => {
    const response = await request(createTestApp())
      .get("/api/recipes")
      .query({ difficulty: 10 })
      .expect(400);

    expect(response.body).toMatchObject({
      code: "VALIDATION_ERROR",
      requestId: expect.any(String),
      details: expect.arrayContaining([expect.objectContaining({ path: "difficulty" })]),
    });
  });

  it("rejects recipe updates from non-owners", async () => {
    const app = createTestApp();
    const owner = request.agent(app);
    const otherUser = request.agent(app);

    const ownerAccessToken = await register(owner);
    const created = await owner
      .post("/api/recipes")
      .set("Authorization", `Bearer ${ownerAccessToken}`)
      .send(recipePayload)
      .expect(201);

    const otherAccessToken = await register(otherUser, {
      ...userPayload,
      username: "sara",
      email: "sara@example.com",
    });

    await otherUser
      .put(`/api/recipes/${created.body.data.id}`)
      .set("Authorization", `Bearer ${otherAccessToken}`)
      .send({ ...recipePayload, name: "Stolen Pizza" })
      .expect(401);
  });

  it("rotates refresh tokens and rejects reused refresh tokens", async () => {
    const app = createTestApp();
    const agent = request.agent(app);

    const registerResponse = await agent
      .post("/api/auth/register")
      .send(userPayload)
      .expect(201);
    const originalCookie = registerResponse.headers["set-cookie"][0];

    const refreshResponse = await agent.post("/api/auth/refresh").expect(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();

    await request(app)
      .post("/api/auth/refresh")
      .set("Cookie", originalCookie)
      .expect(401);
  });

  it("revokes refresh tokens on logout", async () => {
    const agent = request.agent(createTestApp());
    await register(agent);

    await agent.post("/api/auth/logout").expect(204);
    await agent.post("/api/auth/refresh").expect(401);
  });
});
