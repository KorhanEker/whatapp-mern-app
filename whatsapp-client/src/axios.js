import axios from "axios";
require("dotenv").config();

const port = process.env.PORT || 9000;
const instance = axios.create({
  baseURL: `https://korhan-whatsapp-clone.herokuapp.com/api/`,
  timeout: 5000,
});

export default instance;
