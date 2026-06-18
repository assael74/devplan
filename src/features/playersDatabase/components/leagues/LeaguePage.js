// src/features/playersDatabase/components/league/LeaguePage.js

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Groups, ManageSearch, RestartAlt } from '@mui/icons-material'
import { Box, Button, Chip, Input, Sheet, Typography } from '@mui/joy'
import { useNavigate, useParams } from 'react-router-dom'

import {
  getLatestLeagueSnapshot,
  getLeague,
  getLeagueSnapshot,
} from '../../services/pdbLeague.firestore.js'
import { formatLtr } from '../../../../shared/format/direction.js'
import PasteModal from '../modals/PasteModal.js'
import {
  buildLeagueTableRows,
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getPrimaryLeagueSeason,
} from './leagueUtils.js'
import {
  buildTeamsDrilldown,
  SCOUT_LEVEL,
} from '../../../../shared/players/scouting/index.js'
import {
  getDrilldownUi,
  getScoutMetricItems,
  getScoutProfileItems,
} from './scoutUi.js'
import { leagueSx as sx } from './league.sx.js'

const PERSPECTIVES = [
  {
    id: 'premier',
    label: 'ליגת על',
    levels: [SCOUT_LEVEL.BELOW, SCOUT_LEVEL.SAME, SCOUT_LEVEL.ABOVE],
  },
  {
    id: 'national',
    label: 'לאומית',
    levels: [SCOUT_LEVEL.BELOW, SCOUT_LEVEL.SAME],
  },
  {
    id: 'regional',
    label: 'ארצית',
    levels: [SCOUT_LEVEL.BELOW, SCOUT_LEVEL.SAME],
  },
]

const THRESHOLDS = [0, 0.1, 0.2]

PERSPECTIVES.push({
  id: 'district',
  label: 'מחוזית',
  levels: [SCOUT_LEVEL.SAME],
})

const pctLabel = (value) => `${Math.round(Number(value || 0) * 100)}%`

const toThreshold = (value) => {
  if (value === '') return null

  const n = Number(value)
  if (!Number.isFinite(n)) return null

  return n / 100
}

const ThresholdInput = ({ value, onChange }) => (
  <Input
    type="number"
    size="sm"
    value={value === null ? '' : Math.round(value * 100)}
    placeholder="לא פעיל"
    endDecorator="%"
    slotProps={{ input: { step: 1 } }}
    sx={sx.filterInput}
    onChange={(event) => {
      onChange(toThreshold(event.target.value))
    }}
  />
)

const isActiveThreshold = (value) => value !== null && value !== undefined

const getFilterState = ({ drilldown, attackThreshold, defenseThreshold, includeUniversal }) => {
  const metrics = drilldown?.metrics || {}
  const attackActive = isActiveThreshold(attackThreshold)
  const defenseActive = isActiveThreshold(defenseThreshold)
  const attack = Number(metrics.attackEdge)
  const defense = Number(metrics.defenseEdge)
  const attackOk = !attackActive || (Number.isFinite(attack) && attack >= attackThreshold)
  const defenseOk = !defenseActive || (Number.isFinite(defense) && defense >= defenseThreshold)
  const activeCount = [attackActive, defenseActive].filter(Boolean).length
  const matchedCount = [attackActive && attackOk, defenseActive && defenseOk].filter(Boolean).length
  const hasProfiles = (drilldown?.profiles || []).length > 0
  const label = !hasProfiles
    ? activeCount ? `אין התאמה 0/${activeCount}` : 'אין התאמה'
    : activeCount === 0
      ? includeUniversal ? 'התאמה מלאה' : 'ללא פילטר'
      : matchedCount === activeCount
      ? `התאמה מלאה ${matchedCount}/${activeCount}`
      : matchedCount > 0
        ? `התאמה חלקית ${matchedCount}/${activeCount}`
        : `אין התאמה ${matchedCount}/${activeCount}`
  const color = !hasProfiles
    ? 'danger'
    : activeCount === 0
      ? includeUniversal ? 'success' : 'neutral'
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
    visible: activeCount === 0 || (attackOk && defenseOk),
  }
}

const TeamCell = ({ row, drilldown, filterState, expanded, onToggle }) => {
  return (
    <Box sx={sx.teamCell}>
      <Box aria-hidden="true" sx={sx.teamIcon}>
        <Groups fontSize="inherit" />
      </Box>

      <Typography level="body-sm" sx={sx.teamName}>
        {row.clubName}
      </Typography>

      <Chip
        size="sm"
        variant="soft"
        color={filterState.color}
        title={filterState.label}
      >
        <Box component="span" sx={sx.narrativeMini}>
          <ManageSearch fontSize="inherit" />
        </Box>
        {filterState.label}
      </Chip>

      <Button
        size="sm"
        variant="plain"
        color="neutral"
        sx={sx.expandBtn}
        onClick={(event) => {
          event.stopPropagation()
          onToggle()
        }}
      >
        {expanded ? '-' : '+'}
      </Button>
    </Box>
  )
}

