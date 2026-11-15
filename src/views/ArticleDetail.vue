<template>
  <div class="article-detail">
    <div v-if="loading" class="article-layout" :class="{ 'side-collapsed': sideCollapsed }">
      <div class="article-main">
        <el-skeleton animated :rows="12" />
      </div>
      <div class="article-side">
        <el-skeleton animated :rows="10" />
      </div>
    </div>

    <div v-else-if="article" class="article-layout" :class="{ 'side-collapsed': sideCollapsed }">
      <article class="article-main">
        <header class="article-header">
          <p v-if="article.series?.name" class="series-badge">{{ article.series.name }}</p>
          <div class="title-row">
            <el-tag v-if="article.visibility === 'PRIVATE'" type="warning" size="small">私人可见</el-tag>
            <h1 class="article-title">{{ article.title }}</h1>
          </div>
          <div class="article-meta">
            <span>{{ formatTime(article.createTime) }}</span>
            <span>{{ article.viewCount }} 阅读</span>
            <span>{{ article.commentCount }} 评论</span>
            <span>{{ readingTime }} 分钟阅读</span>
            <span v-if="article.authorName">作者：{{ article.authorName }}</span>
          </div>
          <div class="tag-row">
            <div class="tags">
              <el-tag
                v-for="tag in article.tags || []"
                :key="tag.id"
                class="tag-item"
                effect="plain"
              >
                {{ tag.name }}
              </el-tag>
            </div>
            <div v-if="isUserLoggedIn" class="subscription-actions">
              <el-button
                v-if="article.authorId"
                size="small"
                :type="isAuthorSubscribed(article.authorId) ? 'primary' : 'default'"
                @click="toggleAuthorSubscription"
              >
                {{ isAuthorSubscribed(article.authorId) ? '已订阅作者' : '订阅作者' }}
              </el-button>
              <el-button
                v-for="tag in article.tags || []"
                :key="`sub-${tag.id}`"
                size="small"
                plain
                @click="toggleTagSubscription(tag)"
              >
                {{ isTagSubscribed(tag.id) ? `取消 ${tag.name}` : `订阅 ${tag.name}` }}
              </el-button>
            </div>
          </div>
        </header>

        <section v-if="article.seriesNav" class="chapter-nav">
          <div class="chapter-summary">
            <span>当前章节</span>
            <strong>第 {{ article.seriesNav.currentOrder }} / {{ article.seriesNav.totalCount }} 篇</strong>
          </div>
          <div class="chapter-links">
            <el-button
              :disabled="!article.seriesNav.prevId"
              @click="goToArticle(article.seriesNav.prevId)"
            >
              上一篇
            </el-button>
            <el-button
              type="primary"
              :disabled="!article.seriesNav.nextId"
              @click="goToArticle(article.seriesNav.nextId)"
            >
              下一篇
            </el-button>
          </div>
        </section>

        <div class="article-preview-wrap" @contextmenu.prevent>
        <MdPreview
          :id="previewId"
          :model-value="protectedContent"
          :theme="themeStore.isDark ? 'dark' : 'light'"
          preview-theme="github"
          code-theme="github"
          :show-code-row-number="true"
          :code-foldable="true"
          :auto-fold-threshold="36"
          class="article-preview"
        />
        <canvas ref="watermarkCanvas" class="watermark-layer" />
        </div>

        <footer class="copyright-notice">
          <p>&copy; {{ new Date().getFullYear() }} Su的博客 | 本文为原创内容，转载请注明出处</p>
          <p>
            原文链接：<a :href="currentUrl">{{ currentUrl }}</a>
          </p>
          <p v-if="article.authorName">作者：{{ article.authorName }}</p>
          <p>发布时间：{{ formatTime(article.createTime) }}</p>
        </footer>

