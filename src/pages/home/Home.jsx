import React, { useState, useContext } from 'react';
import { HashRouter, Redirect, Route, Switch } from 'react-router-dom';
import { Layout, Dropdown, Menu } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import LeftNav from './component/LeftNav';
import Media from '@/pages/media/Media.jsx';
import Report from '@/pages/report/Report.jsx';
import Slider from '@/pages/slider/Slider.jsx';
import Log from '@/pages/log/Log.jsx';
import './main.less';
import { UserContext } from '../../util/context';

const { Header, Content, Sider } = Layout;

function Home() {
	const [isNavFold, setIsNavFold] = useState(false); // 导航栏展开收起

	// 用户信息
	const user = useContext(UserContext);
	// 用户下拉框
	const userLogout = (
		<Menu>
			<Menu.Item key="1">
				<span>退出系统</span>
			</Menu.Item>
		</Menu>
	);

	return (
		<div className="home">
			<Layout style={{ minHeight: '100%' }}>
				<Header className="header">
					<div className="header_left">
						<div className="toggle_fold" onClick={() => setIsNavFold(!isNavFold)}>
							{isNavFold ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						</div>
						<h1 className="title">宝安政数后台管理系统</h1>
					</div>
					{/* <Dropdown overlay={userLogout}> */}
					<div className="header_right">
						<span className="iconfont icon-yonghu"></span>
						<div className="user">{'欢迎，' + (user?user.name:'用户')}</div>
					</div>
					{/* </Dropdown> */}
				</Header>
				<Layout>
					<Sider width={isNavFold ? 0 : 200} className="site-layout-background">
						<LeftNav />
					</Sider>
					<Layout style={{ padding: '0 24px 24px' }}>
						<Content
							className="site-layout-background"
							style={{
								padding: 24,
								margin: 0,
								minHeight: 280,
							}}
						>
							{user ? (
								// 获取到用户信息才渲染组件，避免请求头中无用户信息
								<HashRouter>
									<Switch>
										<Route path="/media" component={Media}></Route>
										<Route path="/report" component={Report}></Route>
										<Route path="/slider" component={Slider}></Route>
										<Route path="/log" component={Log}></Route>
										<Redirect to="/media" />
									</Switch>
								</HashRouter>
							) : null}
						</Content>
					</Layout>
				</Layout>
			</Layout>
		</div>
	);
}

export default Home;
