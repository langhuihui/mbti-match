<template>
  <div class="page-container" v-loading="loading">
    <el-page-header @back="$router.back()" style="margin-bottom: 20px">
      <template #content>测定详情 - {{ detail.mbtiType }} {{ detail.enneagramType }}</template>
    </el-page-header>

    <el-row :gutter="20">
      <!-- 左侧：基本信息 + 功能栈 -->
      <el-col :span="10">
        <el-card style="margin-bottom: 20px">
          <template #header><span>基本信息</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="MBTI">{{ detail.mbtiType }}</el-descriptions-item>
            <el-descriptions-item label="九型">{{ detail.enneagramType }} ({{ detail.subtype }})</el-descriptions-item>
            <el-descriptions-item label="置信度">{{ ((detail.confidence || 0) * 100).toFixed(0) }}%</el-descriptions-item>
            <el-descriptions-item label="对话轮数">{{ detail.totalRounds }}</el-descriptions-item>
            <el-descriptions-item label="风险级别">
              <el-tag :type="riskTagType(detail.riskLevel)">{{ riskLabel(detail.riskLevel) }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="测定时间">{{ detail.assessmentDate }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card style="margin-bottom: 20px">
          <template #header><span>荣格八维功能分析</span></template>
          <div v-for="(func, code) in detail.functionAnalysis" :key="code" class="func-item">
            <div class="func-header">
              <span class="func-name">{{ code }}</span>
              <el-tag size="small" :type="confidenceTag(func.confidence)">置信度 {{ (func.confidence * 100).toFixed(0) }}%</el-tag>
            </div>
            <el-progress :percentage="func.score * 10" :stroke-width="8" :color="funcColor(code)" />
            <div v-if="func.evidence && func.evidence.length" class="evidence-list">
              <div v-for="(ev, i) in func.evidence" :key="i" class="evidence-item">
                <el-text type="info" size="small">"{{ ev.quote }}"</el-text>
                <el-text type="warning" size="small">→ {{ ev.interpretation }}</el-text>
              </div>
            </div>
          </div>
        </el-card>

        <el-card>
          <template #header><span>九型人格分析</span></template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="主型">{{ detail.enneagramAnalysis?.mainType }}号</el-descriptions-item>
            <el-descriptions-item label="侧翼">{{ detail.enneagramAnalysis?.mainType }}w{{ detail.enneagramAnalysis?.wing }}</el-descriptions-item>
            <el-descriptions-item label="副型">{{ subtypeLabel(detail.enneagramAnalysis?.subtype) }}</el-descriptions-item>
            <el-descriptions-item label="核心恐惧">{{ detail.enneagramAnalysis?.coreFear }}</el-descriptions-item>
            <el-descriptions-item label="核心欲望">{{ detail.enneagramAnalysis?.coreDesire }}</el-descriptions-item>
            <el-descriptions-item label="侧翼依据">{{ detail.enneagramAnalysis?.wingEvidence }}</el-descriptions-item>
            <el-descriptions-item label="副型依据">{{ detail.enneagramAnalysis?.subtypeEvidence }}</el-descriptions-item>
          </el-descriptions>
          <div v-if="detail.enneagramAnalysis?.evidence?.length" class="evidence-list" style="margin-top: 12px">
            <div v-for="(ev, i) in detail.enneagramAnalysis.evidence" :key="i" class="evidence-item">
              <el-text type="info" size="small">"{{ ev.quote }}"</el-text>
              <el-text type="warning" size="small">→ {{ ev.interpretation }}</el-text>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 右侧：对话原文 + 分析笔记 -->
      <el-col :span="14">
        <el-card style="margin-bottom: 20px">
          <template #header><span>对话原文（含内部标注）</span></template>
          <div class="conversation">
            <div v-for="(msg, i) in detail.conversation" :key="i" :class="['msg', msg.role]">
              <div class="msg-role">{{ msg.role === 'user' ? '用户' : 'AI' }}</div>
              <div class="msg-content">{{ msg.content }}</div>
              <div v-if="msg.internalNote" class="msg-note">
                <el-tag type="warning" size="small">{{ msg.internalNote }}</el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <el-card style="margin-bottom: 20px">
          <template #header><span>维度分析</span></template>
          <el-descriptions :column="2" border>
            <el-descriptions-item v-for="(val, dim) in detail.dimensionAnalysis" :key="dim" :label="dim">
              {{ Object.entries(val).filter(([k]) => ['E','I','S','N','T','F','J','P'].includes(k)).map(([k,v]) => `${k}:${(v*100).toFixed(0)}%`).join(' / ') }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <el-card>
          <template #header><span>测定师笔记 & 风险评估</span></template>
          <el-alert :type="riskAlertType(detail.riskAssessment?.level)" :title="`风险级别: ${riskLabel(detail.riskAssessment?.level)}`" :description="detail.riskAssessment?.notes" show-icon style="margin-bottom: 12px" />
          <div class="analyst-note">{{ detail.analystNote }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { dataService } from '@/services/cloudbase'

const route = useRoute()
const detail = ref({})
const loading = ref(false)

const funcColors = { Ni: '#8b5cf6', Ne: '#f59e0b', Si: '#10b981', Se: '#ef4444', Ti: '#3b82f6', Te: '#06b6d4', Fi: '#ec4899', Fe: '#f97316' }
function funcColor(code) { return funcColors[code] || '#6366f1' }
function confidenceTag(c) { return c > 0.8 ? 'success' : c > 0.6 ? 'warning' : 'info' }
function riskTagType(level) { return { low: 'info', medium: 'warning', high: 'danger' }[level] || 'info' }
function riskLabel(level) { return { low: '低', medium: '中', high: '高' }[level] || level || '未评估' }
function riskAlertType(level) { return { low: 'info', medium: 'warning', high: 'error' }[level] || 'info' }
function subtypeLabel(s) { return { sp: '自保', sx: '一对一', so: '社交' }[s] || s }

onMounted(async () => {
  loading.value = true
  detail.value = await dataService.getAssessmentDetail(route.params.id)
  loading.value = false
})
</script>

<style scoped>
.func-item { margin-bottom: 16px; }
.func-header { display: flex; justify-content: space-between; margin-bottom: 6px; }
.func-name { font-weight: 600; font-size: 14px; }
.evidence-list { margin-top: 8px; }
.evidence-item { padding: 6px 0; border-top: 1px dashed #eee; display: flex; flex-direction: column; gap: 2px; }
.conversation { max-height: 500px; overflow-y: auto; }
.msg { margin-bottom: 12px; padding: 10px 14px; border-radius: 8px; }
.msg.user { background: #f0f2f5; }
.msg.assistant { background: #ede9fe; }
.msg-role { font-size: 12px; color: #999; margin-bottom: 4px; }
.msg-content { font-size: 14px; line-height: 1.6; }
.msg-note { margin-top: 6px; }
.analyst-note { font-size: 14px; line-height: 1.8; color: #333; background: #f9fafb; padding: 12px; border-radius: 6px; }
</style>