<footer class="article-actions">
          <el-button
            :type="liked ? 'primary' : 'default'"
            @click="handleLike"
          >
            {{ liked ? '已点赞' : '点赞' }} ({{ article.likeCount }})
          </el-button>
          <el-button @click="copyLink">复制链接</el-button>
        </footer>

        <section class="comment-panel">
          <div class="comment-header">
            <h2>评论</h2>
            <span>{{ comments.length }} 条</span>
          </div>

          <div v-if="!isUserLoggedIn" class="comment-login-tip">
            登录后可评论、回复、订阅通知
          </div>

          <div v-else class="comment-form">
            <el-input
              v-model="commentContent"
              type="textarea"
              :rows="4"
              maxlength="500"
              show-word-limit
              placeholder="写下你的评论"
            />
            <div class="comment-form-actions">
              <span v-if="commentCooldown > 0">{{ commentCooldown }}s 后可再次评论</span>
              <el-button
                type="primary"
                :loading="submitting"
                :disabled="commentCooldown > 0"
                @click="submitComment(0)"
              >
                发表评论
              </el-button>
            </div>
          </div>

          <div class="comment-list">
            <el-empty v-if="commentTree.length === 0" description="暂无评论" />
            <div v-for="thread in commentTree" :key="thread.id" class="comment-thread">
              <div class="comment-item">
                <el-avatar :src="thread.avatar" :size="40" />
                <div class="comment-body">
                  <div class="comment-line">
                    <strong>{{ thread.displayName }}</strong>
                    <span>{{ formatTime(thread.createTime) }}</span>
                  </div>
                  <p>{{ thread.content }}</p>
                  <div class="comment-tools">
                    <el-button
                      v-if="isUserLoggedIn"
                      link
                      type="primary"
                      @click="toggleReplyBox(thread.id)"
                    >
                      {{ activeReplyId === thread.id ? '取消回复' : '回复' }}
                    </el-button>
                  </div>
                  <div v-if="activeReplyId === thread.id" class="reply-box">
                    <el-input
                      v-model="replyDrafts[thread.id]"
                      type="textarea"
                      :rows="3"
                      maxlength="500"
                      show-word-limit
                      placeholder="回复这条评论"
                    />
                    <div class="reply-box-actions">
                      <el-button @click="toggleReplyBox(null)">取消</el-button>
                      <el-button type="primary" :loading="submitting" @click="submitComment(thread.id)">
                        提交回复
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="thread.children?.length" class="reply-list">
                <div
                  v-for="reply in visibleReplies(thread)"
                  :key="reply.id"
                  class="comment-item reply-item"
                >
                  <el-avatar :src="reply.avatar" :size="32" />
                  <div class="comment-body">
                    <div class="comment-line">
                      <strong>{{ reply.displayName }}</strong>
                      <span>{{ formatTime(reply.createTime) }}</span>
                    </div>
                    <p>{{ reply.content }}</p>
                  </div>
                </div>
                <el-button
                  v-if="thread.children.length > COLLAPSE_THRESHOLD"
                  link
                  type="primary"
                  @click="toggleExpand(thread.id)"
                >
                  {{ isExpanded(thread.id) ? '收起回复' : `展开 ${thread.children.length - COLLAPSE_THRESHOLD} 条回复` }}
                </el-button>
              </div>
            </div>
          </div>
        </section>
      </article>

      <aside class="article-side" :class="{ collapsed: sideCollapsed }">
        <button
          class="side-toggle"
          type="button"
          :aria-label="sideCollapsed ? '展开右侧目录' : '收起右侧目录'"
          @click="toggleSide"
        >
          {{ sideCollapsed ? '展开目录' : '收起目录' }}
        </button>
        <div v-show="!sideCollapsed" class="side-panels">
        <section v-if="limitedSeriesArticles.length" class="side-card">
          <div class="side-title">本专栏目录</div>
          <div class="series-list">
            <button
              v-for="item in limitedSeriesArticles"
              :key="item.id"
              class="series-item"
              :class="{ active: item.id === article.id }"
              @click="goToArticle(item.id)"
            >
              <span class="series-order">{{ item.seriesOrder }}</span>
              <span class="series-text">{{ item.title }}</span>
            </button>
          </div>
        </section>

        <section class="side-card">
          <div class="side-title">文章目录</div>
          <div ref="catalogRef" class="catalog-body">
            <MdCatalog :editor-id="previewId" :scroll-element="scrollElement" />
          </div>
        </section>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import 'md-editor-v3/lib/style.css'
