// features/playersDatabase/ui/pages/teamPage/TeamKpiCard.js

import * as React from 'react'
import {
  Box,
  Card,
  Tooltip,
  Typography,
} from '@mui/joy'

import ScoutPriority from '../../components/scout/ScoutPriority.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamPageSx as sx } from './sx/teamPage.sx.js'

export default function TeamKpiCard({
  title,
  value,
  iconId,
  priorityLevel,
  details = [],
}) {
  return (
    <Card sx={sx.teamKpiCard}>
      <Box sx={sx.teamKpiMain}>
        <Box sx={sx.teamKpiText}>
          <Typography level='body-sm' sx={sx.teamKpiTitle}>
            {title}
          </Typography>

          <Box sx={sx.teamKpiValueRow}>
            <Typography level='h2' sx={sx.teamKpiValue}>
              {value}
            </Typography>

            {priorityLevel ? (
              <ScoutPriority value={priorityLevel} fontSize={12} />
            ) : null}
          </Box>
        </Box>

        {iconId ? (
          <Box sx={sx.teamKpiIcon}>
            {iconUi({ id: iconId, size: 'md' })}
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.teamKpiDetails}>
        {details.map(detail => {
          const content = (
            <Box key={detail.label} sx={sx.teamKpiDetail}>
              <Typography level='body-xs' sx={sx.teamKpiDetailLabel}>
                {detail.label}
              </Typography>

              <Typography level='body-sm' sx={sx.teamKpiDetailValue}>
                {detail.value}
              </Typography>
            </Box>
          )

          if (!detail.tooltip) return content

          return (
            <Tooltip key={detail.label} title={detail.tooltip} arrow>
              {content}
            </Tooltip>
          )
        })}
      </Box>
    </Card>
  )
}
