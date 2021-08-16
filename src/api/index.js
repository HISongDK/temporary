import Request from './api';

/* 
	用户信息
*/

// 获取用户信息
export const getUserData = uid => Request('/who/' + uid);

/* 
	媒体管理
*/

// 批量新增媒体
export const mediaAdd = params => Request('/media/add', params, 'post');
// 批量更新媒体
export const mediaUpdate = params => Request('/media/update', params, 'put');
// 查询媒体
export const mediaQuery = params => Request('/media/query', params);

/* 
	报道管理
*/

// 新增新闻
export const newsAdd = params => Request('news/add', params, 'post');
// 更新新闻
export const newsUpdate = params => Request('news/update', params, 'put');
// 查询新闻
export const newsQuery = params => Request('news/query', params);

/* 
	轮播图
*/

// 新增轮播图
export const pictureAdd = params => Request('/loopPlayPicture/add', params, 'post');
// 修改轮播图
export const pictureUpdate = params => Request('/loopPlayPicture/update', params, 'put');
// 上传轮播图
export const pictureUpload = params => Request('/loopPlayPicture/upload', params);
// 查询轮播图
export const pictureQuery = params => Request('/loopPlayPicture/query', params);

/* 
	系统日志
*/

// 查询系统日志
export const logQuery = params => Request('/log/query', params);
