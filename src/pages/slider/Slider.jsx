import React, { useState, useRef, useCallback, useReducer, useEffect } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu, Upload, Switch } from 'antd';
import {
	SearchOutlined,
	CaretDownOutlined,
	PlusOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { debounce } from '@/util/debounce.js';
import './slider.less';

const { Option } = Select;

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

function beforeUpload(file) {
	// const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
	// if (!isJpgOrPng) {
	// 	message.error('You can only upload JPG/PNG file!');
	// }
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('请上传 2MB 以下的图片!');
	}
	return isLt2M;
}

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
		dispatchParams({ type: 'text', payload: e.target.value });
	};

	/* 增改对话框 */
	const [isShowAdd, setIsShowAdd] = useState(false);
	const [isImgUsable, setIsImgUsable] = useState(false);
	const addMediaRef = useRef(null);
	const getMediaRef = useCallback(node => {
		// 动态获取每次重载的 增改 对话框 DOM
		if (node) addMediaRef.current = node;
	}, []);
	const handleCancelAddModal = () => {
		setIsShowAdd(false);
		setImageUrl('');
	};

	const HandleAddOrChangeMedia = () => {
		console.log(addMediaRef.current.getFieldInstance('file'));
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
	// 上传图片
	const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const handleChange = info => {
		console.log('链接', info);
		if (info.file.status === 'uploading') {
			setLoading(true);
			return;
		}
		if (info.file.status === 'done') {
			// getBase64(info.file.originFileObj, imageUrl => {
			setLoading(false);
			// 	setImageUrl(imageUrl);
			// });
			// Get this url from response in real world.
			setImageUrl('http://localhost:8080' + info.file.response.url);
		}
	};
	const onPreview = async file => {
		let src = file.url;
		if (!src) {
			src = await new Promise(resolve => {
				const reader = new FileReader();
				reader.readAsDataURL(file.originFileObj);
				reader.onload = () => resolve(reader.result);
			});
		}
		const image = new Image();
		image.src = src;
		const imgWindow = window.open(src);
		imgWindow.document.write(image.outerHTML);
	};
	// 图片上传成功后改变 file 输入框的值
	useEffect(() => {
		addMediaRef.current &&
			addMediaRef.current.setFieldsValue({
				file: imageUrl,
			});
	}, [imageUrl]);

	const uploadButton = (
		<div>
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			{/* <div style={{ marginTop: 8 }}>Upload</div> */}
		</div>
	);

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
							<Menu
								// TODO: 默认选中项参数字段可能需调整
								selectedKeys={[params.type || 'all']}
							>
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
								params.type && params.type !== 'all'
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
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
						<CaretDownOutlined
							style={
								params.time && params.time !== 'all'
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'address',
			key: 'address',
			align: 'center',
		},
		{
			title: () => (
				<>
					状态
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.status || 'all']}>
								{[
									{ label: '全部', key: 'all' },
									{ label: '使用中', key: 'using' },
									{ label: '未使用', key: 'unUsing' },
								].map(item => (
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
						<CaretDownOutlined
							style={
								params.status && params.status !== 'all'
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'name',
			key: 'status',
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
							onClick={() => handleClickPreview(t)}
							className="edit iconfont icon-tupian"
						></span>
						<span
							onClick={() => handleClickEdit(t)}
							className="edit iconfont icon-bi"
						></span>
						{/* <span
							onClick={() => handleClickChangeStatus(t)}
							className={`iconfont icon-${t.age === 32 ? 'jinyong' : 'refresh'}`}
						></span> */}
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

	// 图片预览对话框
	const [isShowPreview, setIsShowPreview] = useState(false);
	const [currentPreviewImg, setCurrentPreviewImg] = useState('');
	const handleClickPreview = data => {
		console.log(data);
		setIsShowPreview(true);
		// TODO:获取当前行图片链接
		setCurrentPreviewImg('');
	};
	const handleCancelPreviewModal = () => {
		setIsShowPreview(false);
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
		console.log('当前删除数据行', currentMediaData);
	};

	return (
		<div className="report">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-tupian"></span>
						<span className="sub_title">轮播图管理</span>
					</p>
					<p className="title_desc">现有轮播图：{} 张</p>
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
				title="增改轮播图"
				cancelText="取消"
				okText="确定"
				maskClosable={false}
				centered
				destroyOnClose
			>
				<Form
					ref={getMediaRef}
					name="basic"
					labelCol={{ span: 7 }}
					wrapperCol={{ span: 16 }}
					// initialValues={{ remember: true }}
				>
					<Form.Item
						label="关联报道"
						name="title"
						rules={[{ required: true, message: '请输入报道标题' }]}
					>
						<Input placeholder="请输入报道名称或ID" />
					</Form.Item>
					<Form.Item label="报道关联信息">
						（自动匹配无需填写）
						{/* <p>（自动匹配无需填写）</p> */}
					</Form.Item>
					<Form.Item label="上传图片" required>
						<Form.Item
							noStyle
							name="file"
							rules={[{ required: true, message: '请上传图片' }]}
						>
							<Input type="hidden" />
						</Form.Item>
						<ImgCrop
							aspect={360 / 193}
							quality={1}
							modalTitle="请裁剪轮播图显示尺寸"
							modalOk="裁剪"
							modalCancel="取消"
						>
							<Upload
								listType="picture-card"
								className="avatar-uploader"
								// showUploadList={false}
								maxCount={1}
								action="http://localhost:8080/upload/"
								beforeUpload={beforeUpload}
								onPreview={onPreview}
								onChange={handleChange}
								onDrop={handleChange}
								showUploadList={{
									showPreviewIcon: true,
								}}
								// onRemove={() => new Promise().resolve(true)}
							>
								{imageUrl ? (
									<img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
								) : (
									<span className="iconfont icon-zhaoxiangji"></span>
								)}
							</Upload>
						</ImgCrop>
					</Form.Item>

					<Form.Item
						label="设定状态及位置"
						name="status"
						rules={[{ required: true, message: '请选择图片使用状态' }]}
					>
						<Switch
							checkedChildren="启用"
							unCheckedChildren="禁用"
							defaultChecked={false}
							checked={isImgUsable}
							onChange={status => setIsImgUsable(status)}
						/>
					</Form.Item>
					{isImgUsable ? (
						<Form.Item
							label="请选择排序位置"
							name="time"
							rules={[{ required: true, message: '请选择轮播图位置' }]}
						>
							<Select>
								<option value=""></option>
							</Select>
						</Form.Item>
					) : null}
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
					<img
						src={
							currentPreviewImg ||
							'https://www.bing.com/th?id=OHR.MineBay_ZH-CN4962056960_1920x1080.jpg&rf=LaDigue_1920x1080.jpg'
						}
						alt=""
						className="picture_preview"
					/>
				</div>
			</Modal>
			<Modal
				title={'查看轮播图'}
				footer={null}
				visible={isShowPreview}
				onCancel={handleCancelPreviewModal}
				centered
			>
				<img
					src={
						currentPreviewImg ||
						'https://www.bing.com/th?id=OHR.MineBay_ZH-CN4962056960_1920x1080.jpg&rf=LaDigue_1920x1080.jpg'
					}
					alt=""
					className="picture_preview"
				/>
			</Modal>
		</div>
	);
}

export default Slider;
