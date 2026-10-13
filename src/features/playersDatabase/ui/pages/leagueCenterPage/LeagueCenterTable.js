// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import * as React from 'react'
import { Button } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { buildLeagueCenterExportConfig } from './logic/leagueCenter.export.js'
import { downloadLeagueCenterDocumentsJson } from './logic/leagueCenterJson.logic.js'
import { buildLeagueCenterTableGroups, sortLeagueCenterTableRows } from './logic/leagueCenterTableGroups.js'
import { leagueCenterTableSx as sx } from './sx/leagueCenterTable.sx.js'

export default function LeagueCenterTable({
  columns,
  model,
  onOpenLeague,
}) {
  const hasContext = model.birthYears.length > 0 && model.leagueLevel !== 'all'
  const emptyText = model.loading
    ? 'טוען ליגות...'
    : model.error || (hasContext
      ? 'לא נמצאו ליגות בהקשר שנבחר'
      : 'בחר שנתון ורמת ליגה כדי להתחיל')
  const hasJsonDocument = Boolean(model.leaguesCenterDoc?.documentExists)
  const groupedRows = React.useMemo(() => (
    buildLeagueCenterTableGroups(model.leagues).map(row => (
      row.fullWidthMessage
        ? {
          ...row,
          fullWidthCellSx: sx.groupHeaderCell,
          fullWidthMessageSx: sx.groupHeaderMessage,
        }
        : row
    ))
  ), [model.leagues])
  const exportConfig = {
    ...buildLeagueCenterExportConfig({ rows: model.allRows }),
    headerActions: [{
      id: 'json',
      buttonLabel: 'JSON',
      tooltip: 'הורדת מסמך מרכז הליגות שנטען לעמוד',
      ariaLabel: 'הורדת מסמך מרכז הליגות שנטען לעמוד כ־JSON',
      iconId: 'download',
      showLabel: false,
      enabled: hasJsonDocument,
      onClick: () => downloadLeagueCenterDocumentsJson({
        leaguesCenterDocument: model.leaguesCenterDoc,
      }),
    }],
  }

  return (
    <PageContentPanel
      title='הליגות הרלוונטיות'
      meta={`${model.leagues.length} ליגות`}
      headerTone='soft'
      headerActions={(
        <Button
          type='button'
          size='sm'
          variant='outlined'
          disabled={!model.openLeagueOptions.length}
          startDecorator={iconUi({id: 'addSeason', size: 'sm'})}
          onClick={onOpenLeague}
          sx={sx.openLeagueButton}
        >
          פתיחת ליגה חדשה
        </Button>
      )}
      panelSx={sx.tablePanel}
    >
      <DataTable
        columns={columns}
        rows={groupedRows}
        defaultSort={{ key: 'leagueName', direction: 'asc' }}
        sortRows={sortLeagueCenterTableRows}
        getRowKey={row => `${row.id}_${row.seasonId || row.seasonKey || 'bootstrap'}`}
        emptyText={emptyText}
        wrapSx={sx.tableScroll}
        tableSx={sx.noRowHoverTable}
        bodyScrollSx={sx.tableBodyScroll}
        exportConfig={exportConfig}
      />
    </PageContentPanel>
  )
}