import { ElMessage } from 'element-plus'
import { createComment, getCommentsByArticleId } from '@/api/comment'
import { getArticleById, getLastReadingAnchor, likeArticle, saveReadingAnchor, unlikeArticle } from '@/api/article'
import { getUserSubscriptions, subscribeTarget, unsubscribeTarget } from '@/api/user'
import { useAuthStore } from '@/store/auth'
import { useThemeStore } from '@/store/theme'
import { loadMdCatalog, loadMdPreview } from '@/utils/md-editor'

const previewId = 'article-preview'
const scrollElement = document.documentElement
const COLLAPSE_THRESHOLD = 3
const COMMENT_COOLDOWN_SEC = 60

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()
const MdPreview = defineAsyncComponent(loadMdPreview)
const MdCatalog = defineAsyncComponent(loadMdCatalog)

const loading = ref(false)
const article = ref(null)
const comments = ref([])
const liked = ref(false)
const submitting = ref(false)
const commentContent = ref('')
const commentCooldown = ref(0)
const expandedReplies = ref([])
const activeReplyId = ref(null)
const replyDrafts = ref({})
const subscriptions = ref([])
const restoreAnchor = ref('')
const sideCollapsed = ref(false)
const catalogRef = ref(null)
const watermarkCanvas = ref(null)
let cooldownTimer = null
let saveTimer = null
let catalogObserver = null
let resizeObserver = null

const currentUrl = computed(() => window.location.origin + `/article/${route.params.id}`)

// ---- 零宽字符隐形水印 ----
const ZERO_WIDTH_CHARS = ['\u200b', '\u200c', '\u200d', '\ufeff']

function encodeToZeroWidth(text) {
  return text.split('').map(ch => {
    const bin = ch.charCodeAt(0).toString(2).padStart(8, '0')
    return bin.split('').map(b => ZERO_WIDTH_CHARS[+b]).join('') + ZERO_WIDTH_CHARS[2]
  }).join('')
}

function buildWatermarkPayload() {
  const uid = authStore.userInfo?.id || 'guest'
  const ts = Date.now().toString(36)
  return encodeToZeroWidth(`${uid}-${ts}`)
}

function injectZeroWidthWatermark(content) {
  if (!content) return content
  const payload = buildWatermarkPayload()
  // 注入到第一个段落结尾
  const idx = content.indexOf('\n\n')
  if (idx > 0) {
    return content.slice(0, idx) + payload + content.slice(idx)
  }
  return content + payload
}

const protectedContent = computed(() => {
  if (!article.value?.content) return ''
  return injectZeroWidthWatermark(article.value.content)
})

// ---- Canvas 可见水印 ----
function drawWatermark() {
  const canvas = watermarkCanvas.value
  if (!canvas) return
  const parent = canvas.parentElement
  if (!parent) return

  const width = parent.offsetWidth
  const height = parent.offsetHeight
  const dpr = window.devicePixelRatio || 1
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, width, height)

  const text = authStore.userInfo?.username || 'Su的博客'
  ctx.font = '15px sans-serif'
  ctx.fillStyle = 'rgba(0, 0, 0, 0.035)'
  ctx.textAlign = 'center'

  const gapX = 220
  const gapY = 160
  for (let y = 40; y < height; y += gapY) {
    for (let x = 40; x < width; x += gapX) {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(-20 * Math.PI / 180)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }
  }
}

// ---- 键盘快捷键拦截 ----
function handleKeydown(e) {
  // 允许在 textarea / input 中正常使用
  const tag = e.target.tagName
  if (tag === 'INPUT' || tag === 'TEXTAREA') return

  const ctrl = e.ctrlKey || e.metaKey
  // Ctrl+C / Ctrl+A / Ctrl+S / Ctrl+P
  if (ctrl && ['c', 'a', 's', 'p'].includes(e.key.toLowerCase())) {
    // 如果选区在代码块内则放行 Ctrl+C
    if (e.key.toLowerCase() === 'c') {
      const sel = window.getSelection()
      if (sel?.anchorNode) {
        const el = sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement
        if (el?.closest('pre')) return
      }
    }
    e.preventDefault()
  }
  // F12
  if (e.key === 'F12') {
    e.preventDefault()
  }
}

