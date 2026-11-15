<template>
  <div class="tool-shell">
    <div class="summary-grid">
      <div class="summary-card">
        <span>当前秒级时间戳</span>
        <strong>{{ currentSecond }}</strong>
      </div>
      <div class="summary-card">
        <span>当前毫秒时间戳</span>
        <strong>{{ currentMillisecond }}</strong>
      </div>
      <div class="summary-card">
        <span>当前 UTC 时间</span>
        <strong>{{ currentUtc }}</strong>
      </div>
      <div class="summary-card">
        <span>当前 Asia/Shanghai 时间</span>
        <strong>{{ currentAsia }}</strong>
      </div>
    </div>

    <div class="toolbar">
      <el-button type="primary" @click="convertTimestamp">时间戳转时间</el-button>
      <el-button @click="convertDateText">文本时间转换</el-button>
      <el-button @click="fillNowSeconds">填入当前秒级</el-button>
      <el-button @click="fillNowMilliseconds">填入当前毫秒级</el-button>
      <el-button @click="clearAll">清空</el-button>
    </div>

    <div class="content-grid">
      <div class="converter-card">
        <div class="panel-head">时间戳输入</div>
        <input v-model="timestampInput" class="editor-input" placeholder="输入 10 位秒级或 13 位毫秒级时间戳" />
        <div class="result-list">
          <div class="result-item">
            <span>识别类型</span>
            <strong>{{ detectedType }}</strong>
          </div>
          <div class="result-item">
            <span>UTC</span>
            <strong>{{ utcResult }}</strong>
          </div>
          <div class="result-item">
            <span>Asia/Shanghai</span>
            <strong>{{ asiaResult }}</strong>
          </div>
        </div>
      </div>

      <div class="converter-card">
        <div class="panel-head">日期文本转换</div>
        <input v-model="dateInput" class="editor-input" placeholder="输入 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss / YYYY-MM-DD HH:mm:ss.SSS" />
        <div class="result-list">
          <div class="result-item">
            <span>UTC 时间戳(秒)</span>
            <strong>{{ utcTimestampSeconds }}</strong>
          </div>
          <div class="result-item">
            <span>UTC 时间戳(毫秒)</span>
            <strong>{{ utcTimestampMilliseconds }}</strong>
          </div>
          <div class="result-item">
            <span>Asia 时间戳(秒)</span>
            <strong>{{ asiaTimestampSeconds }}</strong>
          </div>
          <div class="result-item">
            <span>Asia 时间戳(毫秒)</span>
            <strong>{{ asiaTimestampMilliseconds }}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { ElMessage } from 'element-plus'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(customParseFormat)

const now = ref(Date.now())
const timestampInput = ref('')
const detectedType = ref('-')
const utcResult = ref('-')
const asiaResult = ref('-')
const dateInput = ref('')
const utcTimestampSeconds = ref('-')
const utcTimestampMilliseconds = ref('-')
const asiaTimestampSeconds = ref('-')
const asiaTimestampMilliseconds = ref('-')

let timer = null

const currentSecond = computed(() => Math.floor(now.value / 1000))
const currentMillisecond = computed(() => now.value)
const currentUtc = computed(() => dayjs.utc(now.value).format('YYYY-MM-DD HH:mm:ss'))
const currentAsia = computed(() => dayjs(now.value).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'))

function convertTimestamp() {
  const text = timestampInput.value.trim()
  if (!/^\d{10}(\d{3})?$/.test(text)) {
    ElMessage.warning('请输入 10 位或 13 位时间戳')
    return
  }
  const isSecond = text.length === 10
  const ms = isSecond ? Number(text) * 1000 : Number(text)
  detectedType.value = isSecond ? '秒级时间戳' : '毫秒时间戳'
  utcResult.value = dayjs.utc(ms).format('YYYY-MM-DD HH:mm:ss')
  asiaResult.value = dayjs(ms).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')
}

function parseDateText(text) {
  const formats = [
    'YYYY-MM-DD',
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm:ss.SSS',
    'YYYY/MM/DD',
    'YYYY/MM/DD HH:mm:ss',
    'YYYY/MM/DD HH:mm:ss.SSS'
  ]
  for (const format of formats) {
    const parsed = dayjs(text, format, true)
    if (parsed.isValid()) return parsed
  }
  return null
}

function convertDateText() {
  const text = dateInput.value.trim().replace('T', ' ')
  if (!text) {
    ElMessage.warning('请输入日期文本')
    return
  }
  const parsed = parseDateText(text)
  if (!parsed) {
    ElMessage.error('日期格式无法识别')
    return
  }
  const ms = parsed.valueOf()
  const seconds = Math.floor(ms / 1000)
  utcTimestampSeconds.value = String(seconds)
  utcTimestampMilliseconds.value = String(ms)
  asiaTimestampSeconds.value = String(seconds)
  asiaTimestampMilliseconds.value = String(ms)
}

function fillNowSeconds() {
  timestampInput.value = String(currentSecond.value)
  convertTimestamp()
}

function fillNowMilliseconds() {
  timestampInput.value = String(currentMillisecond.value)
  convertTimestamp()
}

function clearAll() {
  timestampInput.value = ''
  detectedType.value = '-'
  utcResult.value = '-'
  asiaResult.value = '-'
  dateInput.value = ''
  utcTimestampSeconds.value = '-'
  utcTimestampMilliseconds.value = '-'
  asiaTimestampSeconds.value = '-'
  asiaTimestampMilliseconds.value = '-'
}

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  clearInterval(timer)
})
</script>

<style scoped>
.tool-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-grid,
.content-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.content-grid {
  grid-template-columns: 1fr 1fr;
}

.summary-card,
.converter-card {
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #dbe4ee;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
}

.summary-card span,
.result-item span {
  display: block;
  color: #64748b;
  font-size: 12px;
  margin-bottom: 8px;
}

.summary-card strong,
.result-item strong {
  color: #0f172a;
  font-size: 15px;
  line-height: 1.6;
  word-break: break-word;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.panel-head {
  margin-bottom: 12px;
  color: #1f2937;
  font-weight: 700;
}

.editor-input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid #cbd5e1;
  outline: none;
  font: inherit;
  color: #334155;
}

.editor-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.result-list {
  margin-top: 16px;
  display: grid;
  gap: 12px;
}

.result-item {
  padding: 12px 14px;
  border-radius: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
}

@media (max-width: 900px) {
  .summary-grid,
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .summary-grid,
  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
