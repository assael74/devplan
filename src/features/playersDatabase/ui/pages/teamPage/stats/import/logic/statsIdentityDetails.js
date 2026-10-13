// src/features/playersDatabase/ui/pages/teamPage/stats/import/logic/statsIdentityDetails.js
import { isValidExternalPlayerId } from '../../../../../../model/player/playerIdentity.model.js'

export const validateStatsIdentityDetails = ({ externalPlayerId, playerUrl }) => {
  const id = String(externalPlayerId || '').trim()
  if (!isValidExternalPlayerId({ externalPlayerId: id })) throw new Error('יש להזין מזהה שחקן תקין — לפחות 5 ספרות')
  let url
  try {
    url = new URL(String(playerUrl || '').trim(), 'https://www.football.org.il')
  } catch {
    throw new Error('יש להזין קישור תקין לשחקן')
  }
  if (!['https:', 'http:'].includes(url.protocol) || !['www.football.org.il', 'football.org.il'].includes(url.hostname) || !url.pathname.startsWith('/players/player')) {
    throw new Error('יש להזין קישור לעמוד השחקן בהתאחדות')
  }
  if (url.searchParams.get('player_id') !== id) throw new Error('המזהה בקישור אינו תואם למזהה השחקן שהוזן')
  return { externalPlayerId: id, playerUrl: url.href }
}

export const prepareStatsIdentityEdit = ({ row, details }) => ({
  ...row,
  ...validateStatsIdentityDetails(details),
  playerId: '',
  identityKey: '',
  matchedPlayerId: '',
  matchedPlayerName: '',
  approvedIdentityCandidateId: '',
  approvedCanonicalPlayerId: '',
  identityCandidateIds: [],
  identityCandidates: [],
  identityResolution: '',
  identityMatchStatus: '',
  identityStatus: 'unresolved',
})
