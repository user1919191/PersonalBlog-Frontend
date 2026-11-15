<template>
  <ReferenceCatalogTool
    :categories="gitCommandCategories"
    :items="gitCommands"
    placeholder="搜索 Git 命令、场景、别名，例如：rebase / revert / stash"
    output-title="使用说明"
  />
</template>

<script setup>
import ReferenceCatalogTool from './ReferenceCatalogTool.vue'
import { gitCommandCategories, gitCommands } from '@/data/git-commands'
</script>
