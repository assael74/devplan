// src/features/reports/dashboard/components/ViewUrl.js

import Box from '@mui/joy/Box'
import Button from '@mui/joy/Button'
import Typography from '@mui/joy/Typography'

import { PUBLIC_REPORT_STATUS } from '../../reports.constants.js'
import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { urlSx as sx } from './sx/url.sx.js'

function clean(value) {
  return String(value ?? '').trim()
}

function resolvePublicationUrl(publication) {
  return clean(
    publication?.versionUrl ||
    publication?.url ||
    ''
  )
}

export default function ViewUrl({ publication }) {
  const reportUrl = resolvePublicationUrl(publication)
  const hasPublication = Boolean(publication?.id)
  const isPublished = publication?.status === PUBLIC_REPORT_STATUS.PUBLISHED
  const hasUrl = hasPublication && isPublished && Boolean(reportUrl)

  return (
    <Box sx={sx.urlRoot}>
      <Box sx={sx.urlMain}>
        <Box sx={sx.urlIcon}>
          {iconUi({ id: 'link', size: 'sm' })}
        </Box>

        <Box sx={sx.urlTextBlock}>
          <Typography level='body-xs' sx={sx.urlLabel}>
            כתובת הפרסום המקורי
          </Typography>

          <Typography level='body-sm' sx={sx.urlValue}>
            {hasUrl
              ? reportUrl
              : hasPublication && !isPublished
                ? 'הפרסום נעצר ולכן הקישור אינו פעיל'
                : 'בחר פרסום כדי לראות כתובת'}
          </Typography>
        </Box>
      </Box>

      <Button
        size='sm'
        variant='solid'
        disabled={!hasUrl}
        startDecorator={iconUi({ id: 'view', size: 'sm' })}
        onClick={() => {
          if (!hasUrl) return

          window.open(reportUrl, '_blank', 'noopener,noreferrer')
        }}
        sx={sx.urlButton}
      >
        פתח דוח
      </Button>
    </Box>
  )
}
