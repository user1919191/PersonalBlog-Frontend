<template>
  <div class="article-edit" :class="{ 'is-editor-fullscreen': isEditorFullscreen }">
    <div v-if="!isEditorFullscreen" class="edit-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <span v-if="savedAt" class="auto-save-tip">本地草稿已自动保存：{{ savedAt }}</span>
      <div class="edit-actions">
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="submitPrimary" :loading="saving">
          {{ primaryActionLabel }}
        </el-button>
      </div>
    </div>

    <div class="edit-body">
      <aside v-show="!isEditorFullscreen" class="edit-meta">
        <el-form :model="form" label-position="top">
          <el-form-item label="文章标题">
            <el-input v-model="form.title" placeholder="请输入标题" maxlength="200" show-word-limit />
          </el-form-item>

          <el-form-item label="分类">
            <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
              <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="标签">
            <el-select
              v-model="selectedTagIds"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="选择标签"
              style="width: 100%"
            >
              <el-option v-for="item in allTags" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item label="摘要">
            <el-input
              v-model="form.summary"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="可选，用于列表摘要和分享描述"
            />
          </el-form-item>

          <el-form-item label="封面图">
            <el-input v-model="form.coverImage" placeholder="图片 URL" />
            <el-upload
              class="cover-upload"
              :show-file-list="false"
              :before-upload="handleUpload"
              accept="image/*"
            >
              <el-button size="small">
                <el-icon><Upload /></el-icon>
                上传封面
              </el-button>
            </el-upload>
          </el-form-item>

          <el-form-item label="发布方式">
            <el-radio-group v-model="publishMode">
              <el-radio-button label="draft">草稿</el-radio-button>
              <el-radio-button label="published">立即发布</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="可见性">
            <el-radio-group v-model="form.visibility">
              <el-radio-button label="PUBLIC">公开</el-radio-button>
              <el-radio-button label="PRIVATE">仅自己可见</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="置顶">
            <el-checkbox v-model="isTop">置顶文章</el-checkbox>
          </el-form-item>

          <el-form-item label="所属专栏">
            <el-select v-model="form.seriesId" placeholder="不加入专栏" clearable style="width: 100%">
              <el-option v-for="item in allSeries" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>

          <el-form-item v-if="form.seriesId" label="专栏顺序">
            <el-input-number v-model="form.seriesOrder" :min="1" :max="999" style="width: 100%" />
          </el-form-item>

          <el-alert
            type="info"
            :closable="false"
            title="草稿不会出现在前台；发布后即可在博客列表中查看。"
          />
        </el-form>
      </aside>

      <section class="editor-shell" :class="{ fullscreen: isEditorFullscreen }">
        <div class="editor-toolbar">
          <span class="editor-toolbar__tip">Markdown 编辑器</span>
          <el-button size="small" @click="toggleEditorFullscreen">
            {{ isEditorFullscreen ? '退出全屏' : '全屏编辑' }}
          </el-button>
        </div>

        <div class="editor-wrap">
          <MdEditor
            v-model="form.content"
            class="editor-instance"
            :height="editorHeight"
            :pageFullscreen="false"
            :theme="themeStore.isDark ? 'dark' : 'light'"
            @upload-img="handleImgUpload"
          />
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Upload } from '@element-plus/icons-vue'
import 'md-editor-v3/lib/style.css'
import { getCategories } from '../../api/category'
import {
  createArticle,
  getAdminArticleById,
  getAdminSeries,
  getAdminTags,
  updateArticle,
  uploadFile
} from '../../api/admin'
import { useThemeStore } from '../../store/theme'
import { loadMdEditor } from '../../utils/md-editor'

const route = useRoute()
const router = useRouter()
const themeStore = useThemeStore()
const MdEditor = defineAsyncComponent(loadMdEditor)

const saving = ref(false)
const isTop = ref(false)
const categories = ref([])
const allTags = ref([])
const allSeries = ref([])
const selectedTagIds = ref([])
const savedAt = ref('')
const viewportHeight = ref(window.innerHeight)
const isEditorFullscreen = ref(false)
const publishMode = ref('published')

const articleId = computed(() => (route.params.id ? Number(route.params.id) : null))
const draftKey = computed(() => (articleId.value ? `draft_article_${articleId.value}` : 'draft_article_new'))
const editorHeight = computed(() => {
  if (isEditorFullscreen.value) {
    return `${viewportHeight.value - 110}px`
  }
  return '100%'
})
const primaryActionLabel = computed(() => {
  if (publishMode.value === 'draft') {
    return articleId.value ? '保存变更' : '创建草稿'
  }
  return articleId.value ? '保存并发布' : '立即发布'
})

const form = reactive({
  title: '',
  content: '# 开始写作\n\n在这里输入文章内容。',
  summary: '',
  coverImage: '',
  categoryId: null,
  seriesId: null,
  seriesOrder: 1,
  status: 1,
  visibility: 'PUBLIC'
})

let debounceTimer = null

function updateViewportHeight() {
  viewportHeight.value = window.innerHeight
}

function toggleEditorFullscreen() {
  isEditorFullscreen.value = !isEditorFullscreen.value
  document.body.classList.toggle('article-editor-fullscreen', isEditorFullscreen.value)
}

function syncModeFromArticle(article) {
  publishMode.value = article.status === 0 ? 'draft' : 'published'
}

