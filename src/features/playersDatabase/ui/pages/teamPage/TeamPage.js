// features/playersDatabase/ui/pages/teamPage/TeamPage.js

import * as React from 'react'
import { Box, CircularProgress, Typography } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

import { PLAYERS_DATABASE_FAVORITE_TYPES } from '../../../constants/pdb.constants.js'
import { usePlayersDatabaseFavorites } from '../../favorites/index.js'
import PlayersDatabaseLayout from '../../layout/PlayersDatabaseLayout.js'
import { useTeamPage } from '../../hooks/useTeamPage.js'
import {
  buildPlayersDatabaseBreadcrumbs,
  PLAYERS_DATABASE_UI_ROUTES,
} from '../../logic/routeBuilders.js'
import { useSnackbar } from '../../../../../ui/core/feedback/snackbar/SnackbarProvider.js'
import TeamHeader from './TeamHeader.js'
import TeamStatsOverview from './TeamStatsOverview.js'
import TeamPlayersSection from './TeamPlayersSection.js'
import TeamRoleModal from './TeamRoleModal.js'
import { SeasonDeleteConfirmModal, WriteFlowReportModal } from '../../components/modals/index.js'
import PlayerUrlEditDrawer from '../../components/drawers/PlayerUrlEditDrawer.js'
import {
  TeamRosterImportModal,
  TeamStatsImportModal,
} from './TeamImportModals.js'
import useTeamRoleEditor from './hooks/useTeamRoleEditor.js'
import usePlayerUrlEditor from './hooks/usePlayerUrlEditor.js'
import useTeamRosterImport from './hooks/useTeamRosterImport.js'
import useTeamStatsImport from './hooks/useTeamStatsImport.js'
import useTeamStatsColumns from './hooks/useTeamStatsColumns.js'
import useTeamSeasonPlayersDelete from './hooks/useTeamSeasonPlayersDelete.js'
import { ReportPreviewModal } from '../../../../reports/publicApi.js'
import { useTeamReport } from './report/index.js'
import { teamPageSx as sx } from './sx/teamPage.sx.js'

