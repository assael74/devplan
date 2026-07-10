// ui/patterns/reports/ReportHeader.js

import { Avatar, Box, Option, Select, Typography } from '@mui/joy'
import { getReportEntityColors } from './sx/reportColors'

const getInitials = name => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map(part => part[0]).join('')
}

export default function ReportHeader({
  title,
  reportDate,
  reportOptions = [],
  selectedReportValue = null,
  onReportChange = null,
  presentation = 'pdf',
  entity,
  sx,
}) {
  const entityColors = getReportEntityColors(entity.type)
  const canSwitchReports = (
    presentation !== 'pdf' &&
    Array.isArray(reportOptions) &&
    reportOptions.length > 1 &&
    typeof onReportChange === 'function'
  )

  const selectedValue = (
    selectedReportValue ||
    reportOptions[0]?.value ||
    reportOptions[0]?.id ||
    ''
  )

  const selectedOption = reportOptions.find(option => (
    (option.value || option.id || '') === selectedValue
  )) || reportOptions[0] || null

  const renderDateValue = option => {
    if (!option) return reportDate

    return (
      <Box sx={sx.dateValueWrap}>
        <Typography component='span' sx={sx.dateValueText}>
          {option.label || option.reportDate || option.date || reportDate}
        </Typography>

        {Number(option.versionNumber) > 1 ? (
          <Box component='span' sx={sx.dateVersionTag}>
            {option.versionNumber}
          </Box>
        ) : null}
      </Box>
    )
  }

  return (
    <Box component='header' sx={sx.header}>
      <Box sx={sx.mainRow}>
        <Typography component='h1' sx={sx.title}>{title}</Typography>
        <Box sx={sx.date}>
          <Typography component='span' sx={sx.dateLabel}>תאריך הדוח</Typography>
          {canSwitchReports ? (
            <Select
              size='sm'
              variant='plain'
              value={selectedValue}
              onChange={(event, value) => {
                if (value) onReportChange(value)
              }}
              indicator={null}
              renderValue={() => renderDateValue(selectedOption)}
              slotProps={{
                button: { sx: sx.dateSelectButton },
                popper: { sx: sx.dateSelectPopper },
                listbox: { sx: sx.dateSelectListbox },
              }}
              sx={sx.dateSelect}
            >
              {reportOptions.map(option => (
                <Option
                  key={option.value || option.id || option.label}
                  value={option.value || option.id}
                >
                  <Box sx={sx.dateOption}>
                    <Typography component='span' sx={sx.dateOptionDate}>
                      {option.reportDate || option.date || option.label || option.value || option.id}
                    </Typography>

                    {Number(option.versionNumber) > 1 ? (
                      <Box component='span' sx={sx.dateOptionVersion}>
                        {option.versionNumber}
                      </Box>
                    ) : null}
                  </Box>
                </Option>
              ))}
            </Select>
          ) : (
            <Typography component='span' sx={sx.dateValue}>{reportDate}</Typography>
          )}
        </Box>
      </Box>

      <Box sx={sx.entity}>
        <Avatar src={entity.avatarUrl || undefined} alt={entity.name}>
          {getInitials(entity.name)}
        </Avatar>

        <Typography component='p' sx={sx.entityName({ entityColors })}>{entity.name}</Typography>
      </Box>
    </Box>
  )
}
