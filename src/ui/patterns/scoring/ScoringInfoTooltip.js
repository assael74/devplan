// src/ui/patterns/scoring/ScoringInfoTooltip.js

import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../core/icons/iconUi.js'

import {
  getScoringMetricInfo,
  SCORING_METRICS_DIFF,
} from './ui/index.js'

import { tooltipSx as sx } from './sx/tooltip.sx.js'

function ScoringShortContent({ info }) {
  return (
    <Box sx={sx.shortContent}>
      <Typography level="body-xs" sx={sx.shortTitle}>
        {info.title}
      </Typography>

      <Typography level="body-sm" sx={sx.text}>
        {info.shortText || info.description}
      </Typography>
    </Box>
  )
}

function ScoringTooltipContent({ info, showDiff }) {
  return (
    <Box sx={sx.content}>
      <Box sx={sx.head}>
        <Typography level="title-sm" sx={sx.title}>
          {info.title}
        </Typography>

        <Typography level="body-xs" sx={sx.subtitle}>
          {info.subtitle}
        </Typography>
      </Box>

      <Typography level="body-sm" sx={sx.text}>
        {info.description}
      </Typography>

      {info.question ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            השאלה שהמדד עונה עליה
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.question}
          </Typography>
        </Box>
      ) : null}

      {info.read?.length ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            איך קוראים את זה?
          </Typography>

          <Box component="ul" sx={sx.list}>
            {info.read.map(item => (
              <Box component="li" key={item} sx={sx.item}>
                <Typography level="body-sm" sx={sx.text}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}

      {info.note ? (
        <Typography level="body-xs" sx={sx.note}>
          {info.note}
        </Typography>
      ) : null}

      {showDiff ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            {SCORING_METRICS_DIFF.title}
          </Typography>

          <Box component="ul" sx={sx.list}>
            {SCORING_METRICS_DIFF.items.map(item => (
              <Box component="li" key={item} sx={sx.item}>
                <Typography level="body-sm" sx={sx.text}>
                  {item}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  )
}

export default function ScoringInfoTooltip({
  metric,
  children,
  mode = 'full',
  size = 'sm',
  placement = 'top',
  showDiff = false,
  iconSize = 16,
  triggerSx,
}) {
  const info = getScoringMetricInfo(metric)

  if (!info) return children || null

  const isShort = mode === 'short'

  const title = isShort ? (
    <ScoringShortContent info={info} />
  ) : (
    <ScoringTooltipContent info={info} showDiff={showDiff} />
  )

  if (children) {
    return (
      <Tooltip arrow variant="outlined" placement={placement} title={title}>
        <Box component="span" sx={{ ...sx.childTrigger, ...triggerSx }}>
          {children}
        </Box>
      </Tooltip>
    )
  }

  return (
    <Tooltip arrow variant="outlined" placement={placement} title={title}>
      <IconButton size={size} variant="plain" sx={sx.trigger}>
        {iconUi({ id: 'info', size: iconSize })}
      </IconButton>
    </Tooltip>
  )
}
