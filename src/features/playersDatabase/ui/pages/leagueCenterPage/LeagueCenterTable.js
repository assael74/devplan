// src/features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import * as React from 'react'
import { Button, Stack, Typography } from '@mui/joy'
import { leagueWorkModeSx as modeSx } from '../../components/leagueWork/leagueWorkMode.sx.js'
import { LEAGUE_STRONG_SIGNAL_MINIMUM_OPTIONS } from '../../logic/leagueWorkNavigation.js'
import PageContentPanel from '../../components/page/PageContentPanel.js'
import DataTable from '../../components/tables/dataTable/index.js'
import { buildLeagueCenterExportConfig } from './logic/leagueCenter.export.js'
import { buildLeagueCenterTableGroups, sortLeagueCenterTableRows } from './logic/leagueCenterTableGroups.js'
import { leagueCenterTableSx as sx } from './sx/leagueCenterTable.sx.js'

export default function LeagueCenterTable({
  columns,
  model,
  strongSignalMinimum = 1,
  onStrongSignalMinimumChange,
}) {
  const hasContext = model.birthYears.length > 0 && model.leagueLevel !== 'all'
  const emptyText = model.loading
    ? 'טוען ליגות...'
    : model.error || (hasContext
      ? 'לא נמצאו ליגות בהקשר שנבחר'
      : 'בחר שנתון ורמת ליגה כדי להתחיל')
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
  const exportConfig = buildLeagueCenterExportConfig({ rows: model.allRows })

  return (
    <PageContentPanel
      title='הליגות הרלוונטיות'
      headerActions={(
        <Stack direction='row' sx={sx.workControls}>
          <Stack direction='row' sx={modeSx.workMode}>
            <Typography sx={modeSx.workModeLabel}>מינימום משפחות עם איתות חזק לקבוצה</Typography>
            <Stack direction='row' role='group' aria-label='סף מינימום משפחות איתות חזקות' sx={modeSx.workModeButtons}>
              {LEAGUE_STRONG_SIGNAL_MINIMUM_OPTIONS.map(({ value, label }) => (
                <Button
                  key={value}
                  size='sm'
                  variant={strongSignalMinimum === value ? 'solid' : 'plain'}
                  aria-pressed={strongSignalMinimum === value}
                  onClick={() => onStrongSignalMinimumChange?.(value)}
                  sx={[modeSx.workModeButton(strongSignalMinimum === value), sx.minimumButton]}
                >
                  {label}
                </Button>
              ))}
            </Stack>
          </Stack>
        </Stack>
      )}
      panelSx={sx.tablePanel}
    >
      <DataTable
        hoverRow={false}
        columns={columns}
        rows={groupedRows}
        defaultSort={{ key: 'leagueName', direction: 'asc' }}
        sortRows={sortLeagueCenterTableRows}
        getRowKey={row => `${row.id}_${row.seasonId || row.seasonKey || 'bootstrap'}`}
        emptyText={emptyText}
        wrapSx={sx.tableScroll}
        bodyScrollSx={sx.tableBodyScroll}
        exportConfig={exportConfig}
      />
    </PageContentPanel>
  )
}
