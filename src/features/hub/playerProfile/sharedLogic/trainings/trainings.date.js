// playerProfile/sharedLogic/trainings/playerTrainings.domain.logic.js

const to2 = (n) => String(n).padStart(2, '0')

export const toLocalYmd = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return ''
  return `${date.getFullYear()}-${to2(date.getMonth() + 1)}-${to2(date.getDate())}`
}

export const toValidDate = (value) => {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const startOfToday = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export const getStartOfWeekSunday = (value = new Date()) => {
  const d = toValidDate(value)
  if (!d) return ''

  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)

  const day = copy.getDay()
  copy.setDate(copy.getDate() - day)

  return toLocalYmd(copy)
}
