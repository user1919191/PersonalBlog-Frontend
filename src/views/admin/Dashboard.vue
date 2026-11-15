<template>
  <div class="dashboard-page">
    <section class="hero-panel">
      <div>
        <p class="eyebrow">数据总览</p>
        <h1>后台数据概览</h1>
        <p class="hero-desc">
          核心卡片优先展示 Redis 实时统计，帮助快速判断今日访问、内容供给和互动活跃度。
        </p>
      </div>
      <div class="hero-meta">
        <div>
          <span>今日 PV</span>
          <strong>{{ formatNumber(overview.todayPV) }}</strong>
        </div>
        <div>
          <span>今日 UV</span>
          <strong>{{ formatNumber(overview.todayUV) }}</strong>
        </div>
        <div>
          <span>今日文章访问</span>
          <strong>{{ formatNumber(overview.todayArticlePV) }}</strong>
        </div>
        <div>
          <span>近 7 天 PV / UV</span>
          <strong>{{ formatNumber(overview.weeklyPV) }} / {{ formatNumber(overview.weeklyUV) }}</strong>
        </div>
      </div>
    </section>

    <section class="metrics-grid">
      <article v-for="item in metricCards" :key="item.label" class="metric-card">
        <div class="metric-icon" :style="{ background: item.bg, color: item.color }">
          <el-icon size="20"><component :is="item.icon" /></el-icon>
        </div>
        <div class="metric-body">
          <span>{{ item.label }}</span>
          <strong>{{ formatNumber(item.value) }}</strong>
          <small>{{ item.tip }}</small>
        </div>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel-card summary-card">
        <div class="panel-head">
          <h3>内容结构</h3>
          <span>当前资源盘点</span>
        </div>
        <div class="summary-list">
          <div class="summary-row"><span>已发布文章</span><strong>{{ formatNumber(overview.publishedArticles) }}</strong></div>
          <div class="summary-row"><span>草稿文章</span><strong>{{ formatNumber(overview.draftArticles) }}</strong></div>
          <div class="summary-row"><span>专栏数量</span><strong>{{ formatNumber(overview.totalSeries) }}</strong></div>
          <div class="summary-row"><span>分类数量</span><strong>{{ formatNumber(overview.totalCategories) }}</strong></div>
          <div class="summary-row"><span>标签数量</span><strong>{{ formatNumber(overview.totalTags) }}</strong></div>
          <div class="summary-row"><span>学习导航</span><strong>{{ formatNumber(overview.totalNavs) }}</strong></div>
        </div>
      </article>

      <article class="panel-card summary-card">
        <div class="panel-head">
          <h3>运营摘要</h3>
          <span>用户与互动</span>
        </div>
        <div class="summary-list">
          <div class="summary-row"><span>用户总数</span><strong>{{ formatNumber(overview.totalUsers) }}</strong></div>
          <div class="summary-row"><span>正常用户</span><strong>{{ formatNumber(overview.enabledUsers) }}</strong></div>
          <div class="summary-row"><span>评论总数</span><strong>{{ formatNumber(overview.totalComments) }}</strong></div>
          <div class="summary-row"><span>论坛帖子</span><strong>{{ formatNumber(overview.totalForumPosts) }}</strong></div>
          <div class="summary-row"><span>精选文章</span><strong>{{ formatNumber(overview.totalFeatured) }}</strong></div>
          <div class="summary-row"><span>面经数量</span><strong>{{ formatNumber(overview.totalInterviews) }}</strong></div>
        </div>
      </article>

      <article class="panel-card quick-card">
        <div class="panel-head">
          <h3>快捷入口</h3>
          <span>高频操作</span>
        </div>
        <div class="quick-grid">
          <router-link v-for="entry in quickEntries" :key="entry.title" :to="entry.to" class="quick-entry">
            <div>
              <strong>{{ entry.title }}</strong>
              <p>{{ entry.desc }}</p>
            </div>
            <span>进入</span>
          </router-link>
        </div>
      </article>
    </section>

    <section class="chart-grid">
      <article class="panel-card chart-card">
        <div class="panel-head with-actions">
          <div>
            <h3>访问趋势</h3>
            <span>PV / UV 折线</span>
          </div>
          <div class="days-btns">
            <el-button :type="days===7 ? 'primary' : 'default'" size="small" @click="switchDays(7)">7 天</el-button>
            <el-button :type="days===14 ? 'primary' : 'default'" size="small" @click="switchDays(14)">14 天</el-button>
            <el-button :type="days===30 ? 'primary' : 'default'" size="small" @click="switchDays(30)">30 天</el-button>
          </div>
        </div>
        <div ref="lineChartRef" class="chart-container"></div>
      </article>

      <article class="panel-card chart-card">
        <div class="panel-head">
          <h3>今日热门文章</h3>
          <span>按今日访问数实时排序</span>
        </div>
        <div ref="barChartRef" class="chart-container short"></div>
      </article>
    </section>

    <section class="panel-card table-card">
      <div class="panel-head">
        <h3>今日文章访问明细</h3>
        <span>每 15 秒自动刷新一次</span>
      </div>
      <el-table :data="topArticles" stripe>
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="id" label="文章 ID" width="100" />
        <el-table-column prop="title" label="文章标题" min-width="280" show-overflow-tooltip />
        <el-table-column prop="todayViewCount" label="今日访问" width="120" />
        <el-table-column prop="totalViewCount" label="累计阅读" width="120" />
        <el-table-column prop="commentCount" label="评论数" width="120" />
        <el-table-column prop="likeCount" label="点赞数" width="120" />
      </el-table>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { ChatDotRound, Collection, Document, Memo, Promotion, User } from '@element-plus/icons-vue'