function TeamPageContent() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const favorites = usePlayersDatabaseFavorites()
  const [profileOnly, setProfileOnly] = React.useState(false)
  const {
    leagueId,
    leagueDoc,
    team,
    players,
    hasTeamPlayers,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOptionKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    reload,
    loading,
    error,
    selectionError,
  } = useTeamPage()

  const sharedActionContext = {
    leagueId,
    leagueDoc,
    team,
    selectedSeasonOption,
    notify,
    reload,
  }
  const roleEditor = useTeamRoleEditor(sharedActionContext)
  const playerUrlEditor = usePlayerUrlEditor(sharedActionContext)
  const rosterImport = useTeamRosterImport(sharedActionContext)
  const statsImport = useTeamStatsImport({
    ...sharedActionContext,
    players,
    hasTeamPlayers,
  })
  const playersDelete = useTeamSeasonPlayersDelete(sharedActionContext)
  const statsColumns = useTeamStatsColumns({
    players,
    rosterLookup: statsImport.rosterLookup,
  })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
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
      to: PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
        seasonKey: selectedSeasonKey,
      }),
    },
    {
      label: team.name,
    },
  ])
  const visiblePlayers = React.useMemo(() => {
    const filteredPlayers = !profileOnly
      ? players
      : players.filter(player => (
        Array.isArray(player.scoutProfiles) &&
        player.scoutProfiles.length > 0
      ))

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
    profileOnly,
  ])
  const teamFavorite = favorites.isBirthTeamFavorite(team.birthTeamId)
  const teamFavoritePending = favorites.isFavoritePending(
    PLAYERS_DATABASE_FAVORITE_TYPES.BIRTH_TEAM,
    team.birthTeamId
  )

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

  const handlePlayerFavoriteToggle = React.useCallback(player => {
    if (!player?.playerId) return null

    const payload = {
      favoriteType: PLAYERS_DATABASE_FAVORITE_TYPES.PLAYER,
      entityId: player.playerId,
    }

    if (favorites.isPlayerFavorite(player.playerId)) {
      return favorites.removeFavorite(payload)
    }

    return favorites.addFavorite({
      ...payload,
      displayName: player.fullName,
      birthYear: team.birthYear,
    })
  }, [favorites, team.birthYear])

  const isActiveSeason = selectedSeasonOption?.target === 'current'
  const teamReport = useTeamReport({
    team,
    players: visiblePlayers,
    seasonKey: selectedSeasonKey,
  })

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
        <TeamHeader
          breadcrumbs={breadcrumbs}
          team={team}
          active={isActiveSeason}
          favorite={teamFavorite}
          favoritePending={teamFavoritePending}
          onFavoriteToggle={() => {
            Promise.resolve(handleTeamFavoriteToggle()).catch(() => {})
          }}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onLeague={() => navigate(PLAYERS_DATABASE_UI_ROUTES.league(leagueId, {
            seasonKey: selectedSeasonKey,
          }))}
        />

        <TeamStatsOverview team={team} />

        <TeamPlayersSection
          players={visiblePlayers}
          selectedSeasonKey={selectedSeasonKey}
          selectedSeasonOptionKey={selectedSeasonOptionKey}
          seasonOptions={seasonOptions}
          hasTeamPlayers={hasTeamPlayers}
          profileOnly={profileOnly}
          onSeasonChange={setSelectedSeasonKey}
          onProfileOnlyChange={setProfileOnly}
          onPlayersImport={() => rosterImport.setOpen(true)}
          onStatsImport={() => statsImport.setOpen(true)}
          onDeletePlayers={() => playersDelete.setOpen(true)}
          onReport={teamReport.openPreview}
          onRoleOpen={roleEditor.open}
          onPlayerOpen={row => navigate(PLAYERS_DATABASE_UI_ROUTES.player(
            row.playerDocumentId || row.id
          ))}
          onPlayerUrlEdit={playerUrlEditor.open}
          onFavoriteToggle={handlePlayerFavoriteToggle}
        />
      </Box>

      <ReportPreviewModal
        open={teamReport.open}
        draft={teamReport.draft}
        busy={teamReport.busy}
        publication={teamReport.publication}
        onPublish={teamReport.publish}
        onClose={teamReport.closePreview}
      />

      <PlayerUrlEditDrawer
        open={Boolean(playerUrlEditor.row)}
        row={playerUrlEditor.row}
        seasonLabel={selectedSeasonOption?.seasonKey || selectedSeasonKey}
        saving={playerUrlEditor.saving}
        onSave={playerUrlEditor.save}
        onClose={playerUrlEditor.close}
      />

      <TeamRoleModal
        row={roleEditor.row}
        draft={roleEditor.draft}
        busy={roleEditor.busy}
        changed={roleEditor.changed}
        onDraftChange={roleEditor.setDraft}
        onConfirm={roleEditor.confirm}
        onClose={roleEditor.close}
      />

      <TeamRosterImportModal
        open={rosterImport.open}
        hasTeamPlayers={hasTeamPlayers}
        teamName={team.name}
        seasonKey={selectedSeasonKey}
        rows={rosterImport.rows}
        pasteValue={rosterImport.pasteValue}
        busy={rosterImport.busy}
        onPasteChange={rosterImport.setPasteValue}
        onPaste={rosterImport.parse}
        onCellChange={rosterImport.changeCell}
        onConfirm={rosterImport.confirm}
        onClose={rosterImport.close}
      />

      <TeamStatsImportModal
        open={statsImport.open}
        team={team}
        seasonKey={selectedSeasonKey}
        hasTeamPlayers={hasTeamPlayers}
        columns={statsColumns}
        rows={statsImport.rows}
        pasteValue={statsImport.pasteValue}
        busy={statsImport.busy}
        hasInvalidRows={statsImport.hasInvalidRows}
        seasonStatus={statsImport.seasonStatus}
        onSeasonStatusChange={statsImport.changeSeasonStatus}
        onPasteChange={statsImport.setPasteValue}
        onPaste={statsImport.parse}
        onClear={statsImport.clearPaste}
        onCellChange={statsImport.changeCell}
        getRowStatus={statsImport.getRowStatus}
        onConfirm={statsImport.confirm}
        onClose={statsImport.close}
      />


      <SeasonDeleteConfirmModal
        open={playersDelete.open}
        title='מחיקת שחקני העונה'
        description='כל השחקנים והסטטיסטיקה שלהם יוסרו מהקבוצה בעונה הנבחרת בלבד.'
        seasonKey={selectedSeasonKey}
        busy={playersDelete.busy}
        confirmLabel='מחיקת שחקני העונה'
        onConfirm={playersDelete.confirm}
        onClose={playersDelete.close}
      />

      <WriteFlowReportModal
        open={Boolean(playersDelete.writeReport)}
        report={playersDelete.writeReport}
        onClose={playersDelete.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(rosterImport.writeReport)}
        report={rosterImport.writeReport}
        onClose={rosterImport.closeWriteReport}
      />

      <WriteFlowReportModal
        open={Boolean(statsImport.writeReport)}
        report={statsImport.writeReport}
        onClose={statsImport.closeWriteReport}
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
