import axios from "axios";

let accessToken = "";

const http = axios.create({
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export function setAccessToken(token) {
  accessToken = token || "";
}

export function clearAccessToken() {
  accessToken = "";
}

export function getAccessToken() {
  return accessToken;
}

export function getMe() {
  return http.get("/auth/me");
}

export function refreshAuth() {
  return http.post("/auth/refresh").then((response) => {
    setAccessToken(response.data.accessToken);
    return response;
  });
}

export function login(credentials) {
  return http.post("/auth/login", credentials).then((response) => {
    setAccessToken(response.data.accessToken);
    return response;
  });
}

export function logout() {
  return http.post("/auth/logout").finally(() => {
    clearAccessToken();
  });
}

export function signUp(user) {
  return http.post("/auth/register", user).then((response) => {
    setAccessToken(response.data.accessToken);
    return response;
  });
}

export function getUserProfile(username) {
  return http.get(`/users/${username}`);
}

export function getRecipes() {
  return http.get("/recipes");
}

export function getRecipe(id) {
  return http.get(`/recipes/${id}`);
}

export function createRecipe(recipe) {
  return http.post("/recipes", recipe);
}

export function updateRecipe(id, recipe) {
  return http.put(`/recipes/${id}`, recipe);
}

export function deleteRecipe(id) {
  return http.delete(`/recipes/${id}`);
}
