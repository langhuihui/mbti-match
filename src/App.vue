<template>
  <n-config-provider>
    <n-message-provider>
      <div class="container">
        <n-h1>MBTI人格关系速查</n-h1>
        
        <div class="personalities-container">
          <n-card class="personality-selector" title="第一个人格">
            <div class="switch-group">
              <n-switch
                v-model:value="personality1.E"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>E</template>
                <template #unchecked>I</template>
              </n-switch>
              <n-switch
                v-model:value="personality1.N"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>N</template>
                <template #unchecked>S</template>
              </n-switch>
              <n-switch
                v-model:value="personality1.F"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>F</template>
                <template #unchecked>T</template>
              </n-switch>
              <n-switch
                v-model:value="personality1.J"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>J</template>
                <template #unchecked>P</template>
              </n-switch>
            </div>
            <div class="personality-info">
              <n-text>选择的人格类型：{{ type1 }}</n-text>
              <img 
                v-if="type1" 
                :src="MBTI_IMAGES[type1]" 
                :alt="type1" 
                class="personality-image"
              >
            </div>
            <div class="cognitive-functions">
              <n-text strong>认知功能：</n-text>
              <div class="functions-list">
                <div 
                  v-for="(func, index) in cognitiveFunctions1List" 
                  :key="index"
                  :class="['function-item', {
                    'inferior': index >= 4,
                    'highlighted': isHighlighted(func.code, type1, type2)
                  }]"
                >
                  <span class="function-number">{{ index + 1 }}</span>
                  <span class="function-code">{{ func.code }}</span>
                  <span class="function-desc">{{ func.desc }}</span>
                </div>
              </div>
            </div>
          </n-card>

          <n-card class="personality-selector" title="第二个人格">
            <div class="switch-group">
              <n-switch
                v-model:value="personality2.E"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>E</template>
                <template #unchecked>I</template>
              </n-switch>
              <n-switch
                v-model:value="personality2.N"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>N</template>
                <template #unchecked>S</template>
              </n-switch>
              <n-switch
                v-model:value="personality2.F"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>F</template>
                <template #unchecked>T</template>
              </n-switch>
              <n-switch
                v-model:value="personality2.J"
                :rail-style="railStyle"
                :button-style="buttonStyle"
              >
                <template #checked>J</template>
                <template #unchecked>P</template>
              </n-switch>
            </div>
            <div class="personality-info">
              <n-text>选择的人格类型：{{ type2 }}</n-text>
              <img 
                v-if="type2" 
                :src="MBTI_IMAGES[type2]" 
                :alt="type2" 
                class="personality-image"
              >
            </div>
            <div class="cognitive-functions">
              <n-text strong>认知功能：</n-text>
              <div class="functions-list">
                <div 
                  v-for="(func, index) in cognitiveFunctions2List" 
                  :key="index"
                  :class="['function-item', {
                    'inferior': index >= 4,
                    'highlighted': isHighlighted(func.code, type2, type1)
                  }]"
                >
                  <span class="function-number">{{ index + 1 }}</span>
                  <span class="function-code">{{ func.code }}</span>
                  <span class="function-desc">{{ func.desc }}</span>
                </div>
              </div>
            </div>
          </n-card>
        </div>

        <n-card class="relationship-result">
          <template #header>
            <div class="relationship-header">
              <n-text strong>关系分析</n-text>
              <n-text v-if="hasHighlightedFunctions" class="highlight-note">
                <n-icon><information-circle /></n-icon>
                高亮显示的认知功能表示两个人格之间的共同或互补功能
              </n-text>
            </div>
          </template>
          <div class="relationship-content">
            <n-text class="relationship-type">{{ type1 }} 和 {{ type2 }} 的关系类型：{{ relationshipType }}</n-text>
            <n-text class="relationship-detail">{{ relationshipDetail }}</n-text>
          </div>
        </n-card>
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  NConfigProvider,
  NMessageProvider,
  NCard,
  NSwitch,
  NText,
  NH1,
  NIcon
} from 'naive-ui'
import { InformationCircle } from '@vicons/ionicons5'

