// src/features/bulkActions/videos/import/logic/normalizeVideoImportRow.js

import { cleanVideoLink } from '../../../../../shared/video/cleanVideoLink.js'

const clean = value => String(value ?? '').trim()

export function normalizeVideoImportRow(row = {}) {
  const name = clean(row.name)
  const rawLink = clean(row.link)
  const cleanedLink = cleanVideoLink(rawLink)

  const errors = []

  if (!name) {
    errors.push('חסר שם וידאו')
  }

  if (!rawLink) {
    errors.push('חסר קישור')
  }

  if (rawLink && !cleanedLink) {
    errors.push('קישור Google Drive לא תקין')
  }

  return {
    ...row,
    name,
    link: cleanedLink || rawLink,
    rawLink,
    isValidLink: Boolean(cleanedLink),
    isValid: Boolean(name && cleanedLink),
    errors,
  }
}
