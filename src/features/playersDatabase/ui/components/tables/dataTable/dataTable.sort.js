// features/playersDatabase/ui/components/tables/dataTable/dataTable.sort.js

export const DATA_TABLE_SORT_DIRECTIONS = {
  ASC: 'asc',
  DESC: 'desc',
}

const isEmptySortValue = value => (
  value === null ||
  value === undefined ||
  String(value).trim() === ''
)

const normalizeSortValue = value => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }

  const textValue = String(value || '').trim()
  if (!textValue) return null

  const numericValue = Number(textValue.replace(/,/g, ''))
  if (Number.isFinite(numericValue)) return numericValue

  return textValue
}

export const compareDataTableSortValues = (
  leftValue,
  rightValue,
  direction
) => {
  const leftEmpty = isEmptySortValue(leftValue)
  const rightEmpty = isEmptySortValue(rightValue)

  if (leftEmpty && rightEmpty) return 0
  if (leftEmpty) return 1
  if (rightEmpty) return -1

  const left = normalizeSortValue(leftValue)
  const right = normalizeSortValue(rightValue)

  let comparison = 0

  if (typeof left === 'number' && typeof right === 'number') {
    comparison = left - right
  } else {
    comparison = String(left).localeCompare(
      String(right),
      'he',
      {
        numeric: true,
        sensitivity: 'base',
      }
    )
  }

  return direction === DATA_TABLE_SORT_DIRECTIONS.DESC
    ? comparison * -1
    : comparison
}

export const sortDataTableRows = ({
  rows,
  column,
  direction,
}) => {
  if (!column) return rows

  const getSortValue = column.getSortValue || (
    row => row[column.key]
  )

  return rows
    .map((row, index) => ({
      row,
      originalIndex: index,
    }))
    .sort((leftItem, rightItem) => {
      const comparison = compareDataTableSortValues(
        getSortValue(leftItem.row, leftItem.originalIndex),
        getSortValue(rightItem.row, rightItem.originalIndex),
        direction
      )

      return comparison || leftItem.originalIndex - rightItem.originalIndex
    })
    .map(item => item.row)
}
