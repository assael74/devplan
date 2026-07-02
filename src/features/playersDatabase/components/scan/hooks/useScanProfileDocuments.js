// src/features/playersDatabase/components/scan/hooks/useScanProfileDocuments.js

import { useCallback, useRef, useState } from 'react'
import { listPlayerSearchByTeamProfile, removePlayerScoutProfile } from '../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../leagues/board/hook/leagueBoardCache.js'
import { buildProfileDocumentsCacheKey, invalidateProfileDocumentsCache, mergeLoadedPlayerRows, stripProfileFromLoadedRow } from '../logic/documents.logic.js'
import { getProfileTeams } from '../logic/profiles.logic.js'
import { getProfileLabel } from '../logic/scout.logic.js'
import { clean } from '../logic/utils.js'

export function useScanProfileDocuments() {
  const [selectedProfilesById, setSelectedProfilesById] = useState({})
  const [scanResultsById, setScanResultsById] = useState({})
  const cacheRef = useRef(new Map())

  const toggleProfileForLoad = useCallback((profileRowId, profileId) => {
    setSelectedProfilesById(current => {
      const currentIds = current[profileRowId] || []
      const nextIds = currentIds.includes(profileId) ? currentIds.filter(id => id !== profileId) : [...currentIds, profileId]
      return { ...current, [profileRowId]: nextIds }
    })
  }, [])

  const invalidateProfileDocuments = useCallback(profileId => invalidateProfileDocumentsCache(cacheRef.current, profileId), [])

  const loadProfileDocuments = useCallback(async (profile, options = {}) => {
    if (!profile) return null
    const profileIds = selectedProfilesById[profile.id] || []

    if (!profileIds.length) {
      setScanResultsById(current => ({ ...current, [profile.id]: { loading: false, error: 'צריך לבחור לפחות פרופיל אחד לטעינה', rows: [] } }))
      return null
    }

    const teams = getProfileTeams(profile)
    const cacheKey = buildProfileDocumentsCacheKey({ profileId: profile.id, profileIds, teams })
    const cachedResult = options?.force === true ? null : cacheRef.current.get(cacheKey)

    if (cachedResult) {
      setScanResultsById(current => ({ ...current, [profile.id]: cachedResult }))
      return cachedResult
    }

    setScanResultsById(current => ({ ...current, [profile.id]: { ...(current[profile.id] || {}), loading: true, error: '' } }))

    try {
      const rows = []
      for (const team of teams) {
        for (const profileId of profileIds) {
          const playerRows = await listPlayerSearchByTeamProfile(team, { profileId, mode: 'eligible' })
          rows.push(...playerRows.map(player => ({ ...player, profileId, profileLabel: getProfileLabel(profileId), teamSeasonKey: team.teamSeasonKey, teamName: team.clubName || team.teamName || team.sourceTeamName, leagueId: team.leagueId, leagueName: team.leagueName })))
        }
      }

      const nextResult = { loading: false, error: '', rows: mergeLoadedPlayerRows(rows), loadedAt: new Date().toISOString(), teamsCount: teams.length, profilesCount: profileIds.length, cacheKey }
      cacheRef.current.set(cacheKey, nextResult)
      setScanResultsById(current => ({ ...current, [profile.id]: nextResult }))
      return nextResult
    } catch (err) {
      cacheRef.current.delete(cacheKey)
      const failedResult = { loading: false, error: err?.message || 'טעינת מסמכי שחקנים נכשלה', rows: [], cacheKey }
      setScanResultsById(current => ({ ...current, [profile.id]: failedResult }))
      return failedResult
    }
  }, [selectedProfilesById])

  const removeProfileFromLoadedDocuments = useCallback(async (profile, player, profileId) => {
    const targetProfileId = clean(profile?.id)
    const targetPlayerId = clean(player?.searchDocId || player?.id)
    const removedId = clean(profileId)
    if (!targetProfileId || !targetPlayerId || !removedId) return

    await removePlayerScoutProfile(player, removedId)
    invalidateProfileDocuments(targetProfileId)
    markLeagueBoardCacheDirty()

    setScanResultsById(current => {
      const currentResult = current[targetProfileId]
      if (!currentResult?.rows?.length) return current
      const rows = currentResult.rows.map(row => clean(row.searchDocId || row.id) === targetPlayerId ? stripProfileFromLoadedRow(row, removedId) : row)
      return { ...current, [targetProfileId]: { ...currentResult, rows } }
    })
  }, [invalidateProfileDocuments])

  return { selectedProfilesById, scanResultsById, toggleProfileForLoad, loadProfileDocuments, invalidateProfileDocuments, removeProfileFromLoadedDocuments }
}
