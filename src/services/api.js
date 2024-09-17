import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/',  // Substitua pelo caminho do seu backend CodeIgniter
});

export default api;
