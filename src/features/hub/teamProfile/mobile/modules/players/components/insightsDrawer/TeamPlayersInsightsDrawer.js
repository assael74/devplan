// teamProfile/mobile/modules/players/components/insightsDrawer/TeamPlayersInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildTeamPlayersInsights } from '../../../../../sharedLogic/players'

const c = getEntityColors('teams')

export default function TeamPlayersInsightsDrawer({
  open,
  onClose,
  rows,
  summary,
  entity,
}) {
  const insights = useMemo(
    () => buildTeamPlayersInsights({ rows, summary }),
    [rows, summary]
  )

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity: entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size='lg'
      header={
        <InsightsDrawerHeader
          title={entity?.teamName || ''}
          subtitle="תובנות"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      בהמשך
    </InsightsDrawerShell>
  )
}
