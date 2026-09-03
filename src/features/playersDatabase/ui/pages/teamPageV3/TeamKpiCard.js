import * as React from 'react'
import {
  Box,
  Card,
  Tooltip,
  Typography,
} from '@mui/joy'

import ScoutPriority from '../../../../../ui/patterns/scout/ScoutPriority.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamKpiCardSx as sx } from './sx/teamKpiCard.sx.js'

const renderDetail = (detail, detailSx) => {
  const content = (
    <Box key={detail.label} sx={detailSx}>
      <Typography level='body-xs' sx={sx.teamKpiDetailLabel}>{detail.label}</Typography>
      <Typography level='body-sm' sx={sx.teamKpiDetailValue}>{detail.value}</Typography>
    </Box>
  )

  return detail.tooltip ? <Tooltip key={detail.label} title={detail.tooltip} arrow>{content}</Tooltip> : content
}

export default function TeamKpiCard({
  title,
  value,
  valueContent = null,
  iconId,
  level,
  primaryDetails = [],
  details = [],
  performance = false,
}) {
  return (
    <Card sx={[sx.teamKpiCard, performance && sx.teamKpiPerformanceCard]}>
      <Box sx={[sx.teamKpiMain, performance && sx.teamKpiPerformanceMain]}>
        <Box sx={sx.teamKpiText}>
          <Typography level='body-sm' sx={sx.teamKpiTitle}>{title}</Typography>
          <Box sx={sx.teamKpiValueRow}>
            {valueContent || <Typography level='h2' sx={sx.teamKpiValue}>{value}</Typography>}
            {level ? <ScoutPriority value={level} fontSize={12} /> : null}
          </Box>
        </Box>

        {primaryDetails.length ? (
          <Box sx={sx.teamKpiPrimaryDetails}>
            {primaryDetails.map(detail => renderDetail(detail, sx.teamKpiPrimaryDetail))}
          </Box>
        ) : null}

        {iconId ? <Box sx={sx.teamKpiIcon}>{iconUi({ id: iconId, size: 'md' })}</Box> : null}
      </Box>

      <Box sx={[sx.teamKpiDetails, performance && sx.teamKpiPerformanceDetails]}>
        {details.map(detail => renderDetail(detail, sx.teamKpiDetail))}
      </Box>
    </Card>
  )
}
