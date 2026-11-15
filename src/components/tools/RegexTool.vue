<template>
  <div class="tool-shell">
    <div class="toolbar">
      <el-radio-group v-model="mode" size="small">
        <el-radio-button label="preset">常用正则</el-radio-button>
        <el-radio-button label="generate">样例生成</el-radio-button>
        <el-radio-button label="test">正则测试</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="mode === 'preset'" class="preset-layout">
      <div class="preset-list">
        <button
          v-for="item in regexPresets"
          :key="item.key"
          class="preset-button"
          :class="{ active: activePresetKey === item.key }"
          @click="activePresetKey = item.key"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </button>
      </div>

      <div v-if="activePreset" class="result-card">
        <div class="section-title">表达式</div>
        <pre class="code-block">{{ renderRegex(activePreset.pattern, activePreset.flags) }}</pre>
        <div class="inline-actions">
          <el-button type="primary" @click="copyText(renderRegex(activePreset.pattern, activePreset.flags))">复制正则</el-button>
        </div>

        <div class="section-title">示例字符串</div>
        <div class="example-grid">
          <div v-for="example in activePreset.examples" :key="example" class="example-item">{{ example }}</div>
        </div>
      </div>
    </div>

    <div v-else-if="mode === 'generate'" class="generator-layout">
      <div class="panel">
        <div class="panel-head">输入样例</div>
        <el-input
          v-model="sampleInput"
          type="textarea"
          :rows="10"
          resize="none"
          placeholder="每行一条样例，例如：&#10;13812345678&#10;15600001111"
        />
        <div class="inline-actions">
          <el-button type="primary" @click="generatePattern">生成正则</el-button>
          <el-button @click="fillSampleDemo">填入示例</el-button>
          <el-button @click="clearGenerator">清空</el-button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">生成结果</div>
        <pre class="code-block">{{ generatedDisplay }}</pre>
        <div class="meta-block">
          <div><strong>来源：</strong>{{ generatedTitle }}</div>
          <div><strong>说明：</strong>{{ generatedDescription }}</div>
        </div>
        <div class="inline-actions">
          <el-button type="primary" :disabled="!generatedPattern" @click="copyText(generatedDisplay)">复制结果</el-button>
          <el-button :disabled="!generatedPattern" @click="applyGeneratedToTester">带入测试器</el-button>
        </div>
      </div>
    </div>

    <div v-else class="tester-layout">
      <div class="panel">
        <div class="panel-head">正则表达式</div>
        <el-input v-model="testerPattern" placeholder="例如：^1[3-9]\\d{9}$" />
        <div class="flag-row">
          <span class="flag-label">Flags</span>
          <el-checkbox-group v-model="testerFlagList">
            <el-checkbox label="g">g</el-checkbox>
            <el-checkbox label="i">i</el-checkbox>
            <el-checkbox label="m">m</el-checkbox>
          </el-checkbox-group>
        </div>
        <div class="panel-head">测试文本</div>
        <el-input
          v-model="testerText"
          type="textarea"
          :rows="8"
          resize="none"
          placeholder="输入要测试的文本"
        />
        <div class="inline-actions">
          <el-button type="primary" @click="runTester">开始测试</el-button>
          <el-button @click="fillTesterDemo">填入示例</el-button>
          <el-button @click="clearTester">清空</el-button>
        </div>
      </div>

      <div class="panel">
        <div class="panel-head">测试结果</div>
        <div class="result-summary" :class="testStatusClass">{{ testStatusText }}</div>
        <div class="result-list">
          <div class="result-item">
            <span>命中次数</span>
            <strong>{{ matchCount }}</strong>
          </div>
          <div class="result-item">
            <span>首个命中</span>
            <strong>{{ firstMatch }}</strong>
          </div>
        </div>
        <div class="section-title">命中详情</div>
        <pre class="code-block match-block">{{ matchDetails }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { regexPresets } from '@/utils/regex-presets'
import { generateRegexFromSamples } from '@/utils/regex-generator'

const mode = ref('preset')
const activePresetKey = ref(regexPresets[0]?.key || '')
const sampleInput = ref('')
const generatedPattern = ref('')
const generatedFlags = ref('')
const generatedTitle = ref('-')
const generatedDescription = ref('等待生成结果')
const testerPattern = ref('')
const testerText = ref('')
const testerFlagList = ref([])
const testStatusText = ref('等待测试')
const testStatusClass = ref('')
const matchCount = ref('0')
const firstMatch = ref('-')
const matchDetails = ref('暂无结果')

const activePreset = computed(() => regexPresets.find(item => item.key === activePresetKey.value) || null)
const generatedDisplay = computed(() => (
  generatedPattern.value ? renderRegex(generatedPattern.value, generatedFlags.value) : '等待生成结果'
))

function renderRegex(pattern, flags = '') {
  return `/${pattern}/${flags}`
}

function copyText(text) {
  navigator.clipboard.writeText(text)
    .then(() => ElMessage.success('已复制'))
    .catch(() => ElMessage.error('复制失败'))
}

function generatePattern() {
  const result = generateRegexFromSamples(sampleInput.value.split(/\r?\n/))
  generatedPattern.value = result.pattern || ''
  generatedFlags.value = result.flags || ''
  generatedTitle.value = result.title || '-'
  generatedDescription.value = result.description || '-'

  if (!result.pattern) {
    ElMessage.warning('请输入有效样例')
    return
  }

  ElMessage.success('正则已生成')
}

function fillSampleDemo() {
  sampleInput.value = 'ABC-2026-001\nXYZ-2027-128'
}

function clearGenerator() {
  sampleInput.value = ''
  generatedPattern.value = ''
  generatedFlags.value = ''
  generatedTitle.value = '-'
  generatedDescription.value = '等待生成结果'
}

function applyGeneratedToTester() {
  if (!generatedPattern.value) return
  testerPattern.value = generatedPattern.value
  testerFlagList.value = generatedFlags.value ? Array.from(new Set(generatedFlags.value.split(''))) : []
  testerText.value = sampleInput.value
  mode.value = 'test'
  runTester()
}

function runTester() {
  if (!testerPattern.value.trim()) {
    ElMessage.warning('请输入正则表达式')
    return
  }

  try {
    const flags = testerFlagList.value.join('')
    const regex = new RegExp(testerPattern.value, flags)
    const text = testerText.value
    const matches = flags.includes('g') ? Array.from(text.matchAll(regex)) : [text.match(regex)].filter(Boolean)

    if (!matches.length) {
      testStatusText.value = '未命中'
      testStatusClass.value = 'error'
      matchCount.value = '0'
      firstMatch.value = '-'
      matchDetails.value = '没有匹配到任何内容。'
      return
    }

    testStatusText.value = '命中成功'
    testStatusClass.value = 'success'
    matchCount.value = String(matches.length)
    firstMatch.value = matches[0]?.[0] || '-'
    matchDetails.value = matches.map((item, index) => {
      const groups = item.slice(1).filter(group => group !== undefined)
      return `#${index + 1} 匹配：${item[0]}${groups.length ? `\n分组：${groups.join(' | ')}` : ''}`
    }).join('\n\n')
  } catch (error) {
    testStatusText.value = '表达式非法'
    testStatusClass.value = 'error'
    matchCount.value = '0'
    firstMatch.value = '-'
    matchDetails.value = error.message || '正则解析失败'
  }
}

function fillTesterDemo() {
  testerPattern.value = '^1[3-9]\\d{9}$'
  testerText.value = '13812345678'
  testerFlagList.value = []
}

function clearTester() {
  testerPattern.value = ''
  testerText.value = ''
  testerFlagList.value = []
  testStatusText.value = '等待测试'
  testStatusClass.value = ''
  matchCount.value = '0'
  firstMatch.value = '-'
  matchDetails.value = '暂无结果'
}
</script>

<style scoped>
.tool-shell,
.panel,
.result-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toolbar,
.inline-actions,
.flag-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.preset-layout,
.generator-layout,
.tester-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.preset-list {
  display: grid;
  gap: 12px;
  align-content: start;
}

.preset-button,
.panel,
.result-card {
  padding: 16px 18px;
  border-radius: 16px;
  border: 1px solid #dbe4ee;
  background: linear-gradient(135deg, #f8fafc, #ffffff);
}

.preset-button {
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.preset-button.active,
.preset-button:hover {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
}

.preset-button strong,
.panel-head,
.section-title {
  color: #1f2937;
  font-weight: 700;
}

.preset-button span,
.meta-block,
.flag-label {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.code-block {
  margin: 0;
  padding: 14px 16px;
  min-height: 76px;
  border-radius: 14px;
  background: #0f172a;
  color: #e2e8f0;
  white-space: pre-wrap;
  word-break: break-word;
  font: 13px/1.7 'Consolas', 'Monaco', monospace;
}

.example-grid,
.result-list {
  display: grid;
  gap: 10px;
}

.example-item,
.result-item {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #fff;
}

.result-item span {
  display: block;
  margin-bottom: 6px;
  color: #64748b;
  font-size: 12px;
}

.result-summary {
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  color: #475569;
}

.result-summary.success {
  background: rgba(22, 163, 74, 0.12);
  color: #166534;
}

.result-summary.error {
  background: rgba(220, 38, 38, 0.12);
  color: #991b1b;
}

.match-block {
  min-height: 160px;
}

@media (max-width: 900px) {
  .preset-layout,
  .generator-layout,
  .tester-layout {
    grid-template-columns: 1fr;
  }
}
</style>