import { getDailyStats, getOverview, getTopArticles } from '../../api/admin'

const overview = ref({})
const days = ref(7)
const dailyStats = ref([])
const topArticles = ref([])

const lineChartRef = ref(null)
const barChartRef = ref(null)
let lineChart = null
let barChart = null
let refreshTimer = null

const metricCards = computed(() => [
  { label: '文章总数', value: overview.value.totalArticles, tip: '博客内容池规模', icon: Document, bg: '#e0f2fe', color: '#0369a1' },
  { label: '用户总数', value: overview.value.totalUsers, tip: '包含 OAuth 注册用户', icon: User, bg: '#dcfce7', color: '#166534' },
  { label: '今日文章访问', value: overview.value.todayArticlePV, tip: 'Redis 实时统计', icon: Memo, bg: '#ccfbf1', color: '#0f766e' },
  { label: '评论总数', value: overview.value.totalComments, tip: '文章评论 + 面经评论', icon: ChatDotRound, bg: '#fef3c7', color: '#92400e' },
  { label: '论坛帖子', value: overview.value.totalForumPosts, tip: '技术讨论内容量', icon: Promotion, bg: '#ede9fe', color: '#6d28d9' },
  { label: '精选文章', value: overview.value.totalFeatured, tip: '外部优质内容收录', icon: Collection, bg: '#ffe4e6', color: '#be123c' }
])

const quickEntries = [
  { title: '写文章', desc: '进入 Markdown 编辑器发布新内容', to: '/admin/articles/new' },
  { title: '文章管理', desc: '查看发布状态、置顶和文章列表', to: '/admin/articles' },
  { title: '专栏管理', desc: '维护系列目录与排序', to: '/admin/series' },
  { title: '用户管理', desc: '查看用户状态和会话', to: '/admin/users' },
  { title: '论坛管理', desc: '处理社区帖子与回复', to: '/admin/forum' }
]

function formatNumber(value) {
  return value ?? '-'
}

function buildLineOption(data) {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: ['PV', 'UV'], top: 8 },
    grid: { left: 42, right: 20, top: 44, bottom: 28 },
    xAxis: {
      type: 'category',
      data: data.map(item => item.date),
      axisLabel: { color: '#64748b', fontSize: 11 }
    },
    yAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#e2e8f0' } }
    },
    series: [
      {
        name: 'PV',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: '#0f766e' },
        areaStyle: { color: 'rgba(15, 118, 110, 0.12)' },
        data: data.map(item => item.pv)
      },
      {
        name: 'UV',
        type: 'line',
        smooth: true,
        symbolSize: 7,
        itemStyle: { color: '#f97316' },
        areaStyle: { color: 'rgba(249, 115, 22, 0.10)' },
        data: data.map(item => item.uv)
      }
    ]
  }
}

function buildBarOption(data) {
  const reversed = [...data].reverse()
  return {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: 150, right: 20, top: 14, bottom: 20 },
    xAxis: {
      type: 'value',
      minInterval: 1,
      axisLabel: { color: '#64748b' },
      splitLine: { lineStyle: { color: '#e2e8f0' } }
    },
    yAxis: {
      type: 'category',
        data: reversed.map(item => item.title),
        axisLabel: { color: '#334155', fontSize: 11 }
    },
    series: [
      {
        type: 'bar',
        data: reversed.map(item => item.todayViewCount),
        barMaxWidth: 26,
        itemStyle: { color: '#2563eb', borderRadius: [0, 6, 6, 0] }
      }
    ]
  }
}

