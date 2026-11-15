<template>
  <div class="catalog-shell">
    <div class="toolbar">
      <el-input v-model="keyword" :placeholder="placeholder" clearable />
      <div class="toolbar-meta">共 {{ filteredItems.length }} 条</div>
    </div>

    <div class="catalog-grid">
      <aside class="sidebar-card">
        <el-collapse v-model="openCategories" class="category-collapse">
          <el-collapse-item
            v-for="category in visibleCategories"
            :key="category.key"
            :name="category.key"
          >
            <template #title>
              <div class="category-title">
                <span>{{ category.label }}</span>
                <span class="category-count">{{ groupedItems[category.key]?.length || 0 }}</span>
              </div>
            </template>

            <div class="item-list">
              <button
                v-for="item in groupedItems[category.key]"
                :key="item.id"
                class="item-button"
                :class="{ active: item.id === activeId }"
                @click="activeId = item.id"
              >
                <strong>{{ item.title }}</strong>
                <span>{{ item.summary }}</span>
              </button>
            </div>
          </el-collapse-item>
        </el-collapse>
      </aside>

      <section v-if="activeItem" class="detail-card">
        <div class="detail-head">
          <div>
            <div class="detail-title">{{ activeItem.title }}</div>
            <div class="detail-summary">{{ activeItem.summary }}</div>
          </div>
          <el-button
            v-if="activeItem.command"
            type="primary"
            @click="copyText(activeItem.command)"
          >
            复制命令
          </el-button>
        </div>

        <div v-if="activeItem.command" class="detail-section">
          <div class="section-title">命令格式</div>
          <pre class="code-block">{{ activeItem.command }}</pre>
        </div>

        <div v-if="activeItem.example" class="detail-section">
          <div class="section-title">示例</div>
          <pre class="code-block">{{ activeItem.example }}</pre>
        </div>

        <div v-if="activeItem.scenario?.length" class="detail-section">
          <div class="section-title">适用场景</div>
          <div class="tag-row">
            <span v-for="tag in activeItem.scenario" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div v-if="activeItem.steps?.length" class="detail-section">
          <div class="section-title">操作步骤</div>
          <ol class="plain-list numbered-list">
            <li v-for="step in activeItem.steps" :key="step">{{ step }}</li>
          </ol>
        </div>

        <div v-if="activeItem.outputTips?.length" class="detail-section">
          <div class="section-title">{{ outputTitle }}</div>
          <ul class="plain-list">
            <li v-for="item in activeItem.outputTips" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="activeItem.caution?.length" class="detail-section">
          <div class="section-title">注意事项</div>
          <ul class="plain-list caution-list">
            <li v-for="item in activeItem.caution" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="relatedItems.length" class="detail-section">
          <div class="section-title">相关条目</div>
          <div class="tag-row">
            <button
              v-for="item in relatedItems"
              :key="item.id"
              class="related-button"
              @click="activeId = item.id"
            >
              {{ item.title }}
            </button>
          </div>
        </div>
      </section>

      <section v-else class="detail-card empty-state">
        没有匹配到内容。
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  categories: {
    type: Array,
    required: true
  },
  items: {
    type: Array,
    required: true
  },
  placeholder: {
    type: String,
    default: '搜索命令、场景、别名'
  },
  outputTitle: {
    type: String,
    default: '输出怎么看'
  }
})

const keyword = ref('')
const activeId = ref(props.items[0]?.id || '')
const openCategories = ref(props.categories.slice(0, 2).map(item => item.key))

const filteredItems = computed(() => {
  const text = keyword.value.trim().toLowerCase()
  return props.items.filter(item => {
    if (!text) return true
    const haystack = [
      item.title,
      item.command,
      item.summary,
      item.example,
      ...(item.scenario || []),
      ...(item.aliases || []),
      ...(item.outputTips || []),
      ...(item.steps || [])
    ].join(' ').toLowerCase()
    return haystack.includes(text)
  })
})

const groupedItems = computed(() => filteredItems.value.reduce((acc, item) => {
  if (!acc[item.category]) acc[item.category] = []
  acc[item.category].push(item)
  return acc
}, {}))

const visibleCategories = computed(() => props.categories.filter(item => groupedItems.value[item.key]?.length))

const activeItem = computed(() => (
  filteredItems.value.find(item => item.id === activeId.value) || filteredItems.value[0] || null
))

const relatedItems = computed(() => {
  if (!activeItem.value?.related?.length) return []
  return activeItem.value.related
    .map(id => props.items.find(item => item.id === id))
    .filter(Boolean)
})

watch(visibleCategories, value => {
  if (!value.length) {
    openCategories.value = []
    return
  }
  const keepOpen = openCategories.value.filter(key => value.some(item => item.key === key))
  openCategories.value = keepOpen.length ? keepOpen : [value[0].key]
}, { immediate: true })

watch(filteredItems, value => {
  if (!value.length) {
    activeId.value = ''
    return
  }
  if (!value.some(item => item.id === activeId.value)) {
    activeId.value = value[0].id
  }
}, { immediate: true })

function copyText(text) {
  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success('已复制'))
    .catch(() => ElMessage.error('复制失败'))
}
</script>

<style scoped>
.catalog-shell,
.detail-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.toolbar-meta {
  color: #64748b;
  font-size: 12px;
}

.catalog-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 18px;
}

.sidebar-card,
.detail-card {
  border-radius: 18px;
  border: 1px solid #dbe4ee;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
}

.sidebar-card {
  padding: 8px 12px;
  max-height: 72vh;
  overflow: auto;
}

.category-collapse {
  --el-collapse-border-color: transparent;
}

.category-title {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #0f172a;
  font-weight: 700;
}

.category-count {
  color: #64748b;
  font-size: 12px;
}

.item-list {
  display: grid;
  gap: 10px;
}

.item-button {
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #dbe4ee;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.item-button strong,
.detail-title,
.section-title {
  color: #0f172a;
  font-weight: 700;
}

.item-button span,
.detail-summary,
.empty-state {
  display: block;
  margin-top: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.7;
}

.item-button.active,
.item-button:hover,
.related-button:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.detail-card {
  padding: 18px 20px;
}

.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag,
.related-button {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid #cbd5e1;
  background: #fff;
  color: #334155;
  font-size: 12px;
}

.related-button {
  cursor: pointer;
}

.code-block {
  margin: 0;
  padding: 14px 16px;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
  font: 13px/1.7 'Consolas', 'Monaco', monospace;
}

.plain-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.8;
}

.numbered-list {
  padding-left: 22px;
}

.caution-list {
  color: #92400e;
}

.empty-state {
  justify-content: center;
}

@media (max-width: 960px) {
  .catalog-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-card {
    max-height: none;
  }
}
</style>
