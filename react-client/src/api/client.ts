import axios, {
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  ApiEnvelope,
  AuthResponse,
  LoginCredentials,
  Recipe,
  RecipeDraft,
  RegisterUserInput,
  UserProfile,
} from "./types";

let accessToken = "";

const http = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export function setAccessToken(token: string | null | undefined) {
  accessToken = token || "";
}

export function clearAccessToken() {
  accessToken = "";
}

export function getAccessToken() {
  return accessToken;
}

export function getMe(): Promise<{ user: AuthResponse["user"] }> {
  return http.get<ApiEnvelope<{ user: AuthResponse["user"] }>>("/api/auth/me").then(unwrapData);
}

export function refreshAuth(): Promise<AuthResponse> {
  return http.post<ApiEnvelope<AuthResponse>>("/api/auth/refresh").then((response) => {
    const data = unwrapData(response);
    setAccessToken(data.accessToken);
    return data;
  });
}

export function login(credentials: LoginCredentials): Promise<AuthResponse> {
  return http.post<ApiEnvelope<AuthResponse>>("/api/auth/login", credentials).then((response) => {
    const data = unwrapData(response);
    setAccessToken(data.accessToken);
    return data;
  });
}

export function logout() {
  return http.post("/api/auth/logout").finally(() => {
    clearAccessToken();
  });
}

export function signUp(user: RegisterUserInput): Promise<AuthResponse> {
  return http.post<ApiEnvelope<AuthResponse>>("/api/auth/register", user).then((response) => {
    const data = unwrapData(response);
    setAccessToken(data.accessToken);
    return data;
  });
}

export function getUserProfile(username: string): Promise<UserProfile> {
  return http.get<ApiEnvelope<UserProfile>>(`/api/users/${username}`).then(unwrapData);
}

export function getRecipes(): Promise<Recipe[]> {
  return http.get<ApiEnvelope<Recipe[]>>("/api/recipes").then(unwrapData);
}

export function getRecipe(id: string): Promise<Recipe> {
  return http.get<ApiEnvelope<Recipe>>(`/api/recipes/${id}`).then(unwrapData);
}

export function createRecipe(recipe: RecipeDraft): Promise<Recipe> {
  return http.post<ApiEnvelope<Recipe>>("/api/recipes", recipe).then(unwrapData);
}

export function updateRecipe(id: string, recipe: RecipeDraft): Promise<Recipe> {
  return http.put<ApiEnvelope<Recipe>>(`/api/recipes/${id}`, recipe).then(unwrapData);
}

export function deleteRecipe(id: string) {
  return http.delete(`/api/recipes/${id}`);
}

function unwrapData<T>(response: AxiosResponse<ApiEnvelope<T>>) {
  return response.data.data;
}
