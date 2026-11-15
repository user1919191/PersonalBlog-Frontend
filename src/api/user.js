import request from '../utils/request'

// ===== 个人资料 =====
export const getUserProfile = () => request({ url: '/user/profile', method: 'get' })
export const updateProfile = (data) => request({ url: '/user/profile', method: 'put', data })

// ===== 收藏夹 =====
export const getFolders = (config = {}) => request({ url: '/user/favorites/folders', method: 'get', ...config })
export const createFolder = (data) => request({ url: '/user/favorites/folders', method: 'post', data })
export const renameFolder = (id, data) => request({ url: `/user/favorites/folders/${id}`, method: 'put', data })
export const deleteFolder = (id) => request({ url: `/user/favorites/folders/${id}`, method: 'delete' })
export const getFolderItems = (folderId, config = {}) => request({ url: `/user/favorites/folders/${folderId}/items`, method: 'get', ...config })
export const addFavorite = (data) => request({ url: '/user/favorites/items', method: 'post', data })
export const removeFavorite = (id) => request({ url: `/user/favorites/items/${id}`, method: 'delete' })

// ===== 阅读记录 =====
export const getContinueReading = (params, config = {}) => request({ url: '/user/reading-history/continue', method: 'get', params, ...config })
export const getReadingHistory = (params, config = {}) => request({ url: '/user/reading-history', method: 'get', params, ...config })

// ===== 订阅 =====
export const getUserSubscriptions = () => request({ url: '/user/subscriptions', method: 'get' })
export const subscribeTarget = (data) => request({ url: '/user/subscriptions', method: 'post', data })
export const unsubscribeTarget = (params) => request({ url: '/user/subscriptions', method: 'delete', params })

// ===== 站内通知 =====
export const getNotifications = (params) => request({ url: '/user/notifications', method: 'get', params })
export const getUnreadNotificationCount = () => request({ url: '/user/notifications/unread-count', method: 'get' })
export const markNotificationRead = (id) => request({ url: `/user/notifications/${id}/read`, method: 'patch' })
export const markAllNotificationsRead = () => request({ url: '/user/notifications/read-all', method: 'patch' })
