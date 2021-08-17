import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { debounce } from '@/util/debounce.js';
import './media.less';
import { mediaAdd, mediaQuery, mediaUpdate } from '../../api';
import { UserContext } from '../../util/context';

const { Option } = Select;

function Media() {
	const user = useContext(UserContext); // 获取用户信息

	const [text, setText] = useState(''); // 搜索框文本
	const [type, setType] = useState(''); // 媒体类型
	const [page, setPage] = useState(0); // 页码
	const [currentPageSize, setCurretPageSize] = useState(10); // 改变每页条数
	const [totalNum, setTotalNum] = useState('');
	const [forceUpdate, setForceUpdate] = useState(0);

	// 获取数据
	const totalNumRef = useRef(null); // 左上角总数
	useEffect(() => {
		let params = {
			page: page,
			size: currentPageSize,
			mediaName: text,
			mediaType: type,
		};

		setIsShowLoading(true);
		async function getMedia() {
			let result = await mediaQuery(params);

			if (totalNumRef.current === null) {
				totalNumRef.current = result.totalElements;
			}
			setTotalNum(result.totalElements);
			setDataSource(result.content);
			setIsShowLoading(false);
		}
		getMedia();
	}, [page, currentPageSize, text, type, forceUpdate]);

	// 搜索框
	const handleChangeSearch = e => {
		// console.log('搜索框变动', e.target.value);
		setText(e.target.value.replace("'", '').trim()); // 替换 ' 输入法分隔符为空
		setPage(0);
	};

	// 增改媒体对话框
	const [isShowAdd, setIsShowAdd] = useState(false);
	const [addOrChange, setAddOrChange] = useState(''); // 判断添加或修改
	const [currentMediaData, setCurrentMediaData] = useState({}); // 当前行媒体数据

	const addMediaRef = useRef(null);
	const getMediaRef = useCallback(node => {
		// 动态获取每次重载的 增改 对话框 DOM
		if (node) addMediaRef.current = node;
	}, []);
	const handleCancelAddModal = () => {
		setIsShowAdd(false);
	};
	const HandleAddOrChangeMedia = () => {
		addMediaRef.current
			.validateFields()
			.then(res => {
				console.log(res);

				let params;
				switch (addOrChange) {
					case 'add':
						// 添加媒体
						params = [
							{
								media: res.mediaName.trim(),
								mediaType: res.mediaType,
								creator: user.userId,
								enableFlag: 1,
							},
						];
						addMedia(params);
						break;
					case 'change':
						// 编辑媒体
						params = [
							{
								id: currentMediaData.id,
								media: res.mediaName,
								mediaType: mediaType.filter(
									item =>
										item.label === res.mediaType || item.key === res.mediaType
								)[0]['key'],
								updator: user.userId,
								enableFlag: 1,
							},
						];
						updateMeida(params);
						break;
					default:
				}
			})
			.catch(err => {
				console.log(err);
			});
	};
	async function addMedia(params) {
		let res = await mediaAdd(params);
		console.log(res);
		message.success('添加成功', 1);
		setIsShowAdd(false);
		setForceUpdate(count => count + 1);
	}

	async function updateMeida(params) {
		let res = await mediaUpdate(params);
		console.log(res);
		if (addOrChange === 'change') {
			message.success('修改媒体成功', 1);
			setIsShowAdd(false);
		} else if (addOrChange === 'delete') {
			message.success('删除媒体成功', 1);
			setIsShowDelete(false);
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
	const handleClickType = item => {
		console.log('点击筛选媒体类型：', item);
		setType(item.key);
		setPage(0);
	};
	const columns = [
		{
			title: '媒体ID',
			dataIndex: 'id',
			key: 'id',
			align: 'center',
			// width: 400,
			ellipsis: true,
		},
		{
			title: '媒体名称',
			dataIndex: 'media',
			key: 'media',
			align: 'center',
		},
		{
			title: () => (
				<>
					媒体类型
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[type]}>
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
								type && type !== 'all'
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'mediaType',
			key: 'mediaType',
			align: 'center',
			render: text => {
				for (let item of mediaType) {
					if (text === item.key) {
						return <span>{item.label}</span>;
					}
				}
			},
		},
		{
			title: '创建时间',
			dataIndex: 'createTime',
			key: 'createTime',
			align: 'center',
		},
		{
			title: '操作',
			align: 'center',
			width: 150,
			render: (t, r, i) => {
				// console.log(t, r, i);
				return (
					<div className="operate_wrap">
						<span
							onClick={() => handleClickEdit(t)}
							className="edit iconfont icon-bi"
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

	const handleClickEdit = data => {
		data.mediaTypeLabel = mediaType.filter(item => item.key === data.meidaType);
		console.log('编辑当前行', data);
		setCurrentMediaData(data);
		setIsShowAdd(true);
		setAddOrChange('change');

		console.log('点击时是否获取到Form', addMediaRef);
		setTimeout(() => {
			addMediaRef.current &&
				addMediaRef.current.setFieldsValue({
					mediaName: data.media,
					mediaType: (() => {
						for (let item of mediaType) {
							if (item.key === data.mediaType) {
								return item.label;
							}
						}
					})(),
				});
		});
	};

	// 确认删除对话框
	const [isShowDelete, setIsShowDelete] = useState(false); // 是否展示
	const handleClickDelete = data => {
		data.mediaTypeLabel = mediaType.filter(item => item.key === data.mediaType)[0]['label'];
		console.log('删除当前行', data);
		setCurrentMediaData(data);
		setAddOrChange('delete');
		setIsShowDelete(true);
	};
	const handleCancelDeleteModal = () => {
		setIsShowDelete(false);
	};
	const HandleDeleteMedia = () => {
		// 删除媒体
		let params = [
			{
				id: currentMediaData.id,
				media: currentMediaData.mediaName,
				mediaType: currentMediaData.mediaType,
				updator: user.userId,
				enableFlag: 0,
			},
		];
		updateMeida(params);
	};

	return (
		<div className="media">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-meitihao"></span>
						<span className="sub_title">媒体管理</span>
					</p>
					<p className="title_desc">现有媒体：{totalNumRef.current} 个</p>
				</div>
				<div className="header_right">
					<Input
						onChange={debounce(handleChangeSearch, 500)}
						allowClear
						size="large"
						placeholder="请输入媒体名称"
						prefix={<SearchOutlined />}
					/>
					<span
						onClick={() => {
							setIsShowAdd(!isShowAdd);
							setAddOrChange('add');
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
					rowKey="id"
					loading={isShowLoading}
					// rowSelection={{
					// 	onChange: (selectedRowKeys, selectedRows) => {
					// 		console.log('表格选中数据', selectedRowKeys, selectedRows);
					// 	},
					// }}
					pagination={{
						current: page + 1,
						pageSize: currentPageSize,
						showQuickJumper: true,
						total: totalNum,
						showTotal: total => `共 ${total} 条`,
						showSizeChanger: true,
						onShowSizeChange: (current, size) => {
							console.log('改变每页条数', current, size);
							setCurretPageSize(size);
						},
						onChange: (page, pageSize) => {
							console.log('点击分页:', page, pageSize);
							setPage(page - 1);
						},
					}}
				/>
			</main>
			<Modal
				visible={isShowAdd}
				onCancel={handleCancelAddModal}
				onOk={HandleAddOrChangeMedia}
				maskClosable={false}
				title="增改媒体"
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
						label="媒体名称"
						name="mediaName"
						rules={[
							{
								required: true,
								message: '请输入媒体名称',
								transform: value => value && value.trim(),
							},
						]}
					>
						<Input placeholder="请输入媒体名称" />
					</Form.Item>

					<Form.Item
						label="媒体类型"
						name="mediaType"
						rules={[{ required: true, message: '请选择媒体类型' }]}
					>
						<Select placeholder="请选择媒体类型" allowClear>
							{mediaType.slice(1).map(item => (
								<Option value={item.key} key={item.key}>
									{item.label}
								</Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
			<Modal
				wrapClassName="delete_modal"
				visible={isShowDelete}
				onCancel={handleCancelDeleteModal}
				onOk={HandleDeleteMedia}
				title="删除媒体"
				cancelText="取消"
				okText="确定"
				okButtonProps={{ danger: true }}
				centered
				destroyOnClose
			>
				<div className="delete_media_wrap">
					<h3>是否确定删除</h3>
					<p>
						媒体名称：<span>{currentMediaData.media}</span>
					</p>
					<p>
						媒体类型：<span>{currentMediaData.mediaTypeLabel}</span>
					</p>
				</div>
			</Modal>
		</div>
	);
}

export default Media;
