export const formatPlayersDatabaseNumber = (value) =>
  Number(value || 0).toLocaleString('he-IL')

export const getPlayersDatabaseInitials = (fullName = '') => {
  const parts = String(fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].slice(0, 2)

  return `${parts[0][0] || ''}${parts[1][0] || ''}`
}
