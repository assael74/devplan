// C:\projects\devplan\functions\src\domain\narrative\validate.js

function clean(value) {
  return String(value || '').trim()
}

function buildEvidenceIds(input = {}) {
  return new Set(
    (Array.isArray(input.evidence) ? input.evidence : [])
      .map(item => clean(item.id))
      .filter(Boolean)
  )
}

function validateDraft({ input = {}, draft = {} } = {}) {
  const title = clean(draft.title)
  const summary = clean(draft.summary)
  const evidenceRefs = Array.isArray(draft.evidenceRefs)
    ? [...new Set(draft.evidenceRefs.map(clean).filter(Boolean))]
    : []

  if (!title || !summary) {
    throw Object.assign(new Error('invalid narrative draft'), { status: 502 })
  }

  const evidenceIds = buildEvidenceIds(input)
  const invalidRefs = evidenceRefs.filter(ref => !evidenceIds.has(ref))

  if (invalidRefs.length) {
    throw Object.assign(new Error('invalid narrative evidence refs'), {
      status: 502,
      details: { invalidRefs },
    })
  }

  return { title, summary, evidenceRefs }
}

module.exports = { validateDraft }
