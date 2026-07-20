// features/playersDatabase/ui/logic/filters.logic.js

const clean = value => String(value ?? '').trim().toLowerCase()

export function filterByText(rows = [], query = '', fields = []) {
  const safeQuery = clean(query)
  if (!safeQuery) return rows

  return rows.filter(row =>
    fields.some(field => clean(row?.[field]).includes(safeQuery))
  )
}

export function filterByValue(rows = [], field, value) {
  if (!value || value === 'all') return rows
  return rows.filter(row => String(row?.[field] ?? '') === String(value))
}
