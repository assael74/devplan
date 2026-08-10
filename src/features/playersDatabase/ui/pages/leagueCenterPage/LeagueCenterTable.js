// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { leagueCenterTableSx as sx } from './sx/leagueCenterTable.sx.js'

export default function LeagueCenterTable({ columns, model }) {
  const hasContext = model.birthYear !== 'all' && model.leagueLevel !== 'all'
  const emptyText = model.loading
    ? 'טוען ליגות...'
    : model.error || (hasContext
      ? 'לא נמצאו ליגות בהקשר שנבחר'
      : 'בחר שנתון ורמת ליגה כדי להתחיל')

  return (
    <PageContentPanel
      title='הליגות הרלוונטיות'
      meta={`${model.leagues.length} ליגות`}
      headerTone='soft'
      panelSx={sx.tablePanel}
    >
      <DataTable
        columns={columns}
        rows={model.leagues}
        getRowKey={row => `${row.id}_${row.seasonKey}`}
        emptyText={emptyText}
        wrapSx={sx.tableScroll}
        tableSx={sx.noRowHoverTable}
        bodyScrollSx={sx.tableBodyScroll}
      />
    </PageContentPanel>
  )
}
