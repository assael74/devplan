export const displayClassificationValue = value => value === null || value === undefined ? '—' : value

export const getPlayerInterestLevel = player => String(
  player?.scoutPlayerInterestLevel || player?.scoutPlayerInterest?.interestLevel || 'unavailable'
).trim().toLowerCase()

export const getPlayerInterestLabel = level => ({
  reasonable: 'עניין סביר',
  curious: 'מסקרן',
  interesting: 'מעניין',
  super_interesting: 'מעניין מאוד',
  unavailable: 'רמת עניין טרם חושבה',
}[level] || 'רמת עניין טרם חושבה')

export const PLAYER_STATUS_DISPLAY = Object.freeze({
  youngerAgeGroup: { label: 'שנתון צעיר', iconId: 'rosterYounger', color: 'primary' },
  retired: { label: 'פרש', iconId: 'rosterRetired', color: 'neutral' },
  transferredIn: { label: 'הצטרף במהלך העונה', iconId: 'rosterJoined', color: 'success' },
})

export const getPlayerStatusPresentation = row => {
  const direction = row.manualTransferDirection || 'unknown'

  return row.rosterStatus === 'transferredOut'
    ? ({
        up: { label: 'עזב לקבוצה ברמה גבוהה יותר', iconId: 'sortUp', color: 'success' },
        down: { label: 'עזב לקבוצה ברמה נמוכה יותר', iconId: 'sortDown', color: 'danger' },
        lateral: { label: 'עזב לקבוצה באותה רמה', iconId: 'swapVert', color: 'primary' },
      }[direction] || { label: 'עזב במהלך העונה', iconId: 'rosterLeft', color: 'danger' })
    : PLAYER_STATUS_DISPLAY[row.rosterStatus]
}

export const displayGamesStarts = row => (
  `${displayClassificationValue(row.games)} / ${displayClassificationValue(row.starts)}`
)

const MINUTES_BAND_RANGES = Object.freeze({
  נמוך: '0–69%',
  בינוני: '70–74%',
  'בינוני־גבוה': '75–89%',
  גבוה: '90–100%',
})

const SUBSTITUTION_BAND_RANGES = Object.freeze({
  נמוך: '0–29%',
  בינוני: '30–49%',
  גבוה: '50–100%',
})

export const getMinutesPresentation = row => {
  const rate = Number(row.minutesRate)
  const progress = Number.isFinite(rate) ? Math.max(0, Math.min(100, rate)) : 0
  const tone = !Number.isFinite(rate)
    ? 'unavailable'
    : rate >= 90
      ? 'high'
      : rate >= 75
        ? 'mediumHigh'
        : rate >= 70
          ? 'medium'
          : 'low'
  const band = MINUTES_BAND_RANGES[row.minutesBand]
    ? row.minutesBand
    : ({ high: 'גבוה', mediumHigh: 'בינוני־גבוה', medium: 'בינוני', low: 'נמוך' })[tone] || 'לא זמין'

  return {
    hasRate: row.minutesRate !== null && row.minutesRate !== undefined,
    progress,
    tone,
    tooltip: `${band} · ${MINUTES_BAND_RANGES[band] || '—'}`,
    tooltipColor: ({ high: 'success', mediumHigh: 'primary', medium: 'warning', low: 'danger', unavailable: 'neutral' })[tone] || 'neutral',
  }
}

export const getSubstitutionPresentation = row => {
  const rate = Number(row.substitutionRate)
  const progress = Number.isFinite(rate) ? Math.max(0, Math.min(100, rate)) : 0
  const tone = !Number.isFinite(rate)
    ? 'unavailable'
    : rate >= 50
      ? 'high'
      : rate >= 30
        ? 'medium'
        : 'low'
  const band = SUBSTITUTION_BAND_RANGES[row.substitutionBand]
    ? row.substitutionBand
    : ({ high: 'גבוה', medium: 'בינוני', low: 'נמוך' })[tone] || 'לא זמין'

  return {
    hasRate: row.substitutionRate !== null && row.substitutionRate !== undefined,
    progress,
    tone,
    tooltip: `${band} · ${SUBSTITUTION_BAND_RANGES[band] || '—'}`,
    tooltipColor: ({ high: 'danger', medium: 'warning', low: 'success', unavailable: 'neutral' })[tone] || 'neutral',
  }
}

export const getAllSquadRosterOrder = row => {
  if (row.rosterStatus === 'transferredOut') return 5
  if (row.rosterStatus === 'youngerAgeGroup') return 4
  if (row.squadClassificationStatus === 'irrelevant') return 3
  if (row.squadClassificationStatus === 'insufficientSample') return 2
  if (row.squadClassificationStatus === 'unclassifiedSufficientSample') return 1

  return 0
}

export const getPersonalMinutesRate = row => {
  const value = Number(row.minutesRate)
  return Number.isFinite(value) ? value : -1
}

export const sortByPersonalMinutesRate = (left, right) => (
  getPersonalMinutesRate(right) - getPersonalMinutesRate(left)
)
