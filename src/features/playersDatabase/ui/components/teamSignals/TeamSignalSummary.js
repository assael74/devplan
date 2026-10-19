// src/features/playersDatabase/ui/components/teamSignals/TeamSignalSummary.js

import { Box, Chip, Typography } from '@mui/joy'
import { Link } from 'react-router-dom'
import { TEAM_SIGNAL_FAMILIES, readTeamSignalSummary } from '../../../domain/signals/teamSignalSummary.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { teamSignalsSx as sx } from './teamSignals.sx.js'

export default function TeamSignalSummary({ summary, getFamilyHref, compact = false }) {
  const normalized = readTeamSignalSummary(summary)
  const families = TEAM_SIGNAL_FAMILIES.map(family => ({ ...family, ...normalized.familiesById[family.id] }))
  const active = families.filter(family => family.level > 0)
  const complete = families.every(family => family.availability === 'available')

  if (!active.length) return (
    <Typography component='span' level='body-xs' color='neutral'>
      {complete ? 'ללא איתותים' : normalized.computedAt ? 'אין איתות מוכח · מידע חלקי' : 'איתותים טרם חושבו'}
    </Typography>
  )
  return (
    <Box component='span' sx={sx.summary} aria-label='משפחות איתותים'>
      {active.map(family => {
        const href = getFamilyHref?.(family.id)
        const label = `${family.label} · ${family.level}`
        return (
          <Chip
            key={family.id}
            component={href ? Link : 'span'}
            {...(href ? { to: href, onClick: event => event.stopPropagation() } : {})}
            size='sm'
            variant='soft'
            color={family.level === 2 ? 'warning' : 'primary'}
            startDecorator={compact ? null : iconUi({ id: family.iconId, size: 'sm' })}
            title={`${label} · ${family.level === 2 ? 'לחקירה' : 'למעקב'}${family.availability === 'partial' ? ' · מידע חלקי' : ''}`}
            aria-label={`${label}${family.availability === 'partial' ? ' · מידע חלקי' : ''}`}
            sx={sx.chip}
          >
            {label}
          </Chip>
        )
      })}
      {!complete ? <Typography component='span' level='body-xs' color='neutral'>כיסוי חלקי</Typography> : null}
    </Box>
  )
}
