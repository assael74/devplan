export const toIso = (d) => {
  if (!d) return null
  if (typeof d === 'string') return d
  if (d?.toDate) return d.toDate().toISOString?.() || null // Firestore Timestamp
  if (d instanceof Date) return d.toISOString()
  if (d?.toISOString) return d.toISOString()
  return null
}

export const formatUpdatedLabel = (updatedAt) => {
  const iso = toIso(updatedAt)
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'עודכן היום'
  if (diffDays === 1) return 'עודכן אתמול'
  return `עודכן לפני ${diffDays} ימים`
}

// תומך "11/12/2025" (dd/mm/yyyy)
export const parseDdMmYyyy = (s) => {
  if (!s || typeof s !== 'string') return null
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!m) return null
  const dd = Number(m[1])
  const mm = Number(m[2])
  const yyyy = Number(m[3])
  const d = new Date(yyyy, mm - 1, dd)
  return Number.isFinite(d.getTime()) ? d : null
}

export const formatCheckLabel = (lastCheck) => {
  const d = parseDdMmYyyy(lastCheck)
  if (!d) return ''
  const now = new Date()
  const diffMs = now - d
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'נבדק היום'
  if (diffDays === 1) return 'נבדק אתמול'
  return `נבדק לפני ${diffDays} ימים`
}
