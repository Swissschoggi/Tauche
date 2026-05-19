import axios from "axios";
import CryptoJS from "crypto-js";

let apiInstance = null;

async function getApi() {
  if (apiInstance) return apiInstance;

  try {
    const response = await fetch('/api/config');
    const config = await response.json();
    const url = `${window.location.protocol}//${window.location.hostname}:${config.BACKEND_PORT}`;
    
    apiInstance = axios.create({ baseURL: url });
    apiInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("user_session_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    
    return apiInstance;
  } catch (e) {
    apiInstance = axios.create({ baseURL: `${window.location.protocol}//${window.location.hostname}:8080` });
    return apiInstance;
  }
}

export async function getAllDives() {
  const api = await getApi();
  const response = await api.get("/api/dives");
  return response.data;
}

export async function getDiveById(id) {
  const api = await getApi();
  const response = await api.get(`/api/dives/${id}`);
  return response.data;
}

export async function createDive(diveData) {
  const api = await getApi();
  const response = await api.post("/api/dives", diveData);
  return response.data;
}

export async function updateDive(id, payload) {
  const api = await getApi();
  const response = await api.put(`/api/dives/${id}`, payload);
  return response.data;
}

export async function uploadDiveImage(id, file) {
  const api = await getApi();
  const formData = new FormData();
  formData.append("image", file);
  
  const response = await api.post(`/api/dives/${id}/upload-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function deleteDive(id) {
  const api = await getApi();
  const response = await api.delete(`/api/dives/${id}`);
  return response.data;
}

export async function loginUser(email, password) {
  const api = await getApi();
  const hashedPassword = CryptoJS.SHA256(password).toString();
  return await api.post(`/api/auth/login`, { email, password: hashedPassword });
}

export async function registerUser(email, password) {
  const api = await getApi();
  const hashedPassword = CryptoJS.SHA256(password).toString();
  return await api.post(`/api/auth/register`, { email, password: hashedPassword });
}

export async function getDiverProfile() {
  const api = await getApi();
  const response = await api.get("/api/auth/profile");
  return response.data;
}