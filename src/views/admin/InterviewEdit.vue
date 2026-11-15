<template>
  <div class="interview-edit">
    <div class="edit-header">
      <el-button @click="$router.back()">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </el-button>
      <span v-if="savedAt" class="auto-save-tip">已自动保存 {{ savedAt }}</span>
      <div class="edit-actions">
        <el-button @click="saveDraft" :loading="saving">保存草稿</el-button>
        <el-button type="primary" @click="publish" :loading="saving">发布面经</el-button>
      </div>
    </div>

    <div class="edit-body">
      <div class="edit-meta">
        <el-form :model="form" label-position="top">
          <el-form-item label="面经标题">
            <el-input v-model="form.title" placeholder="请输入标题" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select v-model="form.categoryId" placeholder="选择分类" style="width: 100%">
              <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="摘要">
            <el-input v-model="form.summary" type="textarea" :rows="3" placeholder="可选，用于列表摘要展示" />
          </el-form-item>
          <el-form-item label="封面图">
            <el-input v-model="form.coverImage" placeholder="图片 URL" />
            <el-upload
              :show-file-list="false"
              :before-upload="handleUpload"
              accept="image/*"
              class="cover-upload"
            >
              <el-button size="small">
                <el-icon><Upload /></el-icon>
                上传封面
              </el-button>
            </el-upload>
          </el-form-item>
          <el-form-item label="可见性">
            <el-radio-group v-model="form.visibility">
              <el-radio-button label="PUBLIC">公开</el-radio-button>
              <el-radio-button label="PRIVATE">仅我可见</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="置顶">
            <el-checkbox v-model="isTop">置顶面经</el-checkbox>
          </el-form-item>
          <el-alert
            type="info"
            :closable="false"
            title="草稿不展示在前台；已发布且仅我可见的面经只允许后台查看。"
          />
        </el-form>
      </div>

      <div class="editor-wrap">
        <MdEditor
          v-model="form.content"
          :height="editorHeight"
          :theme="themeStore.isDark ? 'dark' : 'light'"
          @upload-img="handleImgUpload"
        />
      </div>
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
  createInterview,
  getAdminInterviewById,
  updateInterview,
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
const savedAt = ref('')
const editorHeight = computed(() => `${window.innerHeight - 180}px`)

const interviewId = computed(() => (route.params.id ? Number(route.params.id) : null))
const draftKey = computed(() => (interviewId.value ? `draft_interview_${interviewId.value}` : 'draft_interview_new'))

const form = reactive({
  title: '',
  content: '# 面经记录\n\n## 题目\n\n## 解法\n\n## 复盘\n',
  summary: '',
  coverImage: '',
  categoryId: null,
  status: 1,
  visibility: 'PUBLIC'
})

let debounceTimer = null

function saveToDraft() {
  localStorage.setItem(draftKey.value, JSON.stringify({ form: { ...form }, isTop: isTop.value }))
  const now = new Date()
  savedAt.value = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
}

watch(() => ({ ...form, isTop: isTop.value }), () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(saveToDraft, 1500)
}, { deep: true })

onBeforeUnmount(() => {
  clearTimeout(debounceTimer)
})

async function loadInterview() {
  const data = await getAdminInterviewById(interviewId.value)
  form.title = data.title
  form.content = data.content
  form.summary = data.summary || ''
  form.coverImage = data.coverImage || ''
  form.categoryId = data.categoryId
  form.status = data.status
  form.visibility = data.visibility || 'PUBLIC'
  isTop.value = data.isTop === 1
}

async function save(status) {
  if (!form.title.trim()) return ElMessage.warning('请输入标题')
  if (!form.categoryId) return ElMessage.warning('请选择分类')
  saving.value = true
  try {
    const payload = {
      ...form,
      status,
      visibility: form.visibility || 'PUBLIC',
      isTop: isTop.value ? 1 : 0
    }
    if (interviewId.value) {
      await updateInterview(interviewId.value, payload)
      ElMessage.success(status === 1 ? '更新成功' : '草稿已保存')
    } else {
      await createInterview(payload)
      ElMessage.success(status === 1 ? '发布成功' : '草稿已保存')
      router.push('/admin/interviews')
    }
    localStorage.removeItem(draftKey.value)
    savedAt.value = ''
  } finally {
    saving.value = false
  }
}

function saveDraft() {
  save(0)
}

function publish() {
  save(1)
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

onMounted(async () => {
  categories.value = await getCategories()
  if (interviewId.value) {
    await loadInterview()
  }

  const draft = localStorage.getItem(draftKey.value)
  if (draft && !interviewId.value) {
    try {
      await ElMessageBox.confirm('检测到未保存的草稿，是否恢复？', '草稿恢复', { type: 'info' })
      const saved = JSON.parse(draft)
      Object.assign(form, saved.form)
      form.visibility = saved.form?.visibility || 'PUBLIC'
      isTop.value = saved.isTop
    } catch {
      localStorage.removeItem(draftKey.value)
    }
  }
})
</script>

<style scoped>
.interview-edit {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 56px - 48px);
  gap: 16px;
}

.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.auto-save-tip {
  font-size: 12px;
  color: #909399;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.edit-body {
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
}

.edit-meta {
  width: 300px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  overflow-y: auto;
}

.cover-upload {
  margin-top: 8px;
}

.editor-wrap {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 960px) {
  .interview-edit {
    height: auto;
  }

  .edit-header,
  .edit-body {
    flex-direction: column;
  }

  .edit-meta {
    width: 100%;
  }
}
</style>
