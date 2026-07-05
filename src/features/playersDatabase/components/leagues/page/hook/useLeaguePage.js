// src/features/playersDatabase/components/leagues/page/hook/useLeaguePage.js

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
  buildTeamsDrilldown,
  SCOUT_PROFILES,
  SCOUT_LEVEL,
} from '../../../../../../shared/players/scouting/index.js'
import {
  getLatestLeagueSnapshot,
  getLeague,
  getLeagueSnapshot,
  mergeLeagueTeamIndexFromDoc,
  updateLeagueTeamLink,
  updateLeagueSnapshotTeamSlot,
} from '../../../../services/pdbLeague.firestore.js'
import {
  buildLeagueTableRows,
  getPrimaryLeagueSeason,
} from '../../leagueUtils.js'
import { buildTeamIdentity } from '../../../../catalog/teamIdentity.js'
import { markLeagueBoardCacheDirty } from '../../../summary/hooks/leagueBoardCache.js'

export const PERSPECTIVES = [
  {
    id: 'premier',
    targetLevel: 1,
    label: 'ליגת על',
    levels: [
      SCOUT_LEVEL.BELOW,
      SCOUT_LEVEL.SAME,
      SCOUT_LEVEL.ABOVE,
    ],
  },
  {
    id: 'national',
    targetLevel: 2,
    label: 'לאומית',
    levels: [
      SCOUT_LEVEL.BELOW,
      SCOUT_LEVEL.SAME,
    ],
  },
  {
    id: 'regional',
    targetLevel: 3,
    label: 'ארצית',
    levels: [
      SCOUT_LEVEL.BELOW,
      SCOUT_LEVEL.SAME,
    ],
  },
  {
    id: 'district',
    targetLevel: 4,
    label: 'מחוזית',
    levels: [SCOUT_LEVEL.SAME],
  },
]

export const PLAYER_SEARCH_MODES = [
  {
    id: 'eligible',
    label: 'עם הקשר קבוצתי',
  },
  {
    id: 'raw',
    label: 'שחקן בלבד',
  },
]

const isActiveThreshold = value =>
  value !== null && value !== undefined

const getFilterState = ({
  drilldown,
  attackThreshold,
  defenseThreshold,
  includeUniversal,
}) => {
  const metrics = drilldown?.metrics || {}
  const deepSearch = (drilldown?.settings?.searchDistance || 0) >= 2
  const baseAttackActive = isActiveThreshold(attackThreshold)
  const baseDefenseActive = isActiveThreshold(defenseThreshold)
  const effectiveAttackThreshold = deepSearch
    ? drilldown?.settings?.deepAttackPerformanceThreshold
    : attackThreshold
  const effectiveDefenseThreshold = deepSearch
    ? drilldown?.settings?.deepDefensePerformanceThreshold
    : defenseThreshold
  const attackActive = baseAttackActive
  const defenseActive = baseDefenseActive

  const attack = Number(metrics.attackEdge)
  const defense = Number(metrics.defenseEdge)

  const attackOk =
    !attackActive ||
    (
      Number.isFinite(attack) &&
      attack >= effectiveAttackThreshold
    )

  const defenseOk =
    !defenseActive ||
    (
      Number.isFinite(defense) &&
      defense >= effectiveDefenseThreshold
    )

  const activeCount = [
    attackActive,
    defenseActive,
  ].filter(Boolean).length

  const matchedCount = [
    attackActive && attackOk,
    defenseActive && defenseOk,
  ].filter(Boolean).length

  const hasProfiles =
    (drilldown?.profiles || []).length > 0

  const label = !hasProfiles
    ? activeCount
      ? `אין התאמה 0/${activeCount}`
      : 'אין התאמה'
    : activeCount === 0
      ? includeUniversal
        ? 'התאמה מלאה'
        : 'ללא פילטר'
      : matchedCount === activeCount
        ? `התאמה מלאה ${matchedCount}/${activeCount}`
        : matchedCount > 0
          ? `התאמה חלקית ${matchedCount}/${activeCount}`
          : `אין התאמה ${matchedCount}/${activeCount}`

  const color = !hasProfiles
    ? 'danger'
    : activeCount === 0
      ? includeUniversal
        ? 'success'
        : 'neutral'
      : matchedCount === activeCount
        ? 'success'
        : matchedCount > 0
          ? 'warning'
          : 'danger'

  return {
    activeCount,
    matchedCount,
    label,
    color,
  }
}

const hasTeamsIndex = league =>
  Object.keys(league?.teamsIndex || {}).length > 0

export function useLeaguePage() {
  const { leagueId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const mountedRef = useRef(true)
  const initialLeagueRef = useRef(location.state?.league || null)

  const [league, setLeague] = useState(() => {
    const initialLeague = location.state?.league
    return initialLeague?.id === decodeURIComponent(leagueId)
      ? initialLeague
      : null
  })
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState('')
  const [perspectiveId, setPerspectiveId] = useState(
    PERSPECTIVES[0].id
  )
  const [attackThreshold, setAttackThreshold] = useState(null)
  const [defenseThreshold, setDefenseThreshold] = useState(null)
  const [includeUniversal, setIncludeUniversal] = useState(false)
  const [playerSearchProfileId, setPlayerSearchProfileId] = useState('')
  const [playerSearchMode, setPlayerSearchMode] = useState('eligible')
  const [teamLinkOpen, setTeamLinkOpen] = useState(false)
  const [teamLinkRow, setTeamLinkRow] = useState(null)
  const [teamLinkSaving, setTeamLinkSaving] = useState(false)
  const [teamLinkError, setTeamLinkError] = useState('')

  const decodedLeagueId = useMemo(
    () => decodeURIComponent(leagueId),
    [leagueId]
  )

  const activeSeason = useMemo(
    () => getPrimaryLeagueSeason(league),
    [league]
  )

  const tableRows = useMemo(
    () =>
      buildLeagueTableRows({
        league,
        season: activeSeason,
        snapshot,
      }),
    [activeSeason, league, snapshot]
  )

  const scoutPerspective = useMemo(
    () =>
      PERSPECTIVES.find(
        item => item.id === perspectiveId
      ) || PERSPECTIVES[0],
    [perspectiveId]
  )

  const scoutSettings = useMemo(
    () => ({
      perspective: scoutPerspective.id,
      sourceLeagueLevel: league?.level ?? null,
      targetLeagueLevel: scoutPerspective.targetLevel,
      attackPerformanceThreshold: attackThreshold,
      defensePerformanceThreshold: defenseThreshold,
      clearPerformanceThreshold: 0.1,
      deepAttackPerformanceThreshold: 0.2,
      deepDefensePerformanceThreshold: 0.2,
      deepClearPerformanceThreshold: 0.2,
      includeUniversal,
      enabledLevels: scoutPerspective.levels,
    }),
    [
      attackThreshold,
      defenseThreshold,
      includeUniversal,
      league,
      scoutPerspective,
    ]
  )

  const playerSearchProfile = useMemo(
    () =>
      SCOUT_PROFILES.find(
        profile => profile.id === playerSearchProfileId
      ) || null,
    [playerSearchProfileId]
  )

  const playerSearch = useMemo(
    () => ({
      active: Boolean(playerSearchProfileId),
      profileId: playerSearchProfileId,
      profileLabel: playerSearchProfile?.label || '',
      mode: playerSearchMode,
      modeLabel:
        PLAYER_SEARCH_MODES.find(item => item.id === playerSearchMode)?.label ||
        PLAYER_SEARCH_MODES[0].label,
    }),
    [
      playerSearchMode,
      playerSearchProfile,
      playerSearchProfileId,
    ]
  )

  const drilldownsByTeamId = useMemo(
    () =>
      buildTeamsDrilldown({
        rows: tableRows,
        settings: scoutSettings,
      }).reduce((acc, item) => {
        acc[item.teamId] = item
        return acc
      }, {}),
    [scoutSettings, tableRows]
  )

  const rows = useMemo(
    () =>
      tableRows.map(row => {
        const drilldown =
          drilldownsByTeamId[row.id]
        const searchCounts = playerSearchMode === 'raw'
          ? row.rawProfileCounts
          : row.profileCounts
        const playerSearchCount = playerSearchProfileId
          ? Number(searchCounts?.[playerSearchProfileId]) || 0
          : Number(row.playersCount) || 0

        return {
          row,
          drilldown,
          playerSearch: {
            ...playerSearch,
            count: playerSearchCount,
          },
          filterState: getFilterState({
            drilldown,
            attackThreshold,
            defenseThreshold,
            includeUniversal,
          }),
          expanded: expandedTeamId === row.id,
        }
      }),
    [
      attackThreshold,
      defenseThreshold,
      drilldownsByTeamId,
      expandedTeamId,
      includeUniversal,
      playerSearch,
      playerSearchMode,
      playerSearchProfileId,
      tableRows,
    ]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const initialLeague = initialLeagueRef.current
      let nextLeague =
        initialLeague?.id === decodedLeagueId
          ? initialLeague
          : await getLeague(decodedLeagueId)
      initialLeagueRef.current = null

      if (nextLeague?.id && !hasTeamsIndex(nextLeague)) {
        nextLeague = await getLeague(decodedLeagueId)
      }

      if (!mountedRef.current) return

      if (!nextLeague) {
        setError('הליגה לא נמצאה')
        setSnapshot(null)
        return
      }

      const season =
        getPrimaryLeagueSeason(nextLeague)

      if (!season) {
        setLeague(nextLeague)
        setSnapshot(null)
        return
      }

      const nextSnapshot =
        season.latestSnapshotId
          ? await getLeagueSnapshot(
              season.latestSnapshotId
            )
          : await getLatestLeagueSnapshot(
              decodedLeagueId,
              season.seasonId
            )

      if (!mountedRef.current) return

      const sourceLeagueId = nextSnapshot?.leagueId
      const mergeResult =
        sourceLeagueId && sourceLeagueId !== nextLeague.id
          ? await mergeLeagueTeamIndexFromDoc({
              targetLeagueId: nextLeague.id,
              sourceLeagueId,
            })
          : null
      const finalLeague = mergeResult?.merged
        ? await getLeague(decodedLeagueId)
        : nextLeague

      if (!mountedRef.current) return

      setLeague(finalLeague)
      setSnapshot(nextSnapshot || null)
    } catch (err) {
      if (!mountedRef.current) return

      setError(
        err?.message || 'טעינת ליגה נכשלה'
      )
      setSnapshot(null)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [decodedLeagueId])

  useEffect(() => {
    mountedRef.current = true
    load()

    return () => {
      mountedRef.current = false
    }
  }, [load])

  const resetFilters = useCallback(() => {
    setPerspectiveId(PERSPECTIVES[0].id)
    setAttackThreshold(null)
    setDefenseThreshold(null)
    setIncludeUniversal(false)
    setPlayerSearchProfileId('')
    setPlayerSearchMode('eligible')
    setExpandedTeamId('')
  }, [])

  const toggleTeam = teamId => {
    setExpandedTeamId(current =>
      current === teamId ? '' : teamId
    )
  }

  const changePerspective = value => {
    setPerspectiveId(value)
    setExpandedTeamId('')
  }

  const changeAttackThreshold = value => {
    setAttackThreshold(value)
    setExpandedTeamId('')
  }

  const changeDefenseThreshold = value => {
    setDefenseThreshold(value)
    setExpandedTeamId('')
  }

  const toggleUniversal = () => {
    setIncludeUniversal(current => !current)
    setExpandedTeamId('')
  }

  const changePlayerSearchProfile = value => {
    setPlayerSearchProfileId(value || '')
    setExpandedTeamId('')
  }

  const changePlayerSearchMode = value => {
    setPlayerSearchMode(value || 'eligible')
    setExpandedTeamId('')
  }

  const changeTeamSlot = async (rowId, value) => {
    const slot = Number(value)
    if (!snapshot?.id || !rowId || !Number.isInteger(slot)) return

    setSnapshot(current => {
      if (!current) return current

      return {
        ...current,
        rows: (current.rows || []).map(row => {
          if ((row.rowId || '') !== rowId) return row

          const identity = buildTeamIdentity({
            clubId: row.clubId,
            clubName: row.clubName,
            seasonId: current.seasonId || activeSeason?.seasonId,
            ageGroupId: current.ageGroupId || league?.ageGroupId,
            ageGroupLabel: current.ageGroupLabel || league?.ageGroupLabel,
            teamSlot: slot,
            leagueId: league?.id || current.leagueId,
            leagueName: current.leagueName || league?.leagueName,
          })

          return {
            ...row,
            teamSlot: identity.teamSlot,
            teamSlotId: identity.teamSlotId,
            teamSeasonKey: identity.teamSeasonKey,
          }
        }),
      }
    })

    await updateLeagueSnapshotTeamSlot({
      snapshotId: snapshot.id,
      rowId,
      teamSlot: slot,
      context: {
        leagueId: league?.id,
        leagueName: league?.leagueName,
        seasonId: activeSeason?.seasonId,
        ageGroupId: league?.ageGroupId,
        ageGroupLabel: league?.ageGroupLabel,
      },
    })

    markLeagueBoardCacheDirty()
    await load()
  }

  const openTeamLink = row => {
    setTeamLinkRow(row || null)
    setTeamLinkError('')
    setTeamLinkOpen(true)
  }

  const closeTeamLink = () => {
    if (teamLinkSaving) return

    setTeamLinkOpen(false)
    setTeamLinkRow(null)
    setTeamLinkError('')
  }

  const saveTeamLink = async value => {
    if (!league?.id || !teamLinkRow) return

    setTeamLinkSaving(true)
    setTeamLinkError('')

    try {
      await updateLeagueTeamLink({
        leagueId: league.id,
        team: teamLinkRow,
        teamUrl: value,
      })

      markLeagueBoardCacheDirty()
      await load()
      setTeamLinkOpen(false)
      setTeamLinkRow(null)
    } catch (err) {
      setTeamLinkError(err?.message || 'שמירת קישור הקבוצה נכשלה')
    } finally {
      setTeamLinkSaving(false)
    }
  }

  const handleSnapshotSaved = async savedSnapshot => {
    if (savedSnapshot) {
      setSnapshot(savedSnapshot)
    }

    markLeagueBoardCacheDirty()
    await load()
  }

  return {
    league,
    snapshot,
    activeSeason,
    rows,
    loading,
    error,
    decodedLeagueId,
    pasteOpen,
    perspectiveId,
    attackThreshold,
    defenseThreshold,
    includeUniversal,
    playerSearchProfileId,
    playerSearchMode,
    teamLinkOpen,
    teamLinkRow,
    teamLinkSaving,
    teamLinkError,
    tableRowsCount: tableRows.length,

    load,
    resetFilters,
    toggleTeam,
    changePerspective,
    changeAttackThreshold,
    changeDefenseThreshold,
    toggleUniversal,
    changePlayerSearchProfile,
    changePlayerSearchMode,
    changeTeamSlot,
    openTeamLink,
    closeTeamLink,
    saveTeamLink,
    openPaste: () => setPasteOpen(true),
    closePaste: () => setPasteOpen(false),
    goBack: () => {
      const targetLeagueId = league?.id || decodedLeagueId
      const params = new URLSearchParams()
      const boardFilters = location.state?.boardFilters || {}

      if (targetLeagueId) {
        params.set('leagueId', targetLeagueId)
      }

      if (
        boardFilters.birthYearFilter &&
        boardFilters.birthYearFilter !== 'all'
      ) {
        params.set('birthYear', boardFilters.birthYearFilter)
      }

      if (
        boardFilters.levelFilter &&
        boardFilters.levelFilter !== 'all'
      ) {
        params.set('level', boardFilters.levelFilter)
      }

      const query = params.toString()

      navigate(`/players-database${query ? `?${query}` : ''}`)
    },
    handleSnapshotSaved,
  }
}
