<template>
  <div class="page-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <el-card><el-statistic title="待处理警报" :value="stats.pending" /></el-card>
      </el-col>
      <el-col :span="8">
        <el-card><el-statistic title="中风险" :value="stats.medium" :value-style="{color: '#f59e0b'}" /></el-card>
      </el-col>
      <el-col :span="8">
        <el-card><el-statistic title="高风险" :value="stats.high" :value-style="{color: '#ef4444'}" /></el-card>
      </el-col>
    </el-row>

    <div class="toolbar">
      <el-select v-model="levelFilter" placeholder="风险级别" clearable style="width: 150px" @change="loadData">
        <el-option label="中风险" value="medium" /><el-option label="高风险" value="high" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>

    <el-table :data="alerts" v-loading="loading" stripe>
      <el-table-column prop="triggeredAt" label="触发时间" width="170" />
      <el-table-column prop="userId" label="用户" width="120" />
      <el-table-column prop="level" label="级别" width="80">
        <template #default="{ row }"><el-tag :type="row.level === 'high' ? 'danger' : 'warning'" size="small">{{ row.level === 'high' ? '高' : '中' }}</el-tag></template>
      </el-table-column>
      <el-table-column prop="trigger" label="触发原因" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }"><el-tag :type="row.status === 'handled' ? 'success' : 'warning'" size="small">{{ statusLabel(row.status) }}</el-tag></template>
      </el-table-column>
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" @click="viewAssessment(row.assessmentId)">查看测定</el-button>
          <el-button size="small" type="success" @click="handleAlert(row)" v-if="row.status === 'pending'">处理</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dataService } from '@/services/cloudbase'
import { ElMessage } from 'element-plus'

const router = useRouter()
const alerts = ref([])
const loading = ref(false)
const levelFilter = ref('')
const stats = ref({ pending: 3, medium: 5, high: 2 })

function statusLabel(s) { return { pending: '待处理', handled: '已处理', escalated: '已升级' }[s] || s }

async function loadData() {
  loading.value = true
  const res = await dataService.getRiskAlerts({ level: levelFilter.value })
  alerts.value = res.data
  loading.value = false
}
function viewAssessment(id) { router.push(`/assessments/${id}`) }
function handleAlert(row) { row.status = 'handled'; ElMessage.success('已标记为已处理') }

onMounted(loadData)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; display: flex; gap: 12px; }
</style>
