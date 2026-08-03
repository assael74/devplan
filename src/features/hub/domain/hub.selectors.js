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

  const scoutBase = useMemo(
    () => buildScoutingPlayers(coreScouting, playersById),
    [coreScouting, playersById]
  )

  const scoutsById = useMemo(() => buildIdMap(scoutBase), [scoutBase])

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
      scouting: scoutBase.length,
    }),
    [clubPlayersUi, privatePlayersUi, coreTeams, coreClubs, scoutBase]
  )

  return {
    playersUi,
    clubPlayersUi,
    privatePlayersUi,
    playersById,
    clubsById,
    teamsById,
    scoutsById,
    scoutRows,
    counts,
  }
}
