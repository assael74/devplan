// features/reports/renderers/external/ReportContent.js

import { Sheet, Typography } from '@mui/joy'

import { REPORT_TYPES } from '../../reports.constants.js'
import { LeagueTableContent } from './league/index.js'

function ReportPlaceholder({ model = {} }) {
  const content = model.content || {}

  return (
    <Sheet
      variant='outlined'
      sx={{
        p: { xs: 1.5, md: 2.5 },
        borderRadius: 14,
        borderColor: 'var(--report-type-border)',
        bgcolor: 'var(--report-type-soft)',
      }}
    >
      <Typography level='title-md' sx={{ fontWeight: 700 }}>
        {content.title || 'תוכן הדוח ייבנה בשלב הבא'}
      </Typography>

      <Typography level='body-sm' sx={{ mt: 0.75 }}>
        {content.description || 'המעטפת, המטא־דאטה והפרסום מחוברים. כעת ניתן לפתח את תוכן הדוח לפי סוג הישות.'}
      </Typography>
    </Sheet>
  )
}

export default function ReportContent({ model = {} }) {
  if (model.reportType === REPORT_TYPES.EXTERNAL_LEAGUE_TABLE) {
    return <LeagueTableContent model={model} />
  }

  return <ReportPlaceholder model={model} />
}
