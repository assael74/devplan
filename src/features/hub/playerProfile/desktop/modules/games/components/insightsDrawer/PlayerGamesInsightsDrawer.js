// playerProfile/desktop/modules/games/components/insightsDrawer/playerGamesInsightsDrawer.js

import React from 'react'
import { Box, Typography } from '@mui/joy'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
  InsightsSection,
} from '../../../../../../../../ui/patterns/insights/index.js'

import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'

export default function PlayerGamesInsightsDrawer({
  open,
  onClose,
  player,
}) {
  const header = (
    <InsightsDrawerHeader
      title={player?.playerFullName || 'שחקן'}
      subtitle="תובנות משחקים"
      avatarSrc={player?.photo || playerImage}
    />
  )

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={header}
    >
      <InsightsSection title="תובנות שחקן" icon="insights">
        <Box
          sx={{
            p: 2,
            borderRadius: 'lg',
            bgcolor: 'background.level1',
            border: '1px solid',
            borderColor: 'divider',
            display: 'grid',
            gap: 0.75,
          }}
        >
          <Typography level="title-sm" sx={{ fontWeight: 700 }}>
            תובנות משחקי שחקן עדיין לא מוכנות
          </Typography>

          <Typography level="body-sm" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            בהמשך האזור יציג תובנות על השתתפות, דקות משחק, פתיחה בהרכב,
            תרומה התקפית והשפעת נוכחות השחקן על תוצאות הקבוצה.
          </Typography>

          <Typography level="body-xs" sx={{ color: 'text.tertiary', lineHeight: 1.5 }}>
            כרגע הנתונים מוצגים במדדי ה־KPI ובטבלת המשחקים בלבד.
          </Typography>
        </Box>
      </InsightsSection>
    </InsightsDrawerShell>
  )
}
