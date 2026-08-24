// src/features/playersDatabase/ui/components/scout/ScoutProfileChip.js

import * as React from 'react'
import {
  Box,
  Tooltip,
  Typography,
} from '@mui/joy'

import { SCOUT_PROFILES } from '../../../../../shared/scouting/players/profiles.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { scoutProfileChipSx as sx } from './sx/scoutProfileChip.sx.js'
import {
  scoutProfileChipColors,
  scoutProfileChipVariants,
} from './sx/scoutColors.sx.js'

export { scoutProfileChipColors }

function resolveProfile(profileId, label) {
  const definition = SCOUT_PROFILES.find(item => item.id === profileId) || null

  return {
    label: label || definition?.label || 'פרופיל סקאוט',
    iconId: definition?.idIcon || 'performanceProfile',
  }
}

function clampDepth(depthPct) {
  const value = Number(depthPct)

  if (!Number.isFinite(value)) return null

  return Math.min(100, Math.max(0, value))
}

function resolveTooltipTitle(tooltipLabel, profileLabel, depthPct) {
  return (
    <Box sx={sx.tooltipContent}>
      {React.isValidElement(tooltipLabel) ? (
        tooltipLabel
      ) : (
        <>
          <Typography level='title-sm' sx={sx.tooltipTitle}>
            {profileLabel}
          </Typography>

          {tooltipLabel && tooltipLabel !== profileLabel ? (
            <Typography level='body-xs' sx={sx.tooltipText}>
              {tooltipLabel}
            </Typography>
          ) : null}
        </>
      )}

      {depthPct !== null ? (
        <Typography level='body-xs' sx={sx.tooltipDepth}>
          עומק התאמה: {Math.round(depthPct)}%
        </Typography>
      ) : null}
    </Box>
  )
}

function ProfileChipContent({
  colors,
  fontSize,
  iconId,
  label,
  textColor,
}) {
  return (
    <Box sx={sx.content}>
      {iconUi({
        id: iconId,
        size: 'sm',
        sx: sx.icon({ colors, fontSize, textColor }),
      })}

      <Typography
        component='span'
        sx={sx.label({ colors, fontSize, textColor })}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default function ScoutProfileChip({
  profileId = '',
  label = '',
  tooltip,
  iconId = '',
  fontSize = 13,
  variant = 'default',
  selected = false,
  depthPct,
  onClick,
}) {
  const profile = resolveProfile(profileId, label)
  const colors = scoutProfileChipVariants[variant] || scoutProfileChipVariants.default
  const interactive = typeof onClick === 'function'
  const resolvedDepth = variant === 'nearProfile'
    ? null
    : clampDepth(depthPct)
  const hasDepth = resolvedDepth !== null
  const tooltipLabel = tooltip || profile.label
  const tooltipTitle = resolveTooltipTitle(
    tooltipLabel,
    profile.label,
    resolvedDepth,
  )
  const resolvedIconId = iconId || profile.iconId

  return (
    <Tooltip title={tooltipTitle} arrow>
      <Box
        component={interactive ? 'button' : 'span'}
        type={interactive ? 'button' : undefined}
        aria-pressed={interactive ? selected : undefined}
        sx={sx.root({
          colors,
          fontSize,
          interactive,
          selected,
          hasDepth,
        })}
        onClick={onClick}
      >
        {hasDepth ? (
          <>
            <Box
              aria-hidden='true'
              sx={sx.depthFill({ colors, depthPct: resolvedDepth })}
            />

            <Box sx={sx.depthBaseContent}>
              <ProfileChipContent
                colors={colors}
                fontSize={fontSize}
                iconId={resolvedIconId}
                label={profile.label}
                textColor={colors.depthTrackText}
              />
            </Box>

            <Box
              aria-hidden='true'
              sx={sx.depthFilledContent({ depthPct: resolvedDepth })}
            >
              <ProfileChipContent
                colors={colors}
                fontSize={fontSize}
                iconId={resolvedIconId}
                label={profile.label}
                textColor={colors.depthFillText}
              />
            </Box>
          </>
        ) : (
          <ProfileChipContent
            colors={colors}
            fontSize={fontSize}
            iconId={resolvedIconId}
            label={profile.label}
            textColor={selected ? colors.selectedText : colors.text}
          />
        )}
      </Box>
    </Tooltip>
  )
}
