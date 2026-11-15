<template>
  <span class="fav-btn" @click.stop.prevent="handleClick">
    <el-icon><StarFilled /></el-icon>
    <span v-if="showLabel" class="fav-label">收藏</span>
  </span>

  <FavoriteDialog
    v-model="dialogVisible"
    :item-type="itemType"
    :item-id="itemId"
  />
</template>

<script setup>
import { ref } from 'vue'
import { StarFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'
import FavoriteDialog from '@/components/FavoriteDialog.vue'

const props = defineProps({
  itemType: { type: String, required: true },
  itemId: { type: Number, required: true },
  showLabel: { type: Boolean, default: false }
})

const authStore = useAuthStore()
const dialogVisible = ref(false)

async function handleClick() {
  if (!authStore.isUserLoggedIn) {
    ElMessage.warning('请先登录')
    authStore.showLoginDialog = true
    return
  }

  dialogVisible.value = true
}
</script>

<style scoped>
.fav-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: rgba(255, 193, 7, 0.1);
  color: #e6a23c;
  cursor: pointer;
  transition: all 0.2s;
}

.fav-label {
  font-size: 13px;
  line-height: 1;
  white-space: nowrap;
}

.fav-btn:hover {
  background: rgba(255, 193, 7, 0.25);
  transform: translateY(-1px);
}
</style>
