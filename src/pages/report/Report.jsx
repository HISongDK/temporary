import React, { useState, useRef, useCallback, useEffect, useReducer } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu, DatePicker } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import './report.less';

const { Option } = Select;
function Report() {
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
			default:
				return state;
		}
	};
	const initialParams = {
		text: '',
		type: '',
		time: '',
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
	/* 增改报道对话框 */
	const [isShowAdd, setIsShowAdd] = useState(false);
	const addMediaRef = useRef(null);
	const getMediaRef = useCallback(node => {
		// 动态获取每次重载的 增改 对话框 DOM
		if (node) addMediaRef.current = node;
	}, []);
	const handleCancelAddModal = () => {
		setIsShowAdd(false);
	};
	// 日期选择
	const handleTimeChange = (date, dateString) => {
		console.log(date, dateString);
	};
	const HandleAddOrChangeMedia = () => {
		addMediaRef.current
			.validateFields()
			.then(res => {
				console.log(res);

				// TODO: 添加接口
				if (200) {
					message.success('添加成功', 1);
					setIsShowAdd(false);
				}
			})
			.catch(err => {
				console.log(err);
			});
	};

	// 表格
	const [dataSource, setDataSource] = useState([]);
	const [isShowLoading, setIsShowLoading] = useState(false);

	for (let index = 0; index < 100; index++) {
		dataSource.push({
			key: index,
			name: '胡彦斌',
			age: 32,
			address: '西湖区湖底公园1号',
		});
	}

	const mediaType = [
		{
			label: '全部',
			key: 'all',
		},
		{
			label: '央媒',
			key: '1',
		},
		{
			label: '省媒',
			key: '2',
		},
		{
			label: '市媒',
			key: '3',
		},
		{
			label: '其它',
			key: '4',
		},
	];
	const year = new Date().getFullYear();
	const postTime = [
		{
			label: '全部',
			key: 'all',
		},
		{
			label: year,
			key: year,
		},
		{
			label: year - 1,
			key: year - 1,
		},
		{
			label: year - 2,
			key: year - 2,
		},
		{
			label: year - 3,
			key: year - 3,
		},
		{
			label: '其它',
			key: 'other',
		},
	];
	const handleClickType = item => {
		console.log('点击筛选媒体类型：', item);
		dispatchParams({type:'type',payload:item.key})
	};
	const handleClickTime = item => {
		console.log('点击筛选发布时间：', item);
		dispatchParams({type:'time',payload:item.key})
	};

	const columns = [
		{
			title: '报道ID',
			dataIndex: 'name',
			key: 'name',
			align: 'center',
		},
		{
			title: '报道标题',
			dataIndex: 'key',
			key: 'age',
			align: 'center',
		},
		{
			title: '媒体名称',
			dataIndex: 'key',
			key: 'age',
			align: 'center',
		},
		{
			title: () => (
				<>
					媒体类型
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.type || 'all']}>
								{mediaType.map(item => (
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
			title: '报道链接',
			dataIndex: 'address',
			key: 'address',
			align: 'center',
		},
		{
			title: () => (
				<>
					发布时间
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.time || 'all']}>
								{postTime.map(item => (
									<Menu.Item
										onClick={item => {
											handleClickTime(item);
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
			title: '操作',
			align: 'center',

			render: (t, r, i) => {
				// console.log(t, r, i);
				return (
					<div className="operate_wrap">
						<span
							onClick={() => handleClickEdit(t)}
							className="edit iconfont icon-bi"
						></span>
						<span
							onClick={() => handleClickChangeStatus(t)}
							className={`iconfont icon-${t.age === 32 ? 'jinyong' : 'refresh'}`}
						></span>
						<span
							onClick={() => handleClickDelete(t)}
							className="delete iconfont icon-lajitong"
						></span>
					</div>
				);
			},
		},
	];

	// 编辑
	const handleClickEdit = data => {
		console.log('编辑当前行', data);
		setIsShowAdd(true);

		console.log('点击时是否获取到Form', addMediaRef);
		setTimeout(() => {
			addMediaRef.current &&
				addMediaRef.current.setFieldsValue({
					mediaName: data.name,
					mediaType: data.address,
				});
		});
	};

	// 确认删除对话框
	const [isShowDelete, setIsShowDelete] = useState(false); // 是否展示
	const [currentMediaData, setCurrentMediaData] = useState({}); // 当前媒体数据
	const handleClickDelete = data => {
		console.log('删除当前行', data);
		setCurrentMediaData(data);
		setIsShowDelete(true);
	};
	const handleCancelDeleteModal = () => {
		setIsShowDelete(false);
	};
	const HandleDeleteMedia = () => {
		//  TODO:确认删除当前媒体
	};
	// 切换报道禁用使用状态
	// const [isDisableReport,setIsDisableReport] = useState(false)
	// TODO: 报道禁用启用状态不能本地模拟 用接口数据标识判断更改
	const handleClickChangeStatus = item => {
		console.log('启用禁用报道按钮：', item);
	};
	// 改变每页条数
	const [currentPageSize, setCurretPageSize] = useState(10);

	return (
		<div className="report">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-baozhi"></span>
						<span className="sub_title">报道管理</span>
					</p>
					<p className="title_desc">现有报道：{} 篇</p>
				</div>
				<div className="header_right">
					<Input
						onChange={handleChangeSearch}
						allowClear
						size="large"
						placeholder="请输入报道或媒体名称"
						prefix={<SearchOutlined />}
					/>
					<span
						onClick={() => setIsShowAdd(!isShowAdd)}
						className="iconfont icon-add-sy"
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
			<Modal
				visible={isShowAdd}
				onCancel={handleCancelAddModal}
				onOk={HandleAddOrChangeMedia}
				title="增改报道"
				cancelText="取消"
				okText="确定"
				centered
				destroyOnClose
			>
				<Form
					ref={getMediaRef}
					name="basic"
					labelCol={{ span: 6 }}
					wrapperCol={{ span: 16 }}
					// initialValues={{ remember: true }}
				>
					<Form.Item
						label="报道标题"
						name="title"
						rules={[{ required: true, message: '请输入报道标题' }]}
					>
						<Input placeholder="请输入报道或媒体名称" />
					</Form.Item>
					<Form.Item
						label="媒体名称"
						name="mediaName"
						rules={[{ required: true, message: '请选择媒体名称' }]}
					>
						<Select placeholder="请选择媒体名称" allowClear>
							<Option value="male">male</Option>
							<Option value="female">female</Option>
							<Option value="other">other</Option>
						</Select>
					</Form.Item>

					<Form.Item
						label="媒体类型"
						// name="mediaType"
						// rules={[{ required: true, message: '请选择媒体类型' }]}
					>
						（自动匹配无需填写）
					</Form.Item>
					<Form.Item
						label="报道链接"
						name="link"
						rules={[{ required: true, message: '请输入报道链接' }]}
					>
						<Input placeholder="请输入报道链接" />
					</Form.Item>
					<Form.Item
						label="发布时间"
						name="time"
						rules={[{ required: true, message: '请输入发布时间' }]}
					>
						<DatePicker inputReadOnly={false} onChange={handleTimeChange} />
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				wrapClassName="delete_modal"
				visible={isShowDelete}
				onCancel={handleCancelDeleteModal}
				onOk={HandleDeleteMedia}
				title="删除报道"
				cancelText="取消"
				okText="确定"
				okButtonProps={{ danger: true }}
				centered
				destroyOnClose
			>
				<div className="delete_media_wrap">
					<h3>是否确定删除</h3>
					<p>
						报道标题：<span>{currentMediaData.name}</span>
					</p>
					<p>
						媒体名称及类型：
						<span>
							{currentMediaData.name}-{currentMediaData.name}
						</span>
					</p>
					<p>
						报道链接：<span>{currentMediaData.name}</span>
					</p>
					<p>
						发布时间：<span>{currentMediaData.name}</span>
					</p>
				</div>
			</Modal>
		</div>
	);
}

export default Report;