const isUserLoggedIn = computed(() => authStore.isUserLoggedIn)
const readingTime = computed(() => {
  if (!article.value?.content) return 1
  return Math.max(1, Math.ceil(article.value.content.length / 450))
})
const limitedSeriesArticles = computed(() => {
  const items = article.value?.series?.articles || []
  if (items.length <= 5) {
    return items
  }

  const currentIndex = items.findIndex(item => item.id === article.value?.id)
  if (currentIndex === -1) {
    return items.slice(0, 5)
  }

  let start = Math.max(0, currentIndex - 2)
  let end = Math.min(items.length, start + 5)

  if (end - start < 5) {
    start = Math.max(0, end - 5)
  }

  return items.slice(start, end)
})

const commentTree = computed(() => {
  const map = new Map()
  const roots = []
  comments.value.forEach(item => map.set(item.id, { ...item, children: [] }))
  comments.value.forEach(item => {
    const node = map.get(item.id)
    if (item.parentId && item.parentId !== 0 && map.has(item.parentId)) {
      map.get(item.parentId).children.push(node)
    } else {
      roots.push(node)
    }
  })
  return roots
})

function isExpanded(id) {
  return expandedReplies.value.includes(id)
}

function toggleExpand(id) {
  if (isExpanded(id)) {
    expandedReplies.value = expandedReplies.value.filter(item => item !== id)
    return
  }
  expandedReplies.value = [...expandedReplies.value, id]
}

function visibleReplies(thread) {
  if (isExpanded(thread.id) || thread.children.length <= COLLAPSE_THRESHOLD) {
    return thread.children
  }
  return thread.children.slice(0, COLLAPSE_THRESHOLD)
}

function formatTime(value) {
  return value ? new Date(value).toLocaleString('zh-CN') : ''
}

function goToArticle(id) {
  if (!id) return
  router.push(`/article/${id}`)
}

function toggleSide() {
  sideCollapsed.value = !sideCollapsed.value
}

function initMobileSideState() {
  if (window.innerWidth <= 768) {
    sideCollapsed.value = true
  }
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => ElMessage.success('链接已复制'))
    .catch(() => ElMessage.error('复制失败'))
}

function toggleReplyBox(id) {
  activeReplyId.value = activeReplyId.value === id ? null : id
}

function startCooldown() {
  const lastTime = localStorage.getItem('lastCommentTime')
  if (!lastTime) return
  const remaining = COMMENT_COOLDOWN_SEC - Math.floor((Date.now() - Number(lastTime)) / 1000)
  if (remaining <= 0) return
  commentCooldown.value = remaining
  clearInterval(cooldownTimer)
  cooldownTimer = setInterval(() => {
    commentCooldown.value -= 1
    if (commentCooldown.value <= 0) {
      clearInterval(cooldownTimer)
      commentCooldown.value = 0
    }
  }, 1000)
}

async function loadArticle() {
  loading.value = true
  try {
    article.value = await getArticleById(route.params.id)
    liked.value = localStorage.getItem(`liked_${route.params.id}`) === 'true'
  } catch (error) {
    ElMessage.error(error.message || '文章加载失败')
  } finally {
    loading.value = false
  }
}

async function loadComments() {
  comments.value = await getCommentsByArticleId(route.params.id)
}

async function loadSubscriptions() {
  if (!isUserLoggedIn.value) {
    subscriptions.value = []
    return
  }
  subscriptions.value = await getUserSubscriptions()
}

async function loadPageData() {
  const tasks = [loadArticle(), loadComments()]
  if (isUserLoggedIn.value) {
    tasks.push(loadSubscriptions())
  } else {
    subscriptions.value = []
  }
  await Promise.all(tasks)
}

function isAuthorSubscribed(authorId) {
  return subscriptions.value.some(item => item.type === 'author' && item.targetId === authorId)
}

function isTagSubscribed(tagId) {
  return subscriptions.value.some(item => item.type === 'tag' && item.targetId === tagId)
}

