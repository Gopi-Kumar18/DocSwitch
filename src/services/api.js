import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api`,
  withCredentials: true
});
// console.log("Base URL : ",import.meta.env.VITE_BACKEND_URL);


api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized request');
    }
    return Promise.reject(error);
  }
);

export default api;