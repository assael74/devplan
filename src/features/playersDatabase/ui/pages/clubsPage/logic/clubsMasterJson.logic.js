export const downloadClubsMasterJson = document => {
  if (!document) return

  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replaceAll('.', '-')
  const blob = new Blob([JSON.stringify(document, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = `clubs-master-all-${timestamp}.json`
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
