// teamProfile/modules/abilities/components/insightsDrawer/TeamAbilitiesInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildTeamAbilitiesInsightsDrawerModel } from './../../../../../sharedLogic/abilities'

const c = getEntityColors('teams')

const safeArray = (value) => (Array.isArray(value) ? value : [])

const mapRowToChip = (item, fallbackIcon = 'insights') => ({
  id: item?.id || item?.key || item?.title || item?.label || '',
  label: item?.title || item?.label || item?.name || '',
  value: item?.value ?? '',
  sub: item?.sub || item?.subValue || '',
  icon: item?.icon || fallbackIcon,
  color: item?.color || 'neutral',
})

export default function TeamAbilitiesInsightsDrawer({
  open,
  onClose,
  entity,
  context,
}) {
  const model = useMemo(() => {
    return buildTeamAbilitiesInsightsDrawerModel(entity || {}, context || {})
  }, [entity, context])

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity,
    parentEntity: entity?.club,
    subline: entity?.club?.name || entity?.club?.clubName,
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={entity?.teamName || entity?.name || ''}
          subtitle="תובנות יכולות קבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <InsightsSection title="תקציר על" icon="insights">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          {safeArray(model?.topStats).map((item) => (
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
          items={safeArray(model?.readinessRows).map((item) => mapRowToChip(item, 'check'))}
          iconFallback="check"
        />
      </InsightsSection>

      <InsightsSection title="תמונת קבוצה" icon="profile">
        <InsightsChipsList
          items={safeArray(model?.profileRows).map((item) => mapRowToChip(item, 'profile'))}
          iconFallback="profile"
        />
      </InsightsSection>

      <InsightsSection title="פוטנציאל" icon="potential">
        <InsightsChipsList
          items={safeArray(model?.potentialRows).map((item) => mapRowToChip(item, 'potential'))}
          iconFallback="potential"
        />
      </InsightsSection>

      <InsightsSection title="פירוט דומיינים" icon="abilities">
        <InsightsChipsList
          items={safeArray(model?.domainRows).map((item) => mapRowToChip(item, 'abilities'))}
          iconFallback="abilities"
        />
      </InsightsSection>

      <InsightsSection title="לפי עמדות" icon="position">
        <InsightsChipsList
          items={safeArray(model?.positionRows).map((item) => mapRowToChip(item, 'position'))}
          iconFallback="position"
        />
      </InsightsSection>

      <InsightsSection title="לפי שכבות" icon="layers">
        <InsightsChipsList
          items={safeArray(model?.layerRows).map((item) => mapRowToChip(item, 'layers'))}
          iconFallback="layers"
        />
      </InsightsSection>

      <InsightsSection title="לפי תפקיד בסגל" icon="keyPlayer">
        <InsightsChipsList
          items={safeArray(model?.roleRows).map((item) => mapRowToChip(item, 'keyPlayer'))}
          iconFallback="keyPlayer"
        />
      </InsightsSection>

      {!model?.isEligible && (
        <Box sx={{ mt: 0.5 }}>
          <Typography level="body-sm" sx={{ opacity: 0.75 }}>
            חלק מהתובנות יוצגו באופן חלקי עד להשלמת נתוני היכולות של הקבוצה.
          </Typography>
        </Box>
      )}
    </InsightsDrawerShell>
  )
}
