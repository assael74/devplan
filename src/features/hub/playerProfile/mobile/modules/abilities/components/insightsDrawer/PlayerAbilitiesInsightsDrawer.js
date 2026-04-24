// playerProfile/mobile/modules/abilities/components/insightsDrawer/PlayerAbilitiesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights/index.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

import { resolvePlayerFullName } from '../../../../../../../../shared/abilities/abilities.resolvers.js'
import { buildPlayerAbilitiesInsightsDrawerModel } from './../../../../../sharedLogic'

export default function PlayerAbilitiesInsightsDrawer({
  open,
  onClose,
  entity,
}) {
  const model = useMemo(() => {
    return buildPlayerAbilitiesInsightsDrawerModel(entity || {})
  }, [entity])

  const playerName = resolvePlayerFullName(entity) || entity?.playerFullName || entity?.name || 'שחקן'

  const header = (
    <InsightsDrawerHeader
      title={playerName}
      subtitle={model?.isEligible ? 'תובנות יכולות · מוכן לתובנות' : 'תובנות יכולות · מידע חלקי'}
      avatarSrc={entity?.photo || playerImage}
    />
  )

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={header}
    >
      <InsightsSection title="תקציר על" icon="insights">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {(model?.topStats || []).map((item) => (
            <InsightsStatCard
              key={item.id}
              title={item.title}
              value={item.value}
              sub={item.sub}
              icon={item.icon}
            />
          ))}
        </Box>
      </InsightsSection>

      <InsightsSection title="מוכנות נתונים" icon="check">
        <InsightsChipsList
          items={model?.readinessRows || []}
          emptyText="אין כרגע תובנות מוכנות באזור זה"
        />
      </InsightsSection>

      <InsightsSection title="תמונת פרופיל" icon="profile">
        <InsightsChipsList
          items={model?.profileRows || []}
          emptyText="אין כרגע תובנות פרופיל להצגה"
        />
      </InsightsSection>

      <InsightsSection title="פוטנציאל" icon="potential">
        <InsightsChipsList
          items={model?.potentialRows || []}
          emptyText="אין כרגע תובנות פוטנציאל להצגה"
        />
      </InsightsSection>

      <InsightsSection title="פירוט דומיינים" icon="abilities">
        <InsightsChipsList
          items={model?.domainRows || []}
          emptyText="אין כרגע דומיינים תקפים להצגה"
        />
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
