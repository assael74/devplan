// features/playersDatabase/ui/components/tables/tableWidths.js

export const buildTableColumnWidth = value => {
  if (!value) return {}

  if (typeof value === 'object') {
    return value
  }

  return {
    width: value,
  }
}
