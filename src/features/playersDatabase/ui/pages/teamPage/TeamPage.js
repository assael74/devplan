// features/playersDatabase/ui/pages/teamPage/TeamPage.js

import * as React from 'react'
import { Box } from '@mui/joy'
import { useNavigate } from 'react-router-dom'

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
import { teamPageSx as sx } from './sx/teamPage.sx.js'

export default function TeamPage() {
  const navigate = useNavigate()
  const { notify } = useSnackbar()
  const [profileOnly, setProfileOnly] = React.useState(false)
  const {
    leagueId,
    leagueDoc,
    team,
    players,
    hasTeamPlayers,
    seasonOptions,
    selectedSeasonKey,
    selectedSeasonOption,
    setSelectedSeasonKey,
    reload,
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
  const statsColumns = useTeamStatsColumns({
    players,
    rosterLookup: statsImport.rosterLookup,
  })

  const breadcrumbs = buildPlayersDatabaseBreadcrumbs([
    {
      label: 'מרכז ליגות',
      to: PLAYERS_DATABASE_UI_ROUTES.leagues,
    },
    {
      label: team.leagueName,
      to: PLAYERS_DATABASE_UI_ROUTES.league(leagueId),
    },
    {
      label: team.name,
    },
  ])
  const visiblePlayers = React.useMemo(() => {
    if (!profileOnly) return players

    return players.filter(player => (
      Array.isArray(player.scoutProfiles) &&
      player.scoutProfiles.length > 0
    ))
  }, [players, profileOnly])
  const isActiveSeason = selectedSeasonOption?.target === 'current'

  return (
    <PlayersDatabaseLayout>
      <Box sx={sx.page}>
        <TeamHeader
          breadcrumbs={breadcrumbs}
          team={team}
          active={isActiveSeason}
          onSearch={() => navigate(PLAYERS_DATABASE_UI_ROUTES.search)}
          onLeague={() => navigate(PLAYERS_DATABASE_UI_ROUTES.league(leagueId))}
        />

        <TeamStatsOverview team={team} />

        <TeamPlayersSection
          players={visiblePlayers}
          selectedSeasonKey={selectedSeasonKey}
          seasonOptions={seasonOptions}
          hasTeamPlayers={hasTeamPlayers}
          profileOnly={profileOnly}
          onSeasonChange={setSelectedSeasonKey}
          onProfileOnlyChange={setProfileOnly}
          onPlayersImport={() => rosterImport.setOpen(true)}
          onStatsImport={() => statsImport.setOpen(true)}
          onRoleOpen={roleEditor.open}
          onPlayerOpen={row => navigate(PLAYERS_DATABASE_UI_ROUTES.player(row.id))}
          onPlayerUrlEdit={playerUrlEditor.open}
        />
      </Box>

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
        onPasteChange={statsImport.setPasteValue}
        onPaste={statsImport.parse}
        onCellChange={statsImport.changeCell}
        getRowStatus={statsImport.getRowStatus}
        onConfirm={statsImport.confirm}
        onClose={statsImport.close}
      />
    </PlayersDatabaseLayout>
  )
}
