<template>
  <div class="page-container">
    <div class="chart-container">
      <h3 class="chart-title">认证咨询师管理</h3>
      <el-table :data="counselors" v-loading="loading" stripe>
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="license" label="执照编号" width="180" />
        <el-table-column prop="authorizedUsers" label="授权用户数" width="120" sortable />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'warning'" size="small">
              {{ row.status === 'active' ? '已激活' : '待审核' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160">
          <template #default="{ row }">
            <el-button size="small" v-if="row.status === 'pending'" type="success" @click="approve(row)">批准</el-button>
            <el-button size="small" @click="viewAuthorized(row)">查看授权</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dataService } from '@/services/cloudbase'
import { ElMessage } from 'element-plus'

const counselors = ref([])
const loading = ref(false)

async function loadData() {
  loading.value = true
  const res = await dataService.getCounselors()
  counselors.value = res.data
  loading.value = false
}
function approve(row) { row.status = 'active'; ElMessage.success(`${row.name} 已批准`) }
function viewAuthorized(row) { ElMessage.info(`${row.name} 已授权 ${row.authorizedUsers} 位用户`) }

onMounted(loadData)
</script>

<style scoped>
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
</style>
