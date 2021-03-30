import axios from "axios";
require("dotenv").config();
// @ts-check
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://korhan-whatsapp-clone.herokuapp.com/"
    : "http://localhost:9000/";
// @ts-check
const instance = axios.create({
  baseURL: `${API_URL}`,
  timeout: 5000,
});

export default instance;
