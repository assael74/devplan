// src/features/playersDatabase/domain/narrative/narrativeDraft.js

const clean = value => String(value || '').trim()

const buildEntryKey = (season, entry) => {
  const seasonKey = clean(entry?.seasonKey || season?.seasonKey)
  const teamKey = clean(entry?.team?.teamDocumentId || entry?.team?.teamId || entry?.team?.clubId)
  const slot = Number(entry?.team?.teamSlot || 0)

  return [seasonKey, teamKey, slot].join('|')
}

const walkEvidence = ({ value, path, entryKey, refs }) => {
  if (value === null || value === undefined) return

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      walkEvidence({
        value: item,
        path: `${path}.${index}`,
        entryKey,
        refs,
      })
    })
    return
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => {
      walkEvidence({
        value: item,
        path: path ? `${path}.${key}` : key,
        entryKey,
        refs,
      })
    })
    return
  }

  if (!path) return
  refs.add(`${entryKey}|${path}`)
}

export const createEmptyNarrativeDraft = () => ({
  title: '',
  summary: '',
  evidenceRefs: [],
})

export const listEvidenceRefs = input => {
  const refs = new Set()
  const seasons = Array.isArray(input?.seasons) ? input.seasons : []

  seasons.forEach(season => {
    const entries = Array.isArray(season?.entries) ? season.entries : []

    entries.forEach(entry => {
      const entryKey = buildEntryKey(season, entry)

      walkEvidence({
        value: entry?.evidence,
        path: 'evidence',
        entryKey,
        refs,
      })
    })
  })

  return [...refs]
}

export const normalizeNarrativeDraft = value => ({
  ...createEmptyNarrativeDraft(),
  title: clean(value?.title),
  summary: clean(value?.summary),
  evidenceRefs: Array.isArray(value?.evidenceRefs)
    ? [...new Set(value.evidenceRefs.map(clean).filter(Boolean))]
    : [],
})

export const validateNarrativeDraft = ({ draft, input } = {}) => {
  const value = normalizeNarrativeDraft(draft)
  const allowedRefs = new Set(listEvidenceRefs(input))
  const invalidRefs = value.evidenceRefs.filter(ref => !allowedRefs.has(ref))
  const errors = []

  if (!value.title) errors.push('missing_title')
  if (!value.summary) errors.push('missing_summary')
  if (!value.evidenceRefs.length) errors.push('missing_evidence_refs')
  if (invalidRefs.length) errors.push('invalid_evidence_refs')

  return {
    valid: errors.length === 0,
    draft: value,
    errors,
    invalidRefs,
  }
}
