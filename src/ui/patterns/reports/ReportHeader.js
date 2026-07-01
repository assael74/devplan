import { Avatar, Box, Typography } from '@mui/joy'
import { getReportEntityColors } from './reportColors'
import { shellSx } from './report.sx'

const getInitials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(part => part[0]).join('')
}

export default function ReportHeader({ title, reportDate, entity }) {
  const systemColors = entity.systemColors
  const sx = shellSx({ systemColors })
  const entityColors = getReportEntityColors(entity.type)

  return (
    <Box component='header' sx={sx.header}>
      <Box sx={sx.mainRow}>
        <Typography component='h1' sx={sx.title}>{title}</Typography>
        <Box sx={sx.date}>
          <Typography component='span' sx={sx.dateLabel}>תאריך הדוח</Typography>
          <Typography component='span' sx={sx.dateValue}>{reportDate}</Typography>
        </Box>
      </Box>

      <Box sx={sx.entity}>
        <Avatar src={entity.avatarUrl || undefined} alt={entity.name} />

        <Typography component='p' sx={sx.entityName({ entityColors })}>{entity.name}</Typography>
      </Box>
    </Box>
  )
}
