import Request from './api';

export const getSiderPic = () => Request('/news/loopPlayPicture?isDev=1');

export const getNewsList = () => Request('/news/query?isDev=1&all=all');

export const queryNewsList = params => Request('/news/search', { isDev: 1, all: 'all', ...params });
