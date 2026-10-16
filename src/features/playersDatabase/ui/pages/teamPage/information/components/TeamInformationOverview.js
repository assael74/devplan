// src/features/playersDatabase/ui/pages/teamPage/information/components/TeamInformationOverview.js

import * as React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Box, Button, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import useScrollToTopOnChange from '../../../../../../../ui/core/useScrollToTopOnChange.js'
import { teamInformationSx as sx } from '../sx/teamInformation.sx.js'
import {
  resolveDefaultTeamStructureFilter,
  TEAM_STRUCTURE_FILTER,
} from '../../structure/model/teamStructureFilter.model.js'
import { buildTeamSeasonTabs } from '../model/teamSeasonTabs.model.js'
import TeamWorkspaceNavigation from './TeamWorkspaceNavigation.js'
import TeamInsightContent from './TeamInsightContent.js'
import TeamRosterWorkspace from './TeamRosterWorkspace.js'
import { buildRosterBalanceSeasonView, buildTeamInsightsPresentation } from '../model/teamInsights.presentation.js'
import {
  TEAM_INSIGHTS,
  resolveTeamWorkspace,
  buildTeamWorkspaceUrl,
  buildTeamRosterSeasonUrl,
} from '../model/teamWorkspace.navigation.js'

const PERFORMANCE_CHANGE_LABELS = {
  significant: 'שינוי משמעותי · לחקירה',
  minor: 'שינוי קטן · למעקב',
  steady: 'ללא שינוי',
  limited: 'השוואה חלקית',
}

const rosterBalanceTaskLabel = presentation => {
  if (!presentation.rosterBalanceAvailable) return 'ניתוח טרם זמין'
  if (presentation.rosterBalanceStatus === 'multiple') {
    return `${presentation.rosterBalanceTaskCount} משימות · לחקירה`
  }
  return presentation.rosterBalanceStatus === 'single'
    ? 'משימה אחת · למעקב'
    : 'ללא משימות'
}

const movementSignalLabel = signal => {
  if (signal.status === 'limited') return 'ניתוח טרם זמין'
  if (signal.count === 2) return '2 איתותים · לחקירה'
  return signal.count === 1 ? 'איתות אחד · למעקב' : 'ללא איתות מזוהה'
}

const insightSlideDirection = (previous, current) => {
  if (previous.mode !== 'insight' || current.mode !== 'insight' ||
    previous.seasonKey !== current.seasonKey) return 0

  const previousIndex = TEAM_INSIGHTS.findIndex(insight => insight.id === previous.insightId)
  const currentIndex = TEAM_INSIGHTS.findIndex(insight => insight.id === current.insightId)
  if (previousIndex < 0 || currentIndex < 0 || previousIndex === currentIndex) return 0

  if (currentIndex === (previousIndex + 1) % TEAM_INSIGHTS.length) return 1
  if (currentIndex === (previousIndex - 1 + TEAM_INSIGHTS.length) % TEAM_INSIGHTS.length) return -1
  return 0
}

