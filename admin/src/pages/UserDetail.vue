<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="$router.back()" style="margin-bottom: 20px">
      <template #content>用户详情</template>
    </el-page-header>

    <el-row :gutter="20">
      <!-- 左侧：用户信息 -->
      <el-col :span="8">
        <el-card>
          <template #header><span>用户信息</span></template>
          <div class="user-header">
            <el-avatar :size="64" icon="User" />
            <div class="user-meta">
              <h3>{{ user.nickname || '未命名' }}</h3>
              <p class="user-id">{{ user._id }}</p>
            </div>
          </div>
          <el-descriptions :column="1" border style="margin-top: 16px">
            <el-descriptions-item label="MBTI 类型">
              <el-tag v-if="user.mbtiType" :type="mbtiTagType(user.mbtiType)">{{ user.mbtiType }}</el-tag>
              <span v-else class="muted">未测定</span>
            </el-descriptions-item>
            <el-descriptions-item label="九型">
              <span v-if="user.enneagramType" class="enneagram">{{ user.enneagramType }}号</span>
              <span v-else class="muted">未测定</span>
            </el-descriptions-item>
            <el-descriptions-item label="测定次数">{{ user.assessmentCount || 0 }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ user.createdAt || '-' }}</el-descriptions-item>
            <el-descriptions-item label="最后活跃">{{ user.lastActive || '-' }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="user.status === 'risk' ? 'danger' : 'success'" size="small">
                {{ user.status === 'risk' ? '需关注' : '正常' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>

      <!-- 右侧：测定记录 -->
      <el-col :span="16">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>测定记录</span>
              <el-tag type="info" size="small">共 {{ assessments.length }} 条</el-tag>
            </div>
          </template>

          <el-empty v-if="assessments.length === 0" description="暂无测定记录" />

          <el-table v-else :data="assessments" stripe>
            <el-table-column prop="mbtiType" label="MBTI" width="90">
              <template #default="{ row }">
                <el-tag :type="mbtiTagType(row.mbtiType)" size="small">{{ row.mbtiType }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="enneagramType" label="九型" width="100">
              <template #default="{ row }">{{ row.enneagramType }}</template>
            </el-table-column>
            <el-table-column prop="confidence" label="置信度" width="100">
              <template #default="{ row }">
                <el-progress :percentage="Math.round((row.confidence || 0) * 100)" :stroke-width="6" />
              </template>
            </el-table-column>
            <el-table-column prop="totalRounds" label="轮数" width="60" />
            <el-table-column prop="riskLevel" label="风险" width="70">
              <template #default="{ row }">
                <el-tag :type="riskTagType(row.riskLevel)" size="small">{{ riskLabel(row.riskLevel) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="assessmentDate" label="时间" width="160" />
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button size="small" type="primary" @click="viewReport(row._id)">查看报告</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dataService } from '@/services/cloudbase'

const route = useRoute()
const router = useRouter()
const user = ref({})
const assessments = ref([])
const loading = ref(false)

const groupColors = { NT: 'warning', NF: 'success', SJ: 'primary', SP: 'danger' }
function getGroup(type) {
  const groups = { NT: ['INTJ','INTP','ENTJ','ENTP'], NF: ['INFJ','INFP','ENFJ','ENFP'], SJ: ['ISTJ','ISFJ','ESTJ','ESFJ'], SP: ['ISTP','ISFP','ESTP','ESFP'] }
  return Object.keys(groups).find(g => groups[g].includes(type)) || ''
}
function mbtiTagType(type) { return groupColors[getGroup(type)] || 'info' }
function riskTagType(level) { return { low: 'info', medium: 'warning', high: 'danger' }[level] || 'info' }
function riskLabel(level) { return { low: '低', medium: '中', high: '高' }[level] || level }

function viewReport(id) {
  router.push(`/assessments/${id}`)
}

onMounted(async () => {
  loading.value = true
  try {
    const userId = route.params.id
    // 获取用户详情（含测定记录列表）
    const detail = await dataService.getUserDetail(userId)
    user.value = detail
    // 获取该用户的测定记录
    const res = await dataService.getAssessments({ userId, page: 1, pageSize: 50 })
    assessments.value = res.data || detail.recentAssessments || []
  } catch (e) {
    console.error('加载用户详情失败:', e)
  }
  loading.value = false
})
</script>

<style scoped>
.user-header {
  display: flex;
  align-items: center;
  gap: 16px;
}
.user-meta h3 {
  margin: 0;
  font-size: 18px;
}
.user-id {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0;
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.enneagram {
  color: #6366f1;
  font-weight: 500;
}
.muted {
  color: #ccc;
}
</style>
