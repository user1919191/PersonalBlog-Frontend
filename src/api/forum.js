import request from '@/utils/request'

export const getForumPosts = (params) => request({ url: '/forum/posts', method: 'get', params })
export const getForumPostById = (id) => request({ url: `/forum/posts/${id}`, method: 'get' })
export const createForumPost = (data) => request({ url: '/forum/posts', method: 'post', data })
export const createForumReply = (data) => request({ url: '/forum/replies', method: 'post', data })
export const deleteForumPost = (id) => request({ url: `/forum/posts/${id}`, method: 'delete' })
export const deleteForumReply = (id) => request({ url: `/forum/replies/${id}`, method: 'delete' })
