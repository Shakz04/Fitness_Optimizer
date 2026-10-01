import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" }
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("fitness_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap(response) {
  return response.data;
}

export const api = {
  signup: (payload) => apiClient.post("/auth/signup", payload).then(unwrap),
  login: (payload) => apiClient.post("/auth/login", payload).then(unwrap),
  me: () => apiClient.get("/me").then(unwrap),
  onboarding: (payload) => apiClient.post("/onboarding", payload).then(unwrap),
  foods: () => apiClient.get("/foods").then(unwrap),
  parse: (text) => apiClient.post("/parse-constraints", { text }).then(unwrap),
  mealPlan: (payload) => apiClient.post("/meal-plans/generate", payload).then(unwrap),
  mealPlans: () => apiClient.get("/meal-plans").then(unwrap),
  mealPlanById: (id) => apiClient.get(`/meal-plans/${id}`).then(unwrap),
  trainingSplit: (payload) => apiClient.post("/training-splits/generate", payload).then(unwrap),
  trainingSplits: () => apiClient.get("/training-splits").then(unwrap),
  logWorkout: (payload) => apiClient.post("/workout-logs", payload).then(unwrap),
  workoutLogs: (exercise) => apiClient.get(`/workout-logs/${encodeURIComponent(exercise)}`).then(unwrap),
  checkPlateau: (payload) => apiClient.post("/plateaus/check", payload).then(unwrap),
  plateaus: () => apiClient.get("/plateaus").then(unwrap),
  resolvePlateau: (id) => apiClient.patch(`/plateaus/${id}/resolve`).then(unwrap)
};
