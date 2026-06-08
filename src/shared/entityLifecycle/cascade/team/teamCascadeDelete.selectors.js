// src/shared/entityLifecycle/cascade/team/teamCascadeDelete.selectors.js

export const compact = arr => (arr || []).filter(Boolean)

export const uniq = arr => Array.from(new Set(compact(arr)))

const asArr = value => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.list)) return value.list
  if (Array.isArray(value?.data?.list)) return value.data.list
  return []
}

export const getList = doc => asArr(doc)

const shortKeyParts = shortKey => {
  const [group, docName] = String(shortKey || '').split('.')
  return { group, docName }
}

export const pickShortDoc = (bucket, shortKey) => {
  if (!bucket || !shortKey) return null

  const { group, docName } = shortKeyParts(shortKey)

  // map לפי full shortKey
  if (bucket[shortKey]) return bucket[shortKey]

  // map לפי docName: teamsInfo / playersTeam וכו'
  if (bucket[docName]) return bucket[docName]

  // map לפי group ואז docName
  if (bucket[group]?.[docName]) return bucket[group][docName]

  // resolved object לפעמים מגיע כ-list ישיר
  if (Array.isArray(bucket)) {
    const byKey = bucket.find(d =>
      d?.shortKey === shortKey ||
      d?.key === shortKey ||
      d?.docName === docName ||
      d?.name === docName
    )

    if (byKey) return byKey
  }

  // fallback: חיפוש עמוק רדוד בתוך object
  if (typeof bucket === 'object') {
    const values = Object.values(bucket)

    const found = values.find(value =>
      value?.shortKey === shortKey ||
      value?.key === shortKey ||
      value?.docName === docName ||
      value?.name === docName
    )

    if (found) return found

    const arrValue = values.find(value => Array.isArray(value))
    if (arrValue && docName && bucket[docName] === arrValue) return arrValue
  }

  return null
}

const mergeById = (base, next) => {
  if (!next?.id) return base
  return {
    ...(base || {}),
    ...next,
  }
}

const buildById = (...lists) => {
  const map = {}

  lists.flat().forEach(item => {
    if (!item?.id) return
    map[item.id] = mergeById(map[item.id], item)
  })

  return map
}

const getName = (...values) => {
  return values.find(v => typeof v === 'string' && v.trim()) || ''
}

const byId = (list, id) => {
  return asArr(list).find(x => x?.id === id) || null
}

const byIds = (list, ids) => {
  const idSet = new Set(ids || [])
  return asArr(list).filter(x => idSet.has(x?.id))
}

export const selectTeamById = ({ teamsShorts, teamId, seedTeam }) => {
  const infoDoc = pickShortDoc(teamsShorts, 'teams.teamsInfo')
  const statsDoc = pickShortDoc(teamsShorts, 'teams.teamsStats')

  const teamsById = buildById(getList(infoDoc), getList(statsDoc))
  const team = teamsById[teamId] || null

  if (team) return team
  if (seedTeam?.id === teamId) return seedTeam

  return null
}

export const selectClubById = ({ clubsShorts, clubId, seedClub }) => {
  if (!clubId && seedClub?.id) return seedClub

  const doc = pickShortDoc(clubsShorts, 'clubs.clubsInfo')
  const club = byId(getList(doc), clubId)

  return club || seedClub || null
}

export const selectPlayersByTeamId = ({ playersShorts, teamId, seedPlayers }) => {
  const teamDoc = pickShortDoc(playersShorts, 'players.playersTeam')
  const infoDoc = pickShortDoc(playersShorts, 'players.playersInfo')
  const namesDoc = pickShortDoc(playersShorts, 'players.playersNames')
  const proDoc = pickShortDoc(playersShorts, 'players.playersProInfo')
  const parentsDoc = pickShortDoc(playersShorts, 'players.playersParents')
  const abilitiesDoc = pickShortDoc(playersShorts, 'players.playersAbilities')
  const statsDoc = pickShortDoc(playersShorts, 'players.playersStats')

  const teamRows = getList(teamDoc).filter(x => x?.teamId === teamId)
  const seedRows = Array.isArray(seedPlayers) ? seedPlayers : []

  const playerIds = uniq([
    ...teamRows.map(x => x?.id),
    ...seedRows.map(x => x?.id),
  ])

  const playersById = buildById(
    teamRows,
    seedRows,
    byIds(getList(infoDoc), playerIds),
    byIds(getList(namesDoc), playerIds),
    byIds(getList(proDoc), playerIds),
    byIds(getList(parentsDoc), playerIds),
    byIds(getList(abilitiesDoc), playerIds),
    byIds(getList(statsDoc), playerIds)
  )

  return Object.values(playersById)
}

