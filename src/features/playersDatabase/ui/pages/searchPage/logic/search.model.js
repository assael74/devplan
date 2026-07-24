// features/playersDatabase/ui/pages/searchPage/logic/search.model.js

import { buildScoutProfileDisplay } from '../../../logic/scoutDisplay.logic.js'

export function normalizeSearchRow(row = {}) {
  const current = row.current || row.currentSeason || {}
  const scoutProfiles = Array.isArray(row.scoutProfiles) ? row.scoutProfiles : []

  return {
    ...row,
    id: row.id || row.playerId || row.teamId || row.externalId,
    playerName: row.playerName || row.name || row.fullName || 'שחקן ללא שם',
    teamName: row.teamName || current.teamName || '-',
    leagueName: row.leagueName || current.leagueName || '-',
    leagueLevel: row.leagueLevel || current.leagueLevel || '-',
    birthYear: row.birthYear || row.yearOfBirth || '-',
    seasonKey: row.seasonKey || current.seasonKey || '-',
    minutes: Number(row.minutes || current.minutes || 0),
    appearances: Number(row.appearances || row.games || current.appearances || current.games || 0),
    starts: Number(row.starts || current.starts || 0),
    goals: Number(row.goals || current.goals || 0),
    primaryProfile: row.primaryProfile || row.profileName || '-',
    primaryScoutProfileId: row.primaryScoutProfileId || current.primaryScoutProfileId || '',
    secondaryScoutProfileId: row.secondaryScoutProfileId || current.secondaryScoutProfileId || '',
    scoutProfiles,
    scoutProfileDisplay: row.scoutProfileDisplay || buildScoutProfileDisplay(scoutProfiles),
    score: Number(row.score || row.matchScore || 0),
  }
}

export function normalizeSearchRows(rows = []) {
  return rows.map(normalizeSearchRow)
}
