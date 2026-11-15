import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Blog from '../views/Blog.vue'
import ArticleDetail from '../views/ArticleDetail.vue'
import Featured from '../views/Featured.vue'
import NavSites from '../views/NavSites.vue'
import InterviewList from '../views/InterviewList.vue'
import InterviewDetail from '../views/InterviewDetail.vue'
import ForumList from '../views/ForumList.vue'
import ForumDetail from '../views/ForumDetail.vue'
import Tools from '../views/Tools.vue'
import OAuthCallback from '../views/OAuthCallback.vue'
import UserProfile from '../views/UserProfile.vue'
import UserFavorites from '../views/UserFavorites.vue'
import FolderDetail from '../views/FolderDetail.vue'
import AdminLogin from '../views/admin/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminCategoryList from '../views/admin/CategoryList.vue'
import AdminSeriesList from '../views/admin/SeriesList.vue'
import AdminArticleList from '../views/admin/ArticleList.vue'
import AdminArticleEdit from '../views/admin/ArticleEdit.vue'
import AdminInterviewList from '../views/admin/InterviewList.vue'
import AdminInterviewEdit from '../views/admin/InterviewEdit.vue'
import AdminFeaturedList from '../views/admin/FeaturedList.vue'
import AdminNavList from '../views/admin/NavList.vue'
import AdminTagList from '../views/admin/TagList.vue'
import AdminForumManage from '../views/admin/ForumManage.vue'
import AdminUserList from '../views/admin/UserList.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/blog', name: 'Blog', component: Blog },
  { path: '/article/:id', name: 'ArticleDetail', component: ArticleDetail },
  { path: '/featured', name: 'Featured', component: Featured },
  { path: '/navs', name: 'NavSites', component: NavSites },
  { path: '/interviews', name: 'InterviewList', component: InterviewList },
  { path: '/interview/:id', name: 'InterviewDetail', component: InterviewDetail },
  { path: '/forum', name: 'ForumList', component: ForumList },
  { path: '/forum/:id', name: 'ForumDetail', component: ForumDetail },
  { path: '/tools', name: 'Tools', component: Tools },
  { path: '/oauth/callback', name: 'OAuthCallback', component: OAuthCallback },
  { path: '/profile', name: 'UserProfile', component: UserProfile },
  { path: '/favorites', name: 'UserFavorites', component: UserFavorites },
  { path: '/folder/:id', name: 'FolderDetail', component: FolderDetail },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', name: 'AdminDashboard', component: AdminDashboard },
      { path: 'categories', name: 'AdminCategoryList', component: AdminCategoryList },
      { path: 'series', name: 'AdminSeriesList', component: AdminSeriesList },
      { path: 'articles', name: 'AdminArticleList', component: AdminArticleList },
      { path: 'articles/new', name: 'AdminArticleNew', component: AdminArticleEdit },
      { path: 'articles/:id/edit', name: 'AdminArticleEdit', component: AdminArticleEdit },
      { path: 'interviews', name: 'AdminInterviewList', component: AdminInterviewList },
      { path: 'interviews/new', name: 'AdminInterviewNew', component: AdminInterviewEdit },
      { path: 'interviews/:id/edit', name: 'AdminInterviewEdit', component: AdminInterviewEdit },
      { path: 'featured', name: 'AdminFeaturedList', component: AdminFeaturedList },
      { path: 'navs', name: 'AdminNavList', component: AdminNavList },
      { path: 'tags', name: 'AdminTagList', component: AdminTagList },
      { path: 'forum', name: 'AdminForumManage', component: AdminForumManage },
      { path: 'users', name: 'AdminUserList', component: AdminUserList }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !token) {
    return '/admin/login'
  }
  if (to.path === '/admin/login' && token) {
    return '/admin/dashboard'
  }
})

export default router
