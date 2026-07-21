// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import DataTable from '../../components/tables/DataTable.js'
import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterTable({ columns, model }) {
  return (
    <DataTable
      columns={columns}
      rows={model.leagues}
      getRowKey={row => `${row.id}_${row.seasonKey}`}
      emptyText={model.loading ? 'טוען ליגות...' : model.error || 'לא נמצאו מסמכי ליגות קיימים'}
      wrapSx={sx.tableScroll}
      bodyScrollSx={sx.tableBodyScroll}
    />
  )
}
