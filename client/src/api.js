import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  withCredentials: true,
});

// Products API
export const fetchProducts = () => API.get('/api/products');
export const addProduct = (productData) => API.post('/api/products', productData);
export const deleteProduct = (id) => API.delete(`/api/products/${id}`);

// Admin API
export const loginAdmin = (credentials) => API.post('/api/admin/login', credentials);

// Cloudinary upload
export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET);
  
  return axios.post(
    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
    formData
  );
};

// Add authorization header to requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});