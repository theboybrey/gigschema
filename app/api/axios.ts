import { configurations } from "@/configurations";
import axios from "axios";

const Axios = axios.create({
  baseURL: configurations.socket.url,
  withCredentials: true,
});

export default Axios;
