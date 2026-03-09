/**
 * הליבה הראשית של מנוע הנתונים (Core Data Resolver)
 *
 * תהליך העבודה:
 *
 * 1. Merge
 * מיזוג מסמכי shorts למסמכי בסיס.
 *
 * 2. Index
 * יצירת אינדקסים ומבני נתונים מהירים.
 *
 * 3. Enrich
 * העשרת הנתונים וחיבור בין הישויות.
 *
 * 4. Relations
 * בניית קשרים סופיים בין הישויות.
 *
 * התוצאה:
 * אובייקט נתונים מלא של המערכת הכולל:
 *
 * clubs
 * teams
 * players
 * meetings
 * payments
 * roles
 * videos
 * tags
 * games
 *
 * קובץ זה הוא נקודת הכניסה למנוע הנתונים של המערכת.
 */
import { mergeCoreShorts } from './merge-stage.js'
import { buildCoreIndexes } from './index-stage.js'
import {
  enrichTeams,
  enrichPlayers,
  enrichMeetings,
  enrichScouting,
  attachPlayerStatsAndVideos,
  attachTeamStatsAndVideos,
} from './enrich-stage.js'
import { buildFinalRelations } from './relations-stage.js'

export function resolveCoreDataNext(input) {
  const merged = mergeCoreShorts(input)

  const indexes = buildCoreIndexes(merged)

  const teams = enrichTeams(merged, indexes)
  const players = enrichPlayers(merged, indexes, teams)
  const meetings = enrichMeetings(merged, indexes)
  const scouting = enrichScouting(merged)

  const playersWithVideos = attachPlayerStatsAndVideos(players, merged, indexes, teams)
  const teamsWithVideos = attachTeamStatsAndVideos(teams, indexes)

  return buildFinalRelations({
    merged,
    indexes,
    teamsWithVideos,
    playersWithVideos,
    scouting,
    meetings,
  })
}
