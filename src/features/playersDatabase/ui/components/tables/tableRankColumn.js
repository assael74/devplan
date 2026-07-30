// features/playersDatabase/ui/components/tables/tableRankColumn.js

import TableRankBadge from './TableRankBadge.js'

const toRankSortValue = value => {
  const rank = Number(value)
  return Number.isFinite(rank) && rank > 0 ? rank : Number.MAX_SAFE_INTEGER
}

export const buildTableRankColumn = ({
  key = 'tableRank',
  label = 'מיקום',
  sx = {},
  defaultSortDirection,
} = {}) => ({
  key,
  label,
  sx,
  ...(defaultSortDirection ? { defaultSortDirection } : {}),
  getSortValue: row => toRankSortValue(row?.[key]),
  render: row => <TableRankBadge value={row?.[key]} />,
})
