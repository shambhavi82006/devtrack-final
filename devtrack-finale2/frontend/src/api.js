import axios from "axios";

const api = axios.create({
  baseURL: "https://devtrack-final.onrender.com",
});

export default api;