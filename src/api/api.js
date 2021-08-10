// import { message } from "antd";
import { service } from './service';

const Request = (url, params = {}, type = 'GET') => {
	return new Promise((resolve, reject) => {
		let promise;
		switch (type.toUpperCase()) {
			case 'GET':
				promise = service.get(url, { params });
				break;
			case 'POST':
				promise = service.post(url, params);
				break;
			case 'PUT':
				promise = service.put(url, params);
				break;
			default:
		}

		promise
			.then(res => {
				console.log('请求成功', res);
				console.log('数据内容', res.data.data);
				resolve(res.data.data);
			})
			.catch(err => {
				console.log('请求失败', err.message);
				// message.destroy();
				// message.error("请求失败 " + err);
				reject(err);
			});
	});
};

export default Request;
