export const resultChip = (result) => {
  const r = String(result || '').toLowerCase()
  if (r === 'win') return { color: 'success', label: 'ניצחון', accent: 'success.400' }
  if (r === 'loss') return { color: 'danger', label: 'הפסד', accent: 'danger.400' }
  if (r === 'draw') return { color: 'warning', label: 'תיקו', accent: 'warning.400' }
  return { color: 'neutral', label: '—', accent: 'transparent' }
}

export const typeMeta = (type) => {
  const t = String(type || '').toLowerCase()
  if (t === 'league') return { label: 'ליגה', iconId: 'league', color: 'neutral' }
  if (t === 'cup') return { label: 'גביע', iconId: 'cup', color: 'primary' }
  if (t === 'friendly') return { label: 'ידידות', iconId: 'friendly', color: 'neutral' }
  return { label: 'משחק', iconId: 'game', color: 'neutral' }
}
