<template>
  <div class="interview">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索面经..."
        clearable
        @keyup.enter="handleImmediateSearch"
        @clear="handleKeywordClear"
        class="search-input"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select
        v-model="categoryId"
        placeholder="全部分类"
        clearable
        @change="handleFilterChange"
        class="category-select"
      >
        <el-option
          v-for="cat in categories"
          :key="cat.id"
          :label="cat.name"
          :value="cat.id"
        />
      </el-select>
    </div>

    <div v-loading="loading" class="interview-list">
      <el-empty v-if="!loading && interviews.length === 0" description="暂无面经" />
      <div
        v-for="item in interviews"
        :key="item.id"
        class="interview-card"
        @click="goToDetail(item.id)"
      >
        <div class="card-title-row">
          <el-tag v-if="item.isTop" type="danger" size="small" class="top-tag">置顶</el-tag>
          <h2 class="interview-title">{{ item.title }}</h2>
        </div>
        <p class="interview-summary">{{ item.summary || '暂无摘要' }}</p>
        <div class="interview-meta">
          <span class="meta-item"><el-icon><Calendar /></el-icon> {{ formatTime(item.createTime) }}</span>
          <span class="meta-item"><el-icon><View /></el-icon> {{ item.viewCount }} 阅读</span>
          <span class="meta-item"><el-icon><ChatDotRound /></el-icon> {{ item.commentCount }} 评论</span>
          <span class="meta-item"><el-icon><Star /></el-icon> {{ item.likeCount }} 点赞</span>
          <span class="favorite-action" @click.stop><FavoriteButton item-type="interview" :item-id="item.id" show-label /></span>
          <span class="meta-item action-hint">操作</span>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="total > 0"
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      layout="prev, pager, next"
      @current-change="handlePageChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, Calendar, View, ChatDotRound, Star } from '@element-plus/icons-vue'
import { getInterviews } from '@/api/interview'
import { useSmartListLoader } from '@/composables/useSmartListLoader'
import { useResourceCacheStore } from '@/store/resource-cache'
import FavoriteButton from '@/components/FavoriteButton.vue'

const router = useRouter()
const resourceCacheStore = useResourceCacheStore()

const categories = ref([])
const keyword = ref('')
const categoryId = ref(null)
const pageNum = ref(1)
const pageSize = ref(10)
const { loading, records: interviews, total, run: runInterviews, cancel } = useSmartListLoader(
  (params, config) => getInterviews(params, config),
  { delay: 300 }
)

async function loadInterviews(options = {}) {
  try {
    await runInterviews({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: categoryId.value,
      keyword: keyword.value
    }, options)
  } catch {
    ElMessage.error('加载面经失败')
  }
}

async function loadCategories() {
  try {
    categories.value = await resourceCacheStore.getCategories()
  } catch {
    console.error('加载分类失败')
  }
}

function handleImmediateSearch() {
  pageNum.value = 1
  loadInterviews({ force: true })
}

function handleKeywordClear() {
  pageNum.value = 1
  loadInterviews({ debounce: true })
}

function handleFilterChange() {
  pageNum.value = 1
  loadInterviews({ force: true })
}

function handlePageChange() {
  loadInterviews({ force: true })
}

function goToDetail(id) {
  router.push(`/interview/${id}`)
}

function formatTime(time) {
  return new Date(time).toLocaleDateString('zh-CN')
}

watch(keyword, () => {
  pageNum.value = 1
  loadInterviews({ debounce: true })
})

onMounted(() => {
  loadInterviews()
  loadCategories()
})

onBeforeUnmount(() => {
  cancel()
})
</script>

<style scoped>
.interview {
  width: 100%;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input { flex: 1; }
.category-select { width: 160px; }
.sort-select { width: 160px; }

.interview-list { min-height: 400px; }

.interview-card {
  background: #fff;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
}

.interview-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
  transform: translateY(-2px);
}

.favorite-action {
  display: none;
}

.interview-card:hover .favorite-action {
  display: inline-flex;
}

.interview-card:hover .action-hint {
  display: none;
}

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.top-tag { flex-shrink: 0; }

.interview-title {
  font-size: 20px;
  color: #1a2332;
  font-weight: 600;
  line-height: 1.4;
}

.interview-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.interview-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #909399;
  font-size: 13px;
}

.action-hint {
  color: #c0c4cc;
}

@media (hover: none) {
  .favorite-action {
    display: inline-flex;
  }

  .action-hint {
    display: none;
  }
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 900px) {
  .filter-bar {
    flex-direction: column;
  }

  .category-select,
  .sort-select {
    width: 100%;
  }
}
</style>