const MBTI_RELATIONSHIPS = {
  // 理想搭档
  ideal: [
    ['INFP', 'ENFJ'], ['ENFJ', 'INFP'],
    ['INFJ', 'ENFP'], ['ENFP', 'INFJ'],
    ['INTJ', 'ENTP'], ['ENTP', 'INTJ'],
    ['INTP', 'ENTJ'], ['ENTJ', 'INTP'],
    ['ISFP', 'ESFJ'], ['ESFJ', 'ISFP'],
    ['ISFJ', 'ESFP'], ['ESFP', 'ISFJ'],
    ['ISTJ', 'ESTP'], ['ESTP', 'ISTJ'],
    ['ISTP', 'ESTJ'], ['ESTJ', 'ISTP']
  ],
  // 比较容易相处
  compatible: [
    ['INFP', 'INFP'], ['ENFJ', 'ENFJ'],
    ['INFJ', 'INFJ'], ['ENFP', 'ENFP'],
    ['INTJ', 'INTJ'], ['ENTP', 'ENTP'],
    ['INTP', 'INTP'], ['ENTJ', 'ENTJ'],
    ['ISFP', 'ISFP'], ['ESFJ', 'ESFJ'],
    ['ISFJ', 'ISFJ'], ['ESFP', 'ESFP'],
    ['ISTJ', 'ISTJ'], ['ESTP', 'ESTP'],
    ['ISTP', 'ISTP'], ['ESTJ', 'ESTJ']
  ],
  // 潜在冲突
  conflicting: [
    ['INFP', 'ESTJ'], ['ENFJ', 'ISTP'],
    ['INFJ', 'ESTP'], ['ENFP', 'ISTJ'],
    ['INTJ', 'ESFJ'], ['ENTP', 'ISFJ'],
    ['INTP', 'ESFP'], ['ENTJ', 'ISFP']
  ]
}

const MBTI_RELATIONSHIP_DETAILS = {
  'INFP-ENFJ': '这是一对理想的搭配。INFP的内向情感（Fi）与ENFJ的外向情感（Fe）形成互补，两者都很注重价值观和情感。ENFJ能帮助INFP更好地与外界互动，而INFP则能帮助ENFJ更好地了解自己的内心。',
  'INFJ-ENFP': 'INFJ的内向直觉（Ni）与ENFP的外向直觉（Ne）相互吸引，两者都喜欢探索可能性和意义。ENFP带来活力和创意，而INFJ提供深度和洞察。',
  'INTJ-ENTP': '这对组合都很注重智识探索。INTJ的系统思维与ENTP的创新思维相得益彰，能激发出许多独特的想法和解决方案。',
  'INTP-ENTJ': 'INTP的分析能力与ENTJ的执行力完美互补。ENTJ能帮助INTP将想法付诸实践，而INTP则为ENTJ提供深入的见解。',
  'ISFP-ESFJ': '两者都很重视和谐的人际关系。ISFP带来艺术感和创造力，ESFJ提供稳定性和社交支持。',
  'ISFJ-ESFP': 'ISFJ的稳重与ESFP的活力形成良好平衡。ESFP为生活带来趣味，而ISFJ提供安全感和照顾。',
  'ISTJ-ESTP': '都是实用主义者，但方式不同。ISTJ提供结构和规划，ESTP带来灵活性和即时应变能力。',
  'ISTP-ESTJ': '这对组合能在实践中相互学习。ISTP提供技术洞察，ESTJ带来组织能力和效率。'
}

