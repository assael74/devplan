export function formatPhoneNumber(phone) {
  if (!phone) return ''

  const digits = String(phone).replace(/\D/g, '')

  // תומך גם במספרים קצרים/ארוכים – לא נשבר
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`

  return `${digits.slice(0, 3)}-${digits.slice(3, 10)}`
}
