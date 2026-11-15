import request from '@/utils/request'

export const getFeaturedArticles = (params, config = {}) => request({ url: '/featured', method: 'get', params, ...config })
export const getFeaturedCategories = (config = {}) => request({ url: '/featured/categories', method: 'get', ...config })
