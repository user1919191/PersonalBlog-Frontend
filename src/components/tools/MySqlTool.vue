<template>
  <ReferenceCatalogTool
    :categories="mysqlCommandCategories"
    :items="mysqlCommands"
    placeholder="搜索 MySQL 语句、场景、别名，例如：join / explain / transaction"
    output-title="说明与要点"
  />
</template>

<script setup>
import ReferenceCatalogTool from './ReferenceCatalogTool.vue'
import { mysqlCommandCategories, mysqlCommands } from '@/data/mysql-commands'
</script>
