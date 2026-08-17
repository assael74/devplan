// C:\projects\devplan\functions\src\domain\narrative\ageGroupLabels.js

const AGE_GROUP_LABELS = {
  u19: 'נוער',
  u17: 'נערים א',
  u16: 'נערים ב',
  u15: 'נערים ג',
  u14: 'ילדים א',
  u13: 'ילדים ב',
}

function clean(value) {
  return String(value || '').trim()
}

function resolveAgeGroupLabel({ ageGroupId, ageGroupLabel } = {}) {
  const id = clean(ageGroupId).toLowerCase()
  const label = clean(ageGroupLabel)

  if (AGE_GROUP_LABELS[id]) return AGE_GROUP_LABELS[id]
  if (label && !/^u\d+$/i.test(label)) return label
  return AGE_GROUP_LABELS[label.toLowerCase()] || label || id
}

module.exports = { resolveAgeGroupLabel }
