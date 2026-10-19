// src/features/playersDatabase/ui/logic/downloadDocumentsZip.js

import { strToU8, zipSync } from 'fflate'

export const safeDownloadFilePart = (value, fallback = 'unknown') => String(value || fallback)
  .trim()
  .replace(/[\\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')

export const downloadDocumentsZip = ({ documents = [], fileName = 'documents.zip' }) => {
  if (!documents.length) return 0

  const archive = zipSync(Object.fromEntries(documents.map(({ data, fileName: entryName }) => [
    entryName,
    strToU8(JSON.stringify(data, null, 2)),
  ])))
  const blob = new Blob([archive], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)

  return documents.length
}
