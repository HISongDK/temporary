import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Home from '@/pages/home/Home.jsx';
import '@/assets/style/normalize.css';
import '@/assets/iconfont/iconfont.css';
import 'antd/dist/antd.less';
import axios from 'axios';
import { getUserData } from './api';
import { UserContext } from '@/util/context.js';
import { AES } from './util/Aes';

function App() {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		// 获取用户 ID
		axios.get(window.location.href).then(res => {
			if (res.headers['x-tif-uid']) {
				let uid = res.headers['x-tif-uid'];
				getAuthorityData(uid);
			} else {
				// 测试开发
				let uid = window.TEST_UID;
				getAuthorityData(uid);
			}
		});
		// 获取用户信息
		async function getAuthorityData(uid) {
			let res = await getUserData(uid);
			window.user = res; // 定义全局变量，获取用户信息放入请求头
			res.name = AES.decrypt(res.userName);
			setUserData(res);
		}
	}, []);

	return (
		<Router>
			<UserContext.Provider value={userData}>
				<Route path="/" component={Home} />
			</UserContext.Provider>
		</Router>
	);
}

export default App;
