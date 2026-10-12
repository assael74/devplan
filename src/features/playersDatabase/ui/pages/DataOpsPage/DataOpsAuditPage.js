// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsAuditPage.js

import { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import InfoPanel from '../../components/page/InfoPanel.js'
import usePlayersDatabaseReadStoreEntry from '../../hooks/usePlayersDatabaseReadStoreEntry.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../logic/routeBuilders.js'
import { getSeasonCatalogOptions } from '../../../catalog/seasons.catalog.js'
import { buildTeamSeasonDocumentId } from '../../../domain/identity/index.js'
import { auditLeague } from '../../../services/audit/league/index.js'
import { auditStats } from '../../../services/audit/stats/index.js'
import { getFocusedAuditFindingKey } from '../../../services/audit/repair/index.js'
import {
  getTeamSeasonByDocumentId,
  CLUBS_DIRECTORY_STORE_KEY,
  LEAGUES_CENTER_STORE_KEY,
} from '../../../services/read/index.js'
import {
  buildFocusedAuditPlan,
  getFocusedAuditAgeGroupOptions,
  getFocusedAuditBirthYearOptions,
  getFocusedAuditClubOptions,
  getFocusedAuditLeagueOptions,
  getFocusedAuditPlayerOptions,
  getFocusedAuditTeamSlotOptions,
  getFocusedAuditTeamOptions,
} from './logic/focusedAudit.model.js'
import { downloadDataOpsJson } from './logic/dataOpsJsonDownload.logic.js'
import { getFocusedAuditScopeDetails } from './logic/focusedAuditFindings.presentation.js'
import FocusedAuditFindingCard from './components/FocusedAuditFindingCard.js'
import FocusedAuditRepairDialog from './components/FocusedAuditRepairDialog.js'
import useFocusedAuditRepair from './hooks/useFocusedAuditRepair.js'
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'
import { focusedAuditFindingsSx as findingSx } from './sx/focusedAuditFindings.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const EMPTY_DOCUMENT = Object.freeze({})

const statusOf = result => clean(result && (result.status || result.result)).toUpperCase()

export default function DataOpsAuditPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const leaguesCenterEntry = usePlayersDatabaseReadStoreEntry(LEAGUES_CENTER_STORE_KEY)
  const clubsDirectoryEntry = usePlayersDatabaseReadStoreEntry(CLUBS_DIRECTORY_STORE_KEY)
  const leaguesCenterDoc = leaguesCenterEntry.data || EMPTY_DOCUMENT
  const clubsDirectoryDoc = clubsDirectoryEntry.data || EMPTY_DOCUMENT
  const initialType = ['league', 'team', 'player'].includes(searchParams.get('type'))
    ? searchParams.get('type')
    : 'team'
  const [type, setType] = useState(initialType)
  const [leagueId, setLeagueId] = useState(searchParams.get('league') || '')
  const [teamId, setTeamId] = useState(searchParams.get('team') || '')
  const [playerId, setPlayerId] = useState(searchParams.get('player') || '')
  const [seasonId, setSeasonId] = useState(searchParams.get('season') || '')
  const [clubId, setClubId] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [teamSlot, setTeamSlot] = useState('')
  const [ageGroupSelection, setAgeGroupSelection] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [auditScope, setAuditScope] = useState(null)
  const [visibleFindings, setVisibleFindings] = useState(40)
  const [teamSeason, setTeamSeason] = useState(null)
  const [teamSeasonLoading, setTeamSeasonLoading] = useState(false)
  const [teamSeasonError, setTeamSeasonError] = useState('')
  const repair = useFocusedAuditRepair({
    scope: auditScope,
    onAuditUpdated: nextResult => {
      setResult(nextResult)
      setVisibleFindings(40)
    },
  })
  const controlsDisabled = busy || repair.repairing

  const seasonOptions = useMemo(() => getSeasonCatalogOptions(), [])
  const leagueOptions = useMemo(() => getFocusedAuditLeagueOptions({
    leaguesCenterDoc,
    seasonId,
  }), [leaguesCenterDoc, seasonId])
  const teamOptions = useMemo(() => getFocusedAuditTeamOptions({
    leaguesCenterDoc,
  }), [leaguesCenterDoc])
  const seasonTeamOptions = useMemo(
    () => teamOptions.filter(option => option.seasonId === seasonId),
    [seasonId, teamOptions]
  )
  const clubOptions = useMemo(() => getFocusedAuditClubOptions({
    teamOptions: seasonTeamOptions,
    clubsDirectoryDoc,
  }), [clubsDirectoryDoc, seasonTeamOptions])
  const birthYearOptions = useMemo(() => getFocusedAuditBirthYearOptions({
    teamOptions,
    clubId,
    teamSlot,
    seasonId,
  }), [clubId, seasonId, teamOptions, teamSlot])
  const teamSlotOptions = useMemo(() => getFocusedAuditTeamSlotOptions({
    teamOptions: seasonTeamOptions,
    clubId,
  }), [clubId, seasonTeamOptions])
  const teamAuditSeasonOptions = useMemo(() => {
    const availableIds = new Set(teamOptions.map(option => option.seasonId))
    return seasonOptions.filter(option => availableIds.has(option.seasonId))
  }, [seasonOptions, teamOptions])
  const ageGroupOptions = useMemo(() => getFocusedAuditAgeGroupOptions({
    teamOptions,
    clubId,
    seasonId,
    birthYear,
    teamSlot,
  }), [birthYear, clubId, seasonId, teamOptions, teamSlot])
  const playerOptions = useMemo(
    () => getFocusedAuditPlayerOptions(teamSeason),
    [teamSeason]
  )
  useEffect(() => {
    if (!teamId || !teamOptions.length) return
    const option = teamOptions.find(item => (
      item.value === teamId
      && (!leagueId || item.leagueId === leagueId)
      && (!seasonId || item.seasonId === seasonId)
    ))
    if (!option) return
    setClubId(option.clubId)
    setBirthYear(String(option.birthYear))
    setTeamSlot(String(option.teamSlot))
    setAgeGroupSelection(`${option.leagueId}::${option.value}`)
    if (!leagueId) setLeagueId(option.leagueId)
  }, [leagueId, seasonId, teamId, teamOptions])

  useEffect(() => {
    if (type !== 'player' || !clean(teamId) || !clean(seasonId)) {
      setTeamSeason(null)
      setTeamSeasonLoading(false)
      setTeamSeasonError('')
      return undefined
    }

    let active = true
    const documentId = buildTeamSeasonDocumentId({ teamId, seasonId })
    setTeamSeason(null)
    setTeamSeasonLoading(true)
    setTeamSeasonError('')

    getTeamSeasonByDocumentId(documentId)
      .then(document => {
        if (!active) return
        setTeamSeason(document)
        if (!document) setTeamSeasonError('לא נמצא מסמך עונה לקבוצה שנבחרה')
      })
      .catch(loadError => {
        if (!active) return
        setTeamSeasonError(loadError instanceof Error
          ? loadError.message
          : 'טעינת סגל הקבוצה נכשלה')
      })
      .finally(() => {
        if (active) setTeamSeasonLoading(false)
      })

    return () => {
      active = false
    }
  }, [seasonId, teamId, type])

  const auditPlan = useMemo(() => buildFocusedAuditPlan({
    type,
    leaguesCenterDoc,
    leagueId,
    seasonId,
    teamId,
    teamSeason,
  }), [leagueId, leaguesCenterDoc, seasonId, teamId, teamSeason, type])

  const canRun = Boolean(
    clean(leagueId)
    && clean(seasonId)
    && (type === 'league' || clean(teamId))
    && (type !== 'player' || clean(playerId))
  )
  const findings = useMemo(() => (
    Array.isArray(result && result.findings) ? result.findings : []
  ), [result])

  const clearAuditResult = () => {
    setResult(null)
    setAuditScope(null)
    repair.reset()
  }

  const resetResolvedTeam = () => {
    setAgeGroupSelection('')
    setLeagueId('')
    setTeamId('')
    setPlayerId('')
    clearAuditResult()
  }

  const resetFromTeamSlot = () => {
    setBirthYear('')
    resetResolvedTeam()
  }

  const resetFromClub = () => {
    setTeamSlot('')
    resetFromTeamSlot()
  }

  const resetFromSeason = () => {
    setClubId('')
    resetFromClub()
  }

  const changeType = nextType => {
    if (controlsDisabled) return
    setType(nextType)
    resetFromSeason()
    setVisibleFindings(40)
    setError('')
  }

  const runAudit = async () => {
    if (!canRun || controlsDisabled) return
    setBusy(true)
    setError('')
    clearAuditResult()
    setVisibleFindings(40)
    try {
      const scope = {
        type,
        leagueId: clean(leagueId),
        teamId: clean(teamId),
        playerId: clean(playerId),
        seasonId: clean(seasonId),
      }
      const nextResult = type === 'league'
        ? await auditLeague({ leagueId: scope.leagueId, seasonId: scope.seasonId })
        : await auditStats({
            leagueId: scope.leagueId,
            teamId: scope.teamId,
            seasonId: scope.seasonId,
            scopedPlayerIds: type === 'player' ? [scope.playerId] : [],
          })
      setSearchParams(scope)
      setAuditScope(scope)
      setResult(nextResult)
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : 'הבדיקה נכשלה')
    } finally {
      setBusy(false)
    }
  }

  const openFindingContext = finding => {
    if (!auditScope || repair.repairing) return
    const targetLeagueId = clean(finding && finding.leagueId) || auditScope.leagueId
    const targetTeamId = clean(finding && finding.teamId) || auditScope.teamId
    const targetPlayerId = clean(finding && finding.playerId) || auditScope.playerId
    if (targetPlayerId) {
      navigate(PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: targetPlayerId,
        leagueId: targetLeagueId,
        teamId: targetTeamId,
        seasonKey: auditScope.seasonId,
      }))
      return
    }
    if (targetTeamId && targetLeagueId) {
      navigate(PLAYERS_DATABASE_UI_ROUTES.team({
        leagueId: targetLeagueId,
        teamId: targetTeamId,
        auditSeasonKey: auditScope.seasonId,
      }))
      return
    }
    if (targetLeagueId) navigate(PLAYERS_DATABASE_UI_ROUTES.league(targetLeagueId))
  }

  const ageGroupField = (
    <FormControl required size='sm' disabled={controlsDisabled || !birthYear}>
      <FormLabel>קבוצת גיל</FormLabel>
      <Select
        size='sm'
        value={ageGroupSelection || null}
        placeholder='בחר קבוצת גיל'
        onChange={(_event, value) => {
          const selected = ageGroupOptions.find(option => option.value === value)
          setAgeGroupSelection(value || '')
          setLeagueId(selected ? selected.leagueId : '')
          setTeamId(selected ? selected.teamId : '')
          setPlayerId('')
          clearAuditResult()
        }}
      >
        {ageGroupOptions.map(option => (
          <Option key={option.value} value={option.value}>{option.label}</Option>
        ))}
      </Select>
    </FormControl>
  )

  return (
    <Box sx={sx.auditLayout}>
      <Box className='dpScrollThin' sx={[sx.auditPanelScroll, sx.auditConfigPanelScroll]}>
        <InfoPanel title='הגדרת הבדיקה' sx={sx.auditFullPanel}>
          <Stack sx={sx.auditConfigStack}>
            <Box sx={sx.auditTypeButtons}>
              {[
                ['team', 'קבוצה', 'teams'],
                ['league', 'ליגה', 'league'],
                ['player', 'שחקן', 'players'],
              ].map(([id, label, iconId]) => (
                <Button
                  key={id}
                  type='button'
                  size='sm'
                  variant={type === id ? 'solid' : 'outlined'}
                  color={type === id ? 'primary' : 'neutral'}
                  disabled={controlsDisabled}
                  startDecorator={iconUi({ id: iconId, size: 'sm' })}
                  onClick={() => changeType(id)}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {type === 'league' ? (
              <>
                <FormControl required size='sm' disabled={controlsDisabled}>
                  <FormLabel>עונה</FormLabel>
                  <Select
                    size='sm'
                    indicator={null}
                    value={seasonId || null}
                    placeholder='בחר עונה'
                    onChange={(_event, value) => {
                      setSeasonId(value || '')
                      setLeagueId('')
                      clearAuditResult()
                    }}
                  >
                    {seasonOptions.map(option => (
                      <Option key={option.seasonId} value={option.seasonId}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl required size='sm' disabled={controlsDisabled || !seasonId}>
                  <FormLabel>ליגה</FormLabel>
                  <Select
                    size='sm'
                    value={leagueId || null}
                    placeholder={seasonId ? 'בחר ליגה' : 'בחר עונה תחילה'}
                    onChange={(_event, value) => {
                      setLeagueId(value || '')
                      clearAuditResult()
                    }}
                  >
                    {leagueOptions.map(option => (
                      <Option key={option.value} value={option.value}>{option.label}</Option>
                    ))}
                  </Select>
                </FormControl>
              </>
            ) : null}
            {type !== 'league' ? (
              <>
                <Box sx={sx.auditSeasonClubSlotFields}>
                  <FormControl required size='sm' disabled={controlsDisabled}>
                    <FormLabel>עונה</FormLabel>
                    <Select
                      size='sm'
                      indicator={null}
                      value={seasonId || null}
                      placeholder='בחר עונה'
                      onChange={(_event, value) => {
                        setSeasonId(value || '')
                        resetFromSeason()
                      }}
                    >
                      {teamAuditSeasonOptions.map(option => (
                        <Option key={option.seasonId} value={option.seasonId}>{option.label}</Option>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl required size='sm' disabled={controlsDisabled || !seasonId}>
                    <FormLabel>מועדון</FormLabel>
                    <Autocomplete
                      size='sm'
                      options={clubOptions}
                      value={clubOptions.find(option => option.value === clubId) || null}
                      placeholder='בחר מועדון'
                      disabled={controlsDisabled || !seasonId}
                      forcePopupIcon={false}
                      getOptionLabel={option => option?.label || ''}
                      isOptionEqualToValue={(option, selected) => option.value === selected.value}
                      slotProps={{
                        listbox: { className: 'dpScrollThin', sx: sx.auditTeamSelectListbox },
                      }}
                      onChange={(_event, option) => {
                        setClubId(option?.value || '')
                        resetFromClub()
                      }}
                    />
                  </FormControl>
                  <FormControl required size='sm' disabled={controlsDisabled || !clubId}>
                    <FormLabel>סלוט</FormLabel>
                    <Select
                      size='sm'
                      indicator={null}
                      value={teamSlot || null}
                      placeholder='סלוט'
                      onChange={(_event, value) => {
                        setTeamSlot(value || '')
                        resetFromTeamSlot()
                      }}
                    >
                      {teamSlotOptions.map(option => (
                        <Option key={option.value} value={option.value}>{option.label}</Option>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box sx={sx.auditTeamMetaFields}>
                  <FormControl required size='sm' disabled={controlsDisabled || !teamSlot}>
                    <FormLabel>שנתון</FormLabel>
                    <Select
                      size='sm'
                      value={birthYear || null}
                      placeholder='בחר שנתון'
                      onChange={(_event, value) => {
                        setBirthYear(value || '')
                        resetResolvedTeam()
                      }}
                    >
                      {birthYearOptions.map(option => (
                        <Option key={option.value} value={option.value}>{option.label}</Option>
                      ))}
                    </Select>
                  </FormControl>
                  {ageGroupField}
                </Box>
              </>
            ) : null}
            {type === 'player' ? (
              <FormControl
                required
                size='sm'
                disabled={controlsDisabled || !teamId || teamSeasonLoading || !teamSeason}
              >
                <FormLabel>שחקן</FormLabel>
                <Select
                  size='sm'
                  value={playerId || null}
                  placeholder={teamSeasonLoading ? 'טוען סגל...' : 'בחר שחקן'}
                  onChange={(_event, value) => {
                    setPlayerId(value || '')
                    clearAuditResult()
                  }}
                >
                  {playerOptions.map(option => (
                    <Option key={option.value} value={option.value}>{option.label}</Option>
                  ))}
                </Select>
              </FormControl>
            ) : null}

            {teamSeasonError ? (
              <Typography level='body-xs' color='danger'>{teamSeasonError}</Typography>
            ) : null}

            <Box sx={sx.auditPlan(auditPlan.ready)}>
              <Box sx={sx.auditPlanHeader}>
                <Typography level='title-sm'>היקף הבדיקה</Typography>
                <Chip size='sm' variant='soft' color={auditPlan.ready ? 'primary' : 'neutral'}>
                  {auditPlan.ready ? `${auditPlan.total} מסמכים` : 'ממתין לבחירה'}
                </Chip>
              </Box>
              <Box className='dpScrollThin' sx={sx.auditPlanBody(auditPlan.ready)}>
                {teamSeasonLoading ? (
                  <Box sx={sx.auditPlanLoading}>
                    <CircularProgress size='sm' />
                    <Typography level='body-xs'>מחשב את היקף הבדיקה...</Typography>
                  </Box>
                ) : auditPlan.ready ? (
                  <>
                    <Box sx={sx.auditPlanCollections}>
                      {auditPlan.collections.map(item => (
                        <Box key={item.id} sx={sx.auditPlanCollection}>
                          <Box sx={sx.auditPlanCollectionCopy}>
                            <Typography level='body-xs'>{item.label}</Typography>
                            <Typography component='code' level='body-xs'>{item.collectionName}</Typography>
                          </Box>
                          <Chip size='sm' variant='outlined'>{item.count}</Chip>
                        </Box>
                      ))}
                    </Box>
                    <Typography level='body-xs' sx={sx.auditPlanHint}>
                      הספירה מציגה מסמכים ייחודיים שייבדקו.
                    </Typography>
                  </>
                ) : (
                  <Typography level='body-xs' sx={sx.auditPlanHint}>
                    בחר את פרטי הבדיקה כדי לראות מראש אילו מסמכים ייבדקו.
                  </Typography>
                )}
              </Box>
            </Box>

            <Button
              type='button'
              loading={busy}
              disabled={!canRun || repair.repairing}
              startDecorator={iconUi({ id: 'search', size: 'sm' })}
              sx={sx.auditRunButton}
              onClick={runAudit}
            >
              הרץ בדיקה
            </Button>
          </Stack>
        </InfoPanel>
      </Box>

      <Box className='dpScrollThin' sx={sx.auditPanelScroll}>
        <InfoPanel
          title='תוצאות הבדיקה'
          actions={result ? (
            <Button
              size='sm'
              variant='outlined'
              startDecorator={iconUi({ id: 'download', size: 'sm' })}
              onClick={() => downloadDataOpsJson({
                fileName: `players-database-focused-audit-${new Date().toISOString().slice(0, 10)}.json`,
                data: result,
              })}
            >
              ייצוא JSON
            </Button>
          ) : null}
          sx={sx.auditFullPanel}
        >
          {busy ? (
            <Box sx={sx.auditBusy}>
              <CircularProgress />
              <Typography level='body-sm'>קורא את המקורות הקנוניים ומשווה תוצרים...</Typography>
            </Box>
          ) : error ? (
            <Box sx={sx.receiptsError}>
              <Typography level='title-sm'>הבדיקה נכשלה</Typography>
              <Typography level='body-sm'>{error}</Typography>
            </Box>
          ) : !result ? (
            <Box sx={sx.auditEmpty}>
              {iconUi({ id: 'search', size: 'lg' })}
              <Typography level='title-md'>טרם בוצעה בדיקה</Typography>
              <Typography level='body-sm'>בחר עונה ואת היקף הבדיקה כדי להתחיל.</Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {repair.feedback ? (
                <Alert color={repair.feedback.tone} variant='soft' role={repair.feedback.tone === 'danger' ? 'alert' : 'status'}>
                  <Box>
                    <Typography level='title-sm'>{repair.feedback.title}</Typography>
                    <Typography level='body-sm'>{repair.feedback.message}</Typography>
                  </Box>
                </Alert>
              ) : null}
              <Box sx={findingSx.scope}>
                {getFocusedAuditScopeDetails(auditScope).map(([label, value]) => (
                  <Typography key={label} level='body-xs'>{label}: {value}</Typography>
                ))}
              </Box>
              <Box sx={sx.auditResultSummary}>
                <Box>
                  <Typography level='title-md'>
                    {findings.length ? `נמצאו ${findings.length} ממצאים` : 'לא נמצאו פערים'}
                  </Typography>
                  <Typography level='body-xs'>
                    כיסוי: {result.coverage && result.coverage.complete ? 'מלא' : 'חלקי'}
                  </Typography>
                </Box>
                <Chip
                  size='sm'
                  variant='soft'
                  color={statusOf(result) === 'CLEAN' ? 'success' : 'warning'}
                >
                  {statusOf(result) || 'הושלם'}
                </Chip>
              </Box>

              {findings.length ? (
                <Box sx={sx.findings}>
                  {findings.slice(0, visibleFindings).map(finding => {
                    const key = getFocusedAuditFindingKey(finding)
                    return (
                      <FocusedAuditFindingCard
                        key={key}
                        finding={finding}
                        scope={auditScope}
                        disabled={controlsDisabled}
                        repairing={repair.repairingKey === key}
                        onRepair={() => repair.requestRepair(finding)}
                        onOpenContext={() => openFindingContext(finding)}
                      />
                    )
                  })}
                </Box>
              ) : (
                <Box sx={sx.cleanState}>
                  {iconUi({ id: 'check', size: 'md' })}
                  <Box>
                    <Typography level='title-sm'>הסנכרון תקין בהיקף שנבדק</Typography>
                    <Typography level='body-xs'>לא נמצאו פערי lifecycle, קשרים או projections.</Typography>
                  </Box>
                </Box>
              )}
              {findings.length > visibleFindings ? (
                <Button
                  type='button'
                  size='sm'
                  variant='plain'
                  onClick={() => setVisibleFindings(value => value + 40)}
                  sx={{ justifySelf: 'start' }}
                >
                  הצג עוד ממצאים
                </Button>
              ) : null}
            </Stack>
          )}
        </InfoPanel>
      </Box>
      <FocusedAuditRepairDialog
        pending={repair.pending}
        busy={repair.repairing}
        onClose={repair.cancelRepair}
        onConfirm={repair.confirmRepair}
      />
    </Box>
  )
}
