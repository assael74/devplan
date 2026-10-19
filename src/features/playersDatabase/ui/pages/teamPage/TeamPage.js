// src/features/playersDatabase/ui/pages/teamPage/TeamPage.js

import * as React from 'react'
import {
  Box,
  CircularProgress,
  Typography,
} from '@mui/joy'
import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useTeamPage } from './hooks/useTeamPage.js'
import useTeamClubIntelligence from './hooks/useTeamClubIntelligence.js'
import usePlayersDatabaseTasks from '../../hooks/usePlayersDatabaseTasks.js'
import usePlayersDatabaseTaskActions from '../../hooks/usePlayersDatabaseTaskActions.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_QUERY_KEYS as queryKeys,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { PLAYER_STATS_STATUS } from '../../../model/player/playerStats.model.js'
import { findTeamPageSeasonDoc } from '../../../model/team/page/teamPageSeason.model.js'
import { hasTeamNoteContent } from '../../../model/team/teamNotes.model.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import TeamHeader from './TeamHeader.js'
import TeamActionsPanel from './TeamActionsPanel.js'
import TeamNotebookDrawer from './notes/TeamNotebookDrawer.js'
import { saveTeamNotes } from '../../../services/write/team/saveTeamNotes.js'
import TeamInformationOverview from './information/components/TeamInformationOverview.js'
import { buildTeamInformationView } from './information/model/teamInformation.model.js'
import { buildTeamWorkspaceSeasonContext } from './information/model/teamWorkspaceSeason.model.js'
import { resolveTeamWorkspace } from './information/model/teamWorkspace.navigation.js'
import {
  buildTeamProfileFilterOptions,
  filterTeamPlayersByProfile,
} from './model/teamPlayerFilters.model.js'
import {
  PlayerRoleEditModal,
  TaskEditModal,
  WorkTaskModal,
} from '../../components/modals/index.js'
import TeamUrlEditDrawer from '../../components/drawers/TeamUrlEditDrawer.js'
import PlayerSeasonDetailsDrawer from '../../components/drawers/PlayerSeasonDetailsDrawer.js'
import useTeamRoleEditor from './hooks/useTeamRoleEditor.js'
import { updatePlayerRole } from '../../../services/write/player/edits/updatePlayerRootManual.js'
import { updatePlayerSeasonDetails } from '../../../services/write/roster/edits/updatePlayerShirtNumber.js'
import { SNACK_STATUS } from '../../../../../ui/core/feedback/snackbar/snackbar.model.js'
import useTeamPageUrlEditor from './hooks/useTeamPageUrlEditor.js'
import useTeamRosterImport from './roster/import/hooks/useTeamRosterImport.js'
import RosterImportModal from './roster/import/components/RosterImportModal.js'
import useTeamStatsImport from './stats/import/hooks/useTeamStatsImport.js'
import StatsImportModal from './stats/import/components/StatsImportModal.js'
import useTeamPageTasks from './hooks/useTeamPageTasks.js'
import useTeamStatsColumns from './stats/table/hooks/useTeamStatsColumns.js'
import useClearRosterFlow from './roster/clear/useClearRosterFlow.js'
import ClearRosterModal from './roster/clear/ClearRosterModal.js'
import { resolveNextTeamSeasonDeleteAction } from './roster/clear/rosterDeleteAction.model.js'
import useClearStatsFlow from './stats/clear/hooks/useClearStatsFlow.js'
import ClearStatsModal from './stats/clear/components/ClearStatsModal.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import useTeamReport from './report/useTeamReport.js'
import { pageCoreLayoutSx } from '../../components/page/sx/pageCoreLayout.sx.js'
import usePageSidePanelCollapsed from '../../components/page/usePageSidePanelCollapsed.js'
import { teamPageSx } from './sx/teamPage.sx.js'
import {
  downloadTeamPageDocumentsJson,
} from './logic/teamDocumentsJson.logic.js'

const sx = {
  ...pageCoreLayoutSx,
  ...teamPageSx,
}
const cleanKey = value => String(value || '').trim()

