import request from '@/utils/request'

export const getArticles = (params, config = {}) => request({ url: '/articles', method: 'get', params, ...config })
export const getArticleById = (id, config = {}) => request({ url: `/articles/${id}`, method: 'get', ...config })
export const getPublicTags = (config = {}) => request({ url: '/articles/tags', method: 'get', ...config })
export const likeArticle = (id) => request({ url: `/articles/${id}/like`, method: 'post' })
export const unlikeArticle = (id) => request({ url: `/articles/${id}/like`, method: 'delete' })
export const getLastReadingAnchor = (articleId, config = {}) => request({ url: `/user/reading-history/articles/${articleId}`, method: 'get', ...config })
export const saveReadingAnchor = (articleId, data) => request({ url: `/user/reading-history/articles/${articleId}`, method: 'put', data })
