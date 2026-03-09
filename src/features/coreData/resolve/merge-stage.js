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
import { mergeShorts } from '../resolvers/mergeShorts.js'

const PLAYER_MERGE_DOCS = [
  'staff',
  'playersTeam',
  'playersNames',
  'playersProInfo',
  'playersParents',
  'playersAbilities',
]

export const pickBaseDocName = (shorts = [], candidates = []) => {
  for (const name of candidates) {
    if (shorts.some((doc) => doc.docName === name)) return name
  }
  return candidates[0] || null
}

export function mergeCoreShorts({
  clubsShorts = [],
  teamsShorts = [],
  playersShorts = [],
  scoutingShorts = [],
  meetingsShorts = [],
  paymentsShorts = [],
  gamesShorts = [],
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

  const playersBase = mergeShorts(playersShorts, 'playersInfo', PLAYER_MERGE_DOCS, 'id')
  const scoutingBase = mergeShorts(scoutingShorts, 'playersInfo', ['playersGames'], 'id')
  const meetingsBase = mergeShorts(
    meetingsShorts,
    'meetingDate',
    ['meetingNotes', 'meetingVideo', 'meetingPlayer'],
    'id'
  )
  const paymentsBase = mergeShorts(
    paymentsShorts,
    'paymentOperative',
    ['paymentProfit'],
    'id'
  )
  const gamesBase = mergeShorts(
    gamesShorts,
    'gameInfo',
    ['gameTime', 'gameResult', 'gamePlayers'],
    'id'
  )
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
    scoutingBase,
    meetingsBase,
    paymentsBase,
    gamesBase,
    rolesBase,
    videoAnalysisBase,
    videosBase,
    tagsBase,
  }
}
