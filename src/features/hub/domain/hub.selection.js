// src/features/hub/domain/hub.selection.js

export function createHubSelectionHandlers({
  MODE,
  playersUi,
  clubsById,
  teamsById,
  setMode,
  setDrawerOpen,
  setSelectedPlayer,
  setPreviewSelection,
}) {
  const resetPlayerSelection = () => {
    setSelectedPlayer(null)
    setDrawerOpen(false)
  }

  const resetScoutSelection = () => {
    setSelectedPlayer(null)
    setDrawerOpen(false)
  }

  function handleSelectPlayer(p) {
    setSelectedPlayer(p)
    setPreviewSelection({ type: 'player', data: p })
  }

  function handleOpenActions(p) {
    setSelectedPlayer(p)
    setPreviewSelection({ type: 'player', data: p })
    setDrawerOpen(true)
  }

  function handleSelectClub(clubGroup) {
    resetPlayerSelection()

    const clubId = clubGroup?.clubId || null
    const full = clubId ? clubsById[clubId] : null

    setPreviewSelection({
      type: 'club',
      data: {
        ...(full || {}),
        id: clubId || full?.id || null,
        clubName: full?.clubName || clubGroup?.clubName,
        photo: full?.photo || clubGroup?.clubPhoto || '',
        color: full?.color || clubGroup?.clubColor || null,
        ifaLink: full?.ifaLink || clubGroup?.ifaLink || null,
        playersCount: clubGroup?.playersCount || 0,
        teamsCount: clubGroup?.teamsCount || 0,
      },
    })
  }

  function handleSelectTeam(teamGroup, clubGroup) {
    resetPlayerSelection()

    const teamId = teamGroup?.teamId || null
    const full = teamId ? teamsById[teamId] : null

    const clubId = full?.clubId || clubGroup?.clubId || null
    const fullClub = clubId ? clubsById[clubId] : null

    setPreviewSelection({
      type: 'team',
      data: {
        ...(full || {}),
        id: teamId || full?.id || null,
        teamName: full?.teamName || teamGroup?.teamName,
        teamYear: full?.teamYear || teamGroup?.teamYear || teamGroup?.year || null,
        photo: full?.photo || teamGroup?.teamPhoto || '',
        color: full?.color || teamGroup?.teamColor || null,
        ifaLink: full?.ifaLink || teamGroup?.ifaLink || null,
        clubId,
        clubName: fullClub?.clubName || full?.clubName || clubGroup?.clubName || '',
        playersCount: teamGroup?.players?.length || 0,
      },
    })
  }

  function handleSelectStaff(staff) {
    resetPlayerSelection()
    setPreviewSelection({ type: 'staff', data: staff })
  }

  function handleSelectScout(scout) {
    resetScoutSelection()
    setPreviewSelection({ type: 'scout', data: scout })
  }

  function selectClubById(clubId) {
    if (!clubId) return
    setMode(MODE.CLUBS)
    handleSelectClub({ clubId })
  }

  function selectTeamById(teamId) {
    if (!teamId) return
    setMode(MODE.TEAMS)

    const full = teamsById[teamId] || null
    const clubId = full?.clubId || null

    handleSelectTeam({ teamId }, { clubId })
  }

  function selectPlayerById(playerId) {
    if (!playerId) return

    const p = playersUi?.find((x) => x?.id === playerId) || null
    if (!p) return

    const isPrivatePlayer =
      p?.playerSource === 'private' || p?.isPrivatePlayer === true

    setMode(isPrivatePlayer ? MODE.PRIVATES : MODE.PLAYERS)
    handleSelectPlayer(p)
  }

  return {
    resetPlayerSelection,
    resetScoutSelection,
    handleSelectPlayer,
    handleOpenActions,
    handleSelectClub,
    handleSelectTeam,
    handleSelectStaff,
    handleSelectScout,
    selectClubById,
    selectTeamById,
    selectPlayerById,
  }
}
