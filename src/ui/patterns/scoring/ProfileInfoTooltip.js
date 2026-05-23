// src/ui/patterns/scoring/ProfileInfoTooltip.js

import Box from '@mui/joy/Box'
import IconButton from '@mui/joy/IconButton'
import Tooltip from '@mui/joy/Tooltip'
import Typography from '@mui/joy/Typography'

import { iconUi } from '../../core/icons/iconUi.js'

import {
  getPerformanceProfileInfo,
} from './ui/index.js'
import { tooltipSx as sx } from './sx/tooltip.sx.js'

function ProfileShortContent({ info, showConcept }) {
  return (
    <Box sx={sx.shortContent}>
      <Typography level="body-xs" sx={sx.shortTitle}>
        {showConcept ? info.profileTitle : info.label}
      </Typography>

      <Typography level="body-sm" sx={sx.text}>
        {showConcept ? info.profileShortText : info.description}
      </Typography>
    </Box>
  )
}

function ProfileFullContent({ info, showConcept }) {
  return (
    <Box sx={sx.content}>
      <Box sx={sx.head}>
        <Typography level="title-sm" sx={sx.title}>
          {showConcept ? info.profileTitle : info.label}
        </Typography>

        <Typography level="body-xs" sx={sx.subtitle}>
          {showConcept ? info.profileSubtitle : 'אבחנת תפקוד בפועל'}
        </Typography>
      </Box>

      <Typography level="body-sm" sx={sx.text}>
        {showConcept ? info.profileDescription : info.description}
      </Typography>

      {showConcept ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            השאלה שהפרופיל עונה עליה
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.profileQuestion}
          </Typography>
        </Box>
      ) : null}

      {!showConcept && info.coachText ? (
        <Box sx={sx.section}>
          <Typography level="body-xs" sx={sx.title}>
            משמעות למאמן
          </Typography>

          <Typography level="body-sm" sx={sx.text}>
            {info.coachText}
          </Typography>
        </Box>
      ) : null}

      {showConcept ? (
        <Typography level="body-xs" sx={sx.note}>
          {info.profileNote}
        </Typography>
      ) : null}
    </Box>
  )
}

export default function ProfileInfoTooltip({
  profileId,
  children,
  mode = 'short',
  type = 'profile',
  size = 'sm',
  placement = 'top',
  iconSize = 16,
  triggerSx,
}) {
  const info = getPerformanceProfileInfo(profileId)
  const showConcept = type === 'concept'
  const isShort = mode === 'short'

  const title = isShort ? (
    <ProfileShortContent info={info} showConcept={showConcept} />
  ) : (
    <ProfileFullContent info={info} showConcept={showConcept} />
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
