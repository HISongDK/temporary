import React, { useState, useRef, useCallback } from 'react';
import {
	Modal,
	Table,
	Input,
	Form,
	Select,
	message,
	Dropdown,
	Menu,
	DatePicker,
	Upload,
	Switch,
} from 'antd';
import {
	SearchOutlined,
	CaretDownOutlined,
	PlusOutlined,
	LoadingOutlined,
} from '@ant-design/icons';
import './slider.less';

const { Option } = Select;

function getBase64(img, callback) {
	const reader = new FileReader();
	reader.addEventListener('load', () => callback(reader.result));
	reader.readAsDataURL(img);
}

function beforeUpload(file) {
	const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
	if (!isJpgOrPng) {
		message.error('You can only upload JPG/PNG file!');
	}
	const isLt2M = file.size / 1024 / 1024 < 2;
	if (!isLt2M) {
		message.error('请上传 2MB 以下的图片!');
	}
	return isJpgOrPng && isLt2M;
}

function Slider() {
	/* 搜索 */
	const handleChangeSearch = e => {
		console.log('搜索框变动', e.target.value);
	};
	/* 增改对话框 */
	const [isShowAdd, setIsShowAdd] = useState(false);
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
		if (info.file.status === 'uploading') {
			setLoading(true);
			return;
		}
		if (info.file.status === 'done') {
			// Get this url from response in real world.
			getBase64(info.file.originFileObj, imageUrl => {
				setLoading(false);
				setImageUrl(imageUrl);
			});
		}
	};

	const uploadButton = (
		<div>
			{loading ? <LoadingOutlined /> : <PlusOutlined />}
			<div style={{ marginTop: 8 }}>Upload</div>
		</div>
	);

	// 表格
	const [dataSource, setDataSource] = useState([]);
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
	};
	const handleClickTime = item => {
		console.log('点击筛选发布时间：', item);
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
							<Menu>
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
							<Menu>
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
						<span className="iconfont icon-tupian"></span>
						<span className="sub_title">轮播图管理</span>
					</p>
					<p className="title_desc">现有轮播图：{} 张</p>
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
					<Form.Item
						label="上传图片"
						name="upload"
						rules={[{ required: true, message: '请上传图片' }]}
					>
						<Upload
							name="avatar"
							listType="picture-card"
							className="avatar-uploader"
							showUploadList={false}
							action="upload/"
							// beforeUpload={beforeUpload}
							onChange={handleChange}
						>
							{imageUrl ? (
								<img src={imageUrl} alt="avatar" style={{ width: '100%' }} />
							) : (
								uploadButton
							)}
						</Upload>
						点击上传图片
						<p>图片规格请参照标准制作：240px，大小不超过2M</p>
					</Form.Item>

					<Form.Item
						label="设定状态及位置"
						name="link"
						rules={[{ required: true, message: '请输入报道链接' }]}
					>
						<Switch checkedChildren="启用" unCheckedChildren="禁用" defaultChecked onChange={()=>{}}/>
					</Form.Item>
					{
						<Form.Item
							label="发布时间"
							name="time"
							rules={[{ required: true, message: '请输入发布时间' }]}
						>
							
						</Form.Item>
					}
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

export default Slider;
