import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Menu } from 'antd';
import './leftNav.less';

function LeftNav() {
	const routes = [
		{
			title: '媒体管理',
			path: '/media',
			icon: 'meitihao',
		},
		{
			title: '报道管理',
			path: '/report',
			icon: 'baozhi',
		},
		{
			title: '轮播图管理',
			path: '/slider',
			icon: 'font29',
		},
		{
			title: '系统日志',
			path: '/log',
			icon: 'log',
		},
	];

	const history = useHistory();
	const [path, setPath] = useState(routes[0].path);
	useEffect(() => {
		setPath(history.location.pathname);
	}, [history.location.pathname]);

	return (
		<>
			<Menu
				mode="inline"
				selectedKeys={[path]}
				style={{ height: '100%', borderRight: 0, fontSize: '20px !important' }}
			>
				{routes.map(item => (
					<Menu.Item
						icon={<span className={`iconfont icon-${item.icon}`} />}
						key={item.path}
					>
						<Link to={item.path}>{item.title}</Link>
					</Menu.Item>
				))}
			</Menu>
		</>
	);
}

export default LeftNav;
