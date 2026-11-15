<template>
  <div class="featured">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索精选标题、描述..."
        clearable
        @keyup.enter="handleImmediateSearch"
        @clear="handleKeywordClear"
        class="search-input"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
    </div>

    <div class="category-nav" v-loading="categoryLoading">
      <div class="nav-group">
        <div class="group-label">分类</div>
        <div class="nav-tabs">
          <div
            class="nav-tab"
            :class="{ active: !activeCategory }"
            @click="selectCategory('')"
          >
            全部
          </div>
          <div
            v-for="category in categories"
            :key="category"
            class="nav-tab"
            :class="{ active: activeCategory === category }"
            @click="selectCategory(category)"
          >
            {{ category }}
          </div>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="article-section">
      <el-empty v-if="!loading && records.length === 0" description="暂无匹配结果" />
      <div class="article-grid">
        <div
          v-for="article in records"
          :key="article.id"
          class="article-card"
          @click="openFeatured(article)"
        >
          <div class="card-body">
            <h3 class="card-title">{{ article.title }}</h3>
            <p class="card-desc">{{ article.description || '暂无描述' }}</p>
          </div>
          <div class="card-footer">
            <div class="meta-group">
              <el-tag size="small" type="info">{{ article.category }}</el-tag>
              <span class="meta-text">{{ formatTime(article.createTime) }}</span>
            </div>
            <div class="card-actions">
              <span class="favorite-action" @click.stop><FavoriteButton item-type="featured" :item-id="article.id" show-label /></span>
              <span class="meta-text action-hint">操作</span>
              <el-icon class="link-icon"><TopRight /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-pagination
      v-if="records.length > 0"
      v-model:current-page="pageNum"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="[30, 60]"
      layout="total, sizes, prev, pager, next"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
      class="pagination"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { TopRight, Search } from '@element-plus/icons-vue'
import { getFeaturedArticles, getFeaturedCategories } from '@/api/featured'
import { useSmartListLoader } from '@/composables/useSmartListLoader'
import FavoriteButton from '@/components/FavoriteButton.vue'

const categories = ref([])
const categoryLoading = ref(false)
const activeCategory = ref('')
const keyword = ref('')
const pageNum = ref(1)
const pageSize = ref(30)
const { loading, records, total, run: runArticles, cancel } = useSmartListLoader(
  (params, config) => getFeaturedArticles(params, config),
  { delay: 300 }
)

async function loadCategories() {
  categoryLoading.value = true
  try {
    categories.value = await getFeaturedCategories()
  } catch {
    ElMessage.error('加载分类失败')
  } finally {
    categoryLoading.value = false
  }
}

async function loadArticles(options = {}) {
  try {
    await runArticles({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      category: activeCategory.value || undefined,
      keyword: keyword.value || undefined
    }, options)
  } catch {
    ElMessage.error('加载精选失败')
  }
}

function selectCategory(cat) {
  activeCategory.value = cat
  pageNum.value = 1
  loadArticles({ force: true })
}

function handleImmediateSearch() {
  pageNum.value = 1
  loadArticles({ force: true })
}

function handleKeywordClear() {
  pageNum.value = 1
  loadArticles({ debounce: true })
}

function handlePageChange() {
  loadArticles({ force: true })
}

function handleSizeChange() {
  pageNum.value = 1
  loadArticles({ force: true })
}

function openFeatured(article) {
  if (article.url) {
    window.open(article.url, '_blank', 'noopener,noreferrer')
  }
}

function formatTime(value) {
  return value ? new Date(value).toLocaleDateString('zh-CN') : '-'
}

watch(keyword, () => {
  pageNum.value = 1
  loadArticles({ debounce: true })
})

onMounted(async () => {
  await Promise.all([loadCategories(), loadArticles()])
})

onBeforeUnmount(() => {
  cancel()
})
</script>

<style scoped>
.featured {
  width: 100%;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  max-width: 400px;
}

.sort-select {
  width: 160px;
}

.category-nav {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.nav-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 0;
}

.nav-group + .nav-group {
  border-top: 1px dashed #e4e7ed;
  padding-top: 10px;
  margin-top: 4px;
}

.group-label {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  min-width: 56px;
  padding-top: 5px;
  text-align: right;
}

.nav-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 14px;
  border-radius: 16px;
  font-size: 13px;
  color: #606266;
  background: #f5f7fa;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  user-select: none;
}

.nav-tab:hover {
  color: #409eff;
  background: #ecf5ff;
}

.nav-tab.active {
  color: #fff;
  background: #409eff;
}

.tab-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  font-size: 11px;
  line-height: 1;
  background: rgba(0, 0, 0, 0.08);
  color: inherit;
}

.nav-tab.active .tab-badge {
  background: rgba(255, 255, 255, 0.3);
}

.article-section {
  min-height: 200px;
}

.article-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.article-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.2s;
  border: 1px solid transparent;
  cursor: pointer;
  min-height: 140px;
}

.article-card:hover {
  border-color: #409eff;
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.favorite-action {
  display: none;
}

.article-card:hover .favorite-action {
  display: inline-flex;
}

.article-card:hover .action-hint {
  display: none;
}

@media (hover: none) {
  .favorite-action {
    display: inline-flex;
  }

  .action-hint {
    display: none;
  }
}

.card-title {
  font-size: 15px;
  color: #1a2332;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.5;
}

.card-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.6;
  margin-bottom: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.meta-group,
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.meta-text {
  color: #909399;
  font-size: 12px;
}

.action-hint {
  color: #c0c4cc;
}

.link-icon {
  color: #409eff;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 900px) {
  .filter-bar,
  .nav-group {
    flex-direction: column;
    gap: 6px;
  }

  .sort-select,
  .search-input {
    width: 100%;
    max-width: none;
  }

  .article-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .group-label {
    text-align: left;
  }
}

@media (max-width: 600px) {
  .article-grid {
    grid-template-columns: 1fr;
  }
}
</style>
