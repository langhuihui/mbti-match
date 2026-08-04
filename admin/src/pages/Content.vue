<template>
  <div class="page-container">
    <div class="chart-container">
      <h3 class="chart-title">学习路径内容管理</h3>
      <el-table :data="content" v-loading="loading" stripe>
        <el-table-column prop="level" label="级别" width="80">
          <template #default="{ row }"><el-tag>L{{ row.level }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="title" label="模块标题" />
        <el-table-column prop="isFree" label="免费" width="80">
          <template #default="{ row }"><el-tag :type="row.isFree ? 'success' : 'warning'" size="small">{{ row.isFree ? '免费' : '付费' }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="views" label="浏览量" width="100" sortable />
        <el-table-column label="操作" width="120">
          <template #default="{ row }"><el-button size="small" @click="editContent(row)">编辑</el-button></template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dataService } from '@/services/cloudbase'
import { ElMessage } from 'element-plus'

const content = ref([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  const res = await dataService.getLearningContent()
  content.value = res.data
  loading.value = false
}
function editContent(row) { ElMessage.info(`编辑功能开发中: ${row.title}`) }

onMounted(loadData)
</script>

<style scoped>
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
</style>
