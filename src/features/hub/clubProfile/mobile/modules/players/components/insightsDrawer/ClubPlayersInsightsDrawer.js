// ClubProfile/mobile/modules/players/components/insightsDrawer/ClubPlayersInsightsDrawer.js

import React, { useMemo } from 'react'
import { Box, Chip, Stack, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
  InsightsStatCard,
  InsightsChipsList,
} from '../../../../../../../../ui/patterns/insights/index.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { buildClubPlayersInsights } from '../../../../../sharedLogic/players/insightsLogic/index.js'

const c = getEntityColors('clubs')

export default function ClubPlayersInsightsDrawer({
  open,
  onClose,
  rows,
  summary,
  entity,
}) {
  const insights = useMemo(
    () => buildClubPlayersInsights({ rows, summary }),
    [rows, summary]
  )

  const avatarSrc =
    entity?.photo ||
    buildFallbackAvatar({
      entityType: 'club',
      id: entity?.id,
      name: entity?.clubName,
    })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      header={
        <InsightsDrawerHeader
          title={entity?.clubName || 'מועדון'}
          subtitle="תובנות שחקנים"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
      <InsightsSection title="תובנות סגל" icon="players">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          <InsightsStatCard title="שחקנים בסגל" value={insights.squad.total} icon="players" />
          <InsightsStatCard title="שחקני מפתח" value={insights.squad.keyCount} sub={insights.squad.keyRate} icon="keyPlayer" />
          <InsightsStatCard title="פעילים" value={insights.squad.active} icon="active" />
          <InsightsStatCard title="לא פעילים" value={insights.squad.nonActive} icon="close" />
        </Box>
      </InsightsSection>

      <InsightsSection title="פריסת עמדות" icon="position">
        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
          לפי שכבה
        </Typography>

        <InsightsChipsList
          items={insights.positions.layers.map((item) => ({
            ...item,
            icon: item.id === 'none' ? 'close' : item.id,
          }))}
          iconFallback="layers"
        />

        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
          לפי עמדה
        </Typography>

        <InsightsChipsList
          items={insights.positions.exactPositions.map((item) => ({
            ...item,
            icon: item.id,
          }))}
          iconFallback="layers"
        />
      </InsightsSection>

      <InsightsSection title="תובנות סטטיסטיקה מהירה" icon="stats">
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1 }}>
          <InsightsStatCard title="מעל 70% דקות" value={insights.quickStats.over70} icon="playTimeRate" />
          <InsightsStatCard title="מתחת ל־30% דקות" value={insights.quickStats.under30} icon="playTimeRate" />
          <InsightsStatCard title="עם שערים" value={insights.quickStats.withGoals} sub={`מתוך ${insights.squad.total}`} icon="goal" />
          <InsightsStatCard title="עם ניקוד פוטנציאל" value={insights.quickStats.withPotential} sub={`מתוך ${insights.squad.total}`} icon="insights" />
        </Box>
      </InsightsSection>

      <InsightsSection title="תובנות פרויקט" icon="project">
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
          <Chip size="md" color="success" variant="soft" startDecorator={iconUi({ id: 'project' })}>
            פרויקט ({insights.project.totalProject})
          </Chip>

          <Chip size="md" color="warning" variant="soft" startDecorator={iconUi({ id: 'candidate' })}>
            מועמדות ({insights.project.totalCandidate})
          </Chip>
        </Stack>

        <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
          לפי שלב
        </Typography>

        <InsightsChipsList items={insights.project.byStage} iconFallback="project" />
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