const ScoutDetails = ({ drilldown }) => {
  const drilldownUi = getDrilldownUi(drilldown?.status)
  const searchItems = getScoutProfileItems(drilldown)
  const metricItems = getScoutMetricItems(drilldown)

  return (
    <Box sx={sx.narrativePanel}>
      <Box sx={sx.diagnosisPanel}>
        <Box sx={sx.summaryMain}>
          <Typography level="body-xs" sx={sx.narrativeLabel}>
            פירוש הנרטיב
          </Typography>

          <Box sx={sx.summaryTitleRow}>
            <Box aria-hidden="true" sx={sx.narrativeIcon}>
              <ManageSearch fontSize="inherit" />
            </Box>

            <Chip
              size="sm"
              variant="soft"
              color={drilldownUi.color}
            >
              {drilldownUi.label}
            </Chip>

            <Typography level="body-sm" sx={sx.narrativeText}>
              פרופילים {searchItems.length}
            </Typography>
          </Box>

          <Box sx={sx.narrativeChips}>
            {(drilldown?.contextualProfiles?.length ? ['התאמה קבוצתית'] : ['חיפוש כללי']).map((reason) => (
              <Chip
                key={reason}
                size="sm"
                variant="outlined"
                color={drilldownUi.color}
              >
                {reason}
              </Chip>
            ))}
          </Box>
        </Box>

        <Box sx={sx.metricList}>
          {metricItems.map((item) => (
            <Box key={item.id} sx={sx.metricRow}>
              <Typography level="body-xs" sx={sx.metricLabel}>
                {item.label}
              </Typography>

              <Box sx={sx.metricNumbers}>
                <Typography level="body-sm" sx={sx.metricValue}>
                  {item.value}
                </Typography>

                {item.compareLabel && (
                  <Typography level="body-xs" sx={sx.metricCompare}>
                    {item.compareValue}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={sx.workList}>
        <Box sx={sx.searchHeader}>
          <Typography level="body-xs" sx={sx.narrativeLabel}>
            מה לחפש בקבוצה
          </Typography>

          <Typography level="body-xs" sx={sx.searchHint}>
            פרופילי שחקן שמתאימים לנרטיב הזה
          </Typography>
        </Box>

        <Box sx={sx.searchList}>
          {searchItems.map((item) => (
            <Box key={item.id} sx={sx.searchItem}>
              <Box sx={sx.searchProfile}>
                <Box sx={sx.searchProfileText}>
                  <Typography level="body-sm" sx={sx.searchTitle}>
                    {item.label}
                  </Typography>

                <Typography level="body-xs" sx={sx.searchDesc}>
                  {item.description}
                </Typography>
                </Box>
              </Box>

              <Box sx={sx.paramList}>
                {item.params.map((param) => (
                  <Chip
                    key={param}
                    size="sm"
                    variant="outlined"
                    color="neutral"
                  >
                    {param}
                  </Chip>
                ))}
              </Box>

              <Box sx={sx.interestCell}>
                <Chip size="sm" variant="soft" color="neutral">
                  {item.interestLabel}
                </Chip>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  )
}

export default function LeaguePage() {
  const { leagueId = '' } = useParams()
  const navigate = useNavigate()
  const mountedRef = useRef(true)

  const [league, setLeague] = useState(null)
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pasteOpen, setPasteOpen] = useState(false)
  const [expandedTeamId, setExpandedTeamId] = useState('')
  const [perspectiveId, setPerspectiveId] = useState(PERSPECTIVES[0].id)
  const [attackThreshold, setAttackThreshold] = useState(null)
  const [defenseThreshold, setDefenseThreshold] = useState(null)
  const [includeUniversal, setIncludeUniversal] = useState(false)

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
        season: activeSeason,
        snapshot,
      }),
    [activeSeason, snapshot]
  )

  const scoutPerspective = useMemo(() => {
    return PERSPECTIVES.find((item) => item.id === perspectiveId) || PERSPECTIVES[0]
  }, [perspectiveId])

  const scoutSettings = useMemo(() => ({
    perspective: scoutPerspective.id,
    attackPerformanceThreshold: attackThreshold,
    defensePerformanceThreshold: defenseThreshold,
    clearPerformanceThreshold: 0.1,
    includeUniversal,
    enabledLevels: scoutPerspective.levels,
  }), [attackThreshold, defenseThreshold, includeUniversal, scoutPerspective])

  const resetScoutFilters = useCallback(() => {
    setPerspectiveId(PERSPECTIVES[0].id)
    setAttackThreshold(null)
    setDefenseThreshold(null)
    setIncludeUniversal(false)
    setExpandedTeamId('')
  }, [])

  const drilldownsByTeamId = useMemo(() => {
    return buildTeamsDrilldown({
      rows: tableRows,
      settings: scoutSettings,
    }).reduce((acc, item) => {
      acc[item.teamId] = item
      return acc
    }, {})
  }, [scoutSettings, tableRows])

  const loadLeague = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const nextLeague = await getLeague(decodedLeagueId)

      if (!mountedRef.current) return

      setLeague(nextLeague)

      if (!nextLeague) {
        setError('הליגה לא נמצאה')
        setSnapshot(null)
        return
      }

      const season = getPrimaryLeagueSeason(nextLeague)

      if (!season) {
        setSnapshot(null)
        return
      }

      const nextSnapshot = season.latestSnapshotId
        ? await getLeagueSnapshot(season.latestSnapshotId)
        : await getLatestLeagueSnapshot(
            decodedLeagueId,
            season.seasonId
          )

      if (!mountedRef.current) return

      setSnapshot(nextSnapshot || null)
    } catch (err) {
      if (!mountedRef.current) return

      setError(err?.message || 'טעינת ליגה נכשלה')
      setSnapshot(null)
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [decodedLeagueId])

  useEffect(() => {
    mountedRef.current = true
    loadLeague()

    return () => {
      mountedRef.current = false
    }
  }, [loadLeague])

  const handleSnapshotSaved = async (savedSnapshot) => {
    if (savedSnapshot) {
      setSnapshot(savedSnapshot)
    }

    await loadLeague()
  }

  return (
    <Box>
      <Sheet sx={sx.board}>
        <Box sx={sx.boardTop}>
          <Box>
            <Typography level="title-lg" sx={sx.title}>
              {league?.leagueName || 'ליגה'}
            </Typography>

            <Typography level="body-sm" sx={sx.meta}>
              {league
                ? `${league.ageGroupLabel} | ${getLeagueLevelLabel(
                    league.level
                  )} | ${getLeagueRegionLabel(league.region)}`
                : decodedLeagueId}
            </Typography>
          </Box>

          <Box sx={sx.navControls}>
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              onClick={() => navigate('/players-database')}
            >
              חזרה לרשימה
            </Button>

            <Button
              size="sm"
              color="primary"
              disabled={!league || !activeSeason}
              onClick={() => setPasteOpen(true)}
            >
              טען צילום ליגה
            </Button>
          </Box>
        </Box>

        {error ? (
          <Typography sx={sx.error}>
            {error}
          </Typography>
        ) : (
          <Box sx={sx.detailBody}>
            <Box sx={sx.metaBar}>
              <Typography level="title-md" sx={sx.sectionTitle}>
                טבלת ליגה
              </Typography>

              <Box sx={sx.leagueInfo}>
                <Chip size="sm" variant="soft" color="neutral">
                  רמה {league ? getLeagueLevelLabel(league.level) : '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {league ? getLeagueRegionLabel(league.region) : '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  עונה {activeSeason?.seasonId || '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="warning" sx={sx.birthChip}>
                  שנתון {activeSeason?.primaryBirthYear || '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {tableRows.length} מועדונים
                </Chip>

                {loading && (
                  <Chip size="sm" variant="soft" color="primary">
                    טוען
                  </Chip>
                )}
              </Box>

              <Box sx={sx.chips}>
                <Box sx={sx.filterGroup}>
                  <Typography level="body-xs" sx={sx.filterLabel}>
                    פרספקטיבה
                  </Typography>

                  <Typography level="body-xs" sx={sx.filterLabel}>
                    אני מחפש שחקן עבור
                  </Typography>

                  {PERSPECTIVES.map((item) => (
                    <Button
                      key={item.id}
                      size="sm"
                      variant={perspectiveId === item.id ? 'solid' : 'soft'}
                      color={perspectiveId === item.id ? 'primary' : 'neutral'}
                      sx={sx.filterBtn}
                      onClick={() => {
                        setPerspectiveId(item.id)
                        setExpandedTeamId('')
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Box>

                <Box sx={sx.filterGroup}>
                  <Typography level="body-xs" sx={sx.filterLabel}>
                    התקפה
                  </Typography>

                  <ThresholdInput
                    value={attackThreshold}
                    onChange={(value) => {
                      setAttackThreshold(value)
                      setExpandedTeamId('')
                    }}
                  />

                  {THRESHOLDS.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={attackThreshold === value ? 'solid' : 'soft'}
                      color={attackThreshold === value ? 'success' : 'neutral'}
                      sx={sx.filterBtn}
                      onClick={() => {
                        setAttackThreshold(value)
                        setExpandedTeamId('')
                      }}
                    >
                      מעל {pctLabel(value)}
                    </Button>
                  ))}
                </Box>

                <Box sx={sx.filterGroup}>
                  <Typography level="body-xs" sx={sx.filterLabel}>
                    הגנה
                  </Typography>

                  <ThresholdInput
                    value={defenseThreshold}
                    onChange={(value) => {
                      setDefenseThreshold(value)
                      setExpandedTeamId('')
                    }}
                  />

                  {THRESHOLDS.map((value) => (
                    <Button
                      key={value}
                      size="sm"
                      variant={defenseThreshold === value ? 'solid' : 'soft'}
                      color={defenseThreshold === value ? 'success' : 'neutral'}
                      sx={sx.filterBtn}
                      onClick={() => {
                        setDefenseThreshold(value)
                        setExpandedTeamId('')
                      }}
                    >
                      מעל {pctLabel(value)}
                    </Button>
                  ))}
                </Box>

                <Button
                  size="sm"
                  variant={includeUniversal ? 'solid' : 'soft'}
                  color={includeUniversal ? 'success' : 'danger'}
                  sx={sx.filterBtn}
                  onClick={() => {
                    setIncludeUniversal((value) => !value)
                    setExpandedTeamId('')
                  }}
                >
                  חיפוש כללי {includeUniversal ? 'פעיל' : 'כבוי'}
                </Button>

                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  title="איפוס פילטרים"
                  aria-label="איפוס פילטרים"
                  sx={sx.resetBtn}
                  onClick={resetScoutFilters}
                >
                  <RestartAlt fontSize="small" />
                </Button>

                <Chip size="sm" variant="soft" color="neutral">
                  מזהה {decodedLeagueId}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  רמה{' '}
                  {league
                    ? getLeagueLevelLabel(league.level)
                    : '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {league
                    ? getLeagueRegionLabel(league.region)
                    : '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  עונה {activeSeason?.seasonId || '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  שנתון {activeSeason?.primaryBirthYear || '-'}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {tableRows.length} מועדונים
                </Chip>

                {loading && (
                  <Chip
                    size="sm"
                    variant="soft"
                    color="primary"
                  >
                    טוען
                  </Chip>
                )}
              </Box>
            </Box>

            <Box className="dpScrollThin" sx={sx.tableWrap}>
              <Box component="table" sx={sx.table}>
                <thead>
                  <tr>
                    <th>מקום</th>
                    <th>קבוצה</th>
                    <th>משחקים</th>
                    <th>נצ'</th>
                    <th>תיקו</th>
                    <th>הפ'</th>
                    <th>זכות</th>
                    <th>חובה</th>
                    <th>הפרש</th>
                    <th>נק'</th>
                  </tr>
                </thead>

                <tbody>
                  {tableRows.map((row) => {
                    const drilldown = drilldownsByTeamId[row.id]
                    const filterState = getFilterState({
                      drilldown,
                      attackThreshold,
                      defenseThreshold,
                      includeUniversal,
                    })
                    const expanded = expandedTeamId === row.id

                    return (
                      <React.Fragment key={row.id}>
                        <tr
                          className={[
                            row.placeholder ? 'isPlaceholder' : '',
                            expanded ? 'isExpanded' : '',
                          ].filter(Boolean).join(' ') || undefined}
                          onClick={() => {
                            setExpandedTeamId(expanded ? '' : row.id)
                          }}
                        >
                          <td>{row.leaguePosition}</td>
                          <td>
                            <TeamCell
                              row={row}
                              drilldown={drilldown}
                              filterState={filterState}
                              expanded={expanded}
                              onToggle={() => {
                                setExpandedTeamId(expanded ? '' : row.id)
                              }}
                            />
                          </td>
                          <td>{row.games}</td>
                          <td>{row.wins}</td>
                          <td>{row.draws}</td>
                          <td>{row.losses}</td>
                          <td>{row.goalsFor}</td>
                          <td>{row.goalsAgainst}</td>
                          <td>{formatLtr(row.goalDifference)}</td>
                          <td>{row.points}</td>
                        </tr>

                        {expanded && (
                          <tr className="isScoutDetails">
                            <td colSpan={10}>
                              <ScoutDetails drilldown={drilldown} />
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  })}
                </tbody>
              </Box>
            </Box>
          </Box>
        )}
      </Sheet>

      <PasteModal
        open={pasteOpen}
        onClose={() => setPasteOpen(false)}
        league={league}
        season={activeSeason}
        onSaved={handleSnapshotSaved}
      />
    </Box>
  )
}
