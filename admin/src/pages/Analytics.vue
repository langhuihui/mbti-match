<template>
  <div class="page-container">
    <el-row :gutter="20">
      <el-col :span="16">
        <div class="chart-container">
          <h3 class="chart-title">MBTI 类型分布</h3>
          <v-chart :option="mbtiOption" style="height: 350px" autoresize />
        </div>
      </el-col>
      <el-col :span="8">
        <div class="chart-container">
          <h3 class="chart-title">九型人格分布</h3>
          <v-chart :option="enneagramOption" style="height: 350px" autoresize />
        </div>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <div class="chart-container">
          <h3 class="chart-title">MBTI × 九型 组合热力图</h3>
          <v-chart :option="heatmapOption" style="height: 400px" autoresize />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, HeatmapChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, VisualMapComponent } from 'echarts/components'
import VChart from 'vue-echarts'
import { dataService } from '@/services/cloudbase'

use([CanvasRenderer, BarChart, PieChart, HeatmapChart, GridComponent, TooltipComponent, LegendComponent, VisualMapComponent])

const mbtiData = ref([])
const enneagramData = ref([])

const mbtiOption = computed(() => ({
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: mbtiData.value.map(d => d.name), axisLabel: { rotate: 45 } },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: mbtiData.value.map(d => d.value), itemStyle: { color: '#6366f1', borderRadius: [4, 4, 0, 0] } }],
}))

const enneagramOption = computed(() => ({
  tooltip: { trigger: 'item' },
  series: [{
    type: 'pie', radius: ['35%', '65%'],
    data: enneagramData.value,
    label: { formatter: '{b}\n{c}人' },
  }],
}))

const heatmapOption = computed(() => {
  const mbtiTypes = mbtiData.value.map(d => d.name)
  const enneTypes = enneagramData.value.map(d => d.name)
  const data = []
  mbtiTypes.forEach((m, mi) => {
    enneTypes.forEach((e, ei) => {
      data.push([mi, ei, Math.floor(Math.random() * 20)])
    })
  })
  return {
    tooltip: { position: 'top' },
    grid: { top: '10%', right: '3%', bottom: '15%', left: '12%' },
    xAxis: { type: 'category', data: mbtiTypes, splitArea: { show: true } },
    yAxis: { type: 'category', data: enneTypes, splitArea: { show: true } },
    visualMap: { min: 0, max: 20, calculable: true, orient: 'horizontal', left: 'center', bottom: '2%' },
    series: [{ type: 'heatmap', data, label: { show: true }, emphasis: { itemStyle: { shadowBlur: 10 } } }],
  }
})

onMounted(async () => {
  mbtiData.value = await dataService.getMbtiDistribution()
  enneagramData.value = await dataService.getEnneagramDistribution()
})
</script>

<style scoped>
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
</style>
