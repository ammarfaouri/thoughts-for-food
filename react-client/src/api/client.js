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
  return http.get("/api/auth/me").then(unwrapData);
}

export function refreshAuth() {
  return http.post("/api/auth/refresh").then((response) => {
    const data = unwrapData(response);
    setAccessToken(data.accessToken);
    return data;
  });
}

export function login(credentials) {
  return http.post("/api/auth/login", credentials).then((response) => {
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

export function signUp(user) {
  return http.post("/api/auth/register", user).then((response) => {
    const data = unwrapData(response);
    setAccessToken(data.accessToken);
    return data;
  });
}

export function getUserProfile(username) {
  return http.get(`/api/users/${username}`).then(unwrapData);
}

export function getRecipes() {
  return http.get("/api/recipes").then(unwrapData);
}

export function getRecipe(id) {
  return http.get(`/api/recipes/${id}`).then(unwrapData);
}

export function createRecipe(recipe) {
  return http.post("/api/recipes", recipe).then(unwrapData);
}

export function updateRecipe(id, recipe) {
  return http.put(`/api/recipes/${id}`, recipe).then(unwrapData);
}

export function deleteRecipe(id) {
  return http.delete(`/api/recipes/${id}`);
}

function unwrapData(response) {
  return response.data.data;
}
