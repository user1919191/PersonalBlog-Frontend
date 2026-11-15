
- # 个人博客系统 - 前端

基于 **Vue 3 + Vite 5 + Element Plus** 的博客前端，包含前台展示、用户中心与管理后台，与 `blog-backend` 接口对齐。
后端代码仓库：
- https://github.com/user1919191/PersonalBlog-Backend

## 技术栈

| 类别 | 技术 |
| --- | --- |
| 框架 | Vue 3（Composition API / `<script setup>`） |
| 构建 | Vite 5 |
| 路由 | Vue Router 4 |
| 状态管理 | Pinia |
| UI | Element Plus + @element-plus/icons-vue |
| HTTP | Axios |
| Markdown | md-editor-v3（编辑/预览/目录）、Mermaid |
| 图表 | ECharts |
| 时间处理 | dayjs |

## 目录结构

```text
blog-frontend/
├── src/
│   ├── api/                 # 接口封装
│   │   ├── admin.js         # 认证、后台管理接口
│   │   ├── article.js       # 文章、点赞、阅读进度
│   │   ├── category.js      # 分类
│   │   ├── comment.js       # 文章评论
│   │   ├── featured.js      # 精选文章
│   │   ├── forum.js         # 论坛帖子与回复
│   │   ├── interview.js     # 面经与面经评论
│   │   ├── nav.js           # 学习网址
│   │   └── user.js          # 个人资料、收藏、订阅、通知
│   ├── components/
│   │   ├── FavoriteButton.vue / FavoriteDialog.vue
│   │   └── tools/           # JSON、URL、时间、正则、JVM/Git/MySQL 指令工具
│   ├── composables/
│   │   └── useSmartListLoader.js   # 列表加载、防抖、请求取消
│   ├── data/                # JVM / Git / MySQL 指令数据
│   ├── layouts/
│   │   └── AdminLayout.vue  # 后台布局与侧边栏
│   ├── router/index.js      # 路由与后台登录守卫
│   ├── store/
│   │   ├── auth.js          # 管理员 / 普通用户登录态
│   │   ├── resource-cache.js# 分类、标签、收藏夹缓存
│   │   └── theme.js         # 深色模式
│   ├── utils/
│   │   ├── request.js       # Axios 实例、Token 注入、401 处理
│   │   ├── md-editor.js     # Markdown 编辑器/预览异步加载
│   │   └── regex-*.js       # 正则工具
│   ├── views/               # 前台页面
│   │   └── admin/           # 管理后台页面
│   ├── App.vue              # 前台整体布局（侧边栏、登录、通知）
│   └── main.js
├── index.html
├── package.json
├── vite.config.js           # 端口 5173，/api 代理到 8080
├── .gitignore
└── README.md
```

## 页面与路由

### 前台

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | Home | 首页与项目介绍 |
| `/blog` | Blog | 文章列表，支持分类、标签、关键字筛选 |
| `/article/:id` | ArticleDetail | Markdown 正文、目录、点赞、评论、订阅、阅读进度 |
| `/featured` | Featured | 精选文章，按分类筛选 |
| `/navs` | NavSites | 学习网址导航 |
| `/interviews` | InterviewList | 面经列表 |
| `/interview/:id` | InterviewDetail | 面经详情、点赞、评论 |
| `/forum` | ForumList | 论坛帖子列表与发帖 |
| `/forum/:id` | ForumDetail | 帖子详情、回复、删除 |
| `/tools` | Tools | 实用工具集合 |
| `/oauth/callback` | OAuthCallback | Gitee / GitHub 登录回调 |
| `/profile` | UserProfile | 个人中心（需用户登录） |
| `/favorites` | UserFavorites | 收藏夹列表（需用户登录） |
| `/folder/:id` | FolderDetail | 收藏夹详情（需用户登录） |

### 管理后台

| 路径 | 页面 |
| --- | --- |
| `/admin/login` | 管理员登录 |
| `/admin/dashboard` | 数据仪表盘 |
| `/admin/categories` | 分类管理 |
| `/admin/series` | 专栏管理 |
| `/admin/articles` | 文章列表 |
| `/admin/articles/new` | 新建文章 |
| `/admin/articles/:id/edit` | 编辑文章 |
| `/admin/interviews` | 面经列表 |
| `/admin/interviews/new` | 新建面经 |
| `/admin/interviews/:id/edit` | 编辑面经 |
| `/admin/featured` | 精选文章管理 |
| `/admin/navs` | 学习网址管理 |
| `/admin/tags` | 标签管理 |
| `/admin/forum` | 论坛管理 |
| `/admin/users` | 用户管理 |

> 日程待办、系统监控、API 巡检页面及相关路由已移除。

## 登录与鉴权

- **管理员**：登录后 JWT 保存在 `localStorage.admin_token`，请求 `/admin/**`、`/series/admin/**` 时自动携带
- **普通用户**：Gitee/GitHub OAuth 登录后，Session ID 保存在 `localStorage.user_token`，请求 `/user/**`、评论、发帖、回复等接口时携带
- 未登录访问需要权限的接口时，前端会静默拦截或弹出登录框
- 401 时自动清除对应 Token 并跳转/提示重新登录

所有请求统一走 `/api` 前缀，由 [request.js](src/utils/request.js) 注入 `Authorization: Bearer <token>`。

## 开发与构建

### 环境要求

- Node.js 18+
- npm 9+
- 后端服务运行在 `http://127.0.0.1:8080`（`/api`）

### 安装依赖

```bash
npm install
# 或按 lock 文件精确安装
npm ci
```

### 本地开发

```bash
npm run dev
```

访问：`http://127.0.0.1:5173`

开发环境由 Vite 代理 `/api` 到 `http://127.0.0.1:8080`（见 `vite.config.js`），无需额外配置 CORS。

### 生产构建

```bash
npm run build
```

产物输出到 `dist/`，部署时由 Nginx 托管静态文件，并将 `/api` 反向代理到后端。

### 本地预览构建产物

```bash
npm run preview
```

## 接口与缓存约定

- 所有接口返回值经 `request.js` 统一解包：`code === 200` 时返回 `data`
- 列表接口统一使用 `pageNum` / `pageSize`，返回 `{ total, records }`
- 列表页面推荐使用 `useSmartListLoader`，内置防抖、请求取消和重复请求复用
- 分类、标签、收藏夹等低频数据通过 `resource-cache` 做 5 分钟缓存
- 图片上传接口返回 URL；本地开发可直传后端，生产环境由 COS 提供地址
