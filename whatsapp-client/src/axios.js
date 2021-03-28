import axios from "axios";
require("dotenv").config();

const instance = axios.create({
  baseURL: `https://korhan-whatsapp-clone.herokuapp.com/`,
  timeout: 5000,
});

export default instance;
