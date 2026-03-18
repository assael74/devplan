// teamProfile/modules/players/components/insightsDrawer/TeamPlayersInsightsDrawer.js

import React, { useMemo } from 'react'
import {
  Drawer,
  Box,
  Sheet,
  DialogContent,
  Divider,
  Stack,
  Typography,
  Avatar,
  Button,
  Chip,
} from '@mui/joy'

import { StatCard, ChipsList, SectionBlock, InsightsDrawerHeader } from './InsightsDrawerParts.js'

import { getEntityColors } from '../../../../../../../ui/core/theme/Colors.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import { buildFallbackAvatar } from '../../../../../../../ui/core/avatars/fallbackAvatar.js'

import { teamPlayersInsightsSx as sx } from './sx/teamPlayers.insights.sx.js'
import { buildTeamPlayersInsights } from './logic/teamPlayers.insights.logic.js'

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

  return (
    <Drawer
      size="lg"
      variant="plain"
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerSx } }}
    >
      <Sheet sx={sx.drawerSheet}>
        <InsightsDrawerHeader entity={entity} />

        <DialogContent sx={{ gap: 2 }}>
          <Box sx={sx.content} className='dpScrollThin'>
            <SectionBlock title="תובנות סגל" icon="players">
              <Box sx={sx.statsGrid}>
                <StatCard
                  title="שחקנים בסגל"
                  value={insights.squad.total}
                  icon="players"
                />

                <StatCard
                  title="שחקני מפתח"
                  value={insights.squad.keyCount}
                  sub={insights.squad.keyRate}
                  icon="keyPlayer"
                />

                <StatCard
                  title="פעילים"
                  value={insights.squad.active}
                  icon="active"
                />

                <StatCard
                  title="לא פעילים"
                  value={insights.squad.nonActive}
                  icon="close"
                />
              </Box>
            </SectionBlock>

            <SectionBlock title="פריסת עמדות" icon="position">
              <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
                לפי שכבה
              </Typography>

              <ChipsList
                items={insights.positions.layers.map((item) => ({
                  ...item,
                  icon: item.id === 'none' ? 'close' : item.id,
                }))}
                iconFallback="layers"
              />

              <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
                לפי עמדה
              </Typography>

              <ChipsList
                items={insights.positions.exactPositions.map((item) => ({
                  ...item,
                  icon: item.id,
                }))}
                iconFallback="layers"
              />
            </SectionBlock>

            <SectionBlock title="תובנות סטטיסטיקה מהירה" icon="stats">
              <Box sx={sx.statsGrid}>
                <StatCard
                  title="מעל 70% דקות"
                  value={insights.quickStats.over70}
                  icon="playTimeRate"
                />

                <StatCard
                  title="מתחת ל־30% דקות"
                  value={insights.quickStats.under30}
                  icon="playTimeRate"
                />

                <StatCard
                  title="עם שערים"
                  value={insights.quickStats.withGoals}
                  sub={`מתוך ${insights.squad.total}`}
                  icon="goal"
                />

                <StatCard
                  title="עם ניקוד פוטנציאל"
                  value={insights.quickStats.withPotential}
                  sub={`מתוך ${insights.squad.total}`}
                  icon="insights"
                />
              </Box>
            </SectionBlock>

            <SectionBlock title="תובנות פרויקט" icon="project">
              <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                <Chip
                  size="md"
                  color="success"
                  variant="soft"
                  startDecorator={iconUi({ id: 'project' })}
                >
                  פרויקט ({insights.project.totalProject})
                </Chip>

                <Chip
                  size="md"
                  color="warning"
                  variant="soft"
                  startDecorator={iconUi({ id: 'candidate' })}
                >
                  מועמדות ({insights.project.totalCandidate})
                </Chip>
              </Stack>

              <Typography level="title-sm" sx={{ fontWeight: 700, mt: 0.25, mb: 0.1 }}>
                לפי שלב
              </Typography>

              <ChipsList
                items={insights.project.byStage}
                iconFallback="project"
              />
            </SectionBlock>
          </Box>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
