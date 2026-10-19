// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamInsightContent.js

import { useRef, useState } from 'react'
import { Box, Button, IconButton, Tooltip, Typography } from '@mui/joy'
import { Link } from 'react-router-dom'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import TeamKpiOverview from '../../performance/components/TeamKpiOverview.js'
import TeamScoutingSummary from '../../scouting/components/TeamScoutingSummary.js'
import TeamStructureSection from '../../structure/components/TeamStructureSection.js'
import TeamYearMetricsSection from '../../yearDevelopment/components/TeamYearMetricsSection.js'
import TeamYearMovementsSection from '../../yearDevelopment/components/TeamYearMovementsSection.js'
import TeamMovementsToolbar from '../../yearDevelopment/components/TeamMovementsToolbar.js'
import TeamYearScoutProfilesSection from '../../yearDevelopment/components/TeamYearScoutProfilesSection.js'
import TeamRosterWorkspace from './TeamRosterWorkspace.js'
import TeamRosterComparisonSection from './TeamRosterComparisonSection.js'
import TeamPerformanceToolbar from './TeamPerformanceToolbar.js'
import TeamFutureCompetitionSection from './TeamFutureCompetitionSection.js'
import TeamClubComparisonSection from './TeamClubComparisonSection.js'
import usePerformanceScrollStage from '../hooks/usePerformanceScrollStage.js'
import useMovementScrollEntries from '../hooks/useMovementScrollEntries.js'
import usePerformanceTableHeight from '../hooks/usePerformanceTableHeight.js'
import { teamPerformanceToolbarSx as toolbarSx } from '../sx/teamPerformanceToolbar.sx.js'
import { TEAM_INSIGHTS, getTeamInsight } from '../model/teamWorkspace.navigation.js'
import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'

export default function TeamInsightContent({
  insightId,
  slideDirection = 0,
  view,
  presentation,
  structureFilter,
  onStructureFilterChange,
  toOverview,
  toInsight,
  rosterProps,
  rosterComparison = null,
  scrollRef,
}) {
  const [openProfileSeasonKey, setOpenProfileSeasonKey] = useState('')
  const [movementPeriod, setMovementPeriod] = useState('current')
  const headerRef = useRef(null)
  const kpiRef = useRef(null)
  const metricsRef = useRef(null)
  const toolbarRef = useRef(null)
  const comparisonTableRef = useRef(null)
  const movementRef = useRef(null)
  const toolbarStage = usePerformanceScrollStage({
    enabled: insightId === 'performance',
    resetKey: `${view.team?.id || view.team?.birthTeamId}:${view.selectedSeasonKey}`,
    scrollRef,
    headerRef,
    kpiRef,
    metricsRef,
  })
  const comparisonTableHeight = usePerformanceTableHeight({
    stage: toolbarStage,
    scrollRef,
    headerRef,
    toolbarRef,
    tableRef: comparisonTableRef,
  })
  const movementSeasons = view.yearDevelopment?.movementSeasons || []
  const movementEntries = useMovementScrollEntries({
    enabled: insightId === 'year-movements',
    resetKey: `${view.team?.id || view.team?.birthTeamId}:${view.selectedSeasonKey}:${movementSeasons.map(season => season.seasonKey).join(',')}`,
    scrollRef,
    headerRef,
    movementRef,
  })
  const insight = getTeamInsight(insightId)
  const insightIndex = TEAM_INSIGHTS.findIndex(item => item.id === insightId)
  const nextInsight = TEAM_INSIGHTS[(insightIndex + 1) % TEAM_INSIGHTS.length]
  const previousInsight = TEAM_INSIGHTS[(insightIndex - 1 + TEAM_INSIGHTS.length) % TEAM_INSIGHTS.length]
  const hasRosterPlayers = Boolean(view?.positionClassificationRows?.length)
  const { clubComparison, competitionYearGroups, futureCompetitionSignal } = presentation
  const performanceDetails = Object.fromEntries((view.performanceInsight?.details || [])
    .map(detail => [detail.key, detail]))
  const profileContextLines = [
    performanceDetails.professionalProfiles,
    performanceDetails.underuseProfiles,
  ].filter(detail => detail?.text)

  if (!insight) return null

  return (
    <Box component='section' aria-label={insight.title} sx={sx.workspaceDetail}>
      <Box ref={headerRef} sx={toolbarSx.header}>
        <Box sx={[sx.insightTitleRow, toolbarSx.title]}>
          <Box sx={[sx.insightTitleMain, sx.insightSlide(slideDirection)]}>
            <Button
              component={Link}
              to={toInsight(previousInsight.id)}
              variant='soft'
              size='sm'
              startDecorator={iconUi({ id: 'forward', size: 'sm' })}
              sx={sx.insightTitleAction}
            >
              {previousInsight.title}
            </Button>
            <Typography level='h3' sx={sx.insightTitle}>{insight.title}</Typography>
          </Box>
          <Box sx={[sx.insightTitleActions, sx.insightSlide(slideDirection)]}>
            <Tooltip title='חזרה לתמונת מצב'>
              <IconButton
                component={Link}
                to={toOverview}
                variant='outlined'
                size='sm'
                aria-label='חזרה לתמונת מצב'
                sx={sx.insightOverviewAction}
              >
                {iconUi({ id: 'dashboard', size: 'sm' })}
              </IconButton>
            </Tooltip>
            <Button
              component={Link}
              to={toInsight(nextInsight.id)}
              variant='soft'
              size='sm'
              endDecorator={iconUi({ id: 'back', size: 'sm' })}
              sx={sx.insightTitleAction}
            >
              {nextInsight.title}
            </Button>
          </Box>
        </Box>
        <TeamPerformanceToolbar stage={toolbarStage} view={view} toolbarRef={toolbarRef} />
        <TeamMovementsToolbar
          entries={movementEntries}
          seasons={movementSeasons}
          period={movementPeriod}
          onPeriodChange={setMovementPeriod}
        />
      </Box>

      <Box sx={[sx.insightBody, sx.insightSlide(slideDirection)]}>
        {insightId === 'performance' ? (
          <>
            <Box ref={kpiRef}>
              <TeamKpiOverview
                team={view.team}
                competitionLevels={view.performanceInsight?.facts}
                leaguePath={view.yearDevelopment?.leaguePath}
                tablePositionTimeline={view.seasonTimeline}
                offensePriorityTimeline={view.offensePriorityTimeline}
                defensePriorityTimeline={view.defensePriorityTimeline}
                insightDetails={performanceDetails}
              />
            </Box>
            {view.developmentTimeline?.length ? (
              <Box ref={metricsRef}>
                <TeamYearMetricsSection
                  timeline={view.developmentTimeline}
                  contextText={performanceDetails.reliability?.text}
                />
              </Box>
            ) : <Typography>אין עדיין נתוני עונות להשוואה.</Typography>}
            <TeamYearScoutProfilesSection
              overview={view.yearDevelopment}
              openSeasonKey={openProfileSeasonKey}
              onToggle={setOpenProfileSeasonKey}
              insightNotes={profileContextLines}
            />
            <TeamRosterComparisonSection
              tableRef={comparisonTableRef}
              maxHeight={comparisonTableHeight}
              comparison={rosterComparison}
              favoritePlayerKeys={rosterProps.favoritePlayerKeys}
              onFavoriteToggle={rosterProps.onFavoriteToggle}
              onPlayerOpen={rosterProps.onPlayerOpen}
              onPlayerDetailsEdit={rosterProps.onPlayerDetailsEdit}
              findPlayerDetailsSeason={rosterProps.findPlayerDetailsSeason}
            />
          </>
        ) : null}

        {insightId === 'roster-balance' ? (
          <>
            <TeamScoutingSummary
              structure={view.structure}
              hasRosterPlayers={hasRosterPlayers}
              title={`חלוקת דקות · ${view.selectedSeasonKey}`}
              comparison={presentation.rosterBalanceComparison.minutes}
              selectedFilter={structureFilter}
              onFilterChange={onStructureFilterChange}
            />
            <TeamStructureSection
              structure={view.structure}
              hasRosterPlayers={hasRosterPlayers}
              title={`איזון מבנה העמדות · ${view.selectedSeasonKey}`}
              comparison={presentation.rosterBalanceComparison.positions}
              seasonKey={view.selectedSeasonKey}
              selectedFilter={structureFilter}
              onFilterChange={onStructureFilterChange}
            />
            <TeamRosterWorkspace {...rosterProps} showProfiles={false} />
          </>
        ) : null}

        {insightId === 'year-movements' ? (
          <TeamYearMovementsSection
            seasons={movementSeasons}
            seasonSignals={presentation.movementSeasonSignals}
            clubLevel={presentation.clubComparison.clubLevel}
            onPlayerOpen={rosterProps.onPlayerOpen}
            onPlayerDetailsEdit={rosterProps.onPlayerDetailsEdit}
            findPlayerDetailsSeason={rosterProps.findPlayerDetailsSeason}
            favoritePlayerKeys={rosterProps.favoritePlayerKeys}
            onFavoriteToggle={rosterProps.onFavoriteToggle}
            profilePeriod={movementPeriod}
            onProfilePeriodChange={setMovementPeriod}
            sectionRef={movementRef}
          />
        ) : null}

        {insightId === 'future-competition' ? (
          <TeamFutureCompetitionSection
            groups={competitionYearGroups}
            insight={futureCompetitionSignal}
            clubId={view.team?.clubId}
            seasonKey={view.selectedSeasonKey}
            birthYear={view.team?.birthYear}
          />
        ) : null}

        {insightId === 'club-gap' ? (
          <TeamClubComparisonSection comparison={clubComparison} seasonKey={view.selectedSeasonKey} />
        ) : null}
      </Box>
    </Box>
  )
}