const COGNITIVE_FUNCTIONS = {
  INFP: {
    functions: ['Fi', 'Ne', 'Si', 'Te', 'Fe', 'Ni', 'Se', 'Ti'],
    descriptions: [
      '内向情感',
      '外向直觉',
      '内向感知',
      '外向思维',
      '外向情感',
      '内向直觉',
      '外向感知',
      '内向思维'
    ]
  },
  ENFJ: {
    functions: ['Fe', 'Ni', 'Se', 'Ti', 'Fi', 'Ne', 'Si', 'Te'],
    descriptions: [
      '外向情感',
      '内向直觉',
      '外向感知',
      '内向思维',
      '内向情感',
      '外向直觉',
      '内向感知',
      '外向思维'
    ]
  },
  INFJ: {
    functions: ['Ni', 'Fe', 'Ti', 'Se', 'Ne', 'Fi', 'Te', 'Si'],
    descriptions: [
      '内向直觉',
      '外向情感',
      '内向思维',
      '外向感知',
      '外向直觉',
      '内向情感',
      '外向思维',
      '内向感知'
    ]
  },
  ENFP: {
    functions: ['Ne', 'Fi', 'Te', 'Si', 'Ni', 'Fe', 'Ti', 'Se'],
    descriptions: [
      '外向直觉',
      '内向情感',
      '外向思维',
      '内向感知',
      '内向直觉',
      '外向情感',
      '内向思维',
      '外向感知'
    ]
  },
  INTJ: {
    functions: ['Ni', 'Te', 'Fi', 'Se', 'Ne', 'Ti', 'Fe', 'Si'],
    descriptions: [
      '内向直觉',
      '外向思维',
      '内向情感',
      '外向感知',
      '外向直觉',
      '内向思维',
      '外向情感',
      '内向感知'
    ]
  },
  ENTP: {
    functions: ['Ne', 'Ti', 'Fe', 'Si', 'Ni', 'Te', 'Fi', 'Se'],
    descriptions: [
      '外向直觉',
      '内向思维',
      '外向情感',
      '内向感知',
      '内向直觉',
      '外向思维',
      '内向情感',
      '外向感知'
    ]
  },
  INTP: {
    functions: ['Ti', 'Ne', 'Si', 'Fe', 'Te', 'Ni', 'Se', 'Fi'],
    descriptions: [
      '内向思维',
      '外向直觉',
      '内向感知',
      '外向情感',
      '外向思维',
      '内向直觉',
      '外向感知',
      '内向情感'
    ]
  },
  ENTJ: {
    functions: ['Te', 'Ni', 'Se', 'Fi', 'Ti', 'Ne', 'Si', 'Fe'],
    descriptions: [
      '外向思维',
      '内向直觉',
      '外向感知',
      '内向情感',
      '内向思维',
      '外向直觉',
      '内向感知',
      '外向情感'
    ]
  },
  ISFP: {
    functions: ['Fi', 'Se', 'Ni', 'Te', 'Fe', 'Si', 'Ne', 'Ti'],
    descriptions: [
      '内向情感',
      '外向感知',
      '内向直觉',
      '外向思维',
      '外向情感',
      '内向感知',
      '外向直觉',
      '内向思维'
    ]
  },
  ESFJ: {
    functions: ['Fe', 'Si', 'Ne', 'Ti', 'Fi', 'Se', 'Ni', 'Te'],
    descriptions: [
      '外向情感',
      '内向感知',
      '外向直觉',
      '内向思维',
      '内向情感',
      '外向感知',
      '内向直觉',
      '外向思维'
    ]
  },
  ISFJ: {
    functions: ['Si', 'Fe', 'Ti', 'Ne', 'Se', 'Fi', 'Te', 'Ni'],
    descriptions: [
      '内向感知',
      '外向情感',
      '内向思维',
      '外向直觉',
      '外向感知',
      '内向情感',
      '外向思维',
      '内向直觉'
    ]
  },
  ESFP: {
    functions: ['Se', 'Fi', 'Te', 'Ni', 'Si', 'Fe', 'Ti', 'Ne'],
    descriptions: [
      '外向感知',
      '内向情感',
      '外向思维',
      '内向直觉',
      '内向感知',
      '外向情感',
      '内向思维',
      '外向直觉'
    ]
  },
  ISTJ: {
    functions: ['Si', 'Te', 'Fi', 'Ne', 'Se', 'Ti', 'Fe', 'Ni'],
    descriptions: [
      '内向感知',
      '外向思维',
      '内向情感',
      '外向直觉',
      '外向感知',
      '内向思维',
      '外向情感',
      '内向直觉'
    ]
  },
  ESTP: {
    functions: ['Se', 'Ti', 'Fe', 'Ni', 'Si', 'Te', 'Fi', 'Ne'],
    descriptions: [
      '外向感知',
      '内向思维',
      '外向情感',
      '内向直觉',
      '内向感知',
      '外向思维',
      '内向情感',
      '外向直觉'
    ]
  },
  ISTP: {
    functions: ['Ti', 'Se', 'Ni', 'Fe', 'Te', 'Si', 'Ne', 'Fi'],
    descriptions: [
      '内向思维',
      '外向感知',
      '内向直觉',
      '外向情感',
      '外向思维',
      '内向感知',
      '外向直觉',
      '内向情感'
    ]
  },
  ESTJ: {
    functions: ['Te', 'Si', 'Ne', 'Fi', 'Ti', 'Se', 'Ni', 'Fe'],
    descriptions: [
      '外向思维',
      '内向感知',
      '外向直觉',
      '内向情感',
      '内向思维',
      '外向感知',
      '内向直觉',
      '外向情感'
    ]
  }
}

