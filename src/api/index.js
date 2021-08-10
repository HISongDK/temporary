import Request from './api';

/* 
	用户信息
*/

// 获取用户信息
export const getUserData = uid => Request('http://10.99.85.234/bacovid-test/materials/common/getUserPowerList/' + uid);
// export const getUserData = uid => Request('/common/getUserPowerList/' + uid);

/* 
	媒体管理
*/

// 批量新增媒体
export const mediaAdd = params => Request('/media/add', params, 'post');
// 批量更新新闻
export const mediaUpdate = params => Request('/media/update', params, 'put');
// 查询新闻
export const mediaQuery = params => Request('/media/query', params);
