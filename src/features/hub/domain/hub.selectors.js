// features/hub/domain/hub.selectors.js
import { useMemo } from 'react'
import { buildIdMap } from '../helpers/map'
import { enrichPlayersForUi } from './players.enrich'
import { buildScoutingPlayers } from './hub.scouting'

function isPrivatePlayer(player) {
  return player?.playerSource === 'private' || player?.isPrivatePlayer === true
}

export function useHubSelectors({
  corePlayers,
  coreClubs,
  coreTeams,
  coreRoles,
  coreScouting,
  query,
  mode,
}) {
  const playersUi = useMemo(
    () => enrichPlayersForUi(corePlayers || []),
    [corePlayers]
  )

  const privatePlayersUi = useMemo(
    () => playersUi.filter((player) => isPrivatePlayer(player)),
    [playersUi]
  )

  const clubPlayersUi = useMemo(
    () => playersUi.filter((player) => !isPrivatePlayer(player)),
    [playersUi]
  )

  const playersById = useMemo(() => buildIdMap(playersUi), [playersUi])
  const clubsById = useMemo(() => buildIdMap(coreClubs), [coreClubs])
  const teamsById = useMemo(() => buildIdMap(coreTeams), [coreTeams])
  const rolesById = useMemo(() => buildIdMap(coreRoles), [coreRoles])

  const scoutBase = useMemo(
    () => buildScoutingPlayers(coreScouting, playersById),
    [coreScouting, playersById]
  )

  const scoutsById = useMemo(() => buildIdMap(scoutBase), [scoutBase])

  const staffRows = useMemo(() => {
    if (!query) return coreRoles || []
    const q = query.toLowerCase()
    return (coreRoles || []).filter((r) =>
      `${r?.fullName || ''}`.toLowerCase().includes(q)
    )
  }, [coreRoles, query])

  const scoutRows = useMemo(() => {
    if (!query) return scoutBase
    const q = query.toLowerCase()
    return scoutBase.filter((p) =>
      `${p?.playerName || ''}`.toLowerCase().includes(q)
    )
  }, [scoutBase, query])

  const counts = useMemo(
    () => ({
      players: clubPlayersUi.length,
      privates: privatePlayersUi.length,
      teams: (coreTeams || []).length,
      clubs: (coreClubs || []).length,
      staff: (coreRoles || []).length,
      scouting: scoutBase.length,
    }),
    [clubPlayersUi, privatePlayersUi, coreTeams, coreClubs, coreRoles, scoutBase]
  )

  return {
    playersUi,
    clubPlayersUi,
    privatePlayersUi,
    playersById,
    clubsById,
    teamsById,
    rolesById,
    scoutsById,
    staffRows,
    scoutRows,
    counts,
  }
}
