export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Thoughts for Food API",
    version: "2.0.0",
    description:
      "Recipe-sharing API using JWT access tokens and rotating HTTP-only refresh tokens. Recipe responses preserve legacy frontend fields such as `_id` while the backend uses PostgreSQL internally.",
  },
  servers: [{ url: "http://localhost:5000" }],
  tags: [{ name: "System" }, { name: "Auth" }, { name: "Users" }, { name: "Recipes" }],
  paths: {
    "/health": {
      get: {
        tags: ["System"],
        summary: "Basic service health",
        responses: {
          "200": {
            description: "Service process is alive",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" },
              },
            },
          },
        },
      },
    },
    "/ready": {
      get: {
        tags: ["System"],
        summary: "Readiness check including database connectivity",
        responses: {
          "200": {
            description: "Service is ready to receive traffic",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ReadyResponse" },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/openapi.json": {
      get: {
        tags: ["System"],
        summary: "OpenAPI contract",
        responses: {
          "200": { description: "OpenAPI document" },
        },
      },
    },
    "/metrics": {
      get: {
        tags: ["System"],
        summary: "Prometheus-style HTTP metrics",
        responses: {
          "200": {
            description: "Plain text HTTP counters",
            content: {
              "text/plain": {
                schema: { type: "string" },
              },
            },
          },
        },
      },
    },
    "/users": {
      post: {
        tags: ["Users"],
        summary: "Legacy alias for registering a user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUserRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created and token pair issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { description: "Username or email already exists" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/users/{username}": {
      get: {
        tags: ["Users"],
        summary: "Get a public user profile and recipe summaries",
        parameters: [{ $ref: "#/components/parameters/Username" }],
        responses: {
          "200": {
            description: "Public profile",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/UserProfile" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Legacy alias for logging in",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in and token pair issued",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { description: "Invalid password" },
          "404": { description: "User does not exist" },
          "429": { description: "Too many authentication attempts" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/logged": {
      get: {
        tags: ["Auth"],
        summary: "Legacy alias returning the current access-token username",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description:
              "Current username as plain text for legacy frontend compatibility",
            content: {
              "text/plain": {
                schema: { type: "string", example: "ammar" },
              },
            },
          },
          "404": { description: "No active session" },
        },
      },
    },
    "/logout": {
      post: {
        tags: ["Auth"],
        summary: "Legacy alias for revoking the current refresh token",
        responses: {
          "200": { description: "Logged out" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user and issue tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterUserRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created and token pair issued",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "HTTP-only refresh token cookie",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "409": { description: "Username or email already exists" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and issue tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Logged in and token pair issued",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "HTTP-only refresh token cookie",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { description: "Invalid password" },
          "404": { description: "User does not exist" },
          "429": { description: "Too many authentication attempts" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate refresh token and issue a new access token",
        responses: {
          "200": {
            description: "Token pair rotated",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "New HTTP-only refresh token cookie",
              },
            },
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/AuthResponse" },
              },
            },
          },
          "401": { description: "Missing, expired, invalid, or reused refresh token" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Revoke the current refresh token",
        responses: {
          "200": { description: "Logged out" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Return the current access-token user",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Authenticated user",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MeResponse" },
              },
            },
          },
          "401": { description: "Authentication required" },
        },
      },
    },
    "/recipes": {
      get: {
        tags: ["Recipes"],
        summary: "List recipes",
        parameters: [
          {
            name: "search",
            in: "query",
            schema: { type: "string", minLength: 1, maxLength: 120 },
            description: "Case-insensitive search over recipe name and description",
          },
          {
            name: "difficulty",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 5 },
          },
          {
            name: "maxPrepTime",
            in: "query",
            schema: { type: "integer", minimum: 1 },
            description: "Maximum preparation time in minutes",
          },
          {
            name: "author",
            in: "query",
            schema: { type: "string", minLength: 1, maxLength: 32 },
          },
          {
            name: "tag",
            in: "query",
            schema: { type: "string", minLength: 1, maxLength: 32 },
            description: "Exact normalized recipe tag match",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 50, default: 20 },
          },
          {
            name: "offset",
            in: "query",
            schema: { type: "integer", minimum: 0, default: 0 },
          },
        ],
        responses: {
          "200": {
            description: "Recipe list",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Recipe" },
                },
              },
            },
          },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      post: {
        tags: ["Recipes"],
        summary: "Create a recipe",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecipeDraft" },
            },
          },
        },
        responses: {
          "201": {
            description:
              "Created recipe ID as plain text for legacy frontend compatibility",
            content: {
              "text/plain": {
                schema: { type: "string", format: "uuid" },
              },
            },
          },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { description: "Authentication required" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
    "/recipes/{id}": {
      get: {
        tags: ["Recipes"],
        summary: "Get a recipe by ID",
        parameters: [{ $ref: "#/components/parameters/RecipeId" }],
        responses: {
          "200": {
            description: "Recipe details",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Recipe" },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      put: {
        tags: ["Recipes"],
        summary: "Update a recipe owned by the current user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RecipeId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RecipeDraft" },
            },
          },
        },
        responses: {
          "200": { description: "Updated" },
          "400": { $ref: "#/components/responses/ValidationError" },
          "401": { description: "Authentication required or not recipe owner" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
      delete: {
        tags: ["Recipes"],
        summary: "Delete a recipe owned by the current user",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/RecipeId" }],
        responses: {
          "200": { description: "Deleted" },
          "401": { description: "Authentication required or not recipe owner" },
          "404": { $ref: "#/components/responses/NotFound" },
          "500": { $ref: "#/components/responses/InternalServerError" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    parameters: {
      RecipeId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
      Username: {
        name: "username",
        in: "path",
        required: true,
        schema: { type: "string", example: "ammar" },
      },
    },
    responses: {
      ValidationError: {
        description: "Request validation failed",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
      InternalServerError: {
        description: "Unexpected server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ErrorResponse" },
          },
        },
      },
    },
    schemas: {
      HealthResponse: {
        type: "object",
        required: ["status", "service"],
        properties: {
          status: { type: "string", example: "ok" },
          service: { type: "string", example: "thoughts-for-food-api" },
        },
      },
      ReadyResponse: {
        type: "object",
        required: ["status", "database"],
        properties: {
          status: { type: "string", example: "ready" },
          database: { type: "string", example: "reachable" },
        },
      },
      Ingredient: {
        type: "object",
        required: ["amount", "unit", "name"],
        properties: {
          amount: { type: "number", example: 500 },
          unit: { type: "string", example: "g" },
          name: { type: "string", example: "Flour" },
        },
      },
      RecipeDraft: {
        type: "object",
        required: [
          "name",
          "description",
          "prepTime",
          "difficulty",
          "ingredients",
          "method",
        ],
        properties: {
          name: { type: "string", example: "Pizza" },
          description: { type: "string", example: "Simple pizza dough" },
          prepTime: { type: "integer", minimum: 1, example: 45 },
          difficulty: { type: "integer", minimum: 1, maximum: 5, example: 3 },
          ingredients: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/Ingredient" },
          },
          method: {
            type: "array",
            minItems: 1,
            items: { type: "string" },
            example: ["Mix dough", "Bake until crisp"],
          },
          tags: {
            type: "array",
            maxItems: 10,
            items: { type: "string", minLength: 1, maxLength: 32 },
            example: ["dinner", "italian"],
          },
        },
      },
      Recipe: {
        allOf: [
          { $ref: "#/components/schemas/RecipeDraft" },
          {
            type: "object",
            required: ["_id", "author"],
            properties: {
              _id: { type: "string", format: "uuid" },
              author: { type: "string", example: "ammar" },
            },
          },
        ],
      },
      RecipeSummary: {
        type: "object",
        required: ["_id", "name", "author", "description"],
        properties: {
          _id: { type: "string", format: "uuid" },
          name: { type: "string", example: "Pizza" },
          author: { type: "string", example: "ammar" },
          description: { type: "string", example: "Simple pizza dough" },
        },
      },
      RegisterUserRequest: {
        type: "object",
        required: ["firstName", "lastName", "username", "email", "password"],
        properties: {
          firstName: { type: "string", example: "Ammar" },
          lastName: { type: "string", example: "Faouri" },
          username: { type: "string", minLength: 3, example: "ammar" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["username", "password"],
        properties: {
          username: { type: "string", example: "ammar" },
          password: { type: "string" },
        },
      },
      AuthUser: {
        type: "object",
        required: ["id", "username"],
        properties: {
          id: { type: "string", format: "uuid" },
          username: { type: "string", example: "ammar" },
        },
      },
      AuthResponse: {
        type: "object",
        required: ["accessToken", "user"],
        properties: {
          accessToken: { type: "string", description: "Short-lived JWT access token" },
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      MeResponse: {
        type: "object",
        required: ["user"],
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" },
        },
      },
      UserProfile: {
        type: "object",
        required: ["firstName", "lastName", "recipesInfo"],
        properties: {
          firstName: { type: "string", example: "Ammar" },
          lastName: { type: "string", example: "Faouri" },
          recipesInfo: {
            type: "array",
            items: { $ref: "#/components/schemas/RecipeSummary" },
          },
        },
      },
      ErrorResponse: {
        type: "object",
        required: ["code", "message", "requestId"],
        properties: {
          code: { type: "string", example: "VALIDATION_ERROR" },
          message: { type: "string", example: "Invalid request" },
          requestId: {
            type: "string",
            example: "0f4e7d58-9fd5-4e60-9e88-c68bbadfc67b",
          },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string", example: "difficulty" },
                message: {
                  type: "string",
                  example: "Number must be less than or equal to 5",
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
