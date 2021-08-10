import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route } from 'react-router-dom';
import Home from '@/pages/home/Home.jsx';
import '@/assets/style/normalize.css';
import '@/assets/iconfont/iconfont.css';
import 'antd/dist/antd.less';
import axios from 'axios';
import { getUserData } from './api';
import { UserContext } from '@/util/context.js';

function App() {
	const [userData, setUserData] = useState(null);

	useEffect(() => {
		// 获取用户信息
		axios.get(window.location.href).then(res => {
			if (res.headers['x-tif-uid']) {
				let uid = res.headers['x-tif-uid'];
				uid = 'blhtijx4jd73jo51cd4ztb';
				getAuthorityData(uid);
			}
		});
		// 测试开发
		let uid = 'blhtijx4jd73jo51cd4ztb';
		getAuthorityData(uid);
	}, []);

	async function getAuthorityData(uid) {
		let res = await getUserData(uid);
		// console.log(res);
		setUserData(res.data);
	}

	// const UserContext = React.createContext();
	// console.log(UserContext);

	return (
		<Router>
			<UserContext.Provider>
				<Route path="/" component={Home} />
			</UserContext.Provider>
		</Router>
	);
}

export default App;
