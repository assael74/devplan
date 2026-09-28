// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { buildLeagueCenterExportConfig } from './logic/leagueCenter.export.js'
import { downloadLeagueCenterDocumentsJson } from './logic/leagueCenterJson.logic.js'
import { leagueCenterTableSx as sx } from './sx/leagueCenterTable.sx.js'

export default function LeagueCenterTable({ columns, model }) {
  const hasContext = model.birthYear !== 'all' && model.leagueLevel !== 'all'
  const emptyText = model.loading
    ? 'טוען ליגות...'
    : model.error || (hasContext
      ? 'לא נמצאו ליגות בהקשר שנבחר'
      : 'בחר שנתון ורמת ליגה כדי להתחיל')
  const hasJsonDocuments = Boolean(
    model.leaguesMasterDoc || model.leagueDocuments.length
  )
  const exportConfig = {
    ...buildLeagueCenterExportConfig({ rows: model.allRows }),
    headerActions: [{
      id: 'json',
      buttonLabel: 'JSON',
      tooltip: 'הורדת מסמכי הליגות שנטענו לעמוד',
      ariaLabel: 'הורדת מסמכי הליגות שנטענו לעמוד כ־JSON',
      iconId: 'download',
      showLabel: false,
      enabled: hasJsonDocuments,
      onClick: () => downloadLeagueCenterDocumentsJson({
        leaguesMasterDocument: model.leaguesMasterDoc,
        leagueDocuments: model.leagueDocuments,
      }),
    }],
  }

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
        exportConfig={exportConfig}
      />
    </PageContentPanel>
  )
}
