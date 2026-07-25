// features/playersDatabase/ui/components/tables/dataTable/dataTable.model.js

export const cleanDataTableHref = value => String(value || '').trim()

export const resolveDataTableColumnSx = (
  value,
  row,
  index
) => (
  typeof value === 'function' ? value(row, index) : value
)

export const resolveDataTableRowKey = ({
  row,
  index,
  getRowKey,
}) => {
  if (getRowKey) {
    return getRowKey(row, index)
  }

  return row.id || index
}
