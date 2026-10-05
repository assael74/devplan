// src/features/playersDatabase/ui/pages/clubsPage/logic/clubsPageJson.logic.js

const clean = value => String(value === null || value === undefined ? '' : value).trim()

const safeFilePart = (value, fallback = 'unknown') => clean(value || fallback)
  .replace(/[\\/:*?"<>|]+/g, '-')
  .replace(/\s+/g, '-')

const exportDocument = document => {
  if (!document || typeof document !== 'object') return null

  const { id, documentExists, ...data } = document
  return data
}

const buildOption = ({
  id,
  label,
  collectionName,
  documentId,
  document,
}) => ({
  id,
  label,
  collectionName,
  documentId,
  available: document?.documentExists === true,
  document: exportDocument(document),
  fileName: `${safeFilePart(collectionName)}-${safeFilePart(documentId)}.json`,
})

export const buildClubsPageJsonOptions = ({
  directory = null,
  centers = [],
} = {}) => [
  buildOption({
    id: 'clubsDirectory',
    label: 'ספריית המועדונים · dbClubsDirectory/all',
    collectionName: 'dbClubsDirectory',
    documentId: 'all',
    document: directory,
  }),
  ...(Array.isArray(centers) ? centers : []).map(item => {
    const seasonId = clean(item?.season?.seasonId || item?.document?.id)
    const seasonLabel = clean(item?.season?.label || item?.season?.seasonKey || seasonId)

    return buildOption({
      id: `clubsCenter:${seasonId}`,
      label: `מרכז מועדונים · ${seasonLabel}`,
      collectionName: 'dbClubsCenter',
      documentId: seasonId,
      document: item?.document,
    })
  }),
]

export const downloadClubsPageJsonOption = option => {
  if (!option?.available || !option.document) return false

  const blob = new Blob([JSON.stringify(option.document, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const link = window.document.createElement('a')

  link.href = url
  link.download = option.fileName
  window.document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  return true
}

export const downloadAllClubsPageJsonOptions = options => (
  (Array.isArray(options) ? options : [])
    .filter(option => option.available)
    .reduce((count, option) => (
      downloadClubsPageJsonOption(option) ? count + 1 : count
    ), 0)
)