export default function TeamInformationOverview({
  view,
  overviewRosterView = null,
  rosterComparison = null,
  club = null,
  clubIntelligence = null,
  seasonSnapshots = [],
  seasonOptions = [],
  profileFilterKey = 'all',
  overviewRosterProfileFilterOptions = [],
  onProfileFilterChange,
  onPlayerRoleEdit,
  onPlayerOpen,
}) {
  const location = useLocation()
  const navigate = useNavigate()
  const workspace = resolveTeamWorkspace(location.search)
  const isRosterBalance = workspace.mode === 'insight' && workspace.insightId === 'roster-balance'
  const rosterView = overviewRosterView || view
  const insightView = isRosterBalance ? buildRosterBalanceSeasonView(view, rosterView) : view
  const [selectedRosterPlayer, setSelectedRosterPlayer] = React.useState(null)
  const pendingRevealSeasonRef = React.useRef('')
  const toOverview = buildTeamWorkspaceUrl({ location, mode: 'overview' })
  const toInsight = insightId => buildTeamWorkspaceUrl({
    location,
    mode: 'insight',
    insightId,
  })
  const toRoster = buildTeamWorkspaceUrl({
    location,
    mode: 'roster',
    sourceInsightId: workspace.insightId,
  })
  const handleRosterSeasonSelect = optionKey => {
    if (isRosterBalance && selectedRosterPlayer) pendingRevealSeasonRef.current = optionKey
    navigate(buildTeamRosterSeasonUrl({ location, optionKey }), {
      state: location.state,
    })
  }
  const defaultStructureFilter = resolveDefaultTeamStructureFilter({
    structure: insightView?.structure,
    rows: insightView?.allPositionClassificationRows || insightView?.positionClassificationRows,
  })
  const [structureFilter, setStructureFilter] = React.useState(defaultStructureFilter)
  const [favoritePlayerKeys, setFavoritePlayerKeys] = React.useState(() => new Set())
  const contentRef = React.useRef(null)
  const teamId = view.team?.birthTeamId || view.team?.id || ''
  React.useLayoutEffect(() => {
    setFavoritePlayerKeys(new Set())
    setSelectedRosterPlayer(null)
    pendingRevealSeasonRef.current = ''
  }, [teamId])
  const handleFavoriteToggle = React.useCallback(row => {
    const key = row?.favoriteKey
    if (!key) return
    setFavoritePlayerKeys(current => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  const handleRosterPlayerSelect = React.useCallback(row => {
    const key = row.favoriteKey || row.id
    setSelectedRosterPlayer(current => current?.key === key ? null : { key, name: row.name })
  }, [])
  React.useEffect(() => {
    if (!pendingRevealSeasonRef.current ||
      pendingRevealSeasonRef.current !== rosterView.selectedSeasonOption?.optionKey ||
      !rosterView.selectedTeamSeason) return
    const selectedRow = rosterView.allPositionClassificationRows?.find(row => (
      (row.favoriteKey || row.id) === selectedRosterPlayer?.key
    ))
    if (selectedRow) {
      if (!selectedRow.structureFilterKeys?.includes(structureFilter)) setStructureFilter(TEAM_STRUCTURE_FILTER.ALL_SQUAD)
      if (!rosterView.positionClassificationRows.some(row => (row.favoriteKey || row.id) === selectedRosterPlayer.key)) {
        onProfileFilterChange?.('all')
      }
    }
    pendingRevealSeasonRef.current = ''
  }, [rosterView, selectedRosterPlayer, structureFilter, onProfileFilterChange])
  const overviewRosterSeasons = React.useMemo(() => buildTeamSeasonTabs({
    seasonOptions,
    seasonSnapshots,
    selectedOptionKey: rosterView.selectedSeasonOption?.optionKey,
    selectedSeasonKey: rosterView.selectedSeasonKey,
  }), [
    seasonOptions,
    seasonSnapshots,
    rosterView.selectedSeasonKey,
    rosterView.selectedSeasonOption?.optionKey,
  ])
  const rosterProps = {
    view,
    tableView: rosterView,
    seasons: overviewRosterSeasons,
    onSeasonSelect: handleRosterSeasonSelect,
    profileFilterKey,
    profileFilterOptions: overviewRosterProfileFilterOptions,
    onProfileFilterChange,
    onPlayerRoleEdit,
    onPlayerOpen,
    structureFilter,
    favoritePlayerKeys,
    onFavoriteToggle: handleFavoriteToggle,
    selectedPlayer: isRosterBalance ? selectedRosterPlayer : null,
    onPlayerSelect: isRosterBalance ? handleRosterPlayerSelect : undefined,
    onSelectionClear: () => setSelectedRosterPlayer(null),
  }
  const workspaceKey = `${view.selectedSeasonKey}:${workspace.mode}:${workspace.insightId}`
  const previousWorkspaceRef = React.useRef({
    mode: workspace.mode,
    insightId: workspace.insightId,
    seasonKey: view.selectedSeasonKey,
  })
  const slideDirection = React.useMemo(() => insightSlideDirection(previousWorkspaceRef.current, {
    mode: workspace.mode,
    insightId: workspace.insightId,
    seasonKey: view.selectedSeasonKey,
  }), [workspace.mode, workspace.insightId, view.selectedSeasonKey])
  React.useLayoutEffect(() => {
    previousWorkspaceRef.current = {
      mode: workspace.mode,
      insightId: workspace.insightId,
      seasonKey: view.selectedSeasonKey,
    }
  }, [workspace.mode, workspace.insightId, view.selectedSeasonKey])
  useScrollToTopOnChange(contentRef, workspaceKey, { behavior: 'auto' })

  React.useEffect(() => {
    // Before stats are loaded, position classification is intentionally not
    // available. Show the persisted roster instead of an empty classified
    // table; once stats exist, retain the focused classified default.
    setStructureFilter(defaultStructureFilter)
  }, [defaultStructureFilter, view.selectedSeasonKey])

  const insightPresentation = buildTeamInsightsPresentation({ view: insightView, club, clubIntelligence })
  const performanceChangeStatus = view.performanceInsight?.changeStatus || 'limited'

  return (
    <Box
      ref={contentRef}
      className='dpScrollThin'
      sx={[sx.content, workspace.mode === 'insight' && sx.contentInsight]}
    >
      <Box key={workspaceKey} sx={sx.workspaceRoute}>
      <TeamWorkspaceNavigation
        workspace={workspace}
        toOverview={toOverview}
        toInsight={toInsight}
      />

      {workspace.mode === 'overview' ? (
        <>
          <Box sx={sx.sectionTiles} aria-label='איתותי הקבוצה'>
            {TEAM_INSIGHTS.map((tile, index) => {
              const tileStatus = tile.id === 'performance'
                ? performanceChangeStatus
                : tile.id === 'roster-balance'
                  ? insightPresentation.rosterBalanceStatus
                  : tile.id === 'year-movements' ? insightPresentation.movementSignal.status
                    : tile.id === 'future-competition' ? insightPresentation.futureCompetitionSignal.status
                      : tile.id === 'club-gap' ? insightPresentation.clubComparison.status : null
              const note = tile.id === 'roster-balance'
                ? insightPresentation.rosterBalanceTitles
                  .map(title => title.replace(/[.!?]+$/, ''))
                  .join(' · ')
                : insightPresentation.signalSummaries[tile.id].replace(/[.!?]+$/, '')
              const reliability = tile.id === 'performance'
                ? view.performanceInsight?.reliability || 'מהימנות הנתונים טרם ידועה'
                : insightPresentation.signalReliability[tile.id]
              const secondaryNote = tile.id === 'performance'
                ? view.performanceInsight?.profileSummary || ''
                : ''
              return (
                <Button
                  key={tile.id}
                  component={Link}
                  to={toInsight(tile.id)}
                  variant='plain'
                  color='neutral'
                  sx={[
                    sx.sectionTile,
                    index < 2 ? sx.sectionTileFirstRow : sx.sectionTileSecondRow,
                    tileStatus && sx.insightTileShadow(tileStatus),
                  ]}
                >
                  <Box sx={sx.sectionTileHeader}>
                    <Box sx={sx.sectionTileIdentity}>
                      <Box className='team-insight-icon' sx={sx.sectionTileIcon}>
                        {iconUi({ id: tile.iconId, size: 'sm' })}
                      </Box>
                      <Box sx={sx.sectionTileCopy}>
                        <Typography sx={sx.sectionTileTitle}>{tile.title}</Typography>
                        <Typography sx={sx.sectionTileSubtitle}>{tile.subtitle}</Typography>
                      </Box>
                    </Box>
                    <Typography sx={[
                      sx.sectionTileAction,
                      tileStatus && sx.insightTileStatus(tileStatus),
                    ]}>
                      {tile.id === 'performance'
                        ? PERFORMANCE_CHANGE_LABELS[performanceChangeStatus]
                        : tile.id === 'roster-balance'
                          ? rosterBalanceTaskLabel(insightPresentation)
                          : tile.id === 'year-movements'
                            ? movementSignalLabel(insightPresentation.movementSignal)
                            : tile.id === 'future-competition'
                              ? insightPresentation.futureCompetitionSignal.label
                              : tile.id === 'club-gap' ? insightPresentation.clubComparison.label
                          : 'לחקירה'}
                    </Typography>
                  </Box>
                  <Box sx={sx.sectionTileBody}>
                    <Typography
                      title={secondaryNote ? `${note} · ${secondaryNote}` : note}
                      sx={sx.sectionTileNotes}
                    >
                      {note}
                      {secondaryNote ? (
                        <Typography component='span' sx={sx.sectionTileSecondaryNote}>
                          {' · '}{secondaryNote}
                        </Typography>
                      ) : null}
                    </Typography>
                    <Typography title={reliability} sx={sx.sectionTileReliability}>
                      {reliability}
                    </Typography>
                  </Box>
                </Button>
              )
            })}
          </Box>
          <Box sx={sx.overviewRoster}>
            <TeamRosterWorkspace
              {...rosterProps}
              overview
              structureFilter={TEAM_STRUCTURE_FILTER.ALL_SQUAD}
            />
          </Box>
        </>
      ) : null}

      {workspace.mode === 'insight' ? (
        <TeamInsightContent
          insightId={workspace.insightId}
          slideDirection={slideDirection}
          view={insightView}
          presentation={insightPresentation}
          structureFilter={structureFilter}
          onStructureFilterChange={setStructureFilter}
          toOverview={toOverview}
          toInsight={toInsight}
          toRoster={toRoster}
          rosterProps={rosterProps}
          rosterComparison={rosterComparison}
          scrollRef={contentRef}
        />
      ) : null}
      {workspace.mode === 'roster' ? (
        <TeamRosterWorkspace {...rosterProps} />
      ) : null}
      </Box>
    </Box>
  )
}
