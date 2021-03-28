import axios from "axios";
require("dotenv").config();

const port = process.env.PORT || 9000;
const instance = axios.create({
  baseURL: `http://localhost:${port}`,
});

export default instance;
