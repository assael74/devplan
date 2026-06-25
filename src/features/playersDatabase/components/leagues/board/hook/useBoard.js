// src/features/playersDatabase/components/leagues/board/hook/useBoard.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom'

import { useAuth } from '../../../../../../app/AuthProvider.js'
import {
  clean,
  createLeagueSeason,
  createSeasonKey,
} from '../../../../models/league.model.js'
import {
  ensureLeagueFromPlan,
  listLeagueSnapshotsByIds,
  listLeagues,
} from '../../../../services/pdbLeague.firestore.js'
import { findPlayersDatabaseYearGroupOpportunities } from '../../../../sharedLogic/yearGroupOpportunities.js'
import { getLeagueSeasonRows } from '../../leagueUtils.js'
import {
  getLeagueBoardCache,
  setLeagueBoardCache,
} from './leagueBoardCache.js'

const createDetailsForm = (league = {}) => ({
  leagueName: league.leagueName || '',
  ageGroupLabel: league.ageGroupLabel || '',
  level: league.level ?? '',
  region: league.region || '',
})

export const LEAGUE_SORT_OPTIONS = [
  {
    id: 'birthYear',
    label: 'שנתון',
    defaultDirection: 'asc',
  },
  {
    id: 'levelBirthYear',
    label: 'רמת ליגה ואז שנתון',
    defaultDirection: 'asc',
  },
  {
    id: 'ageGroupLevel',
    label: 'קבוצת גיל ואז רמה',
    defaultDirection: 'asc',
  },
]

export const LEAGUE_LEVEL_FILTERS = [
  { value: 'all', label: 'כל הליגות' },
  { value: '1', label: 'על' },
  { value: '2', label: 'לאומית' },
  { value: '3', label: 'ארצית' },
  { value: '4', label: 'מחוזית' },
]

const cleanText = value => String(value ?? '').trim()

const getPrimaryBirthYear = league => {
  const seasons = getLeagueSeasonRows(league)
  const years = seasons
    .map(season => Number(season.primaryBirthYear || season.birthYear))
    .filter(Number.isFinite)

  return years.length ? Math.min(...years) : 9999
}

const compareText = (a, b) =>
  cleanText(a).localeCompare(cleanText(b), 'he')

const compareLeagueValues = (a, b, sortBy) => {
  const aLevel = Number(a?.level) || 99
  const bLevel = Number(b?.level) || 99
  const aBirthYear = getPrimaryBirthYear(a)
  const bBirthYear = getPrimaryBirthYear(b)

  if (sortBy === 'birthYear') {
    return (aBirthYear - bBirthYear) ||
      (aLevel - bLevel) ||
      compareText(a?.ageGroupLabel, b?.ageGroupLabel) ||
      compareText(a?.leagueName, b?.leagueName)
  }

  if (sortBy === 'ageGroupLevel') {
    return compareText(a?.ageGroupLabel, b?.ageGroupLabel) ||
      (aLevel - bLevel) ||
      (aBirthYear - bBirthYear) ||
      compareText(a?.leagueName, b?.leagueName)
  }

  return (aLevel - bLevel) ||
    (aBirthYear - bBirthYear) ||
    compareText(a?.ageGroupLabel, b?.ageGroupLabel) ||
    compareText(a?.leagueName, b?.leagueName)
}

const sortLeagues = ({ leagues, sortBy, sortDirection }) => {
  const direction = sortDirection === 'desc' ? -1 : 1

  return [...leagues].sort((a, b) => (
    compareLeagueValues(a, b, sortBy) * direction
  ))
}

const getLeagueBirthYearValue = league => {
  const birthYear = getPrimaryBirthYear(league)

  return birthYear === 9999 ? '' : String(birthYear)
}

const filterLeagues = ({
  leagues,
  birthYearFilter,
  levelFilter,
}) => leagues.filter(league => {
  const birthYearOk =
    birthYearFilter === 'all' ||
    getLeagueBirthYearValue(league) === birthYearFilter
  const levelOk =
    levelFilter === 'all' ||
    String(league?.level ?? '') === levelFilter

  return birthYearOk && levelOk
})

const createSeasonForm = () => ({
  seasonId: '',
  birthYear: '',
  clubsCount: '',
})

const latestSnapshotIds = leagues => (
  Array.from(new Set(
    leagues.flatMap(league => (
      Object.values(league?.seasons || {})
        .map(season => cleanText(season?.latestSnapshotId))
        .filter(Boolean)
    ))
  ))
)

const getScoutProfilesCount = league => (
  Object.values(league?.teamsIndex || {})
    .reduce((acc, team) => (
      acc + (Number(team?.scoutProfilesCount) || 0)
    ), 0)
)

const getTeamScoutProfilesCount = (league, team) => {
  const index = league?.teamsIndex || {}
  const direct =
    index[cleanText(team?.teamSeasonKey)] ||
    index[cleanText(team?.teamSlotId)]

  if (direct) {
    return Number(direct.scoutProfilesCount) || 0
  }

  const teamSlot = Number(team?.teamSlot) || 1

  const match = Object.values(index).find(item => (
    cleanText(item?.clubId) === cleanText(team?.clubId) &&
    cleanText(item?.seasonId) === cleanText(team?.seasonId) &&
    cleanText(item?.ageGroupId).toLowerCase() ===
      cleanText(team?.ageGroupId).toLowerCase() &&
    (Number(item?.teamSlot) || 1) === teamSlot
  ))

  return Number(match?.scoutProfilesCount) || 0
}

const buildLeagueProfileRows = league => (
  Object.entries(league?.teamsIndex || {})
    .map(([key, team]) => {
      const scoutProfilesCount = Number(team?.scoutProfilesCount) || 0

      return {
        id: `profiles__${key}`,
        indicatorType: 'profiles',
        clubId: cleanText(team?.clubId),
        clubName: cleanText(
          team?.clubName ||
            team?.teamName ||
            team?.sourceTeamName ||
            key
        ),
        currentTeam: {
          ...team,
          teamSeasonKey: cleanText(team?.teamSeasonKey || key),
          teamSlotId: cleanText(team?.teamSlotId),
          clubId: cleanText(team?.clubId),
          clubName: cleanText(team?.clubName || team?.teamName),
          ageGroupLabel: cleanText(team?.ageGroupLabel || league?.ageGroupLabel),
          leagueLevel: team?.leagueLevel ?? team?.level ?? league?.level,
          leagueName: cleanText(team?.leagueName || league?.leagueName),
        },
        upperTeam: null,
        levelGap: 0,
        scoutProfilesCount,
      }
    })
    .filter(row => row.scoutProfilesCount > 0)
    .sort((a, b) => (
      b.scoutProfilesCount - a.scoutProfilesCount ||
      compareText(a.clubName, b.clubName)
    ))
)

