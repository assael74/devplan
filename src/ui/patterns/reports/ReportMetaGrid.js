import { Box, Typography } from '@mui/joy'
import { shellSx } from './report.sx'

export default function ReportMetaGrid({ items = [], columns = 3, systemColors }) {
  if (!items.length) return null
  const sx = shellSx({ systemColors })

  return (
    <Box sx={sx.metaWrap}>
      <Box sx={sx.metaGrid({ columns })}>
        {items.map(item => (
          <Box key={item.id || item.label} sx={sx.metaItem}>
            <Typography component='span' sx={sx.metaLabel}>{item.label}</Typography>
            <Typography component='span' sx={sx.metaValue}>{item.value || '—'}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
