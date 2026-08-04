/**
 * 邀请分享文案 A/B 变体
 */
function pickShareVariant(seed) {
  const variants = ['curious', 'challenge', 'relation']
  if (typeof seed === 'number') {
    return variants[Math.abs(seed) % variants.length]
  }
  return variants[Math.floor(Math.random() * variants.length)]
}

function buildInviteShare({ nickname, myType, typeName, inviteCode, variant }) {
  const v = variant || pickShareVariant()
  const who = nickname || '我'

  const titles = {
    curious: `${who}是 ${myType}（${typeName}），来测测我们是什么关系？`,
    challenge: `我是 ${myType}，你敢来揭秘我们的 MBTI 关系吗？`,
    relation: `${who}邀请你：选个类型，马上揭晓我们的关系化学反应`
  }

  let path = `/pages/match/match?code=${inviteCode}&type=${myType}`
  if (nickname) {
    path += `&nickname=${encodeURIComponent(nickname)}`
  }

  return {
    title: titles[v] || titles.curious,
    path,
    variant: v
  }
}

function buildCopyText({ nickname, myType, typeName, inviteCode }) {
  const who = nickname || '我'
  return `${who}是 ${myType}（${typeName}），来测测我们的 MBTI 关系吧！\n打开小程序 → 输入邀请码：${inviteCode}`
}

module.exports = {
  pickShareVariant,
  buildInviteShare,
  buildCopyText
}
