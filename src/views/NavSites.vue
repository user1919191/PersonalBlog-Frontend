<template>
  <div class="nav-sites">
    <div class="filter-bar">
      <el-input
        v-model="keyword"
        placeholder="搜索网站名称、描述..."
        clearable
        @keyup.enter="handleImmediateSearch"
        @clear="handleImmediateSearch"
        class="search-input"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select
        v-model="activeCategory"
        placeholder="全部分类"
        clearable
        @change="handleFilterChange"
        class="category-select"
      >
        <el-option v-for="cat in categoryOptions" :key="cat" :label="cat" :value="cat" />
      </el-select>
    </div>

    <div v-loading="loading">
      <el-empty v-if="!loading && records.length === 0" description="暂无匹配结果" />
      <div class="site-grid">
        <a
          v-for="site in records"
          :key="site.id"
          :href="site.url"
          target="_blank"
          rel="noopener noreferrer"
          class="site-card"
        >
          <div class="site-icon">
            <el-icon size="22" color="#409eff"><ChromeFilled /></el-icon>
          </div>
          <div class="site-info">
            <div class="site-name">{{ site.name }}</div>
            <div class="site-desc">{{ site.description || '' }}</div>
          </div>
          <el-tag size="small" type="info" class="site-cat">{{ site.category }}</el-tag>
          <el-icon class="link-arrow"><TopRight /></el-icon>
        </a>
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
import { ChromeFilled, TopRight, Search } from '@element-plus/icons-vue'
import { getNavSites } from '@/api/nav'
import { useSmartListLoader } from '@/composables/useSmartListLoader'

const pageNum = ref(1)
const pageSize = ref(30)
const keyword = ref('')
const activeCategory = ref('')
const categoryOptions = ref([])

const { loading, records, total, run: runNavs, cancel } = useSmartListLoader(
  (params, signal) => getNavSites(params, signal),
  { delay: 300 }
)

async function loadNavs(options = {}) {
  try {
    await runNavs({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      keyword: keyword.value || undefined,
      category: activeCategory.value || undefined
    }, options)
  } catch {
    ElMessage.error('加载失败')
  }
}

async function loadCategories() {
  try {
    const data = await getNavSites({ pageNum: 1, pageSize: 500 })
    const categories = (data?.records || [])
      .map(item => item.category)
      .filter(item => item && item.trim())
    categoryOptions.value = Array.from(new Set(categories))
  } catch {
    categoryOptions.value = []
  }
}

function handleImmediateSearch() {
  pageNum.value = 1
  loadNavs({ force: true })
}

function handleFilterChange() {
  pageNum.value = 1
  loadNavs({ force: true })
}

function handlePageChange() {
  loadNavs({ force: true })
}

function handleSizeChange() {
  pageNum.value = 1
  loadNavs({ force: true })
}

watch(keyword, () => {
  pageNum.value = 1
  loadNavs({ debounce: true })
})

onMounted(() => {
  loadCategories()
  loadNavs()
})

onBeforeUnmount(() => {
  cancel()
})
</script>

<style scoped>
.nav-sites {
  width: 100%;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input { flex: 1; max-width: 400px; }
.category-select { width: 160px; }

.site-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.site-card {
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  border: 1px solid transparent;
  text-decoration: none;
  color: inherit;
}

.site-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 14px rgba(64, 158, 255, 0.15);
  transform: translateY(-2px);
}

.site-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.site-info {
  flex: 1;
  min-width: 0;
}

.site-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a2332;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-desc {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-cat {
  flex-shrink: 0;
}

.link-arrow {
  color: #c0c4cc;
  font-size: 14px;
  flex-shrink: 0;
}

.site-card:hover .link-arrow {
  color: #409eff;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 900px) {
  .site-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .site-grid {
    grid-template-columns: 1fr;
  }
}
</style>
