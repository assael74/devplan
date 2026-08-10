// features/playersDatabase/model/tableRows.model.js

export function sortByTableRank(rows = []) {
  return [...rows].sort(
    (left, right) => (
      Number(left.tableRank || left.rank || 0) -
      Number(right.tableRank || right.rank || 0)
    )
  )
}
