import axios from "axios";

const isDevelopment = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '172.168.1.143';

const backendBaseUrl = isDevelopment 
  ? `${window.location.protocol}//${window.location.hostname}:8989`
  : ''; 

const api = axios.create({
  baseURL: backendBaseUrl || '/api', 
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
  const res = await api.post("/auth/nonce", { email });
  return res.data.nonce;
}

export async function loginUser(email, password) {
  const nonce = await fetchNonce(email);
  return await api.post("/auth/login", { email, password, nonce });
}

export async function registerUser(email, password) {
  const nonce = await fetchNonce(email);
  return await api.post("/auth/register", { email, password, nonce });
}

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
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function deleteDive(id) {
  const response = await api.delete(`/dives/${id}`);
  return response.data;
}

export async function getDiverProfile() {
  const response = await api.get("/auth/profile");
  return response.data;
}

export async function getImageUrl(imagePath) {
  if (!imagePath) return null;
  if (isDevelopment) {
    return `${backendBaseUrl}${imagePath}`;
  }
  return imagePath;
}

export async function getEquipmentCloset() {
  try {
    const response = await api.get("/equipment");
    console.log("Equipment API response:", response); 
    return response.data;
  } catch (error) {
    console.error("Error fetching equipment closet:", error);
    return [];
  }
}

export async function addEquipmentItem(equipmentData) {
  const response = await api.post("/equipment", equipmentData);
  console.log("Add equipment response:", response);
  return response.data;
}

export async function removeEquipmentItem(id) {
  const response = await api.delete(`/equipment/${id}`);
  return response.data;
}