// features/abilitiesPublic/invites/abilitiesInvites.create.helpers.js

function clean(v) {
  return String(v ?? '').trim()
}

function slugifyHebrewSafe(value) {
  return clean(value)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0590-\u05FFa-z0-9-]/gi, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function randomPart() {
  return Math.random().toString(36).slice(2, 10)
}

export function createAbilitiesInviteToken() {
  return `ab_${Date.now()}_${randomPart()}`
}

export function buildAbilitiesInviteSlug(playerName) {
  return slugifyHebrewSafe(playerName)
}

export function buildAbilitiesInvitePath({ token }) {
  const safeToken = clean(token)
  if (!safeToken) return ''
  return `/share/abilities/${safeToken}`
}

export function buildAbilitiesInviteLink({ origin, token }) {
  const safeOrigin = clean(origin).replace(/\/$/, '')
  const safePath = buildAbilitiesInvitePath({ token })

  if (!safeOrigin || !safePath) return ''
  return `${safeOrigin}${safePath}`
}

export function addDaysIso(days = 7) {
  const d = new Date()
  d.setDate(d.getDate() + Number(days || 0))
  return d.toISOString()
}

export function buildEvaluatorLabel(invite = {}) {
  return clean(invite?.evaluator?.fullName || invite?.evaluator?.type || '')
}

export function buildAbilitiesWhatsappText(invite = {}) {
  const lines = [
    'טופס הערכת יכולות לשחקן',
    '',
    `שחקן: ${clean(invite?.player?.fullName) || '-'}`,
  ]

  if (clean(invite?.team?.teamName)) {
    lines.push(`קבוצה: ${clean(invite?.team?.teamName)}`)
  }

  if (clean(invite?.evaluator?.fullName || invite?.evaluator?.type)) {
    lines.push(`מעריך: ${clean(invite?.evaluator?.fullName || invite?.evaluator?.type)}`)
  }

  lines.push('מילוי קצר בנייד, ללא צורך בהתחברות.')
  lines.push('')
  lines.push(clean(invite?.link || ''))

  return lines.join('\n')
}