const MBTI_IMAGES = {
  'INTJ': 'https://static.neris-assets.com/images/personality-types/avatars/intj-architect.svg',
  'INTP': 'https://static.neris-assets.com/images/personality-types/avatars/intp-logician.svg',
  'ENTJ': 'https://static.neris-assets.com/images/personality-types/avatars/entj-commander.svg',
  'ENTP': 'https://static.neris-assets.com/images/personality-types/avatars/entp-debater.svg',
  'INFJ': 'https://static.neris-assets.com/images/personality-types/avatars/infj-advocate.svg',
  'INFP': 'https://static.neris-assets.com/images/personality-types/avatars/infp-mediator.svg',
  'ENFJ': 'https://static.neris-assets.com/images/personality-types/avatars/enfj-protagonist.svg',
  'ENFP': 'https://static.neris-assets.com/images/personality-types/avatars/enfp-campaigner.svg',
  'ISTJ': 'https://static.neris-assets.com/images/personality-types/avatars/istj-logistician.svg',
  'ISFJ': 'https://static.neris-assets.com/images/personality-types/avatars/isfj-defender.svg',
  'ESTJ': 'https://static.neris-assets.com/images/personality-types/avatars/estj-executive.svg',
  'ESFJ': 'https://static.neris-assets.com/images/personality-types/avatars/esfj-consul.svg',
  'ISTP': 'https://static.neris-assets.com/images/personality-types/avatars/istp-virtuoso.svg',
  'ISFP': 'https://static.neris-assets.com/images/personality-types/avatars/isfp-adventurer.svg',
  'ESTP': 'https://static.neris-assets.com/images/personality-types/avatars/estp-entrepreneur.svg',
  'ESFP': 'https://static.neris-assets.com/images/personality-types/avatars/esfp-entertainer.svg'
}

const personality1 = ref({
  E: false,
  N: false,
  F: false,
  J: false
})

const personality2 = ref({
  E: false,
  N: false,
  F: false,
  J: false
})

const getPersonalityType = (personality) => {
  return (personality.E ? 'E' : 'I') +
         (personality.N ? 'N' : 'S') +
         (personality.F ? 'F' : 'T') +
         (personality.J ? 'J' : 'P')
}

const type1 = computed(() => getPersonalityType(personality1.value))
const type2 = computed(() => getPersonalityType(personality2.value))

const cognitiveFunctions1List = computed(() => {
  const type = COGNITIVE_FUNCTIONS[type1.value]
  if (!type) return []
  return type.functions.slice(0, 4).map((code, index) => ({
    code,
    desc: type.descriptions[index],
    isInferior: index === 3
  }))
})

const cognitiveFunctions2List = computed(() => {
  const type = COGNITIVE_FUNCTIONS[type2.value]
  if (!type) return []
  return type.functions.slice(0, 4).map((code, index) => ({
    code,
    desc: type.descriptions[index],
    isInferior: index === 3
  }))
})

const hasHighlightedFunctions = computed(() => {
  return type1.value && type2.value
})

const isHighlighted = (functionCode, currentType, otherType) => {
  if (!currentType || !otherType) return false
  
  const currentFunctions = COGNITIVE_FUNCTIONS[currentType].functions
  const otherFunctions = COGNITIVE_FUNCTIONS[otherType].functions
  
  // 检查是否是相同的功能
  const currentIndex = currentFunctions.indexOf(functionCode)
  const otherIndex = otherFunctions.indexOf(functionCode)
  
  // 如果两个类型都有这个功能，且位置相近（±1），则高亮
  if (currentIndex !== -1 && otherIndex !== -1) {
    return Math.abs(currentIndex - otherIndex) <= 1
  }
  
  return false
}

