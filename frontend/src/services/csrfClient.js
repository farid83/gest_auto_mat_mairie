import axios from 'axios';

const isLocal = window.location.hostname === 'localhost';
const BACKEND_URL = isLocal 
  ? 'http://localhost:8000' 
  : process.env.REACT_APP_BACKEND_URL;

const csrfClient = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
});

export default csrfClient;