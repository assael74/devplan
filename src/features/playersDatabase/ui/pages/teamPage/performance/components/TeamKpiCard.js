// src/features/playersDatabase/ui/pages/teamPage/performance/components/TeamKpiCard.js
import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import TeamAnalysisCard from '../../information/components/TeamAnalysisCard.js'
import ScoutPriority from '../../../../../../../ui/patterns/scout/ScoutPriority.js'
import { resolveScoutPriority } from '../../../../../../../ui/patterns/scout/scoutPriority.presentation.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { teamKpiCardSx as sx } from '../sx/teamKpiCard.sx.js'

const semanticIconPriorities = new Set(['elite', 'high', 'positive', 'low'])

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
  iconPriority,
  level,
  primaryDetails = [],
  details = [],
  detailsContent = null,
  insightNotes = [],
  performance = false,
}) {
  const priorityColors = iconPriority && (!performance || semanticIconPriorities.has(iconPriority))
    ? resolveScoutPriority(iconPriority).colors
    : null
  const hasDetails = details.length > 0 || Boolean(detailsContent)

  return (
    <TeamAnalysisCard cardSx={[
      sx.teamKpiCard,
      performance && sx.teamKpiPerformanceCard,
      performance && insightNotes.length > 0 &&
        (hasDetails ? sx.teamKpiWithInsight : sx.teamKpiWithInsightOnly),
    ]}>
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

        {iconId ? (
          <Box sx={[
            sx.teamKpiIcon,
            performance && sx.teamKpiPerformanceIcon,
            priorityColors && sx.teamKpiIconPriority(priorityColors),
          ]}>
            {iconUi({ id: iconId, size: 'md' })}
          </Box>
        ) : null}
      </Box>

      {hasDetails ? (
        <Box sx={[
          sx.teamKpiDetails,
          performance && sx.teamKpiPerformanceDetails,
          detailsContent && sx.teamKpiCustomDetails,
        ]}>
          {detailsContent ? <Box sx={sx.teamKpiDetail}>{detailsContent}</Box>
            : details.map(detail => renderDetail(detail, sx.teamKpiDetail))}
        </Box>
      ) : null}
      {insightNotes.length ? (
        <Box sx={sx.teamKpiInsights}>
          {insightNotes.map(note => (
            <Typography key={note.key} sx={[sx.teamKpiInsight, sx.teamKpiInsightTone(note.tone)]}>
              {note.text}
            </Typography>
          ))}
        </Box>
      ) : null}
    </TeamAnalysisCard>
  )
}