const relationshipType = computed(() => {
  if (MBTI_RELATIONSHIPS.ideal.some(([a, b]) => 
    (a === type1.value && b === type2.value) || (a === type2.value && b === type1.value))) {
    return '理想搭档'
  }
  
  if (MBTI_RELATIONSHIPS.compatible.some(([a, b]) => 
    (a === type1.value && b === type2.value) || (a === type2.value && b === type1.value))) {
    return '比较容易相处'
  }
  
  if (MBTI_RELATIONSHIPS.conflicting.some(([a, b]) => 
    (a === type1.value && b === type2.value) || (a === type2.value && b === type1.value))) {
    return '潜在冲突'
  }
  
  return '一般关系'
})

// 添加功能位分析
const FUNCTION_POSITION_ANALYSIS = {
  // 主导功能（第一功能位）与主导功能的关系
  dominant: {
    'Fi-Fe': '一个重视内在价值观，一个重视外在和谐，需要互相理解对方处理情感的方式。建议：多表达自己的感受，同时也要尊重对方的情感需求。',
    'Fi-Te': '一个重视情感体验，一个重视逻辑效率，可能在决策方式上有分歧。建议：在重要决定时，既考虑情感因素也考虑实际因素。',
    'Fe-Ti': '一个善于处理人际关系，一个擅长逻辑分析，能互补但也可能有沟通障碍。建议：结合感性和理性的视角来处理问题。',
    'Te-Ti': '都重视逻辑思维，但处理方式不同，可能在执行方式上有分歧。建议：相互学习对方的思维方式，取长补短。',
    'Ni-Ne': '都具有直觉思维，但一个倾向深度，一个倾向广度。建议：结合双方的洞察力，既要有远见又要保持开放。',
    'Si-Se': '一个重视经验和细节，一个重视当下和体验，在生活节奏上可能有差异。建议：平衡计划性和自发性，互相体谅对方的生活方式。'
  },
  // 辅助功能（第二功能位）的互动
  auxiliary: {
    'Ne-Ni': '在处理可能性时有不同视角，可以带来创新的火花。建议：多分享各自的想法，共同探索未来。',
    'Se-Si': '对待现实的态度不同，可以互相补充对细节和体验的理解。建议：既要享受当下，也要注意长期规划。',
    'Fe-Fi': '处理情感的方式不同，可以学习对方的情感智慧。建议：保持开放和理解的态度，欣赏对方的情感表达方式。',
    'Te-Ti': '思维方式互补，可以带来全面的问题解决方案。建议：在决策时综合考虑双方的分析方式。'
  }
}

// 修改关系分析的计算属性
const relationshipDetail = computed(() => {
  if (!type1.value || !type2.value) return ''
  
  const type1Functions = COGNITIVE_FUNCTIONS[type1.value].functions
  const type2Functions = COGNITIVE_FUNCTIONS[type2.value].functions
  
  // 获取双方的主导和辅助功能
  const type1Dominant = type1Functions[0]
  const type1Auxiliary = type1Functions[1]
  const type2Dominant = type2Functions[0]
  const type2Auxiliary = type2Functions[1]
  
  // 构建分析文本
  let analysis = ''
  
  // 首先添加基本的关系类型描述
  const pair = `${type1.value}-${type2.value}`
  const reversePair = `${type2.value}-${type1.value}`
  
  for (const [types, description] of Object.entries(MBTI_RELATIONSHIP_DETAILS)) {
    if (types === pair || types === reversePair) {
      analysis = description + '\n\n'
      break
    }
  }
  
  // 添加主导功能分析
  const dominantPair1 = `${type1Dominant}-${type2Dominant}`
  const dominantPair2 = `${type2Dominant}-${type1Dominant}`
  
  for (const [pair, desc] of Object.entries(FUNCTION_POSITION_ANALYSIS.dominant)) {
    if (pair === dominantPair1 || pair === dominantPair2) {
      analysis += `主导功能分析：${desc}\n\n`
      break
    }
  }
  
  // 添加辅助功能分析
  const auxiliaryPair1 = `${type1Auxiliary}-${type2Auxiliary}`
  const auxiliaryPair2 = `${type2Auxiliary}-${type1Auxiliary}`
  
  for (const [pair, desc] of Object.entries(FUNCTION_POSITION_ANALYSIS.auxiliary)) {
    if (pair === auxiliaryPair1 || pair === auxiliaryPair2) {
      analysis += `辅助功能分析：${desc}\n\n`
      break
    }
  }
  
  // 如果没有找到具体的功能位分析，添加通用建议
  if (!analysis.includes('功能分析')) {
    if (MBTI_RELATIONSHIPS.compatible.some(([a, b]) => 
      (a === type1.value && b === type2.value) || (a === type2.value && b === type1.value))) {
      analysis += '这两种类型的认知功能相似，容易产生共鸣和理解。建议：保持开放的心态，欣赏彼此的相似之处，同时也要保持各自的独特性。\n\n'
    } else if (MBTI_RELATIONSHIPS.conflicting.some(([a, b]) => 
      (a === type1.value && b === type2.value) || (a === type2.value && b === type1.value))) {
      analysis += '这两种类型的认知功能差异较大，需要更多的理解和包容。建议：多倾听对方的想法，尊重差异，把不同的认知方式视为互补而不是冲突。\n\n'
    }
  }
  
  // 添加一般性建议
  analysis += '通用建议：\n' +
    '1. 保持开放和诚实的沟通\n' +
    '2. 理解并尊重对方的处事方式\n' +
    '3. 在冲突时，先理解对方的认知方式再寻求解决方案\n' +
    '4. 珍惜彼此的差异，将其视为关系的增长点而不是障碍'
  
  return analysis
})

