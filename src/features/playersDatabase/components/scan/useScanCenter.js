// src/features/playersDatabase/components/scan/useScanCenter.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  listLeagueSnapshotsByIds,
  listLeagues,
} from '../../services/pdbLeague.firestore.js'
import { listPlayerSearchByTeamProfile } from '../../services/pdbPlayers.firestore.js'
import { findPlayersDatabaseYearGroupOpportunities } from '../../sharedLogic/yearGroupOpportunities.js'
import {
  getLeagueBoardCache,
  setLeagueBoardCache,
} from '../leagues/board/hook/leagueBoardCache.js'
import {
  buildScanProfiles,
  buildScanYearOptions,
  filterScanProfiles,
  getLeagueSnapshotId,
  getProfileLabel,
  getProfileTeams,
} from './scanCenter.logic.js'

const unique = values =>
  Array.from(new Set(values.filter(Boolean)))

const clean = value => String(value ?? '').trim()

export function useScanCenter() {
  const [loading, setLoading] = useState(false)
  const [loadingIndicators, setLoadingIndicators] = useState(false)
  const [error, setError] = useState('')
  const [indicatorError, setIndicatorError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [snapshots, setSnapshots] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [indicatorsLoaded, setIndicatorsLoaded] = useState(false)
  const [selectedId, setSelectedId] = useState('database:all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [birthYearFilter, setBirthYearFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [profileFilter, setProfileFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [expandedIds, setExpandedIds] = useState({})
  const [selectedProfilesById, setSelectedProfilesById] = useState({})
  const [scanResultsById, setScanResultsById] = useState({})

  const loadSummaries = useCallback(async ({ force = false } = {}) => {
    setLoading(true)
    setError('')

    try {
      const cached = force ? null : getLeagueBoardCache()

      if (cached?.leagues?.length) {
        setLeagues(cached.leagues)
        setSnapshots(cached.latestSnapshots || [])
        setOpportunities(cached.yearGroupOpportunities || [])
        setIndicatorsLoaded(Boolean(cached.latestSnapshots?.length))
        return
      }

      const rows = await listLeagues()
      setLeagues(Array.isArray(rows) ? rows : [])
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } catch (err) {
      setError(err?.message || 'טעינת תקצירי סריקה נכשלה')
      setLeagues([])
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadIndicators = useCallback(async () => {
    if (!leagues.length || loadingIndicators) return

    const snapshotIds = unique(leagues.map(getLeagueSnapshotId))

    setLoadingIndicators(true)
    setIndicatorError('')

    try {
      const nextSnapshots = await listLeagueSnapshotsByIds(snapshotIds)
      const nextOpportunities = findPlayersDatabaseYearGroupOpportunities({
        leagues,
        snapshots: nextSnapshots,
      })

      setSnapshots(nextSnapshots)
      setOpportunities(nextOpportunities)
      setIndicatorsLoaded(true)
      setLeagueBoardCache({
        leagues,
        latestSnapshots: nextSnapshots,
        yearGroupOpportunities: nextOpportunities,
      })
    } catch (err) {
      setIndicatorError(err?.message || 'טעינת אינדיקציות נכשלה')
      setSnapshots([])
      setOpportunities([])
      setIndicatorsLoaded(false)
    } finally {
      setLoadingIndicators(false)
    }
  }, [leagues, loadingIndicators])

  useEffect(() => {
    loadSummaries()
  }, [loadSummaries])

  const profiles = useMemo(
    () => buildScanProfiles({
      leagues,
      opportunities,
    }),
    [leagues, opportunities]
  )

  const filteredProfiles = useMemo(
    () => filterScanProfiles({
      rows: profiles,
      scope: scopeFilter,
      birthYear: birthYearFilter,
      status: statusFilter,
      profileId: profileFilter,
      search,
    }),
    [
      birthYearFilter,
      profiles,
      profileFilter,
      scopeFilter,
      search,
      statusFilter,
    ]
  )

  const selectedProfile = useMemo(
    () =>
      filteredProfiles.find(row => row.id === selectedId) ||
      profiles.find(row => row.id === selectedId) ||
      filteredProfiles[0] ||
      profiles[0] ||
      null,
    [filteredProfiles, profiles, selectedId]
  )

  useEffect(() => {
    if (!filteredProfiles.length) return

    setSelectedId(current => (
      filteredProfiles.some(row => row.id === current)
        ? current
        : filteredProfiles[0].id
    ))
  }, [filteredProfiles])

  const yearOptions = useMemo(
    () => buildScanYearOptions(leagues),
    [leagues]
  )

  const kpis = useMemo(() => {
    const databaseProfile =
      profiles.find(row => row.scope === 'database') || {}

    return [
      {
        id: 'leagues',
        label: 'ליגות',
        value: leagues.length,
      },
      {
        id: 'years',
        label: 'שנתונים',
        value: Math.max(yearOptions.length - 1, 0),
      },
      {
        id: 'loadedPlayers',
        label: 'שחקנים נטענו',
        value: databaseProfile.loadedPlayersCount || 0,
      },
      {
        id: 'profiles',
        label: 'פרופילי סקאוט',
        value: databaseProfile.scoutProfilesCount || 0,
      },
      {
        id: 'risk',
        label: 'בסיכון',
        value: databaseProfile.riskCount || 0,
      },
    ]
  }, [leagues.length, profiles, yearOptions.length])

  const openProfile = profile => {
    if (!profile) return
    setSelectedId(profile.id)
    setExpandedIds(current => ({
      ...current,
      [profile.id]: !current[profile.id],
    }))
  }

  const toggleProfileForLoad = (profileRowId, profileId) => {
    setSelectedProfilesById(current => {
      const currentIds = current[profileRowId] || []
      const exists = currentIds.includes(profileId)
      const nextIds = exists
        ? currentIds.filter(id => id !== profileId)
        : [...currentIds, profileId]

      return {
        ...current,
        [profileRowId]: nextIds,
      }
    })
  }

  const loadProfileDocuments = async profile => {
    if (!profile) return

    const profileIds = selectedProfilesById[profile.id] || []
    if (!profileIds.length) {
      setScanResultsById(current => ({
        ...current,
        [profile.id]: {
          loading: false,
          error: 'צריך לבחור לפחות פרופיל אחד לטעינה',
          rows: [],
        },
      }))
      return
    }

    const teams = getProfileTeams(profile)

    setScanResultsById(current => ({
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

          rows.push(...playerRows.map(player => ({
            ...player,
            profileId,
            profileLabel: getProfileLabel(profileId),
            teamSeasonKey: team.teamSeasonKey,
            teamName: team.clubName || team.teamName || team.sourceTeamName,
            leagueId: team.leagueId,
            leagueName: team.leagueName,
          })))
        }
      }

      const uniqueRows = Array.from(
        rows.reduce((map, row) => {
          const key = clean(row.searchDocId || row.id)
          if (!key) return map

          const existing = map.get(key)
          if (!existing) {
            map.set(key, {
              ...row,
              matchedProfileIds: unique([row.profileId]),
              matchedProfileLabels: unique([row.profileLabel]),
            })
            return map
          }

          map.set(key, {
            ...existing,
            ...row,
            matchedProfileIds: unique([
              ...(existing.matchedProfileIds || []),
              row.profileId,
            ]),
            matchedProfileLabels: unique([
              ...(existing.matchedProfileLabels || []),
              row.profileLabel,
            ]),
          })
          return map
        }, new Map()).values()
      )

      setScanResultsById(current => ({
        ...current,
        [profile.id]: {
          loading: false,
          error: '',
          rows: uniqueRows,
          loadedAt: new Date().toISOString(),
          teamsCount: teams.length,
          profilesCount: profileIds.length,
        },
      }))
    } catch (err) {
      setScanResultsById(current => ({
        ...current,
        [profile.id]: {
          loading: false,
          error: err?.message || 'טעינת מסמכי שחקנים נכשלה',
          rows: [],
        },
      }))
    }
  }

  return {
    loading,
    loadingIndicators,
    error,
    indicatorError,
    leagues,
    snapshots,
    opportunities,
    indicatorsLoaded,
    profiles,
    filteredProfiles,
    selectedProfile,
    selectedId,
    scopeFilter,
    birthYearFilter,
    statusFilter,
    profileFilter,
    search,
    expandedIds,
    selectedProfilesById,
    scanResultsById,
    yearOptions,
    kpis,
    loadSummaries,
    loadIndicators,
    setSelectedId,
    setScopeFilter,
    setBirthYearFilter,
    setStatusFilter,
    setProfileFilter,
    setSearch,
    openProfile,
    toggleProfileForLoad,
    loadProfileDocuments,
  }
}
