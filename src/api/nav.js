import request from '@/utils/request'

export const getNavSites = (params, config = {}) => request({ url: '/navs', method: 'get', params, ...config })
