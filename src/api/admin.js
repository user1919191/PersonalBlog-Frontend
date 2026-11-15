import request from '../utils/request'

// ===== 认证 =====
export const login = (data) => request({ url: '/auth/login', method: 'post', data })
export const getGiteeAuthUrl = () => request({ url: '/auth/gitee/url', method: 'get' })
export const giteeCallback = (code) => request({ url: '/auth/gitee/callback', method: 'post', params: { code } })
export const getGithubAuthUrl = () => request({ url: '/auth/github/url', method: 'get' })
export const githubCallback = (code) => request({ url: '/auth/github/callback', method: 'post', params: { code } })
export const logoutUser = () => request({ url: '/auth/logout/user', method: 'post' })
export const kickUserSessions = (userId) => request({ url: `/auth/admin/users/${userId}/sessions`, method: 'delete' })

// ===== 用户管理 =====
export const getAdminUsers = (params) => request({ url: '/admin/users', method: 'get', params })
export const updateUserStatus = (userId, status) => request({ url: `/admin/users/${userId}/status`, method: 'patch', data: { status } })

// ===== 数据统计 =====
export const getOverview = () => request({ url: '/admin/stats/overview', method: 'get' })
export const getDailyStats = (days = 7) => request({ url: '/admin/stats/daily', method: 'get', params: { days } })
export const getTopArticles = (limit = 10) => request({ url: '/admin/stats/top-articles', method: 'get', params: { limit } })

// ===== 分类管理 =====
export const getAdminCategories = () => request({ url: '/admin/categories', method: 'get' })
export const createCategory = (data) => request({ url: '/admin/categories', method: 'post', data })
export const updateCategory = (id, data) => request({ url: `/admin/categories/${id}`, method: 'put', data })
export const deleteCategory = (id) => request({ url: `/admin/categories/${id}`, method: 'delete' })

// ===== 文章管理 =====
export const getAdminArticles = (params) => request({ url: '/admin/articles', method: 'get', params })
export const getAdminArticleById = (id) => request({ url: `/admin/articles/${id}`, method: 'get' })
export const createArticle = (data) => request({ url: '/admin/articles', method: 'post', data })
export const updateArticle = (id, data) => request({ url: `/admin/articles/${id}`, method: 'put', data })
export const deleteArticle = (id) => request({ url: `/admin/articles/${id}`, method: 'delete' })

// ===== 专栏管理（后台读写复用 /series 接口） =====
export const getAdminSeries = () => request({ url: '/series', method: 'get' })
export const createSeries = (data) => request({ url: '/series/admin', method: 'post', data })
export const updateSeries = (id, data) => request({ url: `/series/admin/${id}`, method: 'put', data })
export const deleteSeries = (id) => request({ url: `/series/admin/${id}`, method: 'delete' })

// ===== 精选文章 =====
export const getAdminFeatured = (params) => request({ url: '/admin/featured', method: 'get', params })
export const createFeatured = (data) => request({ url: '/admin/featured', method: 'post', data })
export const updateFeatured = (id, data) => request({ url: `/admin/featured/${id}`, method: 'put', data })
export const deleteFeatured = (id) => request({ url: `/admin/featured/${id}`, method: 'delete' })

// ===== 学习网址 =====
export const getAdminNavs = (params) => request({ url: '/admin/navs', method: 'get', params })
export const createNav = (data) => request({ url: '/admin/navs', method: 'post', data })
export const updateNav = (id, data) => request({ url: `/admin/navs/${id}`, method: 'put', data })
export const deleteNav = (id) => request({ url: `/admin/navs/${id}`, method: 'delete' })

// ===== 标签管理 =====
export const getAdminTags = () => request({ url: '/admin/tags', method: 'get' })
export const createTag = (data) => request({ url: '/admin/tags', method: 'post', data })
export const updateTag = (id, data) => request({ url: `/admin/tags/${id}`, method: 'put', data })
export const deleteTag = (id) => request({ url: `/admin/tags/${id}`, method: 'delete' })

// ===== 文件上传 =====
export const uploadFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request({ url: '/admin/upload', method: 'post', data: form, headers: { 'Content-Type': 'multipart/form-data' } })
}

// ===== 面经管理 =====
export const getAdminInterviews = (params) => request({ url: '/admin/interviews', method: 'get', params })
export const getAdminInterviewById = (id) => request({ url: `/admin/interviews/${id}`, method: 'get' })
export const createInterview = (data) => request({ url: '/admin/interviews', method: 'post', data })
export const updateInterview = (id, data) => request({ url: `/admin/interviews/${id}`, method: 'put', data })
export const deleteInterview = (id) => request({ url: `/admin/interviews/${id}`, method: 'delete' })
