import axios from 'axios';

// Base URL for the VehiclePartsApi backend
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7159/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
