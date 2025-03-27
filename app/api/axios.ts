import { GetConfiguration } from "@/configurations";
import axios from "axios";

const Axios = axios.create({
  baseURL:  GetConfiguration('socket.url'),
  withCredentials: true,
});

Axios.interceptors.request.use(
  (config) => {
    console.log("Request sent:", config);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

export default Axios;
