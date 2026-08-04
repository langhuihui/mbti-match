<template>
  <div class="page-container">
    <!-- 数据模式提示 -->
    <el-alert
      v-if="dataMode.usingMock"
      type="warning"
      title="当前使用模拟数据（云函数未部署或不可用）。部署 admin-api 云函数后即可显示真实数据"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />
    <el-alert
      v-else
      type="success"
      title="已连接云开发，显示真实数据"
      show-icon
      :closable="false"
      style="margin-bottom: 16px"
    />

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="4" v-for="card in statCards" :key="card.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-card-body">
            <el-icon class="stat-icon" :style="{ color: card.color }">
              <component :is="card.icon" />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value" :style="{ color: card.color }">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 活跃度趋势 -->
      <el-col :span="16">
        <div class="chart-container">
          <h3 class="chart-title">近 30 天活跃趋势</h3>
          <v-chart :option="activityChartOption" style="height: 320px;" autoresize />
        </div>
      </el-col>

      <!-- 族群分布 -->
      <el-col :span="8">
        <div class="chart-container">
          <h3 class="chart-title">MBTI 族群分布</h3>
          <v-chart :option="groupChartOption" style="height: 320px;" autoresize />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px;">
      <!-- 缓存命中 -->
      <el-col :span="8">
        <div class="chart-container">
          <h3 class="chart-title">关系报告缓存</h3>
          <div class="cache-info">
            <v-chart :option="cacheChartOption" style="height: 200px;" autoresize />
            <div class="cache-stats">
              <span>已缓存: {{ cacheStats.totalCached }} 组合</span>
              <span>命中率: {{ (cacheStats.hitRate * 100).toFixed(1) }}%</span>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 最近风险警报 -->
      <el-col :span="16">
        <div class="chart-container">
          <h3 class="chart-title">最近风险警报</h3>
          <el-table :data="recentRisks" size="small" style="width: 100%">
            <el-table-column prop="triggeredAt" label="时间" width="160" />
            <el-table-column prop="level" label="级别" width="80">
              <template #default="{ row }">
                <el-tag :type="riskTagType(row.level)" size="small">{{ riskLabel(row.level) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="trigger" label="触发原因" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag size="small" :type="row.status === 'handled' ? 'success' : 'warning'">
                  {{ statusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart, GaugeChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, TitleComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { dataService, getDataMode, checkCloudStatus } from '@/services/cloudbase'

const dataMode = ref(getDataMode())
use([CanvasRenderer, LineChart, PieChart, GaugeChart, GridComponent, TooltipComponent, LegendComponent, TitleComponent])

const overview = ref({})
const activityData = ref([])
const cacheStats = ref({ totalCached: 0, hitRate: 0 })
const recentRisks = ref([])

const statCards = computed(() => [
  { label: '总用户', value: overview.value.totalUsers || 0, icon: 'User', color: '#6366f1' },
  { label: '总测定', value: overview.value.totalAssessments || 0, icon: 'Document', color: '#10b981' },
  { label: '今日测定', value: overview.value.todayAssessments || 0, icon: 'Timer', color: '#f59e0b' },
  { label: '月活用户', value: overview.value.monthlyActive || 0, icon: 'TrendCharts', color: '#06b6d4' },
  { label: '风险警报', value: overview.value.riskAlerts || 0, icon: 'Warning', color: '#ef4444' },
  { label: '缓存命中', value: ((overview.value.cacheHitRate || 0) * 100).toFixed(0) + '%', icon: 'Connection', color: '#8b5cf6' },
])

const activityChartOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  legend: { data: ['测定次数', '新增用户'], bottom: 0 },
  grid: { left: '3%', right: '4%', bottom: '10%', top: '5%', containLabel: true },
  xAxis: { type: 'category', data: activityData.value.map(d => d.date), boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    { name: '测定次数', type: 'line', smooth: true, data: activityData.value.map(d => d.assessments), areaStyle: { opacity: 0.1 }, itemStyle: { color: '#6366f1' } },
    { name: '新增用户', type: 'line', smooth: true, data: activityData.value.map(d => d.newUsers), areaStyle: { opacity: 0.1 }, itemStyle: { color: '#10b981' } },
  ],
}))

const groupChartOption = computed(() => {
  const dist = overview.value.typeDistribution || {}
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0 },
    series: [{
      type: 'pie', radius: ['40%', '70%'],
      data: [
        { name: 'NT 分析家', value: dist.NT || 0, itemStyle: { color: '#8b5cf6' } },
        { name: 'NF 外交家', value: dist.NF || 0, itemStyle: { color: '#10b981' } },
        { name: 'SJ 守护者', value: dist.SJ || 0, itemStyle: { color: '#0ea5e9' } },
        { name: 'SP 探索者', value: dist.SP || 0, itemStyle: { color: '#f59e0b' } },
      ],
      label: { formatter: '{b}\n{c}人' },
    }],
  }
})

const cacheChartOption = computed(() => ({
  series: [{
    type: 'gauge', radius: '90%',
    progress: { show: true, width: 12 },
    axisLine: { lineStyle: { width: 12 } },
    axisTick: { show: false },
    splitLine: { length: 8, lineStyle: { width: 1, color: '#999' } },
    axisLabel: { distance: 15, fontSize: 10 },
    pointer: { width: 4 },
    detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20, offsetCenter: [0, '70%'] },
    data: [{ value: (cacheStats.value.hitRate * 100).toFixed(1), name: '命中率' }],
  }],
}))

function riskTagType(level) {
  return { low: 'info', medium: 'warning', high: 'danger' }[level] || 'info'
}
function riskLabel(level) {
  return { low: '低', medium: '中', high: '高' }[level] || level
}
function statusLabel(status) {
  return { pending: '待处理', handled: '已处理', escalated: '已升级' }[status] || status
}

onMounted(async () => {
  // 先验证云函数是否真的可用，更新提示
  await checkCloudStatus()
  dataMode.value = getDataMode()

  const [ov, act, cache, risks] = await Promise.all([
    dataService.getOverview(),
    dataService.getDailyActivity(30),
    dataService.getCacheStats(),
    dataService.getRiskAlerts(),
  ])
  overview.value = ov
  activityData.value = act
  cacheStats.value = cache
  recentRisks.value = risks.data.slice(0, 5)
})
</script>

<style scoped>
.stat-row {
  margin-bottom: 0;
}

.stat-card-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 32px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

.chart-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #333;
}

.cache-info {
  text-align: center;
}

.cache-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 8px;
  font-size: 13px;
  color: #666;
}
</style>
