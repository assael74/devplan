// features/insightsHub/overview/components/IntroCard.js

import React from 'react'
import { Card, Typography } from '@mui/joy'

export default function IntroCard() {
  return (
    <Card
      variant="soft"
      sx={{ borderRadius: 18, p: 2, bgcolor: 'background.level1' }}
    >
      <Typography level="title-sm" sx={{ fontWeight: 700 }}>
        בחר תחום להצגת הפירוט
      </Typography>

      <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
        כרגע מחובר תחום המשחקים. בהמשך יתווספו וידאו, יכולות, פגישות ותחומים נוספים.
      </Typography>
    </Card>
  )
}
