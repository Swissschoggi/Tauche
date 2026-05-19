import axios from "axios";

const API_BASE = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("user_session_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getAllDives() {
  const response = await api.get("/dives");
  return response.data;
}

export async function getDiveById(id) {
  const response = await api.get(`/dives/${id}`);
  return response.data;
}

export async function createDive(diveData) {
  const response = await api.post("/dives", diveData);
  return response.data;
}

export async function updateDive(id, payload) {
  const response = await api.put(`/dives/${id}`, payload);
  return response.data;
}

export async function uploadDiveImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await api.post(`/dives/${id}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteDive(id) {
  const response = await api.delete(`/dives/${id}`);
  return response.data;
}

export async function loginUser(email, password) {
  return await axios.post(`${API_BASE}/auth/login`, { email, password });
}

export async function registerUser(email, password) {
  return await axios.post(`${API_BASE}/auth/register`, { email, password });
}

export async function getDiverProfile() {
  const response = await api.get("/auth/profile");
  return response.data;
}