// teamProfile/modules/games/components/insightsDrawer/TeamGamesInsightsDrawer.js

import React, { useMemo, useState } from 'react'

import {
  InsightsDrawerShell,
  InsightsDrawerHeader,
} from '../../../../../../../../ui/patterns/insights/index.js'

import { getEntityColors } from '../../../../../../../../ui/core/theme/Colors.js'
import { resolveEntityAvatar } from '../../../../../../../../ui/core/avatars/fallbackAvatar.js'

import {
  buildTeamGamesInsights,
  buildTeamGamesBriefSections,
} from '../../../../../../../../shared/games/insights/team/index.js'

import { createGameRowNormalizer } from '../../../../../../../../shared/games/games.normalize.logic.js'

import { buildTeamGamesDrawerViewModel } from './../../../../../sharedLogic/games'

import CalculationModeChips, {
  CALCULATION_MODES,
} from './CalculationModeChips.js'

import SquadCards from './sections/SquadCards.js'
import TargetCards from './sections/TargetCards.js'
import InsightBrief from './sections/InsightBrief.js'
import ForecastCards from './sections/ForecastCards.js'
import HomeAwayCards from './sections/HomeAwayCards.js'
import DifficultyCards from './sections/DifficultyCards.js'
import SourceCompareStrip from './sections/SourceCompareStrip.js'
import LocalInsightsSection from './sections/LocalInsightsSection'
import ModeBlockedPlaceholder from './sections/ModeBlockedPlaceholder.js'

const c = getEntityColors('teams')

export default function TeamGamesInsightsDrawer({
  open,
  onClose,
  games,
  entity,
  team,
}) {
  const [calculationMode, setCalculationMode] = useState(
    CALCULATION_MODES.TEAM
  )

  const liveTeam = team || entity || {}
  const isGamesMode = calculationMode === CALCULATION_MODES.GAMES

  const normalizeRow = useMemo(() => createGameRowNormalizer({}), [])

  const insights = useMemo(() => {
    return buildTeamGamesInsights({
      team: liveTeam,
      rows: Array.isArray(games) ? games : [],
      normalizeRow,
      calculationMode,
    })
  }, [games, liveTeam, normalizeRow, calculationMode])

  const teamSource = insights?.sources?.team || insights?.league || {}
  const gamesSource = insights?.sources?.games || insights?.games || {}

  const viewModel = useMemo(() => {
    return buildTeamGamesDrawerViewModel({
      ...insights,
      team: liveTeam,
    })
  }, [insights, liveTeam])

  const targetProgress = viewModel?.targetProgress || {}
  const forecast = targetProgress?.forecast || {}
  const targetRows = Array.isArray(targetProgress?.rows)
    ? targetProgress.rows
    : []

  const homeAwayProjection = viewModel?.homeAwayProjection || {}
  const difficultyProjection = viewModel?.difficultyProjection || {}
  const squadMetrics = viewModel?.squadMetrics || {}

  const briefSections = useMemo(() => {
    return buildTeamGamesBriefSections({
      ...insights,
      squadMetrics,
      targetProgress,
      homeAwayProjection,
      difficultyProjection,
    })
  }, [insights, targetProgress, homeAwayProjection, difficultyProjection, squadMetrics])

  const avatarSrc = resolveEntityAvatar({
    entityType: 'team',
    entity: liveTeam,
    parentEntity: liveTeam?.club,
    subline: liveTeam?.club?.name || liveTeam?.club?.clubName,
  })

  return (
    <InsightsDrawerShell
      open={open}
      onClose={onClose}
      size="lg"
      header={
        <InsightsDrawerHeader
          title={liveTeam?.teamName || liveTeam?.name || ''}
          subtitle="תובנות משחקי הקבוצה"
          avatarSrc={avatarSrc}
          colorSx={{ bgcolor: c.bg }}
        />
      }
    >
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
          <HomeAwayCards data={homeAwayProjection} brief={briefSections.homeAway} />
        ) : (
          <ModeBlockedPlaceholder
            title="פילוח בית / חוץ אינו זמין בנתוני קבוצה"
            text="הפילוח דורש נתוני משחקים, כי אין כרגע שדות יבשים של בית / חוץ ברמת הקבוצה."
          />
        )}
      </LocalInsightsSection>

      <LocalInsightsSection title="פילוח לפי רמת קושי" icon="difficulty">
        {isGamesMode ? (
          <DifficultyCards data={difficultyProjection} brief={briefSections.difficulty} />
        ) : (
          <ModeBlockedPlaceholder
            title="פילוח רמת קושי אינו זמין בנתוני קבוצה"
            text="הפילוח דורש נתוני משחקים עם סימון רמת יריבה. בעתיד ניתן יהיה להוסיף נתוני קבוצה יבשים."
          />
        )}
      </LocalInsightsSection>

      <LocalInsightsSection title="תובנות מהסגל" icon="team">
        {isGamesMode ? (
          <SquadCards data={squadMetrics} brief={briefSections.squad} />
        ) : (
          <ModeBlockedPlaceholder
            title="תובנות סגל אינן זמינות בנתוני קבוצה"
            text="המדדים האלו מבוססים על נתוני שחקנים מתוך משחקים, כמו כובשים, מבשלים, הרכב ושחקנים ששולבו."
          />
        )}
      </LocalInsightsSection>
    </InsightsDrawerShell>
  )
}
