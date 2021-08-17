import React, { useState, useRef, useCallback, useReducer, useEffect, useContext } from 'react';
import { Modal, Table, Input, Form, Select, message, Dropdown, Menu, Upload, Switch } from 'antd';
import { SearchOutlined, CaretDownOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';
import { debounce } from '@/util/debounce.js';
import './slider.less';
import { newsQuery, pictureQuery, pictureAdd, pictureUpdate } from '../../api';
import { UserContext } from '../../util/context';

const { Option } = Select;

function beforeUpload(file) {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
	if (!isJpgOrPng) {
		message.error('请上传 jpg 或 png 格式的图片');
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('请上传 2MB 以下的图片!');
	}
	return isJpgOrPng && isLt2M;
}

function Slider() {
	// 用户信息
	const user = useContext(UserContext);

	/* 查询参数 */
	const reducer = (state, action) => {
		switch (action.type) {
			case 'keyword':
				return {
					...state,
					keyword: action.payload,
					page: 0,
				};
			case 'mediaType':
				return {
					...state,
					mediaType: action.payload,
					page: 0,
				};
			case 'date':
				return {
					...state,
					date: action.payload,
					page: 0,
				};
			case 'publishFlag':
				return {
					...state,
					publishFlag: action.payload,
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
		publishFlag: '',
		page: 0,
		size: 10,
	};
	const [params, dispatchParams] = useReducer(reducer, initialParams);
	const totalNumRef = useRef(null); // 左上角总数
	const [totalNum, setTotalNum] = useState('');
	const [forceUpdate, setForceUpdate] = useState(0);

	useEffect(() => {
		// 获取数据
		setIsShowLoading(true);
		async function getSliderData() {
			let res = await pictureQuery(params);
			if (totalNumRef.current === null) {
				totalNumRef.current = res.totalElements;
			}
			setTotalNum(res.totalElements);
			setDataSource(res.content);
			setIsShowLoading(false);
		}
		getSliderData();
	}, [params, forceUpdate]);

	/* 搜索 */
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
		dispatchParams({ type: 'keyword', payload: e.target.value.replace("'", '').trim() });
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
		setNewsData({});
		setImageUrl('');
	};

	// 确定增改
	const [modalType, setModalType] = useState('');
	const HandleAddOrChangeMedia = () => {
		addMediaRef.current
			.validateFields()
			.then(res => {
				console.log('当前行的数据', newsData);

				let params;
				console.log(res);
				switch (modalType) {
					case 'add':
						params = {
							newsId: newsData.news.id,
							mediaType: newsData.news.mediaType,
							rank: res.rank,
							storageAddress: res.file,
							publishFlag: !!res.publishFlag * 1,
							enableFlag: 1,
							creator: user.userId,
						};
						console.log('新增入参：', params);
						addPicture([params]);
						break;
					case 'change':
						params = {
							id: newsData.id,
							newsId: newsData.news.id,
							mediaType: 0,
							rank: res.rank || newsData.rank, // 当前修改有排序就使用，没有使用原顺序
							storageAddress: res.file,
							publishFlag: !!res.publishFlag * 1,
							enableFlag: 1,
							updator: user.userId,
						};
						console.log('修改入参：', params);
						updatePicture([params]);
						break;
					default:
						break;
				}
			})
			.catch(err => {
				console.error(err);
				try {
					console.log(newsData.news.id);
					// 是否用匹配到的报道信息
				} catch (error) {
					// 没有正确匹配报道，弹窗提示
					message.destroy();
					message.error('请绑定轮播图相关报道', 3);
				}
			});
	};

	// 添加
	async function addPicture(params) {
		let res = pictureAdd(params);
		console.log(res);
		message.success('添加成功', 1);
		setIsShowAdd(false);
		setImageUrl('');
		setNewsData({});
		setTimeout(() => {
			setForceUpdate(state => state + 1);
		});
	}
	// 删改
	async function updatePicture(param) {
		let res = await pictureUpdate(param);
		console.log(res);
		if (modalType === 'change') {
			message.success('修改轮播图信息成功', 1);
			setForceUpdate(state => state + 1);
			setIsShowAdd(false);
			setNewsData({});
		} else if (modalType === 'delete') {
			message.success('删除轮播图信息成功', 1);
			setIsShowDelete(false);
			setNewsData({});
			setTimeout(() => {
				if (dataSource.length === 1) {
					dispatchParams({ type: 'page', payload: params.page - 1 });
				} else {
					setForceUpdate(state => state + 1);
				}
			});
		}
	}

	// 获取所有报道，用于新增时匹配信息
	const [allReports, setAllReports] = useState([]);
	useEffect(() => {
		async function getNews() {
			let res = await newsQuery({ all: 'all' });
			console.log('所有报道', res.content);
			setAllReports(res.content);
		}
		getNews();
	}, []);

	// 自动匹配对应报道信息
	const [newsData, setNewsData] = useState({});
	const matchCurrentNews = e => {
		console.log(e.target.value);
		for (let item of allReports) {
			if (item.id === e.target.value.trim() || item.title === e.target.value.trim()) {
				console.log('有匹配报道信息', item);

				// 生成匹配显示文本
				setNewsData(state => ({
					...state,
					content: `${item.media} - ${
						mediaType.find(mediaItem => mediaItem.key === item.mediaType)['label']
					} - ${item.url}`,
					news: item,
				}));
				return;
			} else {
				setNewsData(state => ({ ...state, content: '暂未匹配到报道信息' }));
			}
		}
	};
	// 上传图片
	// const [loading, setLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState('');
	const handleChange = info => {
		console.log('链接', info);
		if (info.file.status === 'uploading') {
			// setLoading(true);
			return;
		}
		if (info.file.status === 'done') {
			// setLoading(false);
			setImageUrl(window.PICTURE_URL + info.file.response.data.storageAddress);
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
				file: imageUrl.replace(window.PICTURE_URL, ''),
			});
	}, [imageUrl]);

	// const uploadButton = (
	// 	<div>
	// 		{loading ? <LoadingOutlined /> : <span className="iconfont icon-zhaoxiangji"></span>}
	// 	</div>
	// );

	/* 表格 */
	const [dataSource, setDataSource] = useState([]);
	const [isShowLoading, setIsShowLoading] = useState(false);
	// 改变每页条数
	// for (let index = 0; index < 15; index++) {
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
		dispatchParams({ type: 'mediaType', payload: item.key });
	};
	const handleClickTime = item => {
		console.log('点击筛选发布时间：', item);
		dispatchParams({ type: 'date', payload: item.key });
	};
	const handleClickStatus = item => {
		console.log('点击筛选状态：', item);
		dispatchParams({ type: 'publishFlag', payload: item.key });
	};

	const columns = [
		{
			title: '报道ID',
			dataIndex: 'newsId',
			key: 'newsId',
			align: 'center',
			ellipsis: true,
			// width:200,
		},
		{
			title: '报道标题',
			dataIndex: 'news',
			key: 'news',
			align: 'center',
			ellipsis: true,
			render: data => data?.title,
		},
		{
			title: '媒体名称',
			dataIndex: 'news',
			key: 'new',
			align: 'center',
			width: 120,
			render: data => data?.media,
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
			dataIndex: 'news',
			key: 'news',
			align: 'center',
			width: 120,
			render: data => mediaType.find(item => item.key === data?.mediaType)?.label,
		},
		{
			title: '报道链接',
			ellipsis: true,
			dataIndex: 'news',
			key: 'news',
			align: 'center',
			render: data => data?.url,
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
			dataIndex: 'news',
			key: 'news',
			align: 'center',
			width: 120,
			render: data => data?.newsDate,
		},
		{
			title: () => (
				<>
					状态
					<Dropdown
						trigger="click"
						overlay={
							<Menu selectedKeys={[params.publishFlag]}>
								{[
									{ label: '全部', key: '' },
									{ label: '使用中', key: 1 },
									{ label: '未使用', key: 0 },
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
								params.publishFlag
									? { marginLeft: '10px', color: '#1890ff' }
									: { marginLeft: '10px' }
							}
						/>
					</Dropdown>
				</>
			),
			dataIndex: 'rank',
			key: 'rank',
			align: 'center',
			width: 150,
			render: (text, record, index) =>
				record.publishFlag ? <div className="using">{`使用中-${text}号位`}</div> : '未使用',
		},
		{
			title: '操作',
			align: 'center',
			width: 100,
			render: t => {
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
		setModalType('change');
		setIsShowAdd(true);

		console.log('点击时是否获取到Form', addMediaRef);
		// 回显图片链接
		setImageUrl(window.PICTURE_URL + data.storageAddress);
		setIsImgUsable(!!data.publishFlag);
		setNewsData(data); // 当前行的数据，参数取用
		matchCurrentNews({ target: { value: data.news.id } });
		setTimeout(() => {
			addMediaRef.current &&
				addMediaRef.current.setFieldsValue({
					title: data.news.title,
					file: data.storageAddress,
					publishFlag: !!data.publishFlag,
					rank: data.rank,
				});
		});
	};

	// 图片预览对话框
	const [isShowPreview, setIsShowPreview] = useState(false);
	const [currentPreviewImg, setCurrentPreviewImg] = useState('');
	const handleClickPreview = data => {
		console.log(data);
		setIsShowPreview(true);
		setCurrentPreviewImg(window.PICTURE_URL + data.storageAddress);
	};
	const handleCancelPreviewModal = () => {
		setIsShowPreview(false);
	};

	// 确认删除对话框
	const [isShowDelete, setIsShowDelete] = useState(false); // 是否展示
	const [currentMediaData, setCurrentMediaData] = useState({}); // 当前媒体数据
	const handleClickDelete = data => {
		console.log('删除当前行', data);
		setModalType('delete');
		setCurrentMediaData(data);
		setCurrentPreviewImg(window.PICTURE_URL + data.storageAddress);
		setIsShowDelete(true);
	};
	const handleCancelDeleteModal = () => {
		setIsShowDelete(false);
	};
	const HandleDeleteMedia = () => {
		// 确认删除当前媒体
		console.log('当前删除数据行', currentMediaData);
		let params = {
			id: currentMediaData.id,
			newsId: currentMediaData.news?.id,
			mediaType: 0,
			rank: currentMediaData.rank,
			storageAddress: currentMediaData.storageAddress,
			publishFlag: currentMediaData.publishFlag,
			enableFlag: 0,
			updator: user.userId,
		};
		updatePicture([params]);
	};

	return (
		<div className="report">
			<header>
				<div className="header_left">
					<p className="header_left_top">
						<span className="iconfont icon-tupian"></span>
						<span className="sub_title">轮播图管理</span>
					</p>
					<p className="title_desc">现有轮播图：{totalNumRef.current} 张</p>
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
					rowKey="id"
					// scroll={{ x: '70%', y: '100%' }}
					// rowSelection={{
					// 	onChange: (selectedRowKeys, selectedRows) => {
					// 		console.log('表格选中数据', selectedRowKeys, selectedRows);
					// 	},
					// }}
					pagination={{
						current: params.page + 1,
						pageSize: params.size,
						showQuickJumper: true,
						showSizeChanger: true,
						total: totalNum,
						showTotal: total => `共 ${total} 条`,
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
						<Input placeholder="请输入报道名称或ID" onChange={matchCurrentNews} />
					</Form.Item>
					<Form.Item label="报道关联信息">
						{newsData.content ? newsData.content : '（自动匹配无需填写）'}
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
								showUploadList={false}
								maxCount={1}
								action={window.BASE_URL + 'loopPlayPicture/upload'}
								beforeUpload={beforeUpload}
								onPreview={onPreview}
								onChange={handleChange}
								onDrop={handleChange}
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
						name="publishFlag"
						required
						// rules={[{ required: true, message: '请选择图片使用状态' }]}
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
							name="rank"
							rules={[{ required: true, message: '请选择轮播图位置' }]}
						>
							<Select placeholder="请选择排序位置号">
								{'123456789'.split('').map(item => (
									<Option value={item * 1} key={item}>
										{item * 1}
									</Option>
								))}
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
