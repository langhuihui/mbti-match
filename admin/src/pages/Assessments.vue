<template>
  <div class="page-container">
    <div class="toolbar">
      <el-select v-model="riskFilter" placeholder="风险级别" clearable style="width: 150px" @change="loadData">
        <el-option label="低风险" value="low" />
        <el-option label="中风险" value="medium" />
        <el-option label="高风险" value="high" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>

    <el-table :data="assessments" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="_id" label="记录ID" width="140" />
      <el-table-column prop="userId" label="用户" width="120" />
      <el-table-column prop="mbtiType" label="MBTI" width="90">
        <template #default="{ row }">
          <el-tag size="small">{{ row.mbtiType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enneagramType" label="九型" width="100">
        <template #default="{ row }">{{ row.enneagramType }}</template>
      </el-table-column>
      <el-table-column prop="confidence" label="置信度" width="90">
        <template #default="{ row }">
          <el-progress :percentage="Math.round(row.confidence * 100)" :stroke-width="6" />
        </template>
      </el-table-column>
      <el-table-column prop="totalRounds" label="对话轮数" width="90" />
      <el-table-column prop="riskLevel" label="风险" width="80">
        <template #default="{ row }">
          <el-tag :type="riskTagType(row.riskLevel)" size="small">{{ riskLabel(row.riskLevel) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="assessmentDate" label="测定时间" width="170" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row._id)">查看分析</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next"
      style="margin-top: 20px; justify-content: flex-end;"
      @current-change="loadData"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { dataService } from '@/services/cloudbase'

const router = useRouter()
const assessments = ref([])
const loading = ref(false)
const riskFilter = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)

function riskTagType(level) { return { low: 'info', medium: 'warning', high: 'danger' }[level] || 'info' }
function riskLabel(level) { return { low: '低', medium: '中', high: '高' }[level] || level }

async function loadData() {
  loading.value = true
  const res = await dataService.getAssessments({ page: page.value, pageSize, riskLevel: riskFilter.value })
  assessments.value = res.data
  total.value = res.total
  loading.value = false
}

function viewDetail(id) {
  router.push(`/assessments/${id}`)
}

onMounted(loadData)
</script>

<style scoped>
.toolbar { margin-bottom: 16px; display: flex; gap: 12px; }
</style>
