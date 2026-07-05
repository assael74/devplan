// features/playersDatabase/components/profilesPage/hooks/useProfileDocuments.js

import { useCallback, useRef, useState } from 'react'

import { listPlayerSearchByTeamProfile, removePlayerScoutProfile } from '../../../services/pdbPlayers.firestore.js'
import { markLeagueBoardCacheDirty } from '../../summary/hooks/leagueBoardCache.js'
import {
  buildProfileDocumentsCacheKey,
  invalidateProfileDocumentsCache,
  mergeLoadedPlayerRows,
} from '../list/logic/documents.logic.js'
import { getProfileLabel } from '../list/logic/scout.logic.js'
import { getProfileTeams } from '../logic/profiles.logic.js'
import { clean } from '../logic/utils.js'

export function useProfileDocuments(options = {}) {
  const [selectedProfilesById, setSelectedProfilesById] = useState({})
  const [profileResultsById, setProfileResultsById] = useState({})
  const [removingProfileId, setRemovingProfileId] = useState('')
  const cacheRef = useRef(new Map())
  const removingProfileRef = useRef('')
  const onProfileChanged = options.onProfileChanged

  const toggleProfileForLoad = useCallback((profileRowId, profileId) => {
    setSelectedProfilesById(current => {
      const currentIds = current[profileRowId] || []
      const nextIds = currentIds.includes(profileId)
        ? currentIds.filter(id => id !== profileId)
        : [...currentIds, profileId]

      return { ...current, [profileRowId]: nextIds }
    })
  }, [])

  const clearProfileDocumentsSelection = useCallback(profileRowId => {
    const targetRowId = clean(profileRowId)
    if (!targetRowId) return

    setSelectedProfilesById(current => ({
      ...current,
      [targetRowId]: [],
    }))
  }, [])

  const invalidateProfileDocuments = useCallback(profileId => {
    invalidateProfileDocumentsCache(cacheRef.current, profileId)
  }, [])

  const loadProfileDocuments = useCallback(
    async (profile, options = {}) => {
      if (!profile) return null

      const profileIds = selectedProfilesById[profile.id] || []

      if (!profileIds.length) {
        setProfileResultsById(current => ({
          ...current,
          [profile.id]: {
            loading: false,
            error: 'צריך לבחור לפחות פרופיל אחד לטעינה',
            rows: [],
          },
        }))

        return null
      }

      const teams = getProfileTeams(profile)
      const cacheKey = buildProfileDocumentsCacheKey({ profileId: profile.id, profileIds, teams })
      const cachedResult = options.force === true ? null : cacheRef.current.get(cacheKey)

      if (cachedResult) {
        setProfileResultsById(current => ({ ...current, [profile.id]: cachedResult }))
        return cachedResult
      }

      setProfileResultsById(current => ({
        ...current,
        [profile.id]: {
          ...(current[profile.id] || {}),
          loading: true,
          error: '',
        },
      }))

      try {
        const rows = []

        for (const team of teams) {
          for (const profileId of profileIds) {
            const playerRows = await listPlayerSearchByTeamProfile(team, {
              profileId,
              mode: 'eligible',
            })

            rows.push(
              ...playerRows.map(player => ({
                ...player,
                profileId,
                profileLabel: getProfileLabel(profileId),
                teamSeasonKey: team.teamSeasonKey,
                teamName: team.clubName || team.teamName || team.sourceTeamName,
                leagueId: team.leagueId,
                leagueName: team.leagueName,
              }))
            )
          }
        }

        const nextResult = {
          loading: false,
          error: '',
          rows: mergeLoadedPlayerRows(rows),
          loadedAt: new Date().toISOString(),
          teamsCount: teams.length,
          profilesCount: profileIds.length,
          cacheKey,
        }

        cacheRef.current.set(cacheKey, nextResult)
        setProfileResultsById(current => ({ ...current, [profile.id]: nextResult }))
        return nextResult
      } catch (err) {
        cacheRef.current.delete(cacheKey)

        const failedResult = {
          loading: false,
          error: err?.message || 'טעינת מסמכי שחקנים נכשלה',
          rows: [],
          cacheKey,
        }

        setProfileResultsById(current => ({ ...current, [profile.id]: failedResult }))
        return failedResult
      }
    },
    [selectedProfilesById]
  )

  const removeProfileFromLoadedDocuments = useCallback(
    async (profile, player, profileId) => {
      const targetProfileId = clean(profile?.id)
      const targetPlayerId = clean(player?.searchDocId || player?.id)
      const removedProfileId = clean(profileId)

      if (!targetProfileId || !targetPlayerId || !removedProfileId) return
      if (removingProfileRef.current) return

      removingProfileRef.current = `${targetProfileId}:${targetPlayerId}:${removedProfileId}`
      setRemovingProfileId(removingProfileRef.current)

      setProfileResultsById(current => {
        const currentResult = current[targetProfileId]

        return {
          ...current,
          [targetProfileId]: {
            ...currentResult,
            loading: true,
            error: '',
            removingProfileIds: {
              ...(currentResult?.removingProfileIds || {}),
              [targetPlayerId]: removedProfileId,
            },
          },
        }
      })

      try {
        const removalResult = await removePlayerScoutProfile(player, removedProfileId)
        invalidateProfileDocuments(targetProfileId)
        markLeagueBoardCacheDirty()
        await loadProfileDocuments(profile, { force: true })

        await onProfileChanged?.({
          profileId: targetProfileId,
          playerId: targetPlayerId,
          removedProfileId,
          nextRawProfileIds: removalResult?.nextRawProfileIds || [],
          nextEligibleProfileIds: removalResult?.nextEligibleProfileIds || [],
          team: removalResult?.team || null,
        })
      } finally {
        setProfileResultsById(current => {
          const currentResult = current[targetProfileId]

          if (!currentResult) return current

          const nextRemovingProfileIds = {
            ...(currentResult.removingProfileIds || {}),
          }
          delete nextRemovingProfileIds[targetPlayerId]

          return {
            ...current,
            [targetProfileId]: {
              ...currentResult,
              loading: false,
              removingProfileIds: nextRemovingProfileIds,
            },
          }
        })

        removingProfileRef.current = ''
        setRemovingProfileId('')
      }
    },
    [invalidateProfileDocuments, loadProfileDocuments, onProfileChanged]
  )

  return {
    selectedProfilesById,
    profileResultsById,
    removingProfileId,
    toggleProfileForLoad,
    clearProfileDocumentsSelection,
    loadProfileDocuments,
    invalidateProfileDocuments,
    removeProfileFromLoadedDocuments,
  }
}
