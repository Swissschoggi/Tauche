import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
})

export const getAllDives = () => api.get('/dives')
export const getDiveById = (id) => api.get(`/dives/${id}`)
export const createDive = (dive) => api.post('/dives', dive)
export const updateDive = (id, dive) => api.put(`/dives/${id}`, dive)
export const deleteDive = (id) => api.delete(`/dives/${id}`)