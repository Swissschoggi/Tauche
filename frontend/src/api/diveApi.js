import axios from "axios";

const backendBaseUrl = `${window.location.protocol}//${window.location.hostname}:8989`;

const api = axios.create({
  baseURL: backendBaseUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("user_session_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

async function fetchNonce(email) {
  const res = await api.post("/api/auth/nonce", { email });
  return res.data.nonce;
}

export async function loginUser(email, password) {
  const nonce = await fetchNonce(email);
  // Send raw password and nonce. No client-side hashing!
  return await api.post("/api/auth/login", { email, password, nonce });
}

export async function registerUser(email, password) {
  const nonce = await fetchNonce(email);
  // Send raw password and nonce.
  return await api.post("/api/auth/register", { email, password, nonce });
}

export async function getAllDives() {
  const response = await api.get("/api/dives");
  return response.data;
}

export async function getDiveById(id) {
  const response = await api.get(`/api/dives/${id}`);
  return response.data;
}

export async function createDive(diveData) {
  const response = await api.post("/api/dives", diveData);
  return response.data;
}

export async function updateDive(id, payload) {
  const response = await api.put(`/api/dives/${id}`, payload);
  return response.data;
}

export async function uploadDiveImage(id, file) {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.post(`/api/dives/${id}/upload-image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteDive(id) {
  const response = await api.delete(`/api/dives/${id}`);
  return response.data;
}

export async function getDiverProfile() {
  const response = await api.get("/api/auth/profile");
  return response.data;
}

export async function getImageUrl(imagePath) {
  if (!imagePath) return null;
  return `${backendBaseUrl}${imagePath}`;
}

export async function getEquipmentCloset() {
  try {
    const response = await api.get("/api/equipment");
    console.log("Equipment API response:", response); 
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment closet:", error);
    return [];
  }
}

export async function addEquipmentItem(equipmentData) {
  const response = await api.post("/api/equipment", equipmentData);
  console.log("Add equipment response:", response);
  return response.data;
}

export async function removeEquipmentItem(id) {
  const response = await api.delete(`/api/equipment/${id}`);
  return response.data;
}