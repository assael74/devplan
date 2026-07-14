// src/features/reports/dashboard/components/ViewKpiRow.js

import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { kpiSx as sx } from './sx/kpi.sx.js'

function buildCards(report = {}, publication = {}, reports = []) {
  const reportsWithPublicationsCount = Array.isArray(reports)
    ? reports.filter(item => Array.isArray(item?.publications) && item.publications.length > 0).length
    : 0

  return [
    {
      id: 'status',
      label: 'סטטוס',
      value: publication ? 'פורסם' : 'לא נבחר',
      note: publication ? 'פרסום זמין לצפייה' : 'בחר פרסום לצפייה',
      iconId: 'check',
    },
    {
      id: 'versions',
      label: 'פרסומים',
      value: report?.publications?.length ?? '—',
      note: 'מספר הפרסומים לדוח',
      iconId: 'report',
    },
    {
      id: 'reports-with-publications',
      label: 'דוחות עם פרסומים',
      value: reportsWithPublicationsCount,
      note: 'מספר הדוחות עם מספר פרסומים',
      iconId: 'history',
    },
    {
      id: 'view',
      label: 'תצוגה',
      value: 'שלד',
      note: 'ללא טעינת תוכן הפרסום',
      iconId: 'view',
    },
  ]
}

export default function ViewKpiRow({ report, publication, reports }) {
  const cards = buildCards(report, publication, reports)

  return (
    <Box sx={sx.root}>
      {cards.map((card, index) => (
        <Box key={card.id} sx={sx.card(index)}>
          <Box sx={sx.cardHeader}>
            <Typography level='body-sm' sx={sx.cardLabel}>
              {card.label}
            </Typography>

            <Box sx={sx.cardIcon}>
              {iconUi({ id: card.iconId, size: 'sm' })}
            </Box>
          </Box>

          <Typography level='h3' sx={sx.cardValue}>
            {card.value}
          </Typography>

          <Typography level='body-xs' sx={sx.cardNote}>
            {card.note}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}
