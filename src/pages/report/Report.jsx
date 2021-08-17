import React, { useState, useRef, useCallback, useEffect, useReducer, useContext } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu, DatePicker } from 'antd';
// import moment from 'moment';
import dayjs from 'dayjs';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import './report.less';
import { debounce } from '@/util/debounce.js';
import { UserContext } from '../../util/context';
import { mediaQuery, newsQuery, newsAdd, newsUpdate } from '../../api';

const { Option } = Select;
function Report() {
	/* 用户信息 */
	const user = useContext(UserContext);
	/* 查询参数 */
	const reducer = (state, action) => {
		switch (action.type) {
			case 'text':
				return {
					...state,
					keyword: action.payload,
					page: 0,
				};
			case 'type':
				return {
					...state,
					mediaType: action.payload,
					page: 0,
				};
			case 'time':
				return {
					...state,
					date: action.payload,
					page: 0,
				};
			case 'page':
				return {
					...state,
					page: action.payload,
				};
			case 'size':
				return {
					...state,
					size: action.payload,
					page: 0,
				};
			default:
				return state;
		}
	};
	const initialParams = {
		keyword: '',
		mediaType: '',
		date: '',
		page: 0,
		size: 10,
	};
	const [params, dispatchParams] = useReducer(reducer, initialParams);
	const [totalNum, setTotalNum] = useState('');
	const totalNumRef = useRef(null); // 左上角总数
	const [forceUpdate, setForceUpdate] = useState(0); // 操作后更新表格
	useEffect(() => {
		// 获取表格数据
		console.log(params);

		setIsShowLoading(true);
		async function getTabledata() {
			let res = await newsQuery(params);
			console.log(res);
			if (totalNumRef.current === null) {
				totalNumRef.current = res.totalElements;
			}
			setTotalNum(res.totalElements);
			setDataSource(res.content);
			setIsShowLoading(false);
		}
		getTabledata();
	}, [params, forceUpdate]);

	// 获取所有媒体
	const [allMedia, setAllMedia] = useState([]);
	useEffect(() => {
		async function getMedia() {
			let res = await mediaQuery({ all: 'all' });
			console.log('所有媒体', res.content);
			setAllMedia(res.content);
		}
		getMedia();
	}, []);

	/* 搜索 */
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
		dispatchParams({ type: 'text', payload: e.target.value.replace("'", '').trim() });
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
		setCurrentMediaType('');
	};

	// 媒体选择
	const [currentMediaType, setCurrentMediaType] = useState(''); // 保存选中、回显媒体信息
	const handleSelectMedia = (id, option) => {
		if (id) {
			let mediaName = option.children;
			let key = allMedia.filter(item => item.id === id)[0]['mediaType'];
			let label = mediaType.filter(item => item.key === key)[0]['label'];
			setCurrentMediaType(state => ({ ...state, mediaName, key, label }));
		} else {
			setCurrentMediaType('');
		}
	};

	// 日期选择
	const handleTimeChange = (date, dateString) => {
		console.log(date, dateString);
	};
	// 确定
	const [modalType, setModalType] = useState('publishStatus'); // 启用禁用首次不执行状态、弹窗，指定默认状态标识为发布状态
	const HandleAddOrChangeMedia = () => {
		addMediaRef.current
			.validateFields()
			.then(res => {
				console.log(res);
				let params;
				switch (modalType) {
					case 'add':
						params = [
							{
								title: res.title.trim(),
								mediaId: res.mediaId,
								media: currentMediaType.mediaName,
								mediaType: currentMediaType.key,
								newsDate: res.time.format('YYYY-MM-DD'),
								url: res.link.trim(),
								enableFlag: 1,
								publishFlag: 1,
								creator: user.userId,
							},
						];
						addNews(params);
						break;
					case 'change':
						// console.log('不是change么');
						params = [
							{
								id: currentMediaType.id,
								title: res.title,
								mediaId: res.mediaId,
								media: currentMediaType.mediaName,
								mediaType: currentMediaType.key,
								newsDate: res.time.format('YYYY-MM-DD'),
								url: res.link,
								enableFlag: 1,
								publishFlag: 1,
								updator: user.userId,
							},
						];
						console.log(params);
						updateNews(params);
						break;
					default:
				}
			})
			.catch(err => {
				console.log(err);
			});
	};

	// 新增
	async function addNews(params) {
		let res = await newsAdd(params);
		console.log(res);
		message.success('添加成功', 1);
		setIsShowAdd(false);
		setForceUpdate(count => count + 1);
	}
	// 删改
	let currentPublishStatus; // 判断启用禁用
	async function updateNews(params) {
		let res = await newsUpdate(params);
		console.log(res);
		if (modalType === 'change') {
			message.success('修改报道成功', 1);
			setIsShowAdd(false);
			setCurrentMediaType('');
		} else if (modalType === 'delete') {
			message.success('删除报道成功', 1);
			setIsShowDelete(false);
		} else if (modalType === 'publishStatus') {
			console.log('首次无弹窗，是否执行');
			if (currentPublishStatus === 1) {
				message.destroy();
				message.success('禁用报道成功', 2);
			}
			if (currentPublishStatus === 0) {
				message.destroy();
				message.success('启用报道成功', 2);
			}
		}
		setForceUpdate(count => count + 1);
	}

	// 表格
	const [dataSource, setDataSource] = useState([]);
	const [isShowLoading, setIsShowLoading] = useState(false);

	// for (let index = 0; index < 100; index++) {
	// 	dataSource.push({
	// 		key: index,
	// 		name: '胡彦斌',
	// 		age: 32,
	// 		address: '西湖区湖底公园1号',
	// 	});
	// }

	const mediaType = [
		{
			label: '全部',
			key: '',
		},
		{
			label: '央媒',
			key: 1,
		},
		{
			label: '省媒',
			key: 2,
		},
		{
			label: '市媒',
			key: 3,
		},
		{
			label: '区媒',
			key: 4,
		},
		{
			label: '其它',
			key: 5,
		},
	];
	const year = new Date().getFullYear();
	const postTime = [
		{
			label: '全部',
			key: '',
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
		dispatchParams({ type: 'type', payload: item.key });
	};
	const handleClickTime = item => {
		console.log('点击筛选发布时间：', item);
		dispatchParams({ type: 'time', payload: item.key });
	};

	const columns = [
		{
			title: '报道ID',
			dataIndex: 'id',
			key: 'id',
			align: 'center',
			ellipsis: true,
		},
		{
			title: '报道标题',
			dataIndex: 'title',
			key: 'title',
			align: 'center',
			ellipsis: true,
		},
		{
			title: '媒体名称',
			dataIndex: 'media',
			key: 'media',
			align: 'center',
			width: 120,
		},
		{
			title: () => (
				<>
					媒体类型
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.mediaType]}>
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
						<CaretDownOutlined
							style={
								params.mediaType
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			width: 120,
			dataIndex: 'mediaType',
			key: 'mediaType',
			align: 'center',
			render: text => mediaType.filter(item => item.key === text)[0]['label'],
		},
		{
			title: '报道链接',
			// width: 350,
			ellipsis: true,
			dataIndex: 'url',
			key: 'url',
			align: 'center',
		},
		{
			title: () => (
				<>
					发布时间
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.date]}>
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
						<CaretDownOutlined
							style={
								params.date
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'newsDate',
			key: 'newsDate',
			align: 'center',
			width: 120,
		},
		{
			title: '操作',
			align: 'center',
			width: 100,
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
							className={`iconfont icon-${t.publishFlag ? 'jinyong' : 'refresh'}`}
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
		setModalType('change');

		let mediaName = data.media;
		let key = data.mediaType;
		let label = mediaType.filter(item => item.key === key)[0]['label'];

		console.log(data.id);
		setCurrentMediaType({
			mediaName,
			key,
			label,
			id: data.id, // 保存当前行新闻 id ，作为删改参数
		});

		// console.log('点击时是否获取到Form', addMediaRef);
		setTimeout(() => {
			addMediaRef.current &&
				addMediaRef.current.setFieldsValue({
					title: data.title,
					mediaId: data.mediaId,
					mediaType: data.address,
					link: data.url,
					time: dayjs(data.newsDate),
				});
		});
	};

	// 删除对话框
	const [isShowDelete, setIsShowDelete] = useState(false); // 是否展示
	const [currentMediaData, setCurrentMediaData] = useState({}); // 当前媒体数据
	const handleClickDelete = data => {
		console.log('删除当前行', data);
		setCurrentMediaData(data);
		setIsShowDelete(true);
		setModalType('delete');
	};
	const handleCancelDeleteModal = () => {
		setIsShowDelete(false);
		setCurrentMediaData({});
	};
	const HandleDeleteMedia = () => {
		// 确认删除当前新闻
		let params = [
			{
				id: currentMediaData.id,
				title: currentMediaData.title,
				mediaId: currentMediaData.mediaId,
				media: currentMediaData.media,
				mediaType: currentMediaData.mediaType,
				newsDate: currentMediaData.newsDate,
				url: currentMediaData.url,
				enableFlag: 0,
				publishFlag: 0,
				updator: user.userId,
			},
		];
		updateNews(params);
	};

	// 切换报道禁用使用状态
	const handleClickChangeStatus = item => {
		setModalType('publishStatus');
		currentPublishStatus = item.publishFlag;
		let params = { ...item };
		console.log('启用禁用报道按钮：', item);
		console.log(params);
		delete params.createTime;
		delete params.creator;
		delete params.updateTime;
		params.updator = user.userId;
		if (params.publishFlag) {
			params.publishFlag = 0;
		} else {
			params.publishFlag = 1;
		}
		console.log(params);
		updateNews([params]);
	};

	return (
		<div className="report">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-baozhi"></span>
						<span className="sub_title">报道管理</span>
					</p>
					<p className="title_desc">现有报道：{totalNumRef.current} 篇</p>
				</div>
				<div className="header_right">
					<Input
						onChange={debounce(handleChangeSearch, 500)}
						allowClear
						size="large"
						placeholder="请输入报道或媒体名称"
						prefix={<SearchOutlined />}
					/>
					<span
						onClick={() => {
							setIsShowAdd(!isShowAdd);
							setModalType('add');
						}}
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
					// rowSelection={{
					// 	onChange: (selectedRowKeys, selectedRows) => {
					// 		console.log('表格选中数据', selectedRowKeys, selectedRows);
					// 	},
					// }}
					rowKey="id"
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
			<Modal
				visible={isShowAdd}
				onCancel={handleCancelAddModal}
				onOk={HandleAddOrChangeMedia}
				maskClosable={false}
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
						rules={[
							{
								required: true,
								message: '请输入报道标题',
								transform: value => value && value.trim(),
							},
						]}
					>
						<Input placeholder="请输入报道标题" />
					</Form.Item>
					<Form.Item
						label="媒体名称"
						name="mediaId"
						rules={[
							{
								required: true,
								message: '请选择媒体名称',
								// transform: value => value.trim(),
							},
						]}
					>
						<Select
							placeholder="请选择媒体名称"
							allowClear
							onChange={handleSelectMedia}
						>
							{allMedia.map(item => (
								<Option value={item.id} key={item.id}>
									{item.media}
								</Option>
							))}
						</Select>
					</Form.Item>

					<Form.Item label="媒体类型">
						{currentMediaType ? currentMediaType.label : '（自动匹配无需填写）'}
					</Form.Item>
					<Form.Item
						label="报道链接"
						name="link"
						rules={[
							{
								required: true,
								message: '请输入报道链接',
								transform: value => value && value.trim(),
							},
						]}
					>
						<Input placeholder="请输入报道链接" />
					</Form.Item>
					<Form.Item
						label="发布时间"
						name="time"
						rules={[{ required: true, message: '请输入发布时间' }]}
					>
						<DatePicker
							inputReadOnly={true}
							onChange={handleTimeChange}
							disabledDate={current => {
								return current && current >= dayjs().endOf('day');
							}}
						/>
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
				<div className="delete_wrap">
					<h3>是否确定删除</h3>
					<div>
						<span className="label">报道标题：</span>
						<span className="content">{currentMediaData.title}</span>
					</div>
					<div>
						<span className="label">媒体名称及类型：</span>
						<span className="content">
							{currentMediaData.media}&nbsp;-&nbsp;
							{currentMediaData.mediaType &&
								mediaType.filter(
									item => item.key === currentMediaData.mediaType
								)[0]['label']}
						</span>
					</div>
					<div>
						<span className="label">报道链接：</span>
						<span className="content">{currentMediaData.url}</span>
					</div>
					<div>
						<span className="label">发布时间：</span>
						<span className="content">{currentMediaData.newsDate}</span>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default Report;
