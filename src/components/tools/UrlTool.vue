<template>
  <div class="tool-shell">
    <div class="toolbar">
      <el-select v-model="mode" style="width: 240px">
        <el-option label="encodeURIComponent / decodeURIComponent" value="component" />
        <el-option label="encodeURI / decodeURI" value="uri" />
        <el-option label="Base64" value="base64" />
        <el-option label="URLSearchParams" value="form" />
        <el-option label="Hex" value="hex" />
      </el-select>
      <el-button type="primary" @click="handleEncode">编码</el-button>
      <el-button @click="handleDecode">解码</el-button>
      <el-button @click="swapText">交换</el-button>
      <el-button @click="copyOutput">复制结果</el-button>
      <el-button @click="clearAll">清空</el-button>
    </div>

    <div class="editor-grid">
      <div class="panel">
        <div class="panel-head">输入</div>
        <textarea v-model="input" class="editor-textarea" spellcheck="false" placeholder="请输入待编码或解码的 URL、参数或普通文本" />
      </div>
      <div class="panel">
        <div class="panel-head">
          <span>输出</span>
          <span class="meta">{{ modeLabel }}</span>
        </div>
        <textarea v-model="output" class="editor-textarea output-textarea" readonly />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

const input = ref('')
const output = ref('')
const mode = ref('component')

const modeLabel = computed(() => ({
  component: '组件编码',
  uri: '整段 URL',
  base64: 'Base64',
  form: '表单参数',
  hex: 'Hex'
}[mode.value]))

function stringToHex(value) {
  return Array.from(new TextEncoder().encode(value))
    .map(item => item.toString(16).padStart(2, '0'))
    .join('')
}

function hexToString(value) {
  const normalized = value.replace(/\s+/g, '')
  if (!/^[0-9a-fA-F]*$/.test(normalized) || normalized.length % 2 !== 0) {
    throw new Error('Hex 字符串不合法')
  }
  const bytes = normalized.match(/.{1,2}/g)?.map(item => Number.parseInt(item, 16)) || []
  return new TextDecoder().decode(new Uint8Array(bytes))
}

function handleEncode() {
  try {
    if (mode.value === 'component') output.value = encodeURIComponent(input.value)
    else if (mode.value === 'uri') output.value = encodeURI(input.value)
    else if (mode.value === 'base64') output.value = btoa(unescape(encodeURIComponent(input.value)))
    else if (mode.value === 'form') output.value = new URLSearchParams({ value: input.value }).toString()
    else output.value = stringToHex(input.value)
  } catch (error) {
    ElMessage.error(error.message || '编码失败')
  }
}

function handleDecode() {
  try {
    if (mode.value === 'component') output.value = decodeURIComponent(input.value)
    else if (mode.value === 'uri') output.value = decodeURI(input.value)
    else if (mode.value === 'base64') output.value = decodeURIComponent(escape(atob(input.value)))
    else if (mode.value === 'form') {
      const params = new URLSearchParams(input.value)
      output.value = params.get('value') || ''
    } else {
      output.value = hexToString(input.value)
    }
  } catch (error) {
    ElMessage.error(error.message || '解码失败')
  }
}

function swapText() {
  const temp = input.value
  input.value = output.value
  output.value = temp
}

async function copyOutput() {
  if (!output.value) {
    ElMessage.warning('暂无可复制内容')
    return
  }
  await navigator.clipboard.writeText(output.value)
  ElMessage.success('已复制')
}

function clearAll() {
  input.value = ''
  output.value = ''
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

.meta {
  color: #64748b;
  font-size: 12px;
}

.editor-textarea {
  width: 100%;
  min-height: 360px;
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

.output-textarea {
  background: #f8fafc;
}

@media (max-width: 900px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }
}
</style>