async function toggleAuthorSubscription() {
  if (!article.value?.authorId) return
  if (isAuthorSubscribed(article.value.authorId)) {
    await unsubscribeTarget({ type: 'author', targetId: article.value.authorId })
    ElMessage.success('已取消作者订阅')
  } else {
    await subscribeTarget({ type: 'author', targetId: article.value.authorId })
    ElMessage.success('作者订阅成功')
  }
  await loadSubscriptions()
}

async function toggleTagSubscription(tag) {
  if (isTagSubscribed(tag.id)) {
    await unsubscribeTarget({ type: 'tag', targetId: tag.id })
    ElMessage.success(`已取消订阅 ${tag.name}`)
  } else {
    await subscribeTarget({ type: 'tag', targetId: tag.id })
    ElMessage.success(`已订阅 ${tag.name}`)
  }
  await loadSubscriptions()
}

async function handleLike() {
  try {
    if (liked.value) {
      await unlikeArticle(article.value.id)
      liked.value = false
      article.value.likeCount -= 1
      localStorage.removeItem(`liked_${article.value.id}`)
      ElMessage.success('已取消点赞')
      return
    }
    await likeArticle(article.value.id)
    liked.value = true
    article.value.likeCount += 1
    localStorage.setItem(`liked_${article.value.id}`, 'true')
    ElMessage.success('点赞成功')
  } catch (error) {
    ElMessage.error(error.message || '操作失败')
  }
}

async function submitComment(parentId) {
  const isReply = parentId && parentId !== 0
  const draft = isReply ? replyDrafts.value[parentId] || '' : commentContent.value
  const content = draft.trim()

  if (!content) {
    ElMessage.warning(isReply ? '请输入回复内容' : '请输入评论内容')
    return
  }
  if (content.length < 5) {
    ElMessage.warning('内容至少 5 个字')
    return
  }
  if (!isReply && commentCooldown.value > 0) {
    ElMessage.warning(`请 ${commentCooldown.value}s 后再试`)
    return
  }

  submitting.value = true
  try {
    await createComment({
      articleId: article.value.id,
      parentId: parentId || 0,
      content
    })
    ElMessage.success(isReply ? '回复成功' : '评论成功')
    if (isReply) {
      replyDrafts.value[parentId] = ''
      activeReplyId.value = null
    } else {
      commentContent.value = ''
      localStorage.setItem('lastCommentTime', Date.now().toString())
      startCooldown()
    }
    article.value.commentCount += 1
    await loadComments()
  } catch (error) {
    ElMessage.error(error.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

function currentAnchorId() {
  const headings = Array.from(document.querySelectorAll(`#${previewId} h1, #${previewId} h2, #${previewId} h3, #${previewId} h4`))
  if (!headings.length) return ''
  const threshold = 120
  let candidate = headings[0]
  headings.forEach(heading => {
    if (heading.getBoundingClientRect().top <= threshold) {
      candidate = heading
    }
  })
  return candidate?.id || ''
}

async function persistReadingAnchor(force = false) {
  if (!isUserLoggedIn.value || !article.value) return
  const anchor = currentAnchorId()
  if (!force && !anchor && !restoreAnchor.value) return
  await saveReadingAnchor(article.value.id, { lastAnchor: anchor || restoreAnchor.value || '' })
}

function scheduleSaveAnchor() {
  if (!isUserLoggedIn.value) return
  clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    persistReadingAnchor().catch(() => {})
  }, 800)
}

function scrollCatalogToActive() {
  const container = catalogRef.value
  if (!container) return
  const active = container.querySelector('.md-editor-catalog-active')
  if (!active) return
  const containerRect = container.getBoundingClientRect()
  const activeRect = active.getBoundingClientRect()
  const offset = activeRect.top - containerRect.top + container.scrollTop
  container.scrollTo({
    top: offset - container.clientHeight / 2 + activeRect.height / 2,
    behavior: 'smooth'
  })
}

function setupCatalogObserver() {
  if (!catalogRef.value) return
  catalogObserver?.disconnect()
  catalogObserver = new MutationObserver(scrollCatalogToActive)
  catalogObserver.observe(catalogRef.value, {
    subtree: true,
    attributes: true,
    attributeFilter: ['class']
  })
}

async function restoreReadingAnchor() {
  if (!isUserLoggedIn.value || !article.value) return
  try {
    const response = await getLastReadingAnchor(article.value.id)
    restoreAnchor.value = response.lastAnchor || ''
    if (!restoreAnchor.value || route.hash) return
    await nextTick()
    setTimeout(() => {
      const target = document.getElementById(restoreAnchor.value)
      if (target) {
        target.scrollIntoView({ block: 'start', behavior: 'smooth' })
      }
    }, 200)
  } catch (_) {
  }
}

watch(() => route.params.id, async () => {
  expandedReplies.value = []
  activeReplyId.value = null
  replyDrafts.value = {}
  await loadPageData()
  await nextTick()
  await restoreReadingAnchor()
  setupCatalogObserver()
  // 水印：观察内容区高度变化后重绘
  resizeObserver?.disconnect()
  if (watermarkCanvas.value?.parentElement) {
    resizeObserver = new ResizeObserver(drawWatermark)
    resizeObserver.observe(watermarkCanvas.value.parentElement)
  }
}, { immediate: true })

watch(() => isUserLoggedIn.value, async (value) => {
  if (value) {
    await loadSubscriptions()
    await restoreReadingAnchor()
  } else {
    subscriptions.value = []
  }
})

onMounted(() => {
  initMobileSideState()
  startCooldown()
  window.addEventListener('scroll', scheduleSaveAnchor, { passive: true })
  window.addEventListener('beforeunload', persistReadingAnchor)
  document.addEventListener('keydown', handleKeydown)
  nextTick(() => setupCatalogObserver())
})

onUnmounted(() => {
  clearInterval(cooldownTimer)
  clearTimeout(saveTimer)
  catalogObserver?.disconnect()
  resizeObserver?.disconnect()
  document.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('scroll', scheduleSaveAnchor)
  window.removeEventListener('beforeunload', persistReadingAnchor)
  persistReadingAnchor(true).catch(() => {})
})
</script>

<style scoped>
.article-detail {
  width: 100%;
}

.article-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 24px;
  align-items: start;
}

