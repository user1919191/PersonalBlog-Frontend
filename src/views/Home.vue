<template>
  <div class="home">
    <!-- Banner -->
    <div class="hero-banner">
      <div class="hero-overlay">
        <h1 class="hero-title">欢迎来到我的博客</h1>
        <p class="hero-sub">这是我个人的知识分享网站，期望和各位同志分享技术，共同进步</p>
        <router-link to="/blog">
          <el-button type="primary" size="large" round>浏览文章</el-button>
        </router-link>
      </div>
    </div>

    <!-- 功能介绍卡片 -->
    <div class="intro-section">
      <div class="intro-card">
        <div class="intro-icon">
          <el-icon size="28" color="#409eff"><Memo /></el-icon>
        </div>
        <h3>面经分享</h3>
        <p>收录真实面试题与解析，涵盖后端、前端、数据库等方向，助你备战面试。</p>
        <router-link to="/interviews" class="card-link">查看面经 →</router-link>
      </div>

      <div class="intro-card">
        <div class="intro-icon">
          <el-icon size="28" color="#67c23a"><Collection /></el-icon>
        </div>
        <h3>精选文章</h3>
        <p>精心挑选的优质技术文章和经典读物，涵盖架构、数据库等领域。</p>
        <router-link to="/featured" class="card-link">查看精选 →</router-link>
      </div>

      <div class="intro-card">
        <div class="intro-icon">
          <el-icon size="28" color="#e6a23c"><Link /></el-icon>
        </div>
        <h3>学习网址</h3>
        <p>收录常用的开发工具、文档手册、技术社区和学习资源网站。</p>
        <router-link to="/navs" class="card-link">查看导航 →</router-link>
      </div>
    </div>

    <!-- 关于本站 -->
    <div class="about-section">
      <h2 class="section-title">关于本站</h2>
      <div class="about-content">
        <p>这是一个基于 <strong>Spring Boot 3 + Vue 3</strong> 全栈开发的技术博客与知识管理平台，集博客、面经、收藏于一体。</p>

        <h3 class="feature-subtitle">核心功能</h3>
        <ul class="feature-list">
          <li><strong>个人博客</strong> — Markdown 编写技术文章，支持代码高亮、分类筛选、全文搜索、点赞评论</li>
          <li><strong>面经分享</strong> — 记录真实面试题与解析，涵盖后端、前端、数据库等方向</li>
          <li><strong>精选文章</strong> — 收录优质外部技术文章，按分类分组浏览，快速导航</li>
          <li><strong>学习网址</strong> — 整理常用开发工具、文档手册、技术社区等资源导航</li>
        </ul>

        <h3 class="feature-subtitle">登录后解锁</h3>
        <ul class="feature-list">
          <li><strong>Gitee 一键登录</strong> — 无需注册，使用 Gitee 账号授权即可登录</li>
          <li><strong>评论互动</strong> — 在博客和面经下发表评论，展示用户名和头像</li>
          <li><strong>收藏管理</strong> — 创建收藏夹，收藏博客、精选文章、面经，个人中心统一管理</li>
          <li><strong>个人资料</strong> — 自定义显示名称，评论时展示个性化昵称</li>
        </ul>

        <h3 class="feature-subtitle">技术栈</h3>
        <div class="tech-group">
          <div class="tech-category">
            <span class="tech-label">后端</span>
            <div class="tech-tags">
              <el-tag type="success">Spring Boot 3</el-tag>
              <el-tag type="success">MyBatis Plus</el-tag>
              <el-tag type="success">JWT</el-tag>
              <el-tag type="success">BCrypt</el-tag>
              <el-tag type="success">Gitee OAuth</el-tag>
              <el-tag type="success">Github OAuth</el-tag>

            </div>
          </div>
          <div class="tech-category">
            <span class="tech-label">前端</span>
            <div class="tech-tags">
              <el-tag>Vue 3</el-tag>
              <el-tag>Pinia</el-tag>
              <el-tag>Element Plus</el-tag>
              <el-tag>Markdown-it</el-tag>
            </div>
          </div>
          <div class="tech-category">
            <span class="tech-label">数据</span>
            <div class="tech-tags">
              <el-tag type="warning">MySQL 8</el-tag>
              <el-tag type="warning">Redis</el-tag>
              <el-tag type="warning">Tencent COS</el-tag>
            </div>
          </div>
          <div class="tech-category">
            <span class="tech-label">部署</span>
            <div class="tech-tags">
              <el-tag type="info">Nginx</el-tag>
              <el-tag type="info">Systemd</el-tag>
              <el-tag type="info">Let's Encrypt</el-tag>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { Memo, Collection, Link } from '@element-plus/icons-vue'
</script>

<style scoped>
.home {
  width: 100%;
}

/* Hero Banner */
.hero-banner {
  height: 300px;
  border-radius: 16px;
  background: linear-gradient(135deg, #1a2332 0%, #2563eb 50%, #7c3aed 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
  position: relative;
  overflow: hidden;
}

.hero-banner::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 119, 115, 0.2) 0%, transparent 40%);
}

.hero-overlay {
  text-align: center;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 36px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hero-sub {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 24px;
}

/* 介绍卡片 */
.intro-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.intro-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.intro-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.intro-icon {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.intro-card:nth-child(2) .intro-icon { background: #f0fff4; }
.intro-card:nth-child(3) .intro-icon { background: #fffbf0; }

.intro-card h3 {
  font-size: 16px;
  color: #1a2332;
  margin-bottom: 8px;
  font-weight: 600;
}

.intro-card p {
  font-size: 14px;
  color: #909399;
  line-height: 1.7;
  margin-bottom: 16px;
}

.card-link {
  font-size: 14px;
  color: #409eff;
  font-weight: 500;
}

.card-link:hover {
  text-decoration: underline;
}

/* 关于本站 */
.about-section {
  background: #fff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 20px;
  color: #1a2332;
  margin-bottom: 16px;
  font-weight: 600;
  padding-bottom: 12px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.about-content p {
  color: #606266;
  line-height: 1.8;
  margin-bottom: 12px;
  font-size: 15px;
}

.tech-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-subtitle {
  font-size: 15px;
  color: #1a2332;
  font-weight: 600;
  margin: 20px 0 10px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  position: relative;
  padding-left: 18px;
  color: #606266;
  line-height: 2;
  font-size: 14px;
}

.feature-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 12px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #409eff;
}

.tech-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}

.tech-category {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tech-label {
  font-size: 13px;
  color: #909399;
  font-weight: 500;
  min-width: 36px;
}

.github-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 20px;
  padding: 8px 16px;
  border-radius: 8px;
  background: #1a2332;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.2s, transform 0.2s;
}

.github-link:hover {
  background: #2d3748;
  transform: translateY(-1px);
}

.github-link .el-icon {
  flex-shrink: 0;
}
</style>
