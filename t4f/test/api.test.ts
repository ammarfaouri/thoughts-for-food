import session from "express-session";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";
import { AuthService } from "../src/application/auth/AuthService";
import { RecipeService } from "../src/application/recipes/RecipeService";
import { UserProfileService } from "../src/application/users/UserProfileService";
import {
  InMemoryRecipeRepository,
  InMemoryUserRepository,
} from "./support/inMemoryRepositories";

function createTestApp() {
  const users = new InMemoryUserRepository();
  const recipes = new InMemoryRecipeRepository(users);

  return createApp({
    sessionStore: new session.MemoryStore(),
    sessionSecret: "test-session-secret",
    enableLogger: false,
    enableRateLimit: false,
    secureCookies: false,
    services: {
      authService: new AuthService(users),
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
};

describe("API", () => {
  it("exposes health and readiness routes", async () => {
    const app = createTestApp();

    await request(app).get("/health").expect(200, {
      status: "ok",
      service: "thoughts-for-food-api",
    });
  });

  it("exposes the OpenAPI contract", async () => {
    const response = await request(createTestApp()).get("/openapi.json").expect(200);

    expect(response.body.info.title).toBe("Thoughts for Food API");
    expect(response.body.paths).toHaveProperty("/recipes");
    expect(response.body.components.schemas).toHaveProperty("Recipe");
  });

  it("returns a structured 404 for unknown routes", async () => {
    const response = await request(createTestApp()).get("/missing").expect(404);

    expect(response.body).toMatchObject({
      code: "NOT_FOUND",
      message: "Route GET /missing was not found",
    });
  });

  it("registers a user, stores the session, and hides profile email", async () => {
    const agent = request.agent(createTestApp());

    await agent.post("/users").send(userPayload).expect(201);

    const logged = await agent.get("/logged").expect(200);
    expect(logged.text).toBe("ammar");

    const profile = await agent.get("/users/ammar").expect(200);
    expect(profile.body).toMatchObject({
      firstName: "Ammar",
      lastName: "Faouri",
      recipesInfo: [],
    });
    expect(profile.body.email).toBeUndefined();
  });

  it("requires authentication before creating recipes", async () => {
    await request(createTestApp()).post("/recipes").send(recipePayload).expect(401);
  });

  it("creates and reads recipes using the authenticated user as author", async () => {
    const agent = request.agent(createTestApp());
    await agent.post("/users").send(userPayload).expect(201);

    const created = await agent.post("/recipes").send(recipePayload).expect(201);
    const recipe = await agent.get(`/recipes/${created.text}`).expect(200);

    expect(recipe.body).toMatchObject({
      _id: created.text,
      name: "Pizza",
      author: "ammar",
      description: "Simple pizza",
      prepTime: 45,
      difficulty: 3,
    });
  });

  it("rejects recipe updates from non-owners", async () => {
    const app = createTestApp();
    const owner = request.agent(app);
    const otherUser = request.agent(app);

    await owner.post("/users").send(userPayload).expect(201);
    const created = await owner.post("/recipes").send(recipePayload).expect(201);

    await otherUser
      .post("/users")
      .send({
        ...userPayload,
        username: "sara",
        email: "sara@example.com",
      })
      .expect(201);

    await otherUser
      .put(`/recipes/${created.text}`)
      .send({ ...recipePayload, name: "Stolen Pizza" })
      .expect(401);
  });
});
