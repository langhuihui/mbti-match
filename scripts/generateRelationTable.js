import { generateRelationMatrix } from '../src/utils/mbtiRelations.js'
import { MBTI_TYPE_ORDER } from '../src/constants.js'

function generateMarkdownTable() {
  const matrix = generateRelationMatrix()
  
  // 生成表头
  let table = '| 类型 | ' + MBTI_TYPE_ORDER.join(' | ') + ' |\n'
  // 生成分隔行
  table += '|------|' + MBTI_TYPE_ORDER.map(() => '------|').join('') + '\n'
  
  // 生成表格内容
  for (const type1 of MBTI_TYPE_ORDER) {
    table += `| ${type1} | `
    for (const type2 of MBTI_TYPE_ORDER) {
      table += `${matrix[type1][type2]} | `
    }
    table += '\n'
  }
  
  return table
}

// 生成表格并输出
console.log(generateMarkdownTable()) 