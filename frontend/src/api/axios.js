import axios from 'axios';

const API = axios.create({
  baseURL: 'https://team-task-manager-production-80fa.up.railway.app/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;