// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterTable.js

import { Stack, Typography } from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import DataTable from '../../components/tables/DataTable.js'
import LeagueCenterTableFilters from './LeagueCenterTableFilters.js'
import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterTable({ columns, model }) {
  const hasContext = model.birthYear !== 'all' && model.leagueLevel !== 'all'
  const emptyText = model.loading
    ? 'טוען ליגות...'
    : model.error || (hasContext
      ? 'לא נמצאו ליגות בהקשר שנבחר'
      : 'בחר שנתון ורמת ליגה כדי להתחיל')

  return (
    <InfoPanel
      title='הליגות הרלוונטיות'
      actions={(
        <Typography level='body-xs' sx={sx.tableCount}>
          {model.leagues.length} ליגות
        </Typography>
      )}
      sx={sx.tablePanel}
    >
      <LeagueCenterTableFilters model={model} />
      <Stack sx={sx.tableArea}>
        <DataTable
          columns={columns}
          rows={model.leagues}
          getRowKey={row => `${row.id}_${row.seasonKey}`}
          emptyText={emptyText}
          wrapSx={sx.tableScroll}
          bodyScrollSx={sx.tableBodyScroll}
        />
      </Stack>
    </InfoPanel>
  )
}
