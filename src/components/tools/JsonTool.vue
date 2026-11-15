<template>
  <div class="tool-shell">
    <div class="toolbar">
      <el-button type="primary" @click="formatJson">格式化</el-button>
      <el-button @click="minifyJson">压缩</el-button>
      <el-button @click="validateJson">校验</el-button>
      <el-button @click="stripComments">去除注释</el-button>
      <el-button @click="convertToXml">JSON 转 XML</el-button>
      <el-button @click="copyOutput">复制结果</el-button>
      <el-button @click="clearAll">清空</el-button>
    </div>

    <div class="editor-grid">
      <div class="panel">
        <div class="panel-head">输入</div>
        <textarea
          v-model="input"
          class="editor-textarea"
          spellcheck="false"
          placeholder='请输入 JSON，例如：{"name":"blog","tags":["java","vue"]}'
        />
      </div>

      <div class="panel">
        <div class="panel-head">
          <span>结果</span>
          <span class="status" :class="statusType">{{ statusText }}</span>
        </div>
        <div class="result-panel">
          <template v-if="treeData !== null">
            <JsonTreeNode :value="treeData" />
          </template>
          <pre v-else class="plain-output">{{ output || '等待操作结果' }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import JsonTreeNode from './JsonTreeNode.vue'

const input = ref('')
const output = ref('')
const treeData = ref(null)
const statusText = ref('未处理')
const statusType = ref('')

function stripJsonComments(text) {
  let result = ''
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (!inString && char === '/' && next === '/') {
      while (i < text.length && text[i] !== '\n') i += 1
      result += '\n'
      continue
    }

    if (!inString && char === '/' && next === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/')) i += 1
      i += 1
      continue
    }

    result += char
    if (char === '"' && !escaped) inString = !inString
    escaped = char === '\\' && !escaped
    if (char !== '\\') escaped = false
  }

  return result
}

function parseInput() {
  return JSON.parse(stripJsonComments(input.value))
}

function setSuccess(message) {
  statusText.value = message
  statusType.value = 'success'
}

function setError(message) {
  statusText.value = message
  statusType.value = 'error'
}

function formatJson() {
  try {
    const parsed = parseInput()
    output.value = JSON.stringify(parsed, null, 2)
    treeData.value = parsed
    setSuccess('格式化成功')
  } catch (error) {
    treeData.value = null
    output.value = error.message
    setError('JSON 非法')
  }
}

function minifyJson() {
  try {
    output.value = JSON.stringify(parseInput())
    treeData.value = null
    setSuccess('压缩成功')
  } catch (error) {
    treeData.value = null
    output.value = error.message
    setError('JSON 非法')
  }
}

function validateJson() {
  try {
    parseInput()
    treeData.value = null
    output.value = 'JSON 校验通过'
    setSuccess('校验通过')
  } catch (error) {
    treeData.value = null
    output.value = error.message
    setError('JSON 非法')
  }
}

function stripComments() {
  output.value = stripJsonComments(input.value)
  treeData.value = null
  setSuccess('注释已去除')
}

function escapeXml(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function jsonToXml(value, tagName = 'root', depth = 0) {
  const indent = '  '.repeat(depth)
  if (Array.isArray(value)) {
    return value.map(item => jsonToXml(item, 'item', depth)).join('\n')
  }
  if (value !== null && typeof value === 'object') {
    const children = Object.entries(value)
      .map(([key, child]) => jsonToXml(child, key, depth + 1))
      .join('\n')
    return `${indent}<${tagName}>\n${children}\n${indent}</${tagName}>`
  }
  return `${indent}<${tagName}>${escapeXml(String(value ?? ''))}</${tagName}>`
}

function convertToXml() {
  try {
    output.value = jsonToXml(parseInput())
    treeData.value = null
    setSuccess('已转换为 XML')
  } catch (error) {
    treeData.value = null
    output.value = error.message
    setError('JSON 非法')
  }
}

async function copyOutput() {
  const text = treeData.value !== null ? JSON.stringify(treeData.value, null, 2) : output.value
  if (!text) {
    ElMessage.warning('暂无可复制内容')
    return
  }
  await navigator.clipboard.writeText(text)
  ElMessage.success('已复制')
}

function clearAll() {
  input.value = ''
  output.value = ''
  treeData.value = null
  statusText.value = '未处理'
  statusType.value = ''
}
</script>

<style scoped>
.tool-shell,
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #1f2937;
  font-weight: 700;
}

.editor-textarea {
  width: 100%;
  min-height: 396px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #dbe4ee;
  background: #fff;
  resize: vertical;
  font: 14px/1.7 'Consolas', 'Monaco', monospace;
  color: #334155;
  outline: none;
}

.editor-textarea:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.status {
  font-size: 12px;
  color: #64748b;
}

.status.success {
  color: #047857;
}

.status.error {
  color: #dc2626;
}

.result-panel {
  min-height: 396px;
  max-height: 396px;
  overflow: auto;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid #dbe4ee;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
}

.plain-output {
  margin: 0;
  color: #475569;
  font-family: 'Consolas', 'Monaco', monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 900px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
