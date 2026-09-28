// src/features/playersDatabase/domain/rosterV2/clear/clearRosterIdentity.js

import { buildTeamSeasonDocumentId } from '../../../model/team/teamIdentity.model.js'
import { normalizeSeasonLookupKey } from '../../../model/shared/season.model.js'

export const sameClearRosterSeason = (left, right) => {
  const a = normalizeSeasonLookupKey(left)
  const b = normalizeSeasonLookupKey(right)
  return Boolean(a && b && a === b)
}
import { buildTeamSeasonSearchIndexId } from '../../projections/teamSeasonSearchIndex.projection.js'

export const assertClearRosterDocumentId = value => {
  if (typeof value !== 'string' || !value.trim() || value.includes('/') || value === '.' || value === '..') {
    throw new Error('Invalid Clear Roster document identity')
  }

  return value
}

// Local adapter only. Business seasonKey is never rewritten.
export const buildClearRosterIds = ({ birthTeamDocumentId, seasonKey, leagueId }) => {
  assertClearRosterDocumentId(birthTeamDocumentId)
  if (typeof seasonKey !== 'string' || !seasonKey.trim()) {
    throw new Error('Missing Clear Roster season')
  }

  return {
    teamSeasonDocumentId: assertClearRosterDocumentId(
      buildTeamSeasonDocumentId(birthTeamDocumentId, seasonKey)
    ),
    ...(leagueId ? {
      teamSearchIndexId: assertClearRosterDocumentId(buildTeamSeasonSearchIndexId({
        leagueId: assertClearRosterDocumentId(leagueId),
        seasonKey,
        teamId: birthTeamDocumentId,
      })),
    } : {}),
  }
}
