// features/playersDatabase/ui/components/tables/dataTable/dataTable.export.js

import * as XLSX from 'xlsx'

const clean = value => {
  const safeValue = value === null || value === undefined
    ? ''
    : value

  return String(safeValue).trim()
}

const resolveColumnValue = ({ column = {}, row = {}, index = 0 } = {}) => {
  if (typeof column.value === 'function') {
    return column.value(row, index)
  }

  return row[column.key]
}

const buildExportRows = ({ rows = [], columns = [] } = {}) => {
  return (Array.isArray(rows) ? rows : []).map((row, index) => {
    return columns.reduce((result, column) => {
      result[column.label || column.key] = resolveColumnValue({
        column,
        row,
        index,
      })

      return result
    }, {})
  })
}

export default function exportDataTableRowsToXlsx({
  rows = [],
  columns = [],
  fileName = 'table-export',
  sheetName = 'Data',
} = {}) {
  const safeColumns = (Array.isArray(columns) ? columns : [])
    .filter(column => clean(column?.label || column?.key))

  if (!safeColumns.length) return false

  const exportRows = buildExportRows({
    rows,
    columns: safeColumns,
  })
  const worksheet = XLSX.utils.json_to_sheet(exportRows)
  const workbook = XLSX.utils.book_new()

  XLSX.utils.book_append_sheet(workbook, worksheet, clean(sheetName) || 'Data')
  XLSX.writeFile(workbook, `${clean(fileName) || 'table-export'}.xlsx`)

  return true
}
