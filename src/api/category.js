import request from '@/utils/request'

export const getCategories = (config = {}) => {
  return request({
    url: '/categories',
    method: 'get',
    ...config
  })
}
