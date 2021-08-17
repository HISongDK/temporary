import { service } from './service';
import { message } from 'antd';

const Request = (url, params = {}, type = 'GET') => {
	return new Promise((resolve, reject) => {
		let promise;
		switch (type.toUpperCase()) {
			case 'GET':
				promise = service.get(url, {
					params,
					headers: window.user
						? {
								'Cw-Principal': window.user?.userId,
								'CW-PrincipalName': window.user?.userName,
						  }
						: null,
				});
				break;
			case 'POST':
				promise = service.post(url, params, {
					headers: window.user
						? {
								'Cw-Principal': window.user?.userId,
								'CW-PrincipalName': window.user?.userName,
						  }
						: null,
				});
				break;
			case 'PUT':
				promise = service.put(url, params, {
					headers: window.user
						? {
								'Cw-Principal': window.user?.userId,
								'CW-PrincipalName': window.user?.userName,
						  }
						: null,
				});
				break;
			default:
		}

		promise
			.then(res => {
				// console.log('请求成功', res);
				// console.log('数据内容', res.data.data);
				resolve(res.data.data);
			})
			.catch(err => {
				// console.log('请求失败', err);
				message.destroy();
				message.error('请求失败，请重试 ' + err.message, 3);
				reject(err);
			});
	});
};

export default Request;
