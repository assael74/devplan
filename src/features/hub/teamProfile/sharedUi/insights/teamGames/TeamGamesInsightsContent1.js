// teamProfile/sharedUi/insights/teamGames/TeamGamesInsightsContent.js

import React from 'react'
import { Box } from '@mui/joy'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
} from '../../../../../../ui/patterns/insights/index.js'

import {
  LocalHeader,
  SourceCompareStrip,
} from './layout/index.js'

import {
  DifficultyCards,
  ForecastCards,
  HomeAwayCards,
  InsightBrief,
  SquadCards,
  TargetCards,
} from './sections/index.js'

import { useTeamGamesInsightsModel } from './useTeamGamesInsightsModel.js'

const LoadingBlock = ({ height = 120 }) => {
  return (
    <Box
      sx={{
        height,
        borderRadius: 'xl',
        bgcolor: 'background.level1',
      }}
    />
  )
}

const TeamGamesInsightsLoading = ({
  calculationMode,
  setCalculationMode,
  liveTeam,
  model,
}) => {
  return (
    <LocalInsightsSection
      title="תחזית סיום"
      icon="projection"
      action={(
        <LocalHeader
          model={model}
          calculationMode={calculationMode}
          onCalculationModeChange={setCalculationMode}
          liveTeam={liveTeam}
        />
      )}
    >
      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <LoadingBlock height={44} />
        <LoadingBlock height={132} />
        <LoadingBlock height={180} />
      </Box>
    </LocalInsightsSection>
  )
}

export default function TeamGamesInsightsContent({
  games,
  entity,
  team,
  enabled = true,
}) {
  const model = useTeamGamesInsightsModel({
    games,
    entity,
    team,
    enabled,
    defer: true,
  })

  const {
    calculationMode,
    setCalculationMode,
    isGamesMode,

    liveTeam,

    teamSource,
    gamesSource,

    forecast,
    targetRows,

    homeAwayProjection,
    difficultyProjection,
    squadMetrics,

    briefSections,
    isBuilding,
  } = model

  if (isBuilding) {
    return (
      <TeamGamesInsightsLoading
        model={model}
        calculationMode={calculationMode}
        setCalculationMode={setCalculationMode}
        liveTeam={liveTeam}
      />
    )
  }

  return (
    <>
      <LocalInsightsSection
        title="תחזית סיום"
        icon="projection"
        action={(
          <LocalHeader
            model={model}
            calculationMode={calculationMode}
            onCalculationModeChange={setCalculationMode}
            liveTeam={liveTeam}
          />
        )}
      >
        <SourceCompareStrip
          teamSource={teamSource}
          gamesSource={gamesSource}
        />

        <ForecastCards forecast={forecast} />
      </LocalInsightsSection>

      <LocalInsightsSection title="יעד מול ביצוע צפוי" icon="targets">
        <TargetCards rows={targetRows} />
      </LocalInsightsSection>

      <LocalInsightsSection title="תובנות ביצוע כללי" icon="insights">
        <InsightBrief brief={briefSections.forecast} />
      </LocalInsightsSection>

      <LocalInsightsSection title="פילוח בית / חוץ" icon="home">
        {isGamesMode ? (
          <HomeAwayCards
            data={homeAwayProjection}
            brief={briefSections.homeAway}
          />
        ) : (
          <ModeBlockedPlaceholder
            title="פילוח בית / חוץ אינו זמין בנתוני קבוצה"
            text="הפילוח דורש נתוני משחקים, כי אין כרגע שדות יבשים של בית / חוץ ברמת הקבוצה."
          />
        )}
      </LocalInsightsSection>

      <LocalInsightsSection title="פילוח לפי רמת קושי" icon="difficulty">
        {isGamesMode ? (
          <DifficultyCards
            data={difficultyProjection}
            brief={briefSections.difficulty}
          />
        ) : (
          <ModeBlockedPlaceholder
            title="פילוח רמת קושי אינו זמין בנתוני קבוצה"
            text="הפילוח דורש נתוני משחקים עם סימון רמת יריבה. בעתיד ניתן יהיה להוסיף נתוני קבוצה יבשים."
          />
        )}
      </LocalInsightsSection>

      <LocalInsightsSection title="תובנות מהסגל" icon="team">
        {isGamesMode ? (
          <SquadCards
            data={squadMetrics}
            brief={briefSections.squad}
          />
        ) : (
          <ModeBlockedPlaceholder
            title="תובנות סגל אינן זמינות בנתוני קבוצה"
            text="המדדים האלו מבוססים על נתוני שחקנים מתוך משחקים, כמו כובשים, מבשלים, הרכב ושחקנים ששולבו."
          />
        )}
      </LocalInsightsSection>
    </>
  )
}
