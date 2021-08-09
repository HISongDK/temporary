import React, { useState, useReducer, useEffect } from 'react';
import { Table, Input, Dropdown, Menu, DatePicker } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { operateModule, operateObject, operateAction, operateResult } from './config.js';
import './log.less';

const { RangePicker } = DatePicker;

function Slider() {
	/* 查询参数 */
	const reducer = (state, action) => {
		switch (action.type) {
			case 'text':
				return {
					...state,
					text: action.payload,
				};
			case 'type':
				return {
					...state,
					type: action.payload,
				};
			case 'time':
				return {
					...state,
					time: action.payload,
				};
			case 'status':
				return {
					...state,
					status: action.payload,
				};
			default:
				return state;
		}
	};
	const initialParams = {
		text: '',
		type: '',
		time: '',
		status: '',
	};
	const [params, dispatchParams] = useReducer(reducer, initialParams);

	useEffect(() => {
		// TODO: 筛选参数改动 请求表格数据
		console.log(params);
	}, [params]);

	/* 搜索 */
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
	};
	/* 时间选择 */
	const timeChange = (dateMoment, dateString) => {
		console.log(dateMoment, dateString);
	};

	/* 表格 */
	const [dataSource, setDataSource] = useState([]);
	const [isShowLoading, setIsShowLoading] = useState(false);
	// 改变每页条数
	const [currentPageSize, setCurretPageSize] = useState(10);

	for (let index = 0; index < 15; index++) {
		dataSource.push({
			key: index,
			name: '胡彦斌',
			age: 32,
			address: '西湖区湖底公园1号',
		});
	}

	const handleClickType = item => {
		console.log('点击筛选媒体类型：', item);
		dispatchParams({ type: 'type', payload: item.key });
	};
	const handleClickTime = item => {
		console.log('点击筛选发布时间：', item);
		dispatchParams({ type: 'time', payload: item.key });
	};
	const handleClickStatus = item => {
		console.log('点击筛选状态：', item);
		dispatchParams({ type: 'status', payload: item.key });
	};

	const columns = [
		{
			title: '用户',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作模块
					<Dropdown
						trigger="click"
						overlay={
							<Menu
								// TODO: 默认选中项参数字段可能需调整
								selectedKeys={[params.type || 'all']}
							>
								{operateModule.map(item => (
									<Menu.Item
										onClick={item => {
											handleClickType(item);
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined style={{ marginLeft: '10px' }} />
					</Dropdown>
				</>
			),
			dataIndex: 'key',
			key: 'age',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作对象
					<Dropdown
						trigger="click"
						overlay={
							<Menu
								// TODO: 默认选中项参数字段可能需调整
								selectedKeys={[params.type || 'all']}
							>
								{operateObject.map(item => (
									<Menu.Item
										onClick={item => {
											handleClickType(item);
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined style={{ marginLeft: '10px' }} />
					</Dropdown>
				</>
			),
			dataIndex: 'key',
			key: 'age',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作行为
					<Dropdown
						trigger="click"
						overlay={
							<Menu
								// TODO: 默认选中项参数字段可能需调整
								selectedKeys={[params.type || 'all']}
							>
								{operateAction.map(item => (
									<Menu.Item
										onClick={item => {
											handleClickType(item);
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined style={{ marginLeft: '10px' }} />
					</Dropdown>
				</>
			),
			dataIndex: 'address',
			key: 'address',
			align: 'center',
		},
		{
			title: '操作详情',
			dataIndex: 'address',
			key: 'address',
			align: 'center',
		},
		{
			title: '操作时间',
			dataIndex: 'address',
			key: 'address',
			align: 'center',
			sorter: (a, b) => {
				console.log(a, b);
				return a.key - b.key;
			},
		},
		{
			title: () => (
				<>
					操作结果
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.status || 'all']}>
								{operateResult.map(item => (
									<Menu.Item
										onClick={item => {
											handleClickStatus(item);
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined style={{ marginLeft: '10px' }} />
					</Dropdown>
				</>
			),
			dataIndex: 'name',
			key: 'status',
			align: 'center',
		},
	];

	return (
		<div className="log">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-log"></span>
						<span className="sub_title">系统日志</span>
					</p>
					<p className="title_desc">现有日志记录：{} 条</p>
				</div>
				<div className="header_right">
					<RangePicker
						size="large"
						onChange={(dateMoment, dateString) => timeChange(dateMoment, dateString)}
					/>
					<Input
						onChange={handleChangeSearch}
						allowClear
						size="large"
						placeholder="请输入报道或媒体名称"
						prefix={<SearchOutlined />}
					/>
				</div>
			</header>
			<main>
				<Table
					dataSource={dataSource}
					columns={columns}
					size="small"
					bordered
					loading={isShowLoading}
					rowSelection={{
						onChange: (selectedRowKeys, selectedRows) => {
							console.log('表格选中数据', selectedRowKeys, selectedRows);
						},
					}}
					pagination={{
						pageSize: currentPageSize,
						showQuickJumper: true,
						// total: dataSource.length,
						showTotal: total => `共 ${total} 条`,
						showSizeChanger: true,
						onShowSizeChange: (current, size) => {
							console.log('改变每页条数', current, size);
							setCurretPageSize(size);
						},
						onChange: (page, pageSize) => {
							console.log('点击分页:', page, pageSize);
						},
					}}
				/>
			</main>
		</div>
	);
}

export default Slider;