const railStyle = ({ focused, checked }) => {
  const style = {
    height: '28px',
    width: '50px',
    borderRadius: '4px',
    backgroundColor: checked ? '#1976d2' : '#ff9800',
    opacity: 1
  }
  return style
}

const buttonStyle = ({ focused, checked }) => {
  const style = {
    height: '24px',
    width: '24px',
    borderRadius: '2px',
    backgroundColor: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }
  return style
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.personalities-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.personality-selector {
  flex: 1;
}

.switch-group {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 16px;
  padding: 12px 0;
  margin: 0;
}

.switch-item :deep(.n-switch) {
  min-width: 45px;
  height: 26px;
  margin: 0;
}

.cognitive-functions {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.functions-list {
  margin-top: 10px;
}

.function-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  background-color: #fff;
  transition: all 0.3s ease;
}

.function-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e3f2fd;
  border-radius: 50%;
  margin-right: 12px;
  font-size: 0.9em;
  font-weight: bold;
  color: #1976d2;
  flex-shrink: 0;
}

.function-code {
  font-weight: bold;
  margin-right: 12px;
  color: #1976d2;
  width: 30px;
  flex-shrink: 0;
}

.function-desc {
  color: #666;
  min-width: 0;
  flex: 1;
}

.inferior {
  background-color: #f5f5f5;
}

.inferior .function-number {
  background-color: #ffe0b2;
  color: #ff9800;
}

.inferior .function-code {
  color: #ff9800;
}

.highlighted {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

.relationship-header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.highlight-note {
  font-size: 0.9em;
  color: #666;
  display: flex;
  align-items: center;
  gap: 4px;
}

.highlight-note :deep(.n-icon) {
  color: #1976d2;
  flex-shrink: 0;
}

.personality-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
}

.personality-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.relationship-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.relationship-type {
  font-size: 1.1em;
  font-weight: bold;
  color: #1976d2;
}

.relationship-detail {
  line-height: 1.6;
  color: #666;
  text-align: justify;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .container {
    padding: 10px;
  }

  .personalities-container {
    flex-direction: column;
    gap: 10px;
  }

  .switch-group {
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 0;
    justify-content: center;
  }

  .switch-item {
    min-width: 70px;
  }

  .function-item {
    padding: 6px;
  }

  .function-number {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    font-size: 0.8em;
  }

  .function-code {
    margin-right: 8px;
    width: 25px;
  }

  .function-desc {
    font-size: 0.9em;
  }

  .relationship-header {
    gap: 8px;
  }

  .highlight-note {
    font-size: 0.8em;
    width: 100%;
  }

  .personality-image {
    width: 100px;
    height: 100px;
  }

  .relationship-detail {
    font-size: 0.9em;
  }
}

/* 超小屏幕适配 */
@media screen and (max-width: 375px) {
  .switch-group {
    gap: 8px;
  }

  .switch-item {
    min-width: 60px;
  }

  .switch-item :deep(.n-switch) {
    min-width: 45px;
    height: 24px;
  }

  .function-item {
    font-size: 0.9em;
  }

  .personality-image {
    width: 80px;
    height: 80px;
  }
}
</style> 