export function useBoard() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedLeagueId = searchParams.get('leagueId') || ''
  const { user } = useAuth()

  const [createOpen, setCreateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [preloadLoading, setPreloadLoading] = useState(false)
  const [preloadError, setPreloadError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [latestSnapshots, setLatestSnapshots] = useState([])
  const [yearGroupOpportunities, setYearGroupOpportunities] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [sortBy, setSortBy] = useState('levelBirthYear')
  const [sortDirection, setSortDirection] = useState('asc')
  const [birthYearFilter, setBirthYearFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const [editingDetails, setEditingDetails] = useState(false)
  const [detailsForm, setDetailsForm] = useState(createDetailsForm)
  const [savingDetails, setSavingDetails] = useState(false)
  const [detailsError, setDetailsError] = useState('')

  const [addingSeason, setAddingSeason] = useState(false)
  const [seasonForm, setSeasonForm] = useState(createSeasonForm)
  const [savingSeason, setSavingSeason] = useState(false)
  const [seasonError, setSeasonError] = useState('')

  const selectedLeague = useMemo(
    () =>
      leagues.find(league => league.id === selectedId) ||
      leagues[0] ||
      null,
    [leagues, selectedId]
  )

  const filteredLeagues = useMemo(
    () => filterLeagues({
      leagues,
      birthYearFilter,
      levelFilter,
    }),
    [birthYearFilter, leagues, levelFilter]
  )

  const sortedLeagues = useMemo(
    () => sortLeagues({
      leagues: filteredLeagues,
      sortBy,
      sortDirection,
    }),
    [filteredLeagues, sortBy, sortDirection]
  )

  const birthYearOptions = useMemo(
    () => [
      { value: 'all', label: 'כל השנתונים' },
      ...Array.from(new Set(
        leagues.map(getLeagueBirthYearValue).filter(Boolean)
      ))
        .sort((a, b) => Number(a) - Number(b))
        .map(value => ({ value, label: value })),
    ],
    [leagues]
  )

  const leagueInsightsById = useMemo(() => {
    const byId = {}

    leagues.forEach(league => {
      byId[league.id] = {
        scoutProfilesCount: getScoutProfilesCount(league),
        opportunityCount: 0,
        maxLevelGap: 0,
      }
    })

    yearGroupOpportunities.forEach(opportunity => {
      const leagueId = cleanText(
        opportunity?.currentTeam?.leagueId ||
          opportunity?.currentTeam?.league?.id
      )

      if (!leagueId) return

      const insight = byId[leagueId] || {
        scoutProfilesCount: 0,
        opportunityCount: 0,
        maxLevelGap: 0,
      }

      insight.opportunityCount += 1
      insight.maxLevelGap = Math.max(
        insight.maxLevelGap,
        Number(opportunity?.levelGap) || 0
      )
      byId[leagueId] = insight
    })

    return byId
  }, [leagues, yearGroupOpportunities])

  const totalScoutProfilesCount = useMemo(
    () => leagues.reduce((acc, league) => (
      acc + getScoutProfilesCount(league)
    ), 0),
    [leagues]
  )

  const boardStatus = useMemo(() => [
    {
      id: 'preload',
      label: preloadLoading
        ? 'טוען רקע'
        : preloadError
          ? 'טעינת רקע נכשלה'
          : 'טעינה מוקדמת פעילה',
      color: preloadError ? 'danger' : 'success',
    },
    {
      id: 'opportunities',
      label: `${yearGroupOpportunities.length} שנתונים בסיכון`,
      color: yearGroupOpportunities.length ? 'warning' : 'neutral',
    },
    {
      id: 'profiles',
      label: `${totalScoutProfilesCount} התאמות סקאוט`,
      color: 'neutral',
    },
    {
      id: 'snapshots',
      label: `${latestSnapshots.length} צילומים`,
      color: 'neutral',
    },
  ], [
    latestSnapshots.length,
    preloadError,
    preloadLoading,
    totalScoutProfilesCount,
    yearGroupOpportunities.length,
  ])

  useEffect(() => {
    if (!sortedLeagues.length) return

    setSelectedId(current => (
      sortedLeagues.some(league => league.id === current)
        ? current
        : sortedLeagues[0]?.id || ''
    ))
  }, [sortedLeagues])

  const seasonRows = useMemo(
    () => getLeagueSeasonRows(selectedLeague),
    [selectedLeague]
  )

  const selectedLeagueInsight = useMemo(
    () => leagueInsightsById[selectedLeague?.id] || {
      scoutProfilesCount: 0,
      opportunityCount: 0,
      maxLevelGap: 0,
    },
    [leagueInsightsById, selectedLeague?.id]
  )

  const selectedLeagueOpportunities = useMemo(
    () => yearGroupOpportunities
      .filter(opportunity => (
        cleanText(
          opportunity?.currentTeam?.leagueId ||
            opportunity?.currentTeam?.league?.id
        ) === selectedLeague?.id
      ))
      .map(opportunity => ({
        ...opportunity,
        scoutProfilesCount: getTeamScoutProfilesCount(
          selectedLeague,
          opportunity.currentTeam
        ),
      })),
    [selectedLeague, selectedLeague?.id, yearGroupOpportunities]
  )

  const selectedLeagueProfileRows = useMemo(
    () => buildLeagueProfileRows(selectedLeague),
    [selectedLeague]
  )

  const preloadLeagueContext = useCallback(async nextLeagues => {
    const snapshotIds = latestSnapshotIds(nextLeagues)

    setPreloadLoading(true)
    setPreloadError('')

    try {
      const snapshots = await listLeagueSnapshotsByIds(snapshotIds)
      const opportunities = findPlayersDatabaseYearGroupOpportunities({
        leagues: nextLeagues,
        snapshots,
      })

      setLatestSnapshots(snapshots)
      setYearGroupOpportunities(opportunities)

      return {
        snapshots,
        opportunities,
        ok: true,
      }
    } catch (err) {
      setLatestSnapshots([])
      setYearGroupOpportunities([])
      setPreloadError(
        err?.message || 'טעינת נתוני רקע לליגות נכשלה'
      )
      return {
        snapshots: [],
        opportunities: [],
        ok: false,
      }
    } finally {
      setPreloadLoading(false)
    }
  }, [])

  const load = useCallback(async (options = {}) => {
    const force = options?.force === true

    setLoading(true)
    setLoadError('')
    setPreloadError('')

    try {
      const cached = force ? null : getLeagueBoardCache()

      if (cached) {
        setLeagues(cached.leagues)
        setLatestSnapshots(cached.latestSnapshots)
        setYearGroupOpportunities(cached.yearGroupOpportunities)

        setSelectedId(current => {
          const requestedExists = cached.leagues.some(
            league => league.id === requestedLeagueId
          )
          const currentExists = cached.leagues.some(
            league => league.id === current
          )

          if (requestedExists) return requestedLeagueId

          return currentExists
            ? current
            : cached.leagues[0]?.id || ''
        })

        return
      }

      const rows = await listLeagues()
      const nextLeagues = Array.isArray(rows) ? rows : []

      setLeagues(nextLeagues)
      const preloadResult = await preloadLeagueContext(nextLeagues)

      if (preloadResult.ok) {
        setLeagueBoardCache({
          leagues: nextLeagues,
          latestSnapshots: preloadResult.snapshots,
          yearGroupOpportunities: preloadResult.opportunities,
        })
      }

      setSelectedId(current => {
        const requestedExists = nextLeagues.some(
          league => league.id === requestedLeagueId
        )
        const currentExists = nextLeagues.some(
          league => league.id === current
        )

        if (requestedExists) return requestedLeagueId

        return currentExists
          ? current
          : nextLeagues[0]?.id || ''
      })
    } catch (err) {
      setLatestSnapshots([])
      setYearGroupOpportunities([])
      setLoadError(
        err?.message || 'טעינת ליגות נכשלה'
      )
    } finally {
      setLoading(false)
    }
  }, [preloadLeagueContext, requestedLeagueId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setDetailsForm(
      createDetailsForm(selectedLeague || {})
    )
    setEditingDetails(false)
    setDetailsError('')
    setAddingSeason(false)
    setSeasonForm(createSeasonForm())
    setSeasonError('')
  }, [selectedLeague?.id])

  const selectLeague = leagueId => {
    setSelectedId(leagueId)

    if (requestedLeagueId) {
      setSearchParams({}, { replace: true })
    }
  }

  const openLeague = () => {
    if (!selectedLeague?.id) return

    navigate(
      `/players-database/leagues/${encodeURIComponent(
        selectedLeague.id
      )}`,
      {
        state: {
          league: selectedLeague,
        },
      }
    )
  }

  const updateDetails = (field, value) => {
    setDetailsForm(current => ({
      ...current,
      [field]: value,
    }))

    setDetailsError('')
  }

  const startDetailsEdit = () => {
    setEditingDetails(true)
    setDetailsError('')
  }

  const cancelDetailsEdit = () => {
    setDetailsForm(
      createDetailsForm(selectedLeague || {})
    )
    setEditingDetails(false)
    setDetailsError('')
  }

  const saveDetails = async () => {
    if (!selectedLeague || savingDetails) return

    const level = Number(detailsForm.level)

    if (
      !clean(detailsForm.leagueName) ||
      !Number.isInteger(level) ||
      level < 1 ||
      level > 4
    ) {
      setDetailsError('שמירת פרטי הליגה נכשלה')
      return
    }

    setSavingDetails(true)
    setDetailsError('')

    try {
      await ensureLeagueFromPlan({
        ...selectedLeague,
        leagueName: clean(detailsForm.leagueName),
        ageGroupLabel: clean(detailsForm.ageGroupLabel),
        level,
        region: clean(detailsForm.region),
        updatedBy:
          user?.uid ||
          selectedLeague.updatedBy ||
          '',
      })

      await load({ force: true })
      setEditingDetails(false)
    } catch (err) {
      setDetailsError(
        err?.message || 'שמירת פרטי הליגה נכשלה'
      )
    } finally {
      setSavingDetails(false)
    }
  }

  const updateSeason = (field, value) => {
    setSeasonForm(current => ({
      ...current,
      [field]: value,
    }))

    setSeasonError('')
  }

  const toggleSeasonForm = () => {
    setAddingSeason(current => !current)
    setSeasonError('')
  }

  const saveSeason = async () => {
    if (!selectedLeague || savingSeason) return

    const seasonId = clean(seasonForm.seasonId)
    const birthYear = Number(seasonForm.birthYear)
    const clubsCount = Number(seasonForm.clubsCount)

    if (
      !seasonId ||
      !Number.isInteger(birthYear) ||
      !Number.isInteger(clubsCount) ||
      clubsCount < 1
    ) {
      setSeasonError('הוספת עונה נכשלה')
      return
    }

    const seasonKey = createSeasonKey(seasonId)

    setSavingSeason(true)
    setSeasonError('')

    try {
      await ensureLeagueFromPlan({
        ...selectedLeague,
        seasons: {
          ...(selectedLeague.seasons || {}),
          [seasonKey]: createLeagueSeason({
            seasonId,
            birthYear,
            clubsCount,
          }),
        },
        updatedBy:
          user?.uid ||
          selectedLeague.updatedBy ||
          '',
      })

      await load({ force: true })
      setAddingSeason(false)
      setSeasonForm(createSeasonForm())
    } catch (err) {
      setSeasonError(
        err?.message || 'הוספת עונה נכשלה'
      )
    } finally {
      setSavingSeason(false)
    }
  }

  const handleLeagueSaved = async league => {
    await load({ force: true })

    if (league?.id) {
      setSelectedId(league.id)
    }
  }

  return {
    createOpen,
    loading,
    loadError,
    preloadLoading,
    preloadError,
    leagues: sortedLeagues,
    latestSnapshots,
    yearGroupOpportunities,
    leagueInsightsById,
    boardStatus,
    selectedLeague,
    selectedLeagueInsight,
    selectedLeagueOpportunities,
    selectedLeagueProfileRows,
    seasonRows,
    editingDetails,
    detailsForm,
    savingDetails,
    detailsError,
    addingSeason,
    seasonForm,
    savingSeason,
    seasonError,

    load: () => load({ force: true }),
    selectLeague,
    openLeague,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    startDetailsEdit,
    cancelDetailsEdit,
    updateDetails,
    saveDetails,
    sortBy,
    sortDirection,
    sortOptions: LEAGUE_SORT_OPTIONS,
    setSortBy,
    setSortDirection,
    birthYearFilter,
    levelFilter,
    birthYearOptions,
    levelOptions: LEAGUE_LEVEL_FILTERS,
    setBirthYearFilter,
    setLevelFilter,
    toggleSeasonForm,
    updateSeason,
    saveSeason,
    handleLeagueSaved,
  }
}