.article-layout.side-collapsed {
  grid-template-columns: minmax(0, 1fr) 0;
  gap: 0;
}

.article-main {
  background: #fff;
  border-radius: 18px;
  padding: 32px;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
  min-width: 0;
}

.article-side {
  position: sticky;
  top: 88px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.article-side.collapsed {
  width: 0;
  align-items: flex-end;
  overflow: visible;
}

.side-panels {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.side-toggle {
  align-self: flex-end;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.96);
  color: #374151;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.side-toggle:hover {
  border-color: #0f766e;
  color: #0f766e;
}

.side-card {
  background: #fff;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.07);
}

.side-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #1f2937;
}

.catalog-body {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
  scrollbar-width: thin;
}

.series-badge {
  margin: 0 0 10px;
  color: #0f766e;
  font-weight: 700;
}

.article-title {
  margin: 0 0 16px;
  font-size: 34px;
  line-height: 1.2;
  color: #111827;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 18px;
}

.tag-row {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tags,
.subscription-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  margin: 0;
}

.chapter-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 18px;
  margin: 24px 0;
  border-radius: 14px;
  background: linear-gradient(135deg, #f0fdf4, #ecfeff);
}

.chapter-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.chapter-links {
  display: flex;
  gap: 10px;
}

.article-preview {
  margin-top: 18px;
  width: 100%;
  user-select: none;
  --article-accent: #0f766e;
  --article-accent-soft: rgba(15, 118, 110, 0.12);
  --article-border: #dbe4ee;
  --article-muted: #64748b;
  --article-text: #1f2937;
  --article-surface: #f8fafc;
}

.article-preview-wrap {
  position: relative;
}

.watermark-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.copyright-notice {
  margin-top: 24px;
  padding: 18px 22px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f0fdf4, #ecfeff);
  border-left: 4px solid #0f766e;
  font-size: 13px;
  color: #475569;
  line-height: 1.9;
}

