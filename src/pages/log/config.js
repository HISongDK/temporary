export const reducer = (state, action) => {
	switch (action.type) {
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
		case 'keyword':
			return {
				...state,
				keyword: action.payload,
				page: 0,
			};
		case 'source':
			return {
				...state,
				source: action.payload,
				page: 0,
			};
		case 'object':
			return {
				...state,
				object: action.payload,
				page: 0,
			};
		case 'behavior':
			return {
				...state,
				behavior: action.payload,
				page: 0,
			};
		case 'result':
			return {
				...state,
				result: action.payload,
				page: 0,
			};
		case 'startTime':
			return {
				...state,
				startTime: action.payload,
				page: 0,
			};
		case 'endTime':
			return {
				...state,
				endTime: action.payload,
				page: 0,
			};
		default:
			return state;
	}
};
export const operateModule = [
	{
		label: '全部',
		key: '',
	},
	{
		label: '媒体管理',
		key: '媒体管理',
	},
	{
		label: '报道管理',
		key: '报道管理',
	},
	{
		label: '轮播图管理',
		key: '轮播图管理',
	},
];

export const operateObject = [
	{
		label: '全部',
		key: '',
	},
	{
		label: '查询媒体',
		key: '查询媒体',
	},
	{
		label: '新增媒体',
		key: '新增媒体',
	},
	{
		label: '修改媒体',
		key: '修改媒体',
	},
	{
		label: '删除媒体',
		key: '删除媒体',
	},
	{
		label: '查询报道',
		key: '查询报道',
	},
	{
		label: '新增报道',
		key: '新增报道',
	},
	{
		label: '删除报道',
		key: '删除报道',
	},
	{
		label: '启用报道',
		key: '启用报道',
	},
	{
		label: '禁用报道',
		key: '禁用报道',
	},
	{
		label: '查询轮播图',
		key: '查询轮播图',
	},
	{
		label: '新增轮播图',
		key: '新增轮播图',
	},
	{
		label: '修改轮播图',
		key: '修改轮播图',
	},
	{
		label: '删除轮播图',
		key: '删除轮播图',
	},
	// {
	// 	label: '查看轮播图',
	// 	key: '查看轮播图',
	// },
];
export const operateAction = [
	{
		label: '全部',
		key: '',
	},
	{
		label: '查询',
		key: '查询',
	},
	{
		label: '新增',
		key: '新增',
	},
	{
		label: '修改',
		key: '修改',
	},
	{
		label: '删除',
		key: '删除',
	},
	{
		label: '启用',
		key: '启用',
	},
	{
		label: '禁用',
		key: '禁用',
	},
	// {
	// 	label: '查看详情',
	// 	key: '查看详情',
	// },
];

export const operateResult = [
	{
		label: '全部',
		key: '',
	},
	{
		label: '成功',
		key: 'Success',
	},
	{
		label: '失败',
		key: 'Fail',
	},
];
