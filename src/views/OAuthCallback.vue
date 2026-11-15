<template>
  <div class="oauth-callback">
    <el-icon class="loading-icon" size="48"><Loading /></el-icon>
    <p>正在登录...</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { giteeCallback, githubCallback } from '../api/admin'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useAuthStore } from '../store/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

onMounted(async () => {
  const code = route.query.code
  if (!code) {
    ElMessage.error('授权失败：缺少 code 参数')
    router.push('/')
    return
  }

  // state=github 时走 GitHub 回调，否则走 Gitee
  const isGithub = route.query.state === 'github'

  try {
    const data = isGithub ? await githubCallback(code) : await giteeCallback(code)
    authStore.setUserAuth(data.token, {
      id: data.userId,
      username: data.username,
      avatar: data.avatar,
      role: data.role
    })
    ElMessage.success('登录成功')
    // Item 4：登录后回跳到触发登录前的页面
    const redirect = sessionStorage.getItem('oauth_redirect') || '/'
    sessionStorage.removeItem('oauth_redirect')
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '登录失败')
    router.push('/')
  }
})
</script>

<style scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.loading-icon {
  animation: rotate 1.5s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

p {
  font-size: 18px;
  font-weight: 500;
}
</style>
