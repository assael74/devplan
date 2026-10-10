// src/features/playersDatabase/ui/pages/DataOpsPage/logic/dataOpsJsonDownload.logic.js

export const downloadDataOpsJson = ({ fileName, data } = {}) => {
  if (typeof window === 'undefined' || !data) return

  const url = window.URL.createObjectURL(new Blob([
    JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2),
  ], { type: 'application/json;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => window.URL.revokeObjectURL(url), 0)
}
