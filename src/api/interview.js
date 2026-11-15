import request from '@/utils/request'

export const getInterviews = (params, config = {}) => {
  return request({
    url: '/interviews',
    method: 'get',
    params,
    ...config
  })
}

export const getInterviewById = (id, config = {}) => {
  return request({
    url: `/interviews/${id}`,
    method: 'get',
    ...config
  })
}

export const likeInterview = (id) => {
  return request({
    url: `/interviews/${id}/like`,
    method: 'post'
  })
}

export const unlikeInterview = (id) => {
  return request({
    url: `/interviews/${id}/like`,
    method: 'delete'
  })
}

export const getInterviewComments = (interviewId, config = {}) => {
  return request({
    url: `/interview-comments/interview/${interviewId}`,
    method: 'get',
    ...config
  })
}

export const createInterviewComment = (data) => {
  return request({
    url: '/interview-comments',
    method: 'post',
    data
  })
}
