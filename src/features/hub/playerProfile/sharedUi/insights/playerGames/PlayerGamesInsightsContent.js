// playerProfile/sharedUi/insights/playerGames/PlayerGamesInsightsContent.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
} from '../../../../../../ui/patterns/insights/index.js'

import {
  MainDiagnosis,
  OpportunitySection,
  ExpectationSection,
  TeamImpactSection,
  DifficultyImpactSection,
} from './sections/index.js'

import { usePlayerGamesInsightsModel } from './usePlayerGamesInsightsModel.js'

export default function PlayerGamesInsightsContent({
  games,
  player,
  team,
}) {
  const model = usePlayerGamesInsightsModel({
    games,
    player,
    team,
  })

  const {
    gamesReady,
    topStats,
    briefCards,
    insights,
    mainDiagnosis,
  } = model

  if (!gamesReady) {
    return (
      <LocalInsightsSection title="תובנות משחקי שחקן" icon="insights">
        <ModeBlockedPlaceholder
          title="אין מספיק נתוני משחקים"
          text="כדי להציג תובנות שחקן נדרשים משחקי ליגה משוחקים עם דקות שחקן, פתיחות ונתוני תרומה."
        />
      </LocalInsightsSection>
    )
  }

  // שליפת התובנות הספציפיות מתוך מודל הנתונים
  const briefs = insights?.briefs || {}

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {/* אזור 1: אבחנה ראשית (השורה התחתונה בראש) */}
      <LocalInsightsSection title="שורה תחתונה" icon="keyPlayer">
        <MainDiagnosis data={mainDiagnosis} />
      </LocalInsightsSection>

      <LocalInsightsSection
        title="האם קיבל הזדמנות?"
        icon="time"
      >
        <OpportunitySection
          data={mainDiagnosis}
          brief={briefs.usage}
        />
      </LocalInsightsSection>

      <LocalInsightsSection
        title="האם נתן תפוקה לפי הציפייה?"
        icon="insights"
      >
        <ExpectationSection briefs={briefs} />
      </LocalInsightsSection>

      <LocalInsightsSection title="הקשר ביצוע" icon="details">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1fr 1fr',
            },
            gap: 1,
            minWidth: 0,
            alignItems: 'start',
          }}
        >
          <TeamImpactSection brief={briefs.teamContext} />
          <DifficultyImpactSection brief={briefs.difficulty} />
        </Box>
      </LocalInsightsSection>
    </Box>
  )
}
