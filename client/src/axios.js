import axios from "axios";
require("dotenv").config();

const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://korhan-whatsapp-clone.herokuapp.com/api"
    : "http://localhost:9000/api";

const instance = axios.create({
  baseURL: `${API_URL}`,
  timeout: 5000,
});

export default instance;
