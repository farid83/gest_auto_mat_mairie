// csrfClient.js
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const csrfClient = axios.create({
  baseURL: BACKEND_URL, // 🟢 pas de `/api`
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
});

export default csrfClient;