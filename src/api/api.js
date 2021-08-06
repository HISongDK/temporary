// import { message } from "antd";
import { service } from "./service";


const Request = (url, params = {}, type = "GET") => {
  return new Promise((resolve, reject) => {
    let promise;
    if (type === "GET") {
      promise = service.get(url, { params });
    } else {
      promise = service.post(url, { params });
    }

    promise
      .then((res) => {
        console.log("请求成功", res);
        console.log("数据内容", res.data.data);
        resolve(res.data.data);
      })
      .catch((err) => {
        console.log("请求失败", err.message);
        // message.destroy();
        // message.error("请求失败 " + err);
        reject(err);
      });
  });
  
};

export default Request;
