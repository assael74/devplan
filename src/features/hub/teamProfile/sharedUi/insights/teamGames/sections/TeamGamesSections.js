// teamProfile/sharedUi/insights/teamGames/sections/TeamGamesSections.js

import React from 'react'

import {
  LocalInsightsSection,
  ModeBlockedPlaceholder,
} from '../../../../../../../ui/patterns/insights/index.js'

import {
  DifficultyCards,
  ForecastCards,
  HomeAwayCards,
  SquadCards,
  TargetCards,
  TeamScoringCards,
} from './cards/index.js'

import InsightBrief from './insight/InsightBrief.js'
import { SourceCompareStrip } from '../layout/index.js'

function ScoringBlocked() {
  return (
    <ModeBlockedPlaceholder
      title="מדד יעילות והשפעה אינו זמין בנתוני קבוצה"
      text="המדד דורש נתוני משחקים, תוצאות בפועל ויעדי קבוצה כדי לחשב יעילות והשפעה."
    />
  )
}

function HomeAwayBlocked() {
  return (
    <ModeBlockedPlaceholder
      title="פילוח בית / חוץ אינו זמין בנתוני קבוצה"
      text="הפילוח דורש נתוני משחקים, כי אין כרגע שדות יבשים של בית / חוץ ברמת הקבוצה."
    />
  )
}

function DifficultyBlocked() {
  return (
    <ModeBlockedPlaceholder
      title="פילוח רמת קושי אינו זמין בנתוני קבוצה"
      text="הפילוח דורש נתוני משחקים עם סימון רמת יריבה. בעתיד ניתן יהיה להוסיף נתוני קבוצה יבשים."
    />
  )
}

function SquadBlocked() {
  return (
    <ModeBlockedPlaceholder
      title="תובנות סגל אינן זמינות בנתוני קבוצה"
      text="המדדים האלו מבוססים על נתוני שחקנים מתוך משחקים, כמו כובשים, מבשלים, הרכב ושחקנים ששולבו."
    />
  )
}

export function ForecastSection({
  action,
  teamSource,
  gamesSource,
  forecast,
}) {
  return (
    <LocalInsightsSection
      title="תחזית סיום"
      icon="projection"
      action={action}
    >
      <SourceCompareStrip
        teamSource={teamSource}
        gamesSource={gamesSource}
      />

      <ForecastCards forecast={forecast} />
    </LocalInsightsSection>
  )
}

export function TargetsSection({ rows }) {
  return (
    <LocalInsightsSection title="יעד מול ביצוע צפוי" icon="targets">
      <TargetCards rows={rows} />
    </LocalInsightsSection>
  )
}

export function ScoringSection({ isGamesMode, summary }) {
  return (
    <LocalInsightsSection title="מדד יעילות והשפעה" icon="insights">
      {isGamesMode ? (
        <TeamScoringCards summary={summary} />
      ) : (
        <ScoringBlocked />
      )}
    </LocalInsightsSection>
  )
}

export function GeneralBriefSection({ brief }) {
  return (
    <LocalInsightsSection title="תובנות ביצוע כללי" icon="insights">
      <InsightBrief brief={brief} />
    </LocalInsightsSection>
  )
}

export function HomeAwaySection({ isGamesMode, data, brief }) {
  return (
    <LocalInsightsSection title="פילוח בית / חוץ" icon="home">
      {isGamesMode ? (
        <HomeAwayCards data={data} brief={brief} />
      ) : (
        <HomeAwayBlocked />
      )}
    </LocalInsightsSection>
  )
}

export function DifficultySection({ isGamesMode, data, brief }) {
  return (
    <LocalInsightsSection title="פילוח לפי רמת קושי" icon="difficulty">
      {isGamesMode ? (
        <DifficultyCards data={data} brief={brief} />
      ) : (
        <DifficultyBlocked />
      )}
    </LocalInsightsSection>
  )
}

export function SquadSection({ isGamesMode, data, brief }) {
  return (
    <LocalInsightsSection title="תובנות מהסגל" icon="team">
      {isGamesMode ? (
        <SquadCards data={data} brief={brief} />
      ) : (
        <SquadBlocked />
      )}
    </LocalInsightsSection>
  )
}

export default function TeamGamesSections({ model, headerAction }) {
  return (
    <>
      <ForecastSection
        action={headerAction}
        teamSource={model.teamSource}
        gamesSource={model.gamesSource}
        forecast={model.forecast}
      />

      <TargetsSection rows={model.targetRows} />

      <ScoringSection
        isGamesMode={model.isGamesMode}
        summary={model.teamScoringSummary}
      />

      <GeneralBriefSection brief={model.briefSections?.forecast} />

      <HomeAwaySection
        isGamesMode={model.isGamesMode}
        data={model.homeAwayProjection}
        brief={model.briefSections?.homeAway}
      />

      <DifficultySection
        isGamesMode={model.isGamesMode}
        data={model.difficultyProjection}
        brief={model.briefSections?.difficulty}
      />

      <SquadSection
        isGamesMode={model.isGamesMode}
        data={model.squadMetrics}
        brief={model.briefSections?.squad}
      />
    </>
  )
}
