import axios from "axios";

const http = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

export function getLoggedUser() {
  return http.get("/logged");
}

export function login(credentials) {
  return http.post("/login", credentials);
}

export function logout() {
  return http.get("/logout");
}

export function signUp(user) {
  return http.post("/users", user);
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
