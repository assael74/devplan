import { useMemo } from 'react'
import { getFullDateIl } from '../../../../../shared/format/dateUtiles.js'
import playerImage from '../../../../../ui/core/images/playerImage.jpg'

const safeId = (v) => (v == null ? '' : String(v))
const safeStr = (v) => (v == null ? '' : String(v))

const normalizeToArray = (val) => Array.isArray(val) ? val : val ? [val] : []

export default function useMeetingOptions({
  value,
  options = [],
  context,
  clubId = '',
  teamId = '',
  playerId = '',
}) {

  const { playerById, teamById, clubById } = useMemo(() => {
    const pMap = context?.playerById instanceof Map
      ? context.playerById
      : new Map((context?.players || []).map(p => [safeId(p.id), p]))

    const tMap = context?.teamById instanceof Map
      ? context.teamById
      : new Map((context?.teams || []).map(t => [safeId(t.id), t]))

    const cMap = context?.clubById instanceof Map
      ? context.clubById
      : new Map((context?.clubs || []).map(c => [safeId(c.id), c]))

    return { playerById: pMap, teamById: tMap, clubById: cMap }
  }, [context])

  const indexedOptions = useMemo(() => {
    return (Array.isArray(options) ? options : [])
      .map(m => {
        const mid = safeId(m?.id)
        if (!mid) return null

        const team = teamById.get(safeId(m?.teamId)) || null
        const club = clubById.get(safeId(m?.clubId || team?.clubId)) || null

        const players = normalizeToArray(m?.playerId)
          .map(pid => playerById.get(safeId(pid)))
          .filter(Boolean)

        const meetingDate = getFullDateIl(safeStr(m?.meetingDate))
        const firstPlayer = players[0] || null

        const playerFullName = firstPlayer
          ? [firstPlayer.playerFirstName, firstPlayer.playerLastName]
              .filter(Boolean)
              .join(' ')
          : ''

        const teamName = safeStr(team?.teamName)
        const clubName = safeStr(club?.clubName || club?.name)

        const searchKey = [
          meetingDate,
          playerFullName,
          teamName,
          clubName,
        ].join(' ').toLowerCase()

        return {
          value: mid,
          label: meetingDate,
          secondary: [playerFullName, teamName, clubName].filter(Boolean).join(' · '),
          searchKey,
          players,
          team,
          club,
          playerPhoto: safeStr(firstPlayer?.photo) || playerImage,
          playerFullName,
        }
      })
      .filter(Boolean)
      .filter(x => clubId ? safeId(x.club?.id) === safeId(clubId) : true)
      .filter(x => teamId ? safeId(x.team?.id) === safeId(teamId) : true)
      .filter(x =>
        playerId
          ? x.players.some(p => safeId(p.id) === safeId(playerId))
          : true
      )
  }, [options, playerById, teamById, clubById, clubId, teamId, playerId])

  const selectedOption = useMemo(
    () => indexedOptions.find(o => o.value === value) || null,
    [indexedOptions, value]
  )

  const filterOptions = (opts, state) => {
    const q = safeStr(state?.inputValue).trim().toLowerCase()
    if (!q) return opts.slice(0, 200)
    return opts.filter(o => o.searchKey.includes(q)).slice(0, 200)
  }

  return { indexedOptions, selectedOption, filterOptions }
}
