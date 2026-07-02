// src/dev/reports/components/ReportsDevPreview.js

import Box from '@mui/joy/Box'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

import { getReportCatalogItem } from '../reportsDev.catalog.js'
import { getReportsDevReportDefinition } from '../reportsDev.registry.js'
import { previewSx as sx } from '../sx/index.js'

function getEmptyState(report) {
  if (!report?.exists) {
    return {
      title: 'הדוח עדיין לא נבנה',
      description: 'הדוח מופיע בקטלוג לצורך תכנון ומעקב, אך אין עדיין רכיב דוח פעיל.',
    }
  }

  if (report.needsUpgrade) {
    return {
      title: 'הדוח קיים ודורש שדרוג',
      description: 'יש להשלים את השדרוג ולחבר את רכיב הדוח לכלי הבדיקות.',
    }
  }

  return {
    title: 'הדוח עדיין לא מחובר',
    description: 'רכיב הדוח קיים במערכת אך טרם נוסף לכלי הבדיקות.',
  }
}

export default function ReportsDevPreview({
  reportId,
  fixture,
}) {
  const catalogItem = getReportCatalogItem(reportId)
  const definition = getReportsDevReportDefinition(reportId)
  const emptyState = getEmptyState(catalogItem)

  return (
    <Box
      component='main'
      className='dpScrollThin'
      sx={sx.previewArea}
    >
      <Box sx={sx.previewFrame}>
        {definition && fixture ? (
          <Box sx={sx.reportContainer}>
            {definition.render(fixture)}
          </Box>
        ) : (
          <Sheet variant='outlined' sx={sx.emptyPreview}>
            <Typography level='h4'>
              {emptyState.title}
            </Typography>

            <Typography level='body-sm' textColor='text.secondary'>
              {emptyState.description}
            </Typography>

            <Typography level='body-xs' textColor='text.tertiary'>
              דוח: {catalogItem?.label || reportId}
            </Typography>
          </Sheet>
        )}
      </Box>
    </Box>
  )
}
