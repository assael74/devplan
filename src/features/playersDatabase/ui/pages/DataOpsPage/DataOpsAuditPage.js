// src/features/playersDatabase/ui/pages/DataOpsPage/DataOpsAuditPage.js

import { useEffect, useMemo, useState } from 'react'
import {
  Autocomplete,
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
import { dataOpsPageSx as sx } from './sx/dataOpsPage.sx.js'

const clean = value => String(value === null || value === undefined ? '' : value).trim()
const EMPTY_DOCUMENT = Object.freeze({})

const statusOf = result => clean(result && (result.status || result.result)).toUpperCase()

const toneOfFinding = finding => {
  const type = clean(finding && finding.type)
  if (['missing_canonical', 'missing_canonical_dependency', 'invalid_identity'].includes(type)) {
    return 'danger'
  }
  if (['missing_projection', 'projection_mismatch', 'missing_document', 'orphan_projection'].includes(type)) {
    return 'warning'
  }
  return 'info'
}

const labelOfFinding = finding => {
  const type = clean(finding && finding.type)
  if (type === 'missing_projection' || type === 'missing_document') return 'מסמך חסר'
  if (type === 'projection_mismatch' || type === 'source_mismatch') return 'אי־התאמה'
  if (type === 'orphan_projection') return 'תוצר יתום'
  if (type === 'invalid_identity') return 'זהות לא תקינה'
  if (type === 'broken_relation') return 'קשר שבור'
  return type || 'ממצא'
}

const findingTitle = finding => (
  clean(finding && (finding.title || finding.field || finding.target)) || 'פער בבדיקת הנתונים'
)

const findingDescription = finding => (
  clean(finding && (finding.reason || finding.explanation || finding.recommendedAction))
)

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
  const [visibleFindings, setVisibleFindings] = useState(40)
  const [teamSeason, setTeamSeason] = useState(null)
  const [teamSeasonLoading, setTeamSeasonLoading] = useState(false)
  const [teamSeasonError, setTeamSeasonError] = useState('')

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

  const resetResolvedTeam = () => {
    setAgeGroupSelection('')
    setLeagueId('')
    setTeamId('')
    setPlayerId('')
    setResult(null)
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
    setType(nextType)
    resetFromSeason()
    setVisibleFindings(40)
    setError('')
  }

  const runAudit = async () => {
    if (!canRun || busy) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const scope = {
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
      setSearchParams({ type, ...scope })
      setResult(nextResult)
    } catch (auditError) {
      setError(auditError instanceof Error ? auditError.message : 'הבדיקה נכשלה')
    } finally {
      setBusy(false)
    }
  }

  const openFindingContext = finding => {
    const targetLeagueId = clean(finding && finding.leagueId) || clean(leagueId)
    const targetTeamId = clean(finding && finding.teamId) || clean(teamId)
    const targetPlayerId = clean(finding && finding.playerId) || clean(playerId)
    if (targetPlayerId) {
      navigate(PLAYERS_DATABASE_UI_ROUTES.player({
        playerId: targetPlayerId,
        leagueId: targetLeagueId,
        teamId: targetTeamId,
        seasonKey: clean(seasonId),
      }))
      return
    }
    if (targetTeamId && targetLeagueId) {
      navigate(PLAYERS_DATABASE_UI_ROUTES.team({
        leagueId: targetLeagueId,
        teamId: targetTeamId,
        auditSeasonKey: clean(seasonId),
      }))
      return
    }
    if (targetLeagueId) navigate(PLAYERS_DATABASE_UI_ROUTES.league(targetLeagueId))
  }

  const ageGroupField = (
    <FormControl required size='sm' disabled={!birthYear}>
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
          setResult(null)
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
          <Stack spacing={1} sx={sx.auditConfigStack}>
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
                  startDecorator={iconUi({ id: iconId, size: 'sm' })}
                  onClick={() => changeType(id)}
                >
                  {label}
                </Button>
              ))}
            </Box>

            {type === 'league' ? (
              <>
                <FormControl required size='sm'>
                  <FormLabel>עונה</FormLabel>
                  <Select
                    size='sm'
                    indicator={null}
                    value={seasonId || null}
                    placeholder='בחר עונה'
                    onChange={(_event, value) => {
                      setSeasonId(value || '')
                      setLeagueId('')
                      setResult(null)
                    }}
                  >
                    {seasonOptions.map(option => (
                      <Option key={option.seasonId} value={option.seasonId}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl required size='sm' disabled={!seasonId}>
                  <FormLabel>ליגה</FormLabel>
                  <Select
                    size='sm'
                    value={leagueId || null}
                    placeholder={seasonId ? 'בחר ליגה' : 'בחר עונה תחילה'}
                    onChange={(_event, value) => {
                      setLeagueId(value || '')
                      setResult(null)
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
                  <FormControl required size='sm'>
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
                  <FormControl required size='sm' disabled={!seasonId}>
                    <FormLabel>מועדון</FormLabel>
                    <Autocomplete
                      size='sm'
                      options={clubOptions}
                      value={clubOptions.find(option => option.value === clubId) || null}
                      placeholder='בחר מועדון'
                      disabled={!seasonId}
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
                  <FormControl required size='sm' disabled={!clubId}>
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
                  <FormControl required size='sm' disabled={!teamSlot}>
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
                disabled={!teamId || teamSeasonLoading || !teamSeason}
              >
                <FormLabel>שחקן</FormLabel>
                <Select
                  size='sm'
                  value={playerId || null}
                  placeholder={teamSeasonLoading ? 'טוען סגל...' : 'בחר שחקן'}
                  onChange={(_event, value) => {
                    setPlayerId(value || '')
                    setResult(null)
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
              disabled={!canRun}
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
                  {findings.slice(0, visibleFindings).map((finding, index) => {
                    const tone = toneOfFinding(finding)
                    return (
                      <Box key={`${finding.type}-${finding.documentId}-${index}`} sx={sx.finding(tone)}>
                        <Box sx={sx.findingTop}>
                          <Box sx={sx.findingCopy}>
                            <Typography level='title-sm'>{findingTitle(finding)}</Typography>
                            {findingDescription(finding) ? (
                              <Typography sx={sx.findingDetail}>{findingDescription(finding)}</Typography>
                            ) : null}
                            <Typography component='code' level='body-xs' sx={sx.findingDocumentId}>
                              {clean(finding.documentId) || clean(finding.relatedDocumentId) || 'מסמך לא ידוע'}
                            </Typography>
                          </Box>
                          <Chip
                            size='sm'
                            variant='soft'
                            color={tone === 'danger' ? 'danger' : tone === 'warning' ? 'warning' : 'neutral'}
                          >
                            {labelOfFinding(finding)}
                          </Chip>
                        </Box>
                        <Box sx={sx.findingFooter}>
                          <Typography sx={sx.sourceLabel}>
                            {finding.owner ? `אחריות: ${finding.owner}` : 'נדרשת בדיקת מקור'}
                          </Typography>
                          <Button size='sm' variant='outlined' onClick={() => openFindingContext(finding)}>
                            פתח הקשר עסקי
                          </Button>
                        </Box>
                      </Box>
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
    </Box>
  )
}