const buildSeasonInformationView = ({
  seasonContext,
  seasonOption,
  selectedSeasonKey,
  seasonOptions,
  seasonSnapshots,
  clubsDirectory,
  profileFilterKey,
}) => buildTeamInformationView({
  team: seasonContext.team,
  teamSeasons: seasonSnapshots,
  selectedTeamSeason: seasonContext.season,
  selectedSeasonKey: seasonOption?.seasonKey || selectedSeasonKey,
  selectedSeasonOption: seasonOption,
  seasonOptions,
  clubsDirectory,
  players: seasonContext.visiblePlayers,
  playerIdsFilter: profileFilterKey === 'all' ? null : seasonContext.visiblePlayers.map(player => (
    player.playerId || player.id
  )).filter(Boolean),
})

function TeamPageContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const tasksModel = usePlayersDatabaseTasks()
  const taskActions = usePlayersDatabaseTaskActions()
  const [profileFilterKey, setProfileFilterKey] = React.useState('all')
  const [notebookOpen, setNotebookOpen] = React.useState(false)
  const [playerDetailsEdit, setPlayerDetailsEdit] = React.useState(null)
  const [detailsSaving, setDetailsSaving] = React.useState(false)
  const [sidePanelCollapsed, setSidePanelCollapsed] = usePageSidePanelCollapsed(
    'playersDatabase:teamSidePanelCollapsed'
  )
  const {
    leagueId,
    leagueDoc,
    leagueDocuments,
    team,
    teamDoc,
    teamSeasons,
    seasonSnapshots,
    clubDoc,
    clubsDirectory,
    players,
    leaguesCenterDocument,
    hasTeamPlayers,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    selectedLeagueSeason,
    selectedTeamSeason,
    reload,
    loading,
    error,
    refreshError,
    selectionError,
  } = useTeamPage()
  const notebookMentionOptions = React.useMemo(() => {
    const byId = new Map()
    const addPlayer = (playerId, player) => {
      const id = String(playerId || '').trim()
      const label = String(player?.fullName || player?.name || '').trim()
      if (!id || !label) return
      byId.set(id, {
        id,
        label,
        href: PLAYERS_DATABASE_UI_ROUTES.player({
          playerId: id,
          teamId: team?.birthTeamId || team?.id,
          leagueId,
        }),
      })
    }

    teamSeasons.forEach(season => {
      Object.entries(season?.roster?.playersById || {}).forEach(([id, player]) => addPlayer(id, player))
    })
    players.forEach(player => addPlayer(player.playerId || player.id, player))
    return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label, 'he'))
  }, [leagueId, players, team?.birthTeamId, team?.id, teamSeasons])
  const workspace = React.useMemo(
    () => resolveTeamWorkspace(location.search),
    [location.search]
  )
  const workspaceSeasonOption = React.useMemo(() => (
    workspace.mode === 'overview' || new URLSearchParams(location.search).has('signalSeason')
      ? selectedSeasonOption
      : seasonOptions.find(option => option.target === 'current') ||
        seasonOptions.find(option => option.target !== 'future') ||
        seasonOptions[0]
  ), [location.search, seasonOptions, selectedSeasonOption, workspace.mode])
  const overviewRosterSeasonOption = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    const optionKey = params.get('rosterSeason') || params.get('analysisSeason') || ''
    return seasonOptions.find(option => option.optionKey === optionKey) || workspaceSeasonOption
  }, [location.search, seasonOptions, workspaceSeasonOption])
  const {
    intelligence: clubIntelligence,
    sources: clubSources,
    loading: clubSourcesLoading,
  } = useTeamClubIntelligence({
    clubId: team?.clubId,
    club: clubDoc,
    seasonOption: workspaceSeasonOption,
    seasonOptions,
  })
  const statsImportRequest = React.useMemo(() => {
    const params = new URLSearchParams(location.search)

    return {
      requested: params.get('openStatsImport') === '1',
      seasonKey: cleanKey(params.get('auditSeason')),
    }
  }, [location.search])
  const handledStatsImportRequestRef = React.useRef('')
  const rosterImportRequest = React.useMemo(() => {
    const params = new URLSearchParams(location.search)
    return {
      requested: params.get('openRosterImport') === '1',
      repairReload: params.get('repairReload') === '1',
      seasonKey: cleanKey(params.get('auditSeason')),
    }
  }, [location.search])
  const handledRosterImportRequestRef = React.useRef('')

  const selectedLeagueDocument = selectedLeagueSeason?.leagueDoc || leagueDoc
  const sharedActionContext = {
    leagueId,
    leagueDoc: selectedLeagueDocument,
    leagueDocuments,
    team,
    selectedTeamSeason,
    selectedSeasonOption,
    seasonOptions,
    clubsDirectory,
    notify,
  }
  const roleEditor = useTeamRoleEditor(sharedActionContext)
  const teamUrlEditor = useTeamPageUrlEditor(sharedActionContext)
  const rosterImport = useTeamRosterImport({
    ...sharedActionContext,
    teamSeasons,
    repairReload: rosterImportRequest.repairReload,
  })
  const openRosterImportModal = rosterImport.openModal
  React.useEffect(() => {
    if (!rosterImportRequest.requested || loading || !selectedSeasonOption) return
    if (rosterImportRequest.seasonKey && selectedSeasonOption.seasonKey !== rosterImportRequest.seasonKey) return
    const requestKey = `${leagueId}:${team.id}:${selectedSeasonOption.seasonId}`
    if (handledRosterImportRequestRef.current === requestKey) return
    handledRosterImportRequestRef.current = requestKey
    openRosterImportModal()
  }, [leagueId, loading, openRosterImportModal, rosterImportRequest, selectedSeasonOption, team.id])
  const statsImport = useTeamStatsImport({
    ...sharedActionContext,
    teamDoc,
    teamSeasons,
  })
  React.useEffect(() => {
    if (!statsImportRequest.requested || loading) return
    if (!selectedSeasonOption || !statsImport.hasTeamPlayers) return
    if (statsImportRequest.seasonKey &&
        cleanKey(selectedSeasonOption.seasonKey) !== statsImportRequest.seasonKey) return

    const requestKey = [
      cleanKey(team?.birthTeamDocumentId || team?.teamDocumentId || team?.id),
      cleanKey(selectedSeasonOption.seasonKey),
    ].join('::')

    if (!requestKey || handledStatsImportRequestRef.current === requestKey) return

    handledStatsImportRequestRef.current = requestKey
    statsImport.openModal()
  }, [
    loading,
    selectedSeasonOption,
    statsImport.hasTeamPlayers,
    statsImport.openModal,
    statsImportRequest,
    team,
  ])
  const statsDelete = useClearStatsFlow({
    team,
    selectedSeasonOption,
    leagueId,
  })
  const deleteSeasonOptions = React.useMemo(() => {
    return seasonOptions.map(option => {
      const season = findTeamPageSeasonDoc({
        teamSeasons,
        selectedSeasonOption: option,
      })
      if (!season) return null

      return {
        ...option,
        deleteAction: resolveNextTeamSeasonDeleteAction({
          teamId: cleanKey(team?.birthTeamId || team?.teamId || team?.id),
          seasonId: option.seasonId,
          leagueId: option.leagueId || leagueId,
          teamSeason: season,
        }),
      }
    }).filter(option => Boolean(option?.deleteAction))
  }, [leagueId, seasonOptions, team, teamSeasons])
  const playersDelete = useClearRosterFlow({
    team,
    selectedSeasonOption,
    leagueId,
    refreshAfterStats: statsDelete.status,
  })
  const teamPageTasks = useTeamPageTasks({
    team,
    selectedSeasonKey,
    tasksModel,
    taskActions,
  })
  const statsColumns = useTeamStatsColumns({
    players: statsImport.players,
    rosterLookup: statsImport.rosterLookup,
    teamRootOptions: statsImport.teamRootOptions,
    getRowStatus: statsImport.getRowStatus,
    getCellStatus: statsImport.getCellStatus,
  })

  const pageSearchParams = React.useMemo(
    () => new URLSearchParams(location.search),
    [location.search]
  )
  const fromLeaguePath = pageSearchParams.get(queryKeys.fromLeague) || pageSearchParams.get('fromLeague') || ''
  const fromClubs = (pageSearchParams.get(queryKeys.fromClubs) || pageSearchParams.get('fromClubs')) === '1'
  const leagueFallbackPath = PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
    seasonKey: selectedSeasonKey,
  })
  const leagueBackPath = fromClubs
    ? PLAYERS_DATABASE_UI_ROUTES.clubs
    : fromLeaguePath || leagueFallbackPath
  const breadcrumbs = buildPlayersDatabaseBreadcrumbs(fromClubs
    ? [
      {
        label: 'מועדונים',
        to: PLAYERS_DATABASE_UI_ROUTES.clubs,
      },
      { label: team.name },
    ]
    : [
      {
        label: 'מרכז ליגות',
        to: PLAYERS_DATABASE_UI_ROUTES.leagues({
          seasonKey: selectedSeasonKey,
          birthYear: team.birthYear,
          level: team.league?.leagueLevel || team.leagueLevel,
        }),
      },
      {
        label: team.leagueName,
        to: leagueBackPath,
      },
      { label: team.name },
    ])
  const visiblePlayers = React.useMemo(() => {
    const filteredPlayers = filterTeamPlayersByProfile({
      players,
      profileFilterKey,
      profileOnly: profileFilterKey !== 'all',
    })

    return filteredPlayers.map(player => ({
      ...player,
      favorite: favorites.isPlayerFavorite(player.playerId),
      favoritePending: favorites.isFavoritePending(
        PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
        player.playerId
      ),
    }))
  }, [
    favorites.pendingKeysRevision,
    favorites.playerFavoritesMap,
    players,
    profileFilterKey,
  ])
  const handleProfileFilterChange = React.useCallback(nextValue => {
    const value = cleanKey(nextValue) || 'all'

    setProfileFilterKey(value)
  }, [])
  const seasonContexts = React.useMemo(() => {
    const source = {
      selectedSeasonOption,
      team,
      selectedTeamSeason,
      players,
      clubsDirectory,
      leagueDoc,
      leagueDocuments,
      teamDoc,
      teamSeasons,
    }
    const buildContext = seasonOption => {
      const context = buildTeamWorkspaceSeasonContext({ ...source, seasonOption })
      if (!seasonOption || seasonOption.optionKey === selectedSeasonOption?.optionKey) {
        return { ...context, visiblePlayers }
      }

      return {
        ...context,
        visiblePlayers: filterTeamPlayersByProfile({
          players: context.players,
          profileFilterKey,
          profileOnly: profileFilterKey !== 'all',
        }).map(player => ({
          ...player,
          favorite: favorites.isPlayerFavorite(player.playerId),
          favoritePending: favorites.isFavoritePending(
            PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
            player.playerId
          ),
        })),
      }
    }
    const workspaceContext = buildContext(workspaceSeasonOption)
    const rosterContext = overviewRosterSeasonOption?.optionKey !== workspaceSeasonOption?.optionKey
      ? buildContext(overviewRosterSeasonOption)
      : workspaceContext

    const comparisonContext = seasonKey => {
      const option = seasonOptions.find(item => item.seasonKey === seasonKey)
      return option ? buildContext(option) : null
    }
    return {
      workspace: workspaceContext,
      roster: rosterContext,
      comparison: { current: comparisonContext('26/27'), previous: comparisonContext('25/26') },
    }
  }, [
    clubsDirectory,
    favorites.pendingKeysRevision,
    favorites.playerFavoritesMap,
    leagueDoc,
    leagueDocuments,
    overviewRosterSeasonOption,
    seasonOptions,
    players,
    profileFilterKey,
    selectedSeasonOption,
    selectedTeamSeason,
    team,
    teamDoc,
    teamSeasons,
    visiblePlayers,
    workspaceSeasonOption,
  ])
  const workspaceSeasonContext = seasonContexts.workspace
  const overviewRosterSeasonContext = seasonContexts.roster
  const teamInformationView = React.useMemo(() => buildSeasonInformationView({
    seasonContext: workspaceSeasonContext,
    seasonOption: workspaceSeasonOption,
    selectedSeasonKey,
    seasonOptions,
    seasonSnapshots,
    clubsDirectory,
    profileFilterKey,
  }), [
    clubsDirectory,
    profileFilterKey,
    selectedSeasonKey,
    seasonOptions,
    seasonSnapshots,
    workspaceSeasonContext,
    workspaceSeasonOption,
  ])
  const overviewRosterView = React.useMemo(() => {
    if (overviewRosterSeasonContext === workspaceSeasonContext) return teamInformationView

    return buildSeasonInformationView({
      seasonContext: overviewRosterSeasonContext,
      seasonOption: overviewRosterSeasonOption,
      selectedSeasonKey,
      seasonOptions,
      seasonSnapshots,
      clubsDirectory,
      profileFilterKey,
    })
  }, [
    clubsDirectory,
    overviewRosterSeasonContext,
    overviewRosterSeasonOption,
    profileFilterKey,
    seasonOptions,
    seasonSnapshots,
    selectedSeasonKey,
    teamInformationView,
    workspaceSeasonContext,
  ])
  const overviewRosterProfileFilterOptions = React.useMemo(() => (
    buildTeamProfileFilterOptions(overviewRosterSeasonContext.players)
  ), [overviewRosterSeasonContext.players])
  const hasTeamStats = React.useMemo(() => (
    players.some(player => (
      player.statsStatus === PLAYER_STATS_STATUS.LOADED ||
      Number(player.games || 0) > 0 ||
      Number(player.minutes || 0) > 0
    ))
  ), [players])
  const teamFavorite = favorites.isBirthTeamFavorite(team.birthTeamId)
  const teamFavoritePending = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
    team.birthTeamId
  )

  const handleDownloadJson = React.useCallback(() => {
    downloadTeamPageDocumentsJson({
      clubsDirectoryDocument: clubsDirectory,
      leaguesCenterDocument,
      leagueDocument: selectedLeagueDocument,
      leagueDocuments,
      teamDocument: teamDoc,
      teamSeasons,
      clubSources,
      pageName: [team.name, team.birthYear].filter(Boolean).join(' '),
    })
  }, [clubsDirectory, clubSources, leagueDocuments, leaguesCenterDocument, selectedLeagueDocument, teamDoc, teamSeasons, team.name, team.birthYear])

  const handleNotebookSave = React.useCallback(async draft => {
    await saveTeamNotes(draft)
    try {
      await reload()
      notify({ status: SNACK_STATUS.SUCCESS, title: 'המחברת נשמרה' })
    } catch {
      notify({
        status: SNACK_STATUS.SUCCESS,
        title: 'המחברת נשמרה',
        message: 'הרענון נכשל; הנתונים יופיעו בטעינה הבאה',
      })
    }
  }, [notify, reload])

  const handleBackToLeague = () => {
    navigate(leagueBackPath, {
      replace: true,
      state: null,
    })
  }

  const handleTeamFavoriteToggle = React.useCallback(() => {
    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
      entityId: team.birthTeamId,
    }

    if (!team.birthTeamId) return null
    if (favorites.isBirthTeamFavorite(team.birthTeamId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: team.name,
      birthYear: team.birthYear,
    })
  }, [favorites, team.birthTeamId, team.birthYear, team.name])

  const teamReport = useTeamReport({
    team,
    players: visiblePlayers,
    seasonKey: selectedSeasonKey,
  })
  const handlePlayerOpen = React.useCallback((row, seasonKey = '') => {
    const source = row?.player || row || {}
    const playerId = source.playerId || source.id
    if (!playerId) return
    const movementSeasonOption = seasonKey
      ? seasonOptions.find(option => option.seasonKey === seasonKey)
      : null
    const playerContext = movementSeasonOption
      ? buildTeamWorkspaceSeasonContext({
        seasonOption: movementSeasonOption,
        selectedSeasonOption,
        team,
        selectedTeamSeason,
        players,
        clubsDirectory,
        leagueDoc,
        leagueDocuments,
        teamDoc,
        teamSeasons,
      })
      : overviewRosterSeasonContext
    const playerSeasonOption = movementSeasonOption || overviewRosterSeasonOption

    navigate(
      PLAYERS_DATABASE_UI_ROUTES.player({
        playerId,
        seasonKey: seasonKey || undefined,
        teamId: playerContext.team.birthTeamId || team.id,
        leagueId: playerSeasonOption?.leagueId || leagueId,
        fromTeam: `${location.pathname}${location.search}`,
      }),
      {
        state: {
          playerTeamSource: {
            team: playerContext.team,
            teamDoc,
            selectedTeamSeason: playerContext.season,
          },
        },
      }
    )
  }, [
    clubsDirectory,
    leagueId,
    leagueDoc,
    leagueDocuments,
    location.pathname,
    location.search,
    navigate,
    overviewRosterSeasonContext,
    overviewRosterSeasonOption,
    players,
    seasonOptions,
    selectedSeasonOption,
    selectedTeamSeason,
    team,
    teamDoc,
    teamSeasons,
  ])

  const openPlayerDetails = React.useCallback((row, season) => {
    const playerId = cleanKey(row?.player?.playerId || row?.id)
    const rosterPlayer = season?.roster?.playersById?.[playerId]
    if (!rosterPlayer || season?.stats?.statsLoadState?.status !== 'loaded') return
    setPlayerDetailsEdit({
      playerId,
      playerName: row.name,
      identity: season.identity,
      seasonLabel: season.identity?.seasonKey || '',
      original: {
        numShirt: rosterPlayer.numShirt === null || rosterPlayer.numShirt === undefined ? '' : String(rosterPlayer.numShirt),
        playerUrl: season.manual?.playersById?.[playerId]?.playerUrl || '',
        primaryPosition: row.primaryPosition || '',
        positionLayer: row.positionLayer || '',
      },
    })
  }, [])

  const findPlayerDetailsSeason = React.useCallback((row, preferredSeasonKey) => {
    const playerId = cleanKey(row?.player?.playerId || row?.playerId || row?.id)
    const key = cleanKey(preferredSeasonKey)
    const seasonYear = value => {
      const match = cleanKey(value).match(/^(?:20)?(\d{2})[/_-]/)
      return match ? Number(match[1]) : -1
    }
    const eligible = teamSeasons.filter(season => (
      season?.roster?.playersById?.[playerId] && season?.stats?.statsLoadState?.status === 'loaded'
    ))
    const selected = eligible.find(season => cleanKey(season.identity?.seasonKey) === key)
    if (selected || row?.side !== 'out') return selected || null
    return eligible
      .find(season => seasonYear(season.identity?.seasonKey) === seasonYear(key) - 1) || null
  }, [teamSeasons])

  const savePlayerDetails = React.useCallback(async (draft, changed) => {
    if (!playerDetailsEdit || detailsSaving || !Object.values(changed).some(Boolean)) return
    setDetailsSaving(true)
    try {
      const seasonDetails = {
        ...playerDetailsEdit.identity,
        playerId: playerDetailsEdit.playerId,
        ...(changed.numShirt ? { numShirt: String(draft.numShirt || '').trim() } : {}),
        ...(changed.playerUrl ? { playerUrl: String(draft.playerUrl || '').trim() } : {}),
      }
      if (changed.primaryPosition || changed.positionLayer) {
        await updatePlayerRole({
          playerId: playerDetailsEdit.playerId,
          primaryPosition: draft.primaryPosition,
          positionLayer: draft.positionLayer,
          seasonDetails: changed.numShirt || changed.playerUrl ? seasonDetails : null,
        })
      } else {
        await updatePlayerSeasonDetails(seasonDetails)
      }
      setPlayerDetailsEdit(null)
      notify({ status: SNACK_STATUS.SUCCESS, title: 'פרטי השחקן נשמרו', message: playerDetailsEdit.playerName })
      try {
        await reload()
      } catch {
        notify({ status: SNACK_STATUS.ERROR, title: 'השינויים נשמרו', message: 'רענון העמוד נכשל; הנתונים יופיעו בטעינה הבאה' })
      }
    } catch (error) {
      notify({ status: SNACK_STATUS.ERROR, title: 'שמירת פרטי השחקן נכשלה', message: error?.message || 'לא בוצעה שמירה' })
    } finally {
      setDetailsSaving(false)
    }
  }, [notify, reload, detailsSaving, playerDetailsEdit])

  if (loading) {
    return (
      <Box sx={sx.loadingState}>
        <CircularProgress size='sm' />
        <Typography level='body-sm'>טוען את גרסת הקבוצה...</Typography>
      </Box>
    )
  }

  if (error || selectionError) {
    return (
      <Box sx={sx.loadingState}>
        <Typography level='body-sm'>{error || selectionError}</Typography>
      </Box>
    )
  }

  return (
    <>
      <Box sx={sx.page}>
        {refreshError ? (
          <Typography level='body-sm' color='warning'>
            הרענון נכשל. מוצגים הנתונים האחרונים שנטענו.
          </Typography>
        ) : null}
        <TeamHeader
          breadcrumbs={breadcrumbs}
          team={team}
          clubUrl={clubDoc?.clubUrl || ''}
          clubLevel={clubDoc?.clubLevel}
          favorite={teamFavorite}
          favoritePending={teamFavoritePending}
          onFavoriteToggle={() => {
            Promise.resolve(handleTeamFavoriteToggle()).catch(() => {})
          }}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onLeague={handleBackToLeague}
          backLabel={fromClubs ? 'חזרה למועדונים' : 'חזרה לליגה'}
        />

        <Box sx={[sx.contentGrid, sidePanelCollapsed && sx.contentGridCollapsed]}>
          <Box sx={sx.mainColumn}>
            <TeamInformationOverview
              view={teamInformationView}
              overviewRosterView={overviewRosterView}
              rosterComparison={seasonContexts.comparison}
              club={clubDoc}
              clubIntelligence={clubIntelligence}
              seasonSnapshots={seasonSnapshots}
              seasonOptions={seasonOptions}
              profileFilterKey={profileFilterKey}
              overviewRosterProfileFilterOptions={overviewRosterProfileFilterOptions}
              onProfileFilterChange={handleProfileFilterChange}
              onPlayerRoleEdit={roleEditor.open}
              onPlayerDetailsEdit={openPlayerDetails}
              findPlayerDetailsSeason={findPlayerDetailsSeason}
              onPlayerOpen={handlePlayerOpen}
            />
          </Box>

          <TeamActionsPanel
            collapsible
            collapsed={sidePanelCollapsed}
            onCollapsedChange={setSidePanelCollapsed}
            selectedSeasonOptionKey={selectedSeasonOptionKey}
            seasonOptions={seasonOptions}
            hasTeamPlayers={hasTeamPlayers}
            hasTeamStats={hasTeamStats}
            onPlayersImport={rosterImport.openModal}
            onStatsImport={statsImport.openModal}
            onDeleteStats={statsDelete.openModal}
            onDeletePlayers={playersDelete.openModal}
            deleteSeasonOptions={deleteSeasonOptions}
            getDeleteActionFor={playersDelete.getDeleteActionFor}
            deleteActionsError={playersDelete.deleteActionsError}
            onReport={teamReport.openPreview}
            onTeamLink={teamUrlEditor.openDrawer}
            onNotebookOpen={() => setNotebookOpen(true)}
            hasTeamRoot={Boolean(teamDoc)}
            hasNotebookNote={hasTeamNoteContent(teamDoc?.notes)}
            hasOpenTasks={!tasksModel.loading && teamPageTasks.tasks.length > 0}
            onDownloadJson={handleDownloadJson}
            jsonDownloadDisabled={clubSourcesLoading || Boolean(
              !selectedLeagueDocument &&
              !leagueDocuments.length &&
              !(clubsDirectory && clubsDirectory.documentExists !== false) &&
              !(leaguesCenterDocument && leaguesCenterDocument.documentExists !== false) &&
              !clubSources &&
              !teamDoc &&
              !teamSeasons.length
            )}
            tasks={teamPageTasks.tasks}
            tasksLoading={tasksModel.loading}
            onTaskCreate={teamPageTasks.openCreate}
            onTaskEdit={teamPageTasks.openEdit}
          />
        </Box>
      </Box>

      <ReportPreviewModal
        open={teamReport.open}
        draft={teamReport.draft}
        busy={teamReport.busy}
        publication={teamReport.publication}
        onPublish={teamReport.publish}
        onClose={teamReport.closePreview}
      />

      <TaskEditModal
        open={Boolean(teamPageTasks.editTask)}
        task={teamPageTasks.editTask}
        busy={teamPageTasks.pending}
        onSave={teamPageTasks.saveEdit}
        onDone={teamPageTasks.markDone}
        onClose={teamPageTasks.closeEdit}
      />

      <WorkTaskModal
        open={teamPageTasks.createOpen}
        mode='team'
        onClose={teamPageTasks.closeCreate}
      />

      <TeamUrlEditDrawer
        open={teamUrlEditor.open}
        rows={teamUrlEditor.rows}
        entityName={team.name}
        saving={teamUrlEditor.saving}
        onChange={teamUrlEditor.change}
        onSave={teamUrlEditor.save}
        onClose={teamUrlEditor.close}
      />

      <TeamNotebookDrawer
        open={notebookOpen}
        onClose={() => setNotebookOpen(false)}
        onSave={handleNotebookSave}
        teamId={team.birthTeamId || team.id}
        teamName={team.name}
        birthYear={team.birthYear}
        notes={teamDoc?.notes}
        mentionOptions={notebookMentionOptions}
        initialInsightId={workspace.insightId || workspace.sourceInsightId}
      />

      <PlayerRoleEditModal
        open={Boolean(roleEditor.row)}
        playerName={roleEditor.row?.fullName || ''}
        draft={roleEditor.draft}
        busy={roleEditor.busy}
        changed={roleEditor.changed}
        onDraftChange={roleEditor.setDraft}
        onConfirm={roleEditor.confirm}
        onClose={roleEditor.close}
      />

      <PlayerSeasonDetailsDrawer
        open={Boolean(playerDetailsEdit)}
        playerName={playerDetailsEdit?.playerName || ''}
        seasonLabel={playerDetailsEdit?.seasonLabel || ''}
        value={playerDetailsEdit?.original}
        saving={detailsSaving}
        onSave={savePlayerDetails}
        onClose={() => setPlayerDetailsEdit(null)}
      />

      <RosterImportModal
        team={team}
        seasonKey={rosterImport.selectedSeasonOption?.seasonKey}
        activeSeasonOptionKey={selectedSeasonOptionKey}
        hasTeamPlayers={hasTeamPlayers}
        controller={rosterImport}
      />

      <StatsImportModal
        team={team}
        seasonKey={statsImport.selectedSeasonOption?.seasonKey}
        activeSeasonOptionKey={selectedSeasonOptionKey}
        hasTeamPlayers={statsImport.hasTeamPlayers}
        columns={statsColumns}
        source={{
          teamUrl:
            statsImport.selectedSeasonOption?.season?.teamUrl ||
            selectedTeamSeason?.teamUrl ||
            team.teamUrl ||
            team.domain?.metadata?.teamUrl ||
            team.metadata?.teamUrl ||
            selectedSeasonOption?.season?.teamUrl ||
            '',
          leagueName:
            statsImport.selectedSeasonOption?.leagueName ||
            selectedSeasonOption?.leagueName ||
            team.leagueName ||
            '',
          leagueUrl:
            statsImport.selectedSeasonOption?.season?.seasonUrl ||
            statsImport.selectedSeasonOption?.season?.leagueUrl ||
            selectedLeagueSeason?.season?.seasonUrl ||
            selectedLeagueSeason?.season?.leagueUrl ||
            selectedSeasonOption?.season?.seasonUrl ||
            selectedSeasonOption?.season?.leagueUrl ||
            team.domain?.metadata?.seasonUrl ||
            team.metadata?.seasonUrl ||
            selectedLeagueDocument?.leagueUrl ||
            '',
        }}
        controller={statsImport}
      />


      <ClearStatsModal
        controller={statsDelete}
        teamName={team?.name || team?.teamName}
        seasonKey={statsDelete.target?.seasonKey || selectedSeasonOption?.seasonKey}
      />

      <ClearRosterModal
        controller={playersDelete}
        teamName={team?.name || team?.teamName}
        seasonKey={playersDelete.target?.seasonKey || selectedSeasonOption?.seasonKey}
      />

    </>
  )
}

export default function TeamPage() {
  return (
    <PlayersDatabaseLayout>
      <TeamPageContent />
    </PlayersDatabaseLayout>
  )
}
