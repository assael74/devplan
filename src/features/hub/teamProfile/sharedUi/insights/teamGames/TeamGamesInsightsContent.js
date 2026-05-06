// teamProfile/sharedUi/insights/teamGames/TeamGamesInsightsContent.js

import React from 'react'

import { CalculationModeChips } from './controls/index.js'

import {
  SourceCompareStrip,
} from './layout/index.js'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
} from '../../../../../../ui/patterns/insights/index.js'

import {
  DifficultyCards,
  ForecastCards,
  HomeAwayCards,
  InsightBrief,
  SquadCards,
  TargetCards,
} from './sections/index.js'

import { useTeamGamesInsightsModel } from './useTeamGamesInsightsModel.js'

export default function TeamGamesInsightsContent({
  games,
  entity,
  team,
}) {
  const model = useTeamGamesInsightsModel({
    games,
    entity,
    team,
  })

  const {
    calculationMode,
    setCalculationMode,
    isGamesMode,

    teamSource,
    gamesSource,

    forecast,
    targetRows,

    homeAwayProjection,
    difficultyProjection,
    squadMetrics,

    briefSections,
  } = model

  return (
    <>
      <LocalInsightsSection
        title="תחזית סיום"
        icon="projection"
        action={
          <CalculationModeChips
            value={calculationMode}
            onChange={setCalculationMode}
          />
        }
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
