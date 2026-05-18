import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to our Express backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the JWT token
api.interceptors.request.use(
  (config) => {
    // Pull the token directly from local storage
    const storageStr = localStorage.getItem('auth-storage');
    if (storageStr) {
      const storageObj = JSON.parse(storageStr);
      const token = storageObj?.state?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
