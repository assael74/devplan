// teamProfile/sharedLogic/management/print/management.printRows.js

const EMPTY = '—'

const cleanPercentLabel = (label = '') => {
  return String(label)
    .replace(/\s+/g, ' ')
    .replace(/\s*נקודות\s*/g, ' ')
    .trim()
}

const getChipLabels = row => {
  if (!Array.isArray(row?.chips)) return []

  return row.chips
    .map(chip => String(chip?.label || '').trim())
    .filter(Boolean)
}

const getPercentLabel = (labels = []) => {
  return labels.find(label => label.includes('%')) || ''
}

const normalizePercentValue = (label = '') => {
  const clean = cleanPercentLabel(label)
  if (!clean) return ''
  const match = clean.match(/\d+(?:\.\d+)?%/)
  return match ? match[0] : clean
}

export const mapHomeAwayRowsForPrint = (rows = []) => {
  return rows.map(row => {
    const labels = getChipLabels(row)
    const percentLabel = getPercentLabel(labels)

    return {
      id: row.id,
      idIcon: row.idIcon,
      label: row.label,
      value: normalizePercentValue(percentLabel || labels[0] || '') || EMPTY,
      helper: '',
    }
  })
}

export const mapDifficultyRowsForPrint = (rows = []) => {
  return rows.map(row => {
    const labels = getChipLabels(row)
    const percentLabel = getPercentLabel(labels)

    return {
      id: row.id,
      idIcon: row.idIcon,
      label: row.label,
      value: normalizePercentValue(percentLabel || labels[0] || '') || EMPTY,
      helper: '',
    }
  })
}

export const mapGenericRowsForPrint = (rows = []) => {
  return rows.map(row => {
    const labels = getChipLabels(row)

    return {
      id: row.id,
      idIcon: row.idIcon || 'flag',
      label: row.label,
      value: labels[0] || EMPTY,
      helper: labels.slice(1).join(' · ') || row.helper || '',
    }
  })
}