.copyright-notice p {
  margin: 0;
}

.copyright-notice a {
  color: #0f766e;
  word-break: break-all;
}

.article-preview :deep(pre),
.article-preview :deep(code) {
  user-select: text;
}

.article-preview :deep(.md-editor-preview-wrapper) {
  padding-left: 0;
  padding-right: 0;
}

.article-preview :deep(.md-editor-preview) {
  max-width: none;
  color: var(--article-text);
  font-size: 16px;
  line-height: 1.95;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.article-preview :deep(.md-editor-preview > *) {
  min-width: 0;
}

.article-preview :deep(h1),
.article-preview :deep(h2),
.article-preview :deep(h3),
.article-preview :deep(h4),
.article-preview :deep(h5),
.article-preview :deep(h6) {
  color: #0f172a;
  line-height: 1.32;
  letter-spacing: -0.01em;
  scroll-margin-top: 92px;
}

.article-preview :deep(h1) {
  font-size: 2rem;
}

.article-preview :deep(h2) {
  margin-top: 2.2em;
  padding-bottom: 0.42em;
  font-size: 1.65rem;
  border-bottom: 1px solid var(--article-border);
}

.article-preview :deep(h3) {
  margin-top: 1.9em;
  font-size: 1.35rem;
}

.article-preview :deep(h4) {
  font-size: 1.12rem;
}

.article-preview :deep(p),
.article-preview :deep(ul),
.article-preview :deep(ol),
.article-preview :deep(blockquote),
.article-preview :deep(pre),
.article-preview :deep(table),
.article-preview :deep(details) {
  margin-top: 1.1em;
  margin-bottom: 1.1em;
}

.article-preview :deep(strong) {
  color: #0f172a;
  font-weight: 800;
}

.article-preview :deep(em) {
  color: #334155;
}

.article-preview :deep(del) {
  color: #94a3b8;
}

.article-preview :deep(a) {
  color: var(--article-accent);
  font-weight: 600;
  text-decoration-thickness: 1.5px;
  text-underline-offset: 3px;
}

.article-preview :deep(a:hover) {
  color: #0b5f59;
}

.article-preview :deep(hr) {
  margin: 2em 0;
  border: 0;
  border-top: 1px solid var(--article-border);
}

.article-preview :deep(blockquote) {
  padding: 14px 18px;
  border-left: 4px solid var(--article-accent);
  background: linear-gradient(135deg, rgba(15, 118, 110, 0.06), rgba(14, 165, 233, 0.04));
  border-radius: 0 14px 14px 0;
  color: #334155;
}

.article-preview :deep(blockquote p:last-child) {
  margin-bottom: 0;
}

.article-preview :deep(ul),
.article-preview :deep(ol) {
  padding-left: 1.45em;
}

.article-preview :deep(li) {
  margin: 0.45em 0;
}

.article-preview :deep(li > p) {
  margin: 0.35em 0;
}

.article-preview :deep(img) {
  display: block;
  max-width: 100%;
  height: auto;
  max-height: min(70vh, 720px);
  margin: 1.4rem auto;
  border-radius: 16px;
  object-fit: contain;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
  background: #fff;
}

.article-preview :deep(table) {
  display: block;
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border-collapse: collapse;
  white-space: nowrap;
  border: 1px solid var(--article-border);
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
}

.article-preview :deep(th),
.article-preview :deep(td) {
  padding: 12px 14px;
  border: 1px solid var(--article-border);
  text-align: left;
  vertical-align: top;
}

.article-preview :deep(th) {
  background: #f1f5f9;
  color: #0f172a;
  font-weight: 700;
}

.article-preview :deep(tr:nth-child(even) td) {
  background: #fcfdff;
}

.article-preview :deep(pre) {
  max-width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
}

.article-preview :deep(code:not(pre code)) {
  word-break: break-word;
  padding: 0.18em 0.42em;
  border-radius: 6px;
  font-size: 0.92em;
}

.article-preview :deep(pre code) {
  font-size: 13px;
  line-height: 1.75;
}

.article-preview :deep(.md-editor-code) {
  margin: 1.35rem 0;
}

.article-preview :deep(.md-editor-code-head) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.article-preview :deep(.md-editor-preview-wrapper),
.article-preview :deep(.md-editor-preview),
.article-preview :deep(.md-editor-code pre code .md-editor-code-block) {
  min-width: 0;
}

.article-preview :deep(figure) {
  width: 100%;
}

.article-preview :deep(figcaption) {
  color: var(--article-muted);
  font-size: 13px;
  margin-top: 8px;
}

.article-preview :deep(mark) {
  padding: 0.08em 0.24em;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
}

.article-preview :deep(.md-editor-admonition) {
  border-radius: 16px;
  padding: 1rem 1rem 0.75rem;
}

.article-preview :deep(.md-editor-katex-block) {
  overflow-x: auto;
  overflow-y: hidden;
}

.article-preview :deep(.md-editor-mermaid),
.article-preview :deep(.md-editor-echarts) {
  overflow-x: auto;
  border-radius: 16px;
  background: var(--article-surface);
  padding: 12px;
}

.article-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  padding: 28px 0;
}

