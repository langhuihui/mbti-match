<template>
  <div class="page-container">
    <div class="toolbar">
      <el-input
        v-model="search"
        placeholder="搜索用户名 / MBTI / 九型"
        prefix-icon="Search"
        style="width: 320px"
        clearable
        @clear="loadData"
        @keyup.enter="loadData"
      />
      <el-select v-model="filterType" placeholder="MBTI 筛选" clearable style="width: 140px" @change="loadData">
        <el-option v-for="t in mbtiTypes" :key="t" :label="t" :value="t" />
      </el-select>
      <el-button type="primary" @click="loadData">查询</el-button>
    </div>

    <el-table :data="users" v-loading="loading" stripe style="width: 100%">
      <el-table-column prop="nickname" label="用户" min-width="120">
        <template #default="{ row }">
          <div class="user-cell">
            <el-avatar :size="32" icon="User" />
            <span>{{ row.nickname }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="mbtiType" label="MBTI" width="100">
        <template #default="{ row }">
          <el-tag :type="mbtiTagType(row.mbtiType)" size="small">{{ row.mbtiType }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="enneagramType" label="九型" width="80">
        <template #default="{ row }">
          <span class="enneagram-tag">{{ row.enneagramType }}号</span>
        </template>
      </el-table-column>
      <el-table-column prop="assessmentCount" label="测定次数" width="90" sortable />
      <el-table-column prop="createdAt" label="注册时间" width="160" />
      <el-table-column prop="lastActive" label="最后活跃" width="160" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 'risk' ? 'danger' : 'success'" size="small">
            {{ row.status === 'risk' ? '需关注' : '正常' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="140" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewUserDetail(row)">查看报告</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-model:current-page="page"
      :page-size="pageSize"
      :total="total"
      layout="total, prev, pager, next, jumper"
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
const users = ref([])
const loading = ref(false)
const search = ref('')
const filterType = ref('')
const page = ref(1)
const pageSize = 20
const total = ref(0)

const mbtiTypes = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']

const groupColors = { NT: 'warning', NF: 'success', SJ: 'primary', SP: 'danger' }
function getGroup(type) {
  const groups = { NT: ['INTJ','INTP','ENTJ','ENTP'], NF: ['INFJ','INFP','ENFJ','ENFP'], SJ: ['ISTJ','ISFJ','ESTJ','ESFJ'], SP: ['ISTP','ISFP','ESTP','ESFP'] }
  return Object.keys(groups).find(g => groups[g].includes(type)) || ''
}
function mbtiTagType(type) { return groupColors[getGroup(type)] || 'info' }

async function loadData() {
  loading.value = true
  try {
    const res = await dataService.getUsers({ page: page.value, pageSize, search: search.value })
    users.value = res.data || []
    total.value = res.total || 0
  } catch (e) {
    users.value = []
    total.value = 0
  }
  loading.value = false
}

function viewUserDetail(row) {
  router.push(`/users/${row._id}`)
}

onMounted(loadData)
</script>

<style scoped>
.toolbar {
  margin-bottom: 16px;
  display: flex;
  gap: 12px;
  align-items: center;
}
.user-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.enneagram-tag {
  font-size: 13px;
  color: #6366f1;
  font-weight: 500;
}
</style>
