<template>
  <div class="json-node" :style="{ '--depth-color': depthColor }">
    <div v-if="isExpandable" class="json-line">
      <button class="toggle" type="button" @click="expanded = !expanded">
        {{ expanded ? '-' : '+' }}
      </button>
      <span v-if="showKey" class="json-key">"{{ nodeKey }}"</span>
      <span v-if="showKey" class="json-colon">: </span>
      <span class="bracket">{{ isArray ? '[' : '{' }}</span>
      <span v-if="!expanded" class="collapsed-preview">{{ collapsedPreview }}</span>
      <span class="bracket">{{ expanded ? '' : (isArray ? ']' : '}') }}</span>
      <span v-if="!expanded && !isLast" class="comma">,</span>
    </div>

    <template v-if="isExpandable && expanded">
      <div class="json-children">
        <JsonTreeNode
          v-for="child in entries"
          :key="child.key"
          :node-key="child.label"
          :value="child.value"
          :depth="depth + 1"
          :is-last="child.index === entries.length - 1"
        />
      </div>
      <div class="json-line closing">
        <span class="bracket">{{ isArray ? ']' : '}' }}</span>
        <span v-if="!isLast" class="comma">,</span>
      </div>
    </template>

    <div v-else-if="!isExpandable" class="json-line">
      <span v-if="showKey" class="json-key">"{{ nodeKey }}"</span>
      <span v-if="showKey" class="json-colon">: </span>
      <span :class="valueClass">{{ renderedValue }}</span>
      <span v-if="!isLast" class="comma">,</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  nodeKey: { type: [String, Number], default: '' },
  value: { type: null, required: true },
  depth: { type: Number, default: 0 },
  isLast: { type: Boolean, default: true }
})

const expanded = ref(true)

const isArray = computed(() => Array.isArray(props.value))
const isObject = computed(() => props.value !== null && typeof props.value === 'object')
const isExpandable = computed(() => isObject.value)
const showKey = computed(() => props.nodeKey !== '')

const depthPalette = ['#2563eb', '#0f766e', '#c2410c', '#7c3aed', '#d946ef', '#0f172a']
const depthColor = computed(() => depthPalette[props.depth % depthPalette.length])

const entries = computed(() => {
  if (!isExpandable.value) return []
  const items = isArray.value
    ? props.value.map((item, index) => ({ key: `${index}`, label: index, value: item }))
    : Object.entries(props.value).map(([key, value]) => ({ key, label: key, value }))

  return items.map((item, index) => ({ ...item, index }))
})

const collapsedPreview = computed(() => {
  if (!entries.value.length) return ''
  const preview = entries.value.slice(0, 3).map(item => {
    if (typeof item.value === 'object' && item.value !== null) {
      return `${item.label}: ...`
    }
    return `${item.label}: ${String(item.value)}`
  }).join(', ')
  return ` ${preview}${entries.value.length > 3 ? ', ... ' : ' '}`
})

const renderedValue = computed(() => {
  if (typeof props.value === 'string') return `"${props.value}"`
  if (props.value === null) return 'null'
  return String(props.value)
})

const valueClass = computed(() => {
  if (typeof props.value === 'string') return 'json-string'
  if (typeof props.value === 'number') return 'json-number'
  if (typeof props.value === 'boolean') return 'json-boolean'
  if (props.value === null) return 'json-null'
  return 'json-value'
})
</script>

<style scoped>
.json-node {
  color: #0f172a;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.8;
}

.json-line {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 2px;
}

.json-children {
  padding-left: 22px;
  border-left: 1px dashed rgba(148, 163, 184, 0.45);
  margin-left: 8px;
}

.toggle {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 6px;
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
  cursor: pointer;
  font-size: 12px;
  line-height: 1;
  margin-top: 3px;
}

.json-key {
  color: #334155;
}

.json-colon,
.comma,
.collapsed-preview {
  color: #64748b;
}

.bracket {
  color: var(--depth-color);
  font-weight: 700;
}

.json-string {
  color: #047857;
}

.json-number {
  color: #1d4ed8;
}

.json-boolean {
  color: #c2410c;
}

.json-null {
  color: #7c3aed;
}

.closing {
  padding-left: 26px;
}
</style>
