<template>
  <ReferenceCatalogTool
    :categories="jvmCommandCategories"
    :items="jvmCommands"
    placeholder="搜索 JVM 命令、场景、别名，例如：死锁 / heap dump / Full GC"
  />
</template>

<script setup>
import ReferenceCatalogTool from './ReferenceCatalogTool.vue'
import { jvmCommandCategories, jvmCommands } from '@/data/jvm-commands'
</script>
