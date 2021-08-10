import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import { debounce } from '@/util/debounce.js';
import './media.less';
import { mediaAdd, mediaQuery ,getUserData} from '../../api';
import axios from 'axios'

const { Option } = Select;

function Media() {
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
  
	// const userData = useContext()

	const [text, setText] = useState(''); // 搜索框文本
	const [type, setType] = useState(''); // 媒体类型
	const [page, setPage] = useState(0); // 页码
	const [currentPageSize, setCurretPageSize] = useState(10); // 改变每页条数
	const [totalNum, setTotalNum] = useState('');

	// 获取数据
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
			console.log(result);

			setTotalNum(result.totalElements);
			setDataSource(result.content);
			setIsShowLoading(false);
		}
		getMedia();
	}, [page, currentPageSize, text, type]);

	// 搜索框
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
		setText(e.target.value);
	};

	// 增加媒体对话框
	const [isShowAdd, setIsShowAdd] = useState(false);
	const [addOrChange,setAddOrChange] = useState('')
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

				// TODO: 添加接口
				let params = [
					{
						media: res.mediaName,
						mediaType: res.mediaType,
					},
				];

				addMedia(params);
			})
			.catch(err => {
				console.log(err);
			});
	};
	async function addMedia(params) {
		let res = await mediaAdd(params);
		console.log(res);

		if (200) {
			message.success('添加成功', 1);
			setIsShowAdd(false);
		}
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
			label: '区媒',
			key: '4',
		},
		{
			label: '其它',
			key: '5',
		},
	];
	const handleClickType = item => {
		console.log('点击筛选媒体类型：', item);
		setType(item.key);
	};
	const columns = [
		{
			title: '媒体ID',
			dataIndex: 'id',
			key: 'id',
			align: 'center',
			width: 400,
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
							<Menu selectedKeys={[type || 'all']}>
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
					if (text + '' === item.key) {
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

	return (
		<div className="media">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-meitihao"></span>
						<span className="sub_title">媒体管理</span>
					</p>
					<p className="title_desc">现有媒体：{totalNum} 个</p>
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
					rowKey="id"
					loading={isShowLoading}
					rowSelection={{
						onChange: (selectedRowKeys, selectedRows) => {
							console.log('表格选中数据', selectedRowKeys, selectedRows);
						},
					}}
					pagination={{
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
						rules={[{ required: true, message: '请输入媒体名称' }]}
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
						媒体名称：<span>{currentMediaData.name}</span>
					</p>
					<p>
						媒体类型：<span>{currentMediaData.name}</span>
					</p>
				</div>
			</Modal>
		</div>
	);
}

export default Media;
