import React, { useState, useReducer, useEffect, useRef } from 'react';
import { Table, Input, Dropdown, Menu, DatePicker } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { reducer, operateModule, operateObject, operateAction, operateResult } from './config.js';
import { logQuery } from '../../api/index.js';
import { debounce } from '@/util/debounce.js';
import './log.less';
import { AES } from '../../util/Aes.js';

const { RangePicker } = DatePicker;

function Slider() {
	/* 查询参数 */
	const initialParams = {
		keyword: '',
		source: '',
		object: '',
		behavior: '',
		result: '',
		startTime: '',
		endTime: '',
		page: 0,
		size: 10,
	};
	const [params, dispatchParams] = useReducer(reducer, initialParams);
	const totalNumRef = useRef(null); // 左上角总数
	const [totalNum, setTotalNum] = useState('');
	useEffect(() => {
		// 获取表格数据
		console.log(params);

		setIsShowLoading(true);
		async function getLogData() {
			let res = await logQuery(params);
			console.log(res);

			// 初始获取总数
			if (totalNumRef.current === null) {
				totalNumRef.current = res.totalElements;
			}
			// 每次筛选获取当前分页总数
			setTotalNum(res.totalElements);
			res.content.forEach(item => {
				item.userName = AES.decrypt(item.userName);
			});
			setDataSource(res.content);
			setIsShowLoading(false);
		}
		getLogData();
	}, [params]);

	/* 搜索 */
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
		dispatchParams({ type: 'keyword', payload: e.target.value.replace("'", '') });
	};
	/* 时间选择 */
	const timeChange = dateMoment => {
		if (dateMoment) {
			dispatchParams({
				type: 'startTime',
				payload: dateMoment[0].format('YYYYMMDD') + '000000',
			});
			dispatchParams({
				type: 'endTime',
				payload: dateMoment[1].format('YYYYMMDD') + '000000',
			});
		} else {
			dispatchParams({ type: 'startTime', payload: '' });
			dispatchParams({ type: 'endTime', payload: '' });
		}
	};

	/* 表格 */
	const [dataSource, setDataSource] = useState([]);
	const [isShowLoading, setIsShowLoading] = useState(false);

	const columns = [
		{
			title: '用户',
			dataIndex: 'userName',
			key: 'userName',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作模块
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.source]}>
								{operateModule.map(item => (
									<Menu.Item
										onClick={item => {
											dispatchParams({ type: 'source', payload: item.key });
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined
							style={
								params.source
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'source',
			key: 'source',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作对象
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.object]}>
								{operateObject.map(item => (
									<Menu.Item
										onClick={item => {
											dispatchParams({ type: 'object', payload: item.key });
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined
							style={
								params.object
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'object',
			key: 'object',
			align: 'center',
		},
		{
			title: () => (
				<>
					操作行为
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.behavior]}>
								{operateAction.map(item => (
									<Menu.Item
										onClick={item => {
											dispatchParams({ type: 'behavior', payload: item.key });
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined
							style={
								params.behavior
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'behavior',
			key: 'behavior',
			align: 'center',
		},
		{
			title: '操作详情',
			dataIndex: 'details',
			key: 'details',
			align: 'center',
			// width:300,
			// ellipsis: true,
		},
		{
			title: '操作时间',
			dataIndex: 'time',
			key: 'time',
			align: 'center',
			sorter: (a, b) => {
				console.log(a, b);
				return (
					b.time.replaceAll('-', '').replaceAll(':', '').replace(' ', '') -
					a.time.replaceAll('-', '').replaceAll(':', '').replace(' ', '')
				);
			},
		},
		{
			title: () => (
				<>
					操作结果
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.result]}>
								{operateResult.map(item => (
									<Menu.Item
										onClick={item => {
											dispatchParams({ type: 'result', payload: item.key });
										}}
										key={item.key}
									>
										{item.label}
									</Menu.Item>
								))}
							</Menu>
						}
					>
						<CaretDownOutlined
							style={
								params.result
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'result',
			key: 'result',
			align: 'center',
			render: text =>
				text === 'Success' ? (
					<div className="success">{'成功'}</div>
				) : (
					<div className="fail">{'失败'}</div>
				),
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
					<p className="title_desc">现有日志记录：{totalNumRef.current} 条</p>
				</div>
				<div className="header_right">
					<RangePicker
						size="large"
						onChange={(dateMoment, dateString) => timeChange(dateMoment, dateString)}
					/>
					<Input
						onChange={debounce(handleChangeSearch, 500)}
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
					rowKey="id"
					bordered
					loading={isShowLoading}
					rowSelection={{
						onChange: (selectedRowKeys, selectedRows) => {
							console.log('表格选中数据', selectedRowKeys, selectedRows);
						},
					}}
					pagination={{
						current: params.page + 1,
						pageSize: params.size,
						showQuickJumper: true,
						total: totalNum,
						showTotal: total => `共 ${total} 条`,
						showSizeChanger: true,
						onShowSizeChange: (current, size) => {
							console.log('改变每页条数', current, size);
							dispatchParams({ type: 'size', payload: size });
						},
						onChange: (page, pageSize) => {
							console.log('点击分页:', page, pageSize);
							dispatchParams({ type: 'page', payload: page - 1 });
						},
					}}
				/>
			</main>
		</div>
	);
}

export default Slider;
