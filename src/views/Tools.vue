<template>
  <div class="tools-page">
    <section class="hero-card">
      <div>
        <p class="hero-kicker">Practical Toolbox</p>
        <h1>实用工具</h1>
      </div>
    </section>

    <section class="tool-card">
      <el-tabs v-model="activeTab" class="tool-tabs">
        <el-tab-pane label="JSON 格式化" name="json" />
        <el-tab-pane label="URL 编解码" name="url" />
        <el-tab-pane label="时间转换" name="date" />
        <el-tab-pane label="正则表达式" name="regex" />
        <el-tab-pane label="JVM 指令大全" name="jvm" />
        <el-tab-pane label="Git 语句大全" name="git" />
        <el-tab-pane label="MySQL 语句大全" name="mysql" />
      </el-tabs>

      <Suspense>
        <component :is="activeToolComponent" />
      </Suspense>
    </section>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent, ref } from 'vue'

const activeTab = ref('json')

const toolComponents = {
  json: defineAsyncComponent(() => import('@/components/tools/JsonTool.vue')),
  url: defineAsyncComponent(() => import('@/components/tools/UrlTool.vue')),
  date: defineAsyncComponent(() => import('@/components/tools/DateTool.vue')),
  regex: defineAsyncComponent(() => import('@/components/tools/RegexTool.vue')),
  jvm: defineAsyncComponent(() => import('@/components/tools/JvmCommandTool.vue')),
  git: defineAsyncComponent(() => import('@/components/tools/GitCommandTool.vue')),
  mysql: defineAsyncComponent(() => import('@/components/tools/MySqlTool.vue'))
}

const activeToolComponent = computed(() => toolComponents[activeTab.value] || toolComponents.json)
</script>

<style scoped>
.tools-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.tool-card {
  border-radius: 24px;
  border: 1px solid #dbe4ee;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.07);
}

.hero-card {
  padding: 18px 24px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 32%),
    radial-gradient(circle at right center, rgba(15, 118, 110, 0.12), transparent 24%),
    linear-gradient(135deg, #f8fbff, #f5faf7);
}

.hero-kicker {
  margin: 0 0 6px;
  color: #2563eb;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero-card h1 {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
}

.tool-card {
  padding: 20px 22px 22px;
  min-height: 78vh;
  display: flex;
  flex-direction: column;
}

.tool-tabs {
  flex-shrink: 0;
}

.tool-tabs :deep(.el-tabs__header) {
  margin-bottom: 14px;
}

.tool-tabs :deep(.el-tabs__item) {
  height: 28px;
  line-height: 28px;
  font-size: 13px;
}
</style>
