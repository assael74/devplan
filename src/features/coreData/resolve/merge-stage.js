/**
 * שלב מיזוג הנתונים (Merge Stage)
 *
 * אחריות:
 * - מיזוג מסמכי Firestore מסוג shorts למסמכי בסיס מלאים
 * - חיבור המסמכים לפי docName ומפתח id
 * - יצירת אובייקטים בסיסיים של הישויות במערכת
 *
 * הישויות שנוצרות כאן:
 * clubs
 * teams
 * players
 * meetings
 * payments
 * games
 * roles
 * videos
 * tags
 *
 * חשוב:  בשלב זה אין עדיין קשרים בין הישויות. זהו רק שלב יצירת הנתונים הראשוני.
 */
 // src/features/coreData/resolve/merge-stage.js
import { mergeShorts } from '../resolvers/mergeShorts.js'

const PLAYER_MERGE_DOCS = [
  'staff',
  'playersTeam',
  'playersNames',
  'playersProInfo',
  'playersParents',
  'playersAbilities',
]

const PRIVATE_PLAYER_MERGE_DOCS = [
  'privatePlayersInfo',
  'privatePlayersAbilities',
]

const EXTERNAL_GAME_MERGE_DOCS = ['gamePlayers']

export const pickBaseDocName = (shorts = [], candidates = []) => {
  for (const name of candidates) {
    if (shorts.some((doc) => doc.docName === name)) return name
  }
  return candidates[0] || null
}

const safeId = (v) => (v == null ? '' : String(v))

const uniqById = (arr = []) => {
  const map = new Map()

  for (const item of arr) {
    const id = safeId(item?.id)
    if (!id) continue
    if (!map.has(id)) map.set(id, item)
  }

  return Array.from(map.values())
}

const normalizePlayerSource = (player = {}, source = 'club') => {
  const isPrivatePlayer = source === 'private'

  return {
    ...player,
    playerSource: String(player?.playerSource || source),
    isPrivatePlayer:
      player?.isPrivatePlayer === true ||
      player?.isPrivate === true ||
      isPrivatePlayer,
  }
}

const normalizeGameSource = (game = {}, source = 'team') => {
  const isExternalGame = source === 'external'

  return {
    ...game,
    gameSource: String(game?.gameSource || source),
    isExternalGame:
      game?.isExternalGame === true ||
      game?.externalGame === true ||
      isExternalGame,
  }
}

function mergeStandardPlayers(playersShorts = []) {
  const base = mergeShorts(playersShorts, 'playersInfo', PLAYER_MERGE_DOCS, 'id')
  return base.map((player) => normalizePlayerSource(player, 'club'))
}

function mergePrivatePlayers(privatePlayersShorts = []) {
  const privateBaseDoc = pickBaseDocName(privatePlayersShorts, [
    'privatePlayersInfo',
    'playersInfo',
  ])

  if (!privateBaseDoc) return []

  const docsToMerge = PRIVATE_PLAYER_MERGE_DOCS.filter((docName) => docName !== privateBaseDoc)
  const base = mergeShorts(privatePlayersShorts, privateBaseDoc, docsToMerge, 'id')

  return base.map((player) => normalizePlayerSource(player, 'private'))
}

function mergeStandardGames(gamesShorts = []) {
  const base = mergeShorts(
    gamesShorts,
    'gameInfo',
    ['gameTime', 'gameResult', 'gamePlayers'],
    'id'
  )

  return base.map((game) => normalizeGameSource(game, 'team'))
}

function mergeExternalGames(externalGamesShorts = []) {
  const externalBaseDoc = pickBaseDocName(externalGamesShorts, ['gameInfo', 'externalGameInfo'])
  if (!externalBaseDoc) return []

  const docsToMerge = EXTERNAL_GAME_MERGE_DOCS.filter((docName) => docName !== externalBaseDoc)
  const base = mergeShorts(externalGamesShorts, externalBaseDoc, docsToMerge, 'id')

  return base.map((game) => normalizeGameSource(game, 'external'))
}

export function mergeCoreShorts({
  clubsShorts = [],
  teamsShorts = [],
  playersShorts = [],
  privatePlayersShorts = [],
  scoutingShorts = [],
  meetingsShorts = [],
  paymentsShorts = [],
  gamesShorts = [],
  externalGamesShorts = [],
  rolesShorts = [],
  videosShorts = [],
  videoAnalysisShorts = [],
  tagsShorts = [],
} = {}) {
  const clubsBaseDoc = pickBaseDocName(clubsShorts, ['clubsInfo', 'clubInfo', 'clubs'])
  const teamsBaseDoc = pickBaseDocName(teamsShorts, ['teamsInfo', 'teamInfo', 'teams'])

  const clubs = clubsBaseDoc ? mergeShorts(clubsShorts, clubsBaseDoc, [], 'id') : []

  const teamsBase = teamsBaseDoc
    ? mergeShorts(teamsShorts, teamsBaseDoc, ['teamsMeeting', 'teamsTraining'], 'id')
    : []

  const standardPlayersBase = mergeStandardPlayers(playersShorts)
  const privatePlayersBase = mergePrivatePlayers(privatePlayersShorts)
  const playersBase = uniqById([...standardPlayersBase, ...privatePlayersBase])

  const scoutingBase = mergeShorts(scoutingShorts, 'playersInfo', ['playersGames'], 'id')

  const meetingsBase = mergeShorts(
    meetingsShorts,
    'meetingInfo',
    ['meetingNotes'],
    'id'
  )

  const paymentsBase = mergeShorts(
    paymentsShorts,
    'paymentOperative',
    ['paymentProfit'],
    'id'
  )

  const standardGamesBase = mergeStandardGames(gamesShorts)
  const externalGamesBase = mergeExternalGames(externalGamesShorts)

  const rolesBase = mergeShorts(
    rolesShorts,
    'rolesInfo',
    ['rolesContact'],
    'id'
  )

  const videoAnalysisBase = mergeShorts(
    videoAnalysisShorts,
    'analysisInfo',
    ['analysisTags', 'analysisNotes'],
    'id'
  )

  const videosBase = mergeShorts(
    videosShorts,
    'videoInfo',
    ['videoTags', 'videoNotes'],
    'id'
  )

  const tagsBase = mergeShorts(tagsShorts, 'tagInfo', [], 'id')

  return {
    clubs,
    teamsBase,

    playersBase,
    standardPlayersBase,
    privatePlayersBase,

    scoutingBase,
    meetingsBase,
    paymentsBase,

    gamesBase: standardGamesBase,
    externalGamesBase,

    rolesBase,
    videoAnalysisBase,
    videosBase,
    tagsBase,
  }
}