.comment-panel {
  margin-top: 24px;
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.comment-login-tip {
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  color: #6b7280;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.comment-form-actions,
.reply-box-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #9ca3af;
  font-size: 13px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.comment-thread {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #f8fafc;
}

.reply-item {
  margin-left: 52px;
  background: #f9fafb;
}

.comment-body {
  flex: 1;
  min-width: 0;
}

.comment-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  color: #6b7280;
  font-size: 13px;
}

.comment-body p {
  margin: 0;
  line-height: 1.7;
  color: #1f2937;
}

.comment-tools {
  margin-top: 8px;
}

.reply-box {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reply-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.series-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.series-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
}

.series-item.active {
  border-color: #0f766e;
  background: #f0fdfa;
}

.series-order {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: #ecfeff;
  color: #0f766e;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.series-text {
  flex: 1;
  color: #1f2937;
  line-height: 1.4;
}

@media (max-width: 1100px) {
  .article-layout {
    grid-template-columns: 1fr;
  }

  .article-side {
    position: static;
  }

  .article-side.collapsed {
    align-items: stretch;
  }

  .side-toggle {
    align-self: flex-start;
  }
}

@media (max-width: 768px) {
  .article-layout,
  .article-layout.side-collapsed {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .article-main {
    padding: 20px;
    border-radius: 14px;
  }

  .article-title {
    font-size: 28px;
  }

  .article-meta,
  .tag-row,
  .subscription-actions,
  .article-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .subscription-actions {
    width: 100%;
  }

  .subscription-actions :deep(.el-button) {
    width: 100%;
    margin-left: 0;
  }

  .article-side {
    position: fixed;
    right: 12px;
    bottom: 14px;
    z-index: 30;
    width: auto;
  }

  .article-side.collapsed {
    align-items: flex-end;
  }

  .side-toggle {
    align-self: flex-end;
    border-radius: 999px;
    padding: 10px 14px;
    box-shadow: 0 12px 30px rgba(15, 23, 42, 0.16);
  }

  .side-panels {
    position: fixed;
    left: 12px;
    right: 12px;
    bottom: 66px;
    max-height: 56vh;
    overflow-y: auto;
    padding: 0;
  }

  .side-card {
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.14);
  }

  .chapter-nav,
  .comment-line,
  .comment-form-actions,
  .reply-box-actions {
    flex-direction: column;
    align-items: flex-start;
  }

  .reply-item {
    margin-left: 0;
  }

  .article-preview :deep(.md-editor-preview) {
    font-size: 15px;
    line-height: 1.85;
  }

  .article-preview :deep(h1) {
    font-size: 1.7rem;
  }

  .article-preview :deep(h2) {
    font-size: 1.4rem;
  }

  .article-preview :deep(h3) {
    font-size: 1.2rem;
  }

  .article-preview :deep(img) {
    max-height: 52vh;
    border-radius: 12px;
  }

  .article-preview :deep(th),
  .article-preview :deep(td) {
    padding: 10px 12px;
  }
}
</style>
