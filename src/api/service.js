import axios from "axios";

console.log("当前请求地址：",window.BASE_URL);

const service = axios.create({
  baseURL: window.BASE_URL
});

export { service };