async function loadOverview() {
  overview.value = await getOverview()
}

async function loadLineChart() {
  dailyStats.value = await getDailyStats(days.value)
  lineChart?.setOption(buildLineOption(dailyStats.value))
}

async function loadBarChart() {
  topArticles.value = await getTopArticles(10)
  barChart?.setOption(buildBarOption(topArticles.value))
}

async function refreshRealtimeBlock() {
  await Promise.all([loadOverview(), loadBarChart()])
}

async function switchDays(value) {
  days.value = value
  await loadLineChart()
}

function onResize() {
  lineChart?.resize()
  barChart?.resize()
}

onMounted(async () => {
  await loadOverview()
  lineChart = echarts.init(lineChartRef.value)
  barChart = echarts.init(barChartRef.value)
  await Promise.all([loadLineChart(), loadBarChart()])
  refreshTimer = window.setInterval(() => {
    refreshRealtimeBlock()
  }, 15000)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResize)
  if (refreshTimer) {
    window.clearInterval(refreshTimer)
  }
  lineChart?.dispose()
  barChart?.dispose()
})
</script>

<style scoped>
.dashboard-page {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.hero-panel {
  display: grid;
  grid-template-columns: 1.6fr 1fr;
  gap: 20px;
  padding: 28px;
  border-radius: 24px;
  color: #fff;
  background: radial-gradient(circle at top left, rgba(255,255,255,0.18), transparent 30%), linear-gradient(135deg, #0f172a 0%, #14532d 55%, #0f766e 100%);
}
.eyebrow {
  margin: 0 0 10px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.72);
}
.hero-panel h1 {
  margin: 0 0 12px;
  font-size: 30px;
}
.hero-desc {
  margin: 0;
  max-width: 720px;
  line-height: 1.7;
  color: rgba(255,255,255,0.84);
}
.hero-meta {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.hero-meta div {
  padding: 16px;
  border-radius: 18px;
  background: rgba(255,255,255,0.10);
  backdrop-filter: blur(8px);
}
.hero-meta span {
  display: block;
  font-size: 13px;
  color: rgba(255,255,255,0.72);
}
.hero-meta strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
}
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.metric-card,
.panel-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}
.metric-card {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px;
}
.metric-icon {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.metric-body span,
.panel-head span {
  font-size: 12px;
  color: #64748b;
}
.metric-body strong {
  display: block;
  margin: 6px 0;
  font-size: 28px;
  color: #0f172a;
}
.metric-body small {
  color: #94a3b8;
}
.content-grid,
.chart-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}
.chart-grid {
  grid-template-columns: 1.4fr 1fr;
}
.summary-card,
.quick-card,
.chart-card,
.table-card {
  padding: 20px;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.panel-head h3 {
  margin: 0 0 4px;
  font-size: 18px;
  color: #0f172a;
}
.summary-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  border-radius: 14px;
  background: #f8fafc;
}
.summary-row span {
  color: #475569;
}
.summary-row strong {
  color: #0f172a;
  font-size: 18px;
}
.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.quick-entry {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  background: linear-gradient(135deg, #eff6ff, #f8fafc);
  color: inherit;
  text-decoration: none;
  border: 1px solid #dbeafe;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.quick-entry:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(37, 99, 235, 0.10);
}
.quick-entry strong {
  display: block;
  margin-bottom: 6px;
  color: #0f172a;
}
.quick-entry p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
  font-size: 13px;
}
.quick-entry span {
  color: #2563eb;
  font-size: 13px;
  white-space: nowrap;
}
.with-actions {
  align-items: center;
}
.days-btns {
  display: flex;
  gap: 8px;
}
.chart-container {
  width: 100%;
  height: 340px;
}
.chart-container.short {
  height: 340px;
}
@media (max-width: 1200px) {
  .metrics-grid,
  .content-grid,
  .chart-grid {
    grid-template-columns: 1fr 1fr;
  }
  .hero-panel {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .metrics-grid,
  .content-grid,
  .chart-grid,
  .quick-grid,
  .hero-meta {
    grid-template-columns: 1fr;
  }
  .hero-panel,
  .metric-card,
  .panel-card {
    border-radius: 18px;
  }
  .metric-body strong {
    font-size: 24px;
  }
}
</style>