export const selectGamesByTeamId = ({ gamesShorts, teamId, seedGames }) => {
  const infoDoc = pickShortDoc(gamesShorts, 'games.gameInfo')
  const resultDoc = pickShortDoc(gamesShorts, 'games.gameResult')
  const timeDoc = pickShortDoc(gamesShorts, 'games.gameTime')
  const playersDoc = pickShortDoc(gamesShorts, 'games.gamePlayers')

  const gameInfoRows = getList(infoDoc).filter(x => x?.teamId === teamId)
  const seedRows = Array.isArray(seedGames) ? seedGames : []

  const gameIds = uniq([
    ...gameInfoRows.map(x => x?.id),
    ...seedRows.map(x => x?.id),
  ])

  const gamesById = buildById(
    gameInfoRows,
    seedRows,
    byIds(getList(resultDoc), gameIds),
    byIds(getList(timeDoc), gameIds),
    byIds(getList(playersDoc), gameIds)
  )

  return Object.values(gamesById)
}

export const selectMeetingsByTeamContext = ({
  meetingsShorts,
  teamId,
  playerIds,
  seedMeetings,
}) => {
  const ids = new Set(playerIds || [])

  const infoDoc = pickShortDoc(meetingsShorts, 'meetings.meetingInfo')
  const notesDoc = pickShortDoc(meetingsShorts, 'meetings.meetingNotes')

  const match = item => {
    if (!item) return false
    if (item.teamId === teamId) return true
    if (ids.has(item.playerId)) return true
    if (ids.has(item.entityId)) return true
    if (ids.has(item.targetId)) return true
    return false
  }

  const infoRows = getList(infoDoc).filter(match)
  const noteRows = getList(notesDoc).filter(match)
  const seedRows = Array.isArray(seedMeetings) ? seedMeetings.filter(match) : []

  const meetingIds = uniq([
    ...infoRows.map(x => x?.id),
    ...noteRows.map(x => x?.id),
    ...seedRows.map(x => x?.id),
  ])

  const meetingsById = buildById(
    infoRows,
    noteRows,
    seedRows,
    byIds(getList(notesDoc), meetingIds)
  )

  return Object.values(meetingsById)
}

export const selectPaymentsByTeamContext = ({
  paymentsShorts,
  teamId,
  playerIds,
  seedPayments,
}) => {
  const ids = new Set(playerIds || [])

  const operativeDoc = pickShortDoc(paymentsShorts, 'payments.paymentOperative')
  const profitDoc = pickShortDoc(paymentsShorts, 'payments.paymentProfit')

  const match = item => {
    if (!item) return false
    if (item.teamId === teamId) return true
    if (ids.has(item.playerId)) return true
    if (ids.has(item.entityId)) return true
    if (ids.has(item.targetId)) return true
    return false
  }

  const operativeRows = getList(operativeDoc).filter(match)
  const profitRows = getList(profitDoc).filter(match)
  const seedRows = Array.isArray(seedPayments) ? seedPayments.filter(match) : []

  const paymentIds = uniq([
    ...operativeRows.map(x => x?.id),
    ...profitRows.map(x => x?.id),
    ...seedRows.map(x => x?.id),
  ])

  const paymentsById = buildById(
    operativeRows,
    profitRows,
    seedRows,
    byIds(getList(profitDoc), paymentIds)
  )

  return Object.values(paymentsById)
}

export const buildTeamSnapshot = ({ team, club }) => ({
  id: team?.id || '',
  name: getName(team?.teamName, team?.name),
  clubId: team?.clubId || club?.id || '',
  clubName: getName(club?.clubName, club?.name),
})

export const buildPlayerSnapshot = ({ player, teamSnapshot }) => ({
  id: player?.id || '',
  name: getName(player?.playerFullName, player?.fullName, player?.name),
  teamId: teamSnapshot?.id || player?.teamId || '',
  teamName: teamSnapshot?.name || '',
  clubId: teamSnapshot?.clubId || player?.clubId || '',
  clubName: teamSnapshot?.clubName || '',
})
