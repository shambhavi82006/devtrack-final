import axios from "axios";

const api = axios.create({
  baseURL: "https://devtrack-final.onrender.com/api",
  withCredentials: true,
});

export default api;