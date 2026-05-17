// teamProfile/sharedLogic/management//print/management.printRows.js

const cleanPercentLabel = (label = '') => {
  return String(label)
    .replace(/\s+/g, ' ')
    .replace(/\s*נקודות\s*/g, ' ')
    .trim()
}

const getChipLabels = (row) => {
  if (!Array.isArray(row?.chips)) return []

  return row.chips
    .map((chip) => String(chip?.label || '').trim())
    .filter(Boolean)
}

const getPercentLabel = (labels = []) => {
  return labels.find((label) => label.includes('%')) || ''
}

const normalizeSuccessText = (label = '') => {
  const clean = cleanPercentLabel(label)

  if (!clean) return ''

  return `${clean} הצלחה בצבירת נקודות`
}

const normalizeAboveSuccessText = (label = '') => {
  const clean = cleanPercentLabel(label)

  if (!clean) return ''

  const value = clean.startsWith('מעל')
    ? clean
    : `מעל ${clean.replace(/^מעל\s*/, '')}`

  return `${value} הצלחה בצבירת נקודות`
}

export const mapHomeAwayRowsForPrint = (rows = []) => {
  return rows.map((row) => {
    const labels = getChipLabels(row)
    const percentLabel = getPercentLabel(labels)
    const value = normalizeAboveSuccessText(percentLabel || labels[0] || '')

    return {
      id: row.id,
      label: row.label,
      value: value || '—',
      helper: row.helper || '',
    }
  })
}

export const mapDifficultyRowsForPrint = (rows = []) => {
  return rows.map((row) => {
    const labels = getChipLabels(row)
    const percentLabel = getPercentLabel(labels)
    const cleanPercent = cleanPercentLabel(percentLabel)

    const otherLabels = labels
      .map(cleanPercentLabel)
      .filter((label) => label && label !== cleanPercent)

    return {
      id: row.id,
      label: row.label,
      value: cleanPercent
        ? normalizeSuccessText(cleanPercent)
        : cleanPercentLabel(labels[0]) || '—',
      helper: otherLabels.join(' • ') || row.helper || '',
    }
  })
}

export const mapGenericRowsForPrint = (rows = []) => {
  return rows.map((row) => {
    const labels = getChipLabels(row)

    return {
      id: row.id,
      label: row.label,
      value: labels[0] || '—',
      helper: labels.slice(1).join(' • ') || row.helper || '',
    }
  })
}
