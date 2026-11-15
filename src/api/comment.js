import request from '@/utils/request'

export const getCommentsByArticleId = (articleId) => {
  return request({
    url: `/comments/article/${articleId}`,
    method: 'get'
  })
}

export const createComment = (data) => {
  return request({
    url: '/comments',
    method: 'post',
    data
  })
}
