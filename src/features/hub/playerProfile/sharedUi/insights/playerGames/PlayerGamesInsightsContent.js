// playerProfile/sharedUi/insights/playerGames/PlayerGamesInsightsContent.js

import React from 'react'
import { Box, Skeleton } from '@mui/joy'

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

import {
  LocalHeader,
} from './layout/index.js'

import { usePlayerGamesInsightsModel } from './usePlayerGamesInsightsModel.js'

const PlayerGamesInsightsLoading = () => {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Skeleton variant="rectangular" height={86} />
      <Skeleton variant="rectangular" height={160} />
      <Skeleton variant="rectangular" height={190} />
    </Box>
  )
}

export default function PlayerGamesInsightsContent({
  games,
  player,
  team,
  enabled = true,
}) {
  const model = usePlayerGamesInsightsModel({
    games,
    player,
    team,
    enabled,
    defer: true,
  })

  const {
    gamesReady,
    insights,
    mainDiagnosis,
    isBuilding,
  } = model

  if (isBuilding) {
    return (
      <Box sx={{ display: 'grid', gap: 3 }}>
        <LocalHeader showPrint={false} />

        <PlayerGamesInsightsLoading />
      </Box>
    )
  }

  if (!gamesReady) {
    return (
      <Box sx={{ display: 'grid', gap: 3 }}>
        <LocalHeader showPrint={false} />

        <LocalInsightsSection title="תובנות משחקי שחקן" icon="insights">
          <ModeBlockedPlaceholder
            title="אין מספיק נתוני משחקים"
            text="כדי להציג תובנות שחקן נדרשים משחקי ליגה משוחקים עם דקות שחקן, הרכב ונתוני תרומה."
          />
        </LocalInsightsSection>
      </Box>
    )
  }

  const briefs = insights?.briefs || {}
  const gamesSnapshot = insights?.games || games
  const targets = insights?.targets || {}

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <LocalHeader
        model={model}
        printDisabled={!gamesReady}
      />

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
          gamesData={gamesSnapshot}
        />
      </LocalInsightsSection>

      <LocalInsightsSection
        title="האם נתן תפוקה לפי הציפייה?"
        icon="insights"
      >
        <ExpectationSection
          briefs={briefs}
          targets={targets}
          gamesData={gamesSnapshot}
        />
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
          <TeamImpactSection
            brief={briefs.teamContext}
            gamesData={gamesSnapshot}
          />

          <DifficultyImpactSection
            brief={briefs.difficulty}
            gamesData={gamesSnapshot}
          />
        </Box>
      </LocalInsightsSection>
    </Box>
  )
}
