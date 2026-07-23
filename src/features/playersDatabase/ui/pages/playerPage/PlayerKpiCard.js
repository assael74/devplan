// features/playersDatabase/ui/pages/playerPage/PlayerKpiCard.js

import {
  Box,
  Card,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerPageSx as sx } from './sx/playerPage.sx.js'

export default function PlayerKpiCard({
  title,
  value,
  iconId,
  details = [],
  placeholder = false,
}) {
  return (
    <Card sx={sx.playerKpiCard}>
      <Box sx={sx.playerKpiMain}>
        <Box sx={sx.playerKpiText}>
          <Typography
            level='body-sm'
            sx={sx.playerKpiTitle}
          >
            {title}
          </Typography>

          <Typography
            level='h2'
            sx={[
              sx.playerKpiValue,
              placeholder && sx.placeholderValue,
            ]}
          >
            {value}
          </Typography>
        </Box>

        {iconId ? (
          <Box sx={sx.playerKpiIcon}>
            {iconUi({
              id: iconId,
              size: 'md',
            })}
          </Box>
        ) : null}
      </Box>

      <Box sx={sx.playerKpiDetails}>
        {details.map(detail => (
          <Box
            key={detail.label}
            sx={sx.playerKpiDetail}
          >
            <Typography
              level='body-xs'
              sx={sx.playerKpiDetailLabel}
            >
              {detail.label}
            </Typography>

            <Typography
              level='body-sm'
              sx={sx.playerKpiDetailValue}
            >
              {detail.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Card>
  )
}
