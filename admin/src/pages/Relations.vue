<template>
  <div class="page-container">
    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8"><el-card><el-statistic title="已缓存组合" :value="cacheStats.totalCached" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="缓存命中率" :value="(cacheStats.hitRate * 100).toFixed(1) + '%'" :value-style="{color: '#10b981'}" /></el-card></el-col>
      <el-col :span="8"><el-card><el-statistic title="平均生成耗时" :value="cacheStats.avgGenerateTime + 's'" /></el-card></el-col>
    </el-row>

    <div class="chart-container" style="margin-bottom: 20px">
      <h3 class="chart-title">热门组合 Top 5</h3>
      <el-table :data="cacheStats.topCombos" stripe>
        <el-table-column type="index" label="排名" width="80" />
        <el-table-column prop="combo" label="组合" />
        <el-table-column prop="hits" label="命中次数" width="120" sortable />
      </el-table>
    </div>

    <div class="chart-container">
      <h3 class="chart-title">已缓存的关系报告</h3>
      <el-table :data="relations" v-loading="loading" stripe>
        <el-table-column prop="cacheKey" label="组合键" width="280" />
        <el-table-column prop="profile1" label="用户A">
          <template #default="{ row }">{{ row.profile1.mbti }} {{ row.profile1.enneagram }} {{ row.profile1.subtype }}</template>
        </el-table-column>
        <el-table-column prop="profile2" label="用户B">
          <template #default="{ row }">{{ row.profile2.mbti }} {{ row.profile2.enneagram }} {{ row.profile2.subtype }}</template>
        </el-table-column>
        <el-table-column prop="relationType" label="关系类型" width="120">
          <template #default="{ row }"><el-tag size="small">{{ row.relationType }}</el-tag></template>
        </el-table-column>
        <el-table-column prop="hitCount" label="命中" width="80" sortable />
        <el-table-column prop="generatedAt" label="生成时间" width="130" />
      </el-table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { dataService } from '@/services/cloudbase'

const cacheStats = ref({ totalCached: 0, hitRate: 0, avgGenerateTime: 0, topCombos: [] })
const relations = ref([])
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  const [stats, rels] = await Promise.all([dataService.getCacheStats(), dataService.getRelations({})])
  cacheStats.value = stats
  relations.value = rels.data
  loading.value = false
})
</script>

<style scoped>
.chart-title { font-size: 16px; font-weight: 500; margin-bottom: 16px; }
</style>
