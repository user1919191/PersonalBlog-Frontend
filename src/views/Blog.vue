<template>
  <div class="blog">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索文章..."
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

    <div v-if="tags.length > 0" class="tag-cloud">
      <el-tag
        :type="selectedTagId === null ? 'primary' : 'info'"
        class="tag-item"
        @click="selectTag(null)"
      >全部</el-tag>
      <el-tag
        v-for="tag in tags"
        :key="tag.id"
        :type="selectedTagId === tag.id ? 'primary' : 'info'"
        class="tag-item"
        @click="selectTag(tag.id)"
      >{{ tag.name }}</el-tag>
    </div>

    <div v-if="loading" class="article-list">
      <div v-for="i in pageSize" :key="i" class="article-card skeleton-card">
        <el-skeleton animated>
          <template #template>
            <div style="padding: 4px 0">
              <el-skeleton-item variant="h3" style="width: 55%; height: 22px; margin-bottom: 12px" />
              <el-skeleton-item variant="text" style="width: 95%; margin-bottom: 8px" />
              <el-skeleton-item variant="text" style="width: 75%" />
              <div style="display: flex; gap: 20px; margin-top: 16px">
                <el-skeleton-item variant="text" style="width: 90px" />
                <el-skeleton-item variant="text" style="width: 70px" />
                <el-skeleton-item variant="text" style="width: 70px" />
              </div>
            </div>
          </template>
        </el-skeleton>
      </div>
    </div>

    <div v-else class="article-list">
      <el-empty v-if="articles.length === 0" description="暂无文章" />
      <div
        v-for="article in articles"
        :key="article.id"
        class="article-card"
        @click="goToDetail(article.id)"
      >
        <div class="card-top">
          <div class="card-left">
            <div class="card-title-row">
              <el-tag v-if="article.isTop" type="danger" size="small" class="top-tag">置顶</el-tag>
              <el-tag v-if="article.visibility === 'PRIVATE'" type="warning" size="small" class="private-tag">私有可见</el-tag>
              <h2 class="article-title">{{ article.title }}</h2>
            </div>
            <p class="article-summary">{{ article.summary || '暂无摘要' }}</p>
          </div>
        </div>
        <div class="article-meta">
          <span class="meta-item"><el-icon><Calendar /></el-icon> {{ formatTime(article.createTime) }}</span>
          <span class="meta-item"><el-icon><View /></el-icon> {{ article.viewCount }} 阅读</span>
          <span class="meta-item"><el-icon><ChatDotRound /></el-icon> {{ article.commentCount }} 评论</span>
          <span class="meta-item"><el-icon><Star /></el-icon> {{ article.likeCount }} 点赞</span>
          <span class="favorite-action" @click.stop><FavoriteButton item-type="article" :item-id="article.id" show-label /></span>
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
import { Search, Calendar, View, ChatDotRound, Star } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getArticles } from '@/api/article'
import { useSmartListLoader } from '@/composables/useSmartListLoader'
import { useResourceCacheStore } from '@/store/resource-cache'
import FavoriteButton from '@/components/FavoriteButton.vue'

const router = useRouter()
const resourceCacheStore = useResourceCacheStore()

const categories = ref([])
const tags = ref([])
const keyword = ref('')
const categoryId = ref(null)
const selectedTagId = ref(null)
const pageNum = ref(1)
const pageSize = ref(10)
const { loading, records: articles, total, run: runArticles, cancel } = useSmartListLoader(
  (params, config) => getArticles(params, config),
  { delay: 300 }
)

async function loadArticles(options = {}) {
  try {
    await runArticles({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      categoryId: categoryId.value,
      tagId: selectedTagId.value,
      keyword: keyword.value
    }, options)
  } catch {
    ElMessage.error('加载文章失败')
  }
}

async function loadCategories() {
  try {
    categories.value = await resourceCacheStore.getCategories()
  } catch {
    console.error('加载分类失败')
  }
}

async function loadTags() {
  try {
    tags.value = await resourceCacheStore.getPublicTags()
  } catch {
    console.error('加载标签失败')
  }
}

function handleImmediateSearch() {
  pageNum.value = 1
  loadArticles({ force: true })
}

function handleKeywordClear() {
  pageNum.value = 1
  loadArticles({ debounce: true })
}

function handleFilterChange() {
  pageNum.value = 1
  loadArticles({ force: true })
}

function selectTag(id) {
  selectedTagId.value = id
  pageNum.value = 1
  loadArticles({ force: true })
}

function handlePageChange() {
  loadArticles({ force: true })
}

function goToDetail(id) {
  router.push(`/article/${id}`)
}

function formatTime(time) {
  return new Date(time).toLocaleDateString('zh-CN')
}

watch(keyword, () => {
  pageNum.value = 1
  loadArticles({ debounce: true })
})

onMounted(() => {
  loadArticles()
  loadCategories()
  loadTags()
})

onBeforeUnmount(() => {
  cancel()
})
</script>

<style scoped>
.blog {
  width: 100%;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input { flex: 1; }
.category-select { width: 160px; }

.article-list { min-height: 400px; }

.skeleton-card {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}

.article-card {
  background: #fff;
  padding: 24px;
  margin-bottom: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border: 1px solid transparent;
}

.article-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
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

.card-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.top-tag { flex-shrink: 0; }
.private-tag { flex-shrink: 0; }

.article-title {
  font-size: 20px;
  color: #1a2332;
  font-weight: 600;
  line-height: 1.4;
}

.article-summary {
  color: #606266;
  font-size: 14px;
  line-height: 1.7;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 16px;
}

.article-meta {
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag-item {
  cursor: pointer;
  transition: all 0.2s;
}

.tag-item:hover {
  opacity: 0.85;
  transform: translateY(-1px);
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
