// src/features/playersDatabase/components/leagues/board/hook/useBoard.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../../../../../app/AuthProvider.js'
import {
  clean,
  createLeagueSeason,
  createSeasonKey,
} from '../../../../models/league.model.js'
import {
  ensureLeagueFromPlan,
  listLeagues,
} from '../../../../services/pdbLeague.firestore.js'
import { getLeagueSeasonRows } from '../../leagueUtils.js'

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

const createSeasonForm = () => ({
  seasonId: '',
  birthYear: '',
  clubsCount: '',
})

export function useBoard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [createOpen, setCreateOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [sortBy, setSortBy] = useState('levelBirthYear')
  const [sortDirection, setSortDirection] = useState('asc')

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

  const sortedLeagues = useMemo(
    () => sortLeagues({
      leagues,
      sortBy,
      sortDirection,
    }),
    [leagues, sortBy, sortDirection]
  )

  const seasonRows = useMemo(
    () => getLeagueSeasonRows(selectedLeague),
    [selectedLeague]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setLoadError('')

    try {
      const rows = await listLeagues()
      const nextLeagues = Array.isArray(rows) ? rows : []

      setLeagues(nextLeagues)

      setSelectedId(current => {
        const currentExists = nextLeagues.some(
          league => league.id === current
        )

        return currentExists
          ? current
          : nextLeagues[0]?.id || ''
      })
    } catch (err) {
      setLoadError(
        err?.message || 'טעינת ליגות נכשלה'
      )
    } finally {
      setLoading(false)
    }
  }, [])

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
  }

  const openLeague = () => {
    if (!selectedLeague?.id) return

    navigate(
      `/players-database/leagues/${encodeURIComponent(
        selectedLeague.id
      )}`
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

      await load()
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

      await load()
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
    await load()

    if (league?.id) {
      setSelectedId(league.id)
    }
  }

  return {
    createOpen,
    loading,
    loadError,
    leagues: sortedLeagues,
    selectedLeague,
    seasonRows,
    editingDetails,
    detailsForm,
    savingDetails,
    detailsError,
    addingSeason,
    seasonForm,
    savingSeason,
    seasonError,

    load,
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
    toggleSeasonForm,
    updateSeason,
    saveSeason,
    handleLeagueSaved,
  }
}
