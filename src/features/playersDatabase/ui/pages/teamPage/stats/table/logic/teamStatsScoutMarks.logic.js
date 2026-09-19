export const toFiniteNumber = value => {
  const numberValue = Number(value)

  return Number.isFinite(numberValue) ? numberValue : null
}

export const getSeasonMinutes = row => {
  const seasonMinutes = toFiniteNumber(
    row.scoutCalculationContract?.seasonMinutes
  )

  return seasonMinutes !== null && seasonMinutes > 0
    ? seasonMinutes
    : null
}

export const getMinutesPct = row => {
  const minutes = toFiniteNumber(row.minutes)
  const seasonMinutes = getSeasonMinutes(row)

  if (minutes === null || seasonMinutes === null) return null

  return minutes / seasonMinutes
}

export const getMinutesPctMark = row => {
  const minutesPct = getMinutesPct(row)

  if (minutesPct === null) return null

  if (minutesPct >= 0.9) {
    return {
      color: 'success',
      variant: 'solid',
      text: '90%+ מדקות הקבוצה · תנאי הבסיס של העוגן המקצועי',
    }
  }

  if (minutesPct >= 0.85) {
    const goals = toFiniteNumber(row.goals)
    const goalsOk = goals !== null && goals <= 2

    return {
      color: goalsOk ? 'success' : 'warning',
      variant: 'soft',
      text: goalsOk
        ? '85%+ מדקות הקבוצה ועד 2 שערים · תנאי הבסיס של התחנה האחרונה'
        : '85%+ מדקות הקבוצה, אבל תנאי השערים של התחנה האחרונה לא עבר',
    }
  }

  if (minutesPct >= 0.05 && minutesPct <= 0.15) {
    return {
      color: 'warning',
      variant: 'soft',
      text: '5%-15% מדקות הקבוצה · טווח הבסיס של שחקן איכותי שלא מקבל הזדמנות',
    }
  }

  return null
}