function saveToDraft() {
  localStorage.setItem(
    draftKey.value,
    JSON.stringify({
      form: { ...form },
      isTop: isTop.value,
      selectedTagIds: selectedTagIds.value,
      publishMode: publishMode.value
    })
  )
  const now = new Date()
  savedAt.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

function applySavedDraft(saved) {
  Object.assign(form, saved.form || {})
  form.visibility = saved.form?.visibility || 'PUBLIC'
  isTop.value = Boolean(saved.isTop)
  selectedTagIds.value = Array.isArray(saved.selectedTagIds) ? saved.selectedTagIds : []
  publishMode.value = saved.publishMode === 'draft' ? 'draft' : 'published'
}

function buildPayload(mode) {
  if (!form.title.trim()) {
    ElMessage.warning('请输入标题')
    return null
  }
  if (!form.categoryId) {
    ElMessage.warning('请选择分类')
    return null
  }

  return {
    ...form,
    status: mode === 'draft' ? 0 : 1,
    visibility: form.visibility || 'PUBLIC',
    isTop: isTop.value ? 1 : 0,
    tagIds: selectedTagIds.value
  }
}

watch([() => ({ ...form }), isTop, selectedTagIds, publishMode], () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(saveToDraft, 1500)
}, { deep: true })

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
  document.body.classList.remove('article-editor-fullscreen')
  window.removeEventListener('resize', updateViewportHeight)
})

async function loadArticle() {
  const data = await getAdminArticleById(articleId.value)
  form.title = data.title || ''
  form.content = data.content || ''
  form.summary = data.summary || ''
  form.coverImage = data.coverImage || ''
  form.categoryId = data.categoryId
  form.seriesId = data.seriesId || null
  form.seriesOrder = data.seriesOrder || 1
  form.status = data.status ?? 1
  form.visibility = data.visibility || 'PUBLIC'
  isTop.value = data.isTop === 1
  selectedTagIds.value = Array.isArray(data.tags) ? data.tags.map(tag => tag.id) : []
  syncModeFromArticle(data)
}

async function submit(mode) {
  const payload = buildPayload(mode)
  if (!payload) {
    return
  }

  saving.value = true
  try {
    let savedArticle
    if (articleId.value) {
      savedArticle = await updateArticle(articleId.value, payload)
      ElMessage.success(mode === 'draft' ? '草稿已保存' : '文章已发布')
    } else {
      savedArticle = await createArticle(payload)
      ElMessage.success(mode === 'draft' ? '草稿已创建' : '文章已发布')
    }
    localStorage.removeItem(draftKey.value)
    savedAt.value = ''
    if (savedArticle?.id) {
      router.replace(`/admin/articles/${savedArticle.id}/edit`)
    } else {
      router.push('/admin/articles')
    }
  } finally {
    saving.value = false
  }
}

function saveDraft() {
  publishMode.value = 'draft'
  submit('draft')
}

function submitPrimary() {
  submit(publishMode.value)
}

async function handleUpload(file) {
  const url = await uploadFile(file)
  form.coverImage = url
  return false
}

async function handleImgUpload(files, callback) {
  const urls = await Promise.all(files.map(file => uploadFile(file)))
  callback(urls)
}

async function tryRestoreLocalDraft() {
  const draft = localStorage.getItem(draftKey.value)
  if (!draft) {
    return
  }
  try {
    await ElMessageBox.confirm('检测到本地未提交草稿，是否恢复？', '草稿恢复', {
      type: 'info',
      confirmButtonText: '恢复',
      cancelButtonText: '忽略'
    })
    applySavedDraft(JSON.parse(draft))
  } catch {
    localStorage.removeItem(draftKey.value)
  }
}

onMounted(async () => {
  window.addEventListener('resize', updateViewportHeight)
  categories.value = await getCategories()
  allTags.value = await getAdminTags()
  try {
    allSeries.value = await getAdminSeries()
  } catch {
    allSeries.value = []
  }

  if (articleId.value) {
    await loadArticle()
  }

  await tryRestoreLocalDraft()
})
</script>

<style scoped>
.article-edit {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 105px);
  gap: 16px;
}

.article-edit.is-editor-fullscreen {
  height: 100vh;
}

.edit-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-shrink: 0;
}

.auto-save-tip {
  color: #909399;
  font-size: 12px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-body {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 18px;
  flex: 1;
  min-height: 0;
}

.edit-meta {
  position: sticky;
  top: 16px;
  align-self: start;
  min-height: 0;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
}

.cover-upload {
  margin-top: 10px;
}

.editor-shell {
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  background: #fff;
  overflow: hidden;
}

.editor-shell.fullscreen {
  position: fixed;
  inset: 12px;
  z-index: 3000;
  border-radius: 18px;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.editor-toolbar__tip {
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
}

.editor-wrap {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  background: #fff;
}

.editor-instance {
  width: 100%;
}

.editor-wrap :deep(.md-editor) {
  border: none;
  height: 100% !important;
}

.editor-wrap :deep(.md-editor-footer) {
  height: 24px;
  min-height: 24px;
  padding: 0 8px;
  font-size: 12px;
  line-height: 24px;
}

.editor-wrap :deep(.md-editor-footer-item) {
  height: 24px;
  line-height: 24px;
}

@media (max-width: 1100px) {
  .edit-body {
    grid-template-columns: 1fr;
  }

  .edit-meta {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .article-edit {
    height: auto;
    min-height: calc(100vh - 105px);
  }

  .edit-header {
    flex-direction: column;
    align-items: stretch;
  }

  .edit-actions {
    width: 100%;
  }

  .edit-actions :deep(.el-button) {
    flex: 1;
    min-width: 0;
  }

  .edit-meta {
    padding: 16px;
    border-radius: 14px;
  }

  .editor-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .editor-shell.fullscreen {
    inset: 0;
    border-radius: 0;
  }
}
</style>
