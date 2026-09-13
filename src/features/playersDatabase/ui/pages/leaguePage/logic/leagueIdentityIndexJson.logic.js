const safeFilePart = (value, fallback) => String(value || fallback).replaceAll('/', '-')

export const downloadLeagueIdentityIndexJson = (document = {}) => {
  const blob = new Blob([JSON.stringify(document, null, 2)], {type: 'application/json'})
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = `club-season-identity-index-${safeFilePart(document.seasonKey, 'unknown')}-${safeFilePart(document.birthYear, 'unknown')}.json`
  link.click()
  URL.revokeObjectURL(url)
}
