// teamProfile/mobile/modules/players/components/playerCard/TeamPlayerCardSummary.js

import React from 'react'
import { Box, Chip } from '@mui/joy'

import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { cardSx as sx } from '../../sx/card.mobile.sx.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { getSquadRoleMeta } from '../../../../../../../../shared/players/player.squadRole.utils.js'

import {
  ScoringInfo,
} from '../../../../../../../../ui/patterns/scoring/index.js'

import {
  getPlayerInsightProfile,
} from '../../../../../../../../shared/players/insights/insights.profiles.js'

const c = getEntityColors('players')

const getPerformance = row => row?.performance || {}

const getProfile = row => {
  const performance = getPerformance(row)

  if (performance?.profile?.id) return performance.profile

  return getPlayerInsightProfile(
    performance?.profileId ||
      performance?.insightId ||
      'secondary_contributor'
  )
}

const getRatingLabel = row => {
  const performance = getPerformance(row)

  return performance?.ratingLabel || '-'
}

const getTvaLabel = row => {
  const performance = getPerformance(row)

  return performance?.tvaLabel || '0.00'
}

const getImpactColor = value => {
  const n = Number(String(value).replace('+', ''))

  if (n > 0) return 'success'
  if (n < 0) return 'warning'

  return 'neutral'
}

function ProfileChip({ profile }) {
  return (
    <ScoringInfo
      type="profile"
      profileId={profile.id}
      mode="short"
      triggerSx={{ minWidth: 0 }}
    >
      <Chip
        size="sm"
        variant="soft"
        color={profile.tone || 'neutral'}
        startDecorator={iconUi({ id: profile.icon || 'insights' })}
        sx={sx.chip}
      >
        {profile.shortLabel || profile.label}
      </Chip>
    </ScoringInfo>
  )
}

function ScoreChip({ value }) {
  return (
    <ScoringInfo type="metric" metric="efficiency" mode="short">
      <Chip size="sm" variant="soft" color="neutral" sx={sx.chip}>
        {value}
      </Chip>
    </ScoringInfo>
  )
}

function ImpactChip({ value }) {
  return (
    <ScoringInfo type="metric" metric="impact" mode="short">
      <Chip
        size="sm"
        variant="soft"
        color={getImpactColor(value)}
        sx={sx.chip}
      >
        {value}
      </Chip>
    </ScoringInfo>
  )
}

export default function TeamPlayerCardSummary({ row }) {
  const squadRoleMeta = getSquadRoleMeta(row, c)
  const profile = getProfile(row)
  const ratingLabel = getRatingLabel(row)
  const tvaLabel = getTvaLabel(row)

  return (
    <Box sx={sx.playerStatsWrap}>
      {squadRoleMeta?.value ? (
        <Chip
          size="sm"
          variant="soft"
          startDecorator={iconUi({
            id: squadRoleMeta.iconId,
            sx: { color: squadRoleMeta.color },
          })}
          sx={sx.chip}
        >
          {squadRoleMeta.label}
        </Chip>
      ) : (
        <Chip size="sm" variant="soft" color="danger" sx={sx.chip}>
          לא הוגדר מעמד
        </Chip>
      )}

      <ProfileChip profile={profile} />
      <ScoreChip value={ratingLabel} />
      <ImpactChip value={tvaLabel} />
    </Box>
  )
}
