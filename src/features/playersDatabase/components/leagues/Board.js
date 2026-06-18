//  src/features/playersDatabase/components/league/Board.js

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Chip, Input, Sheet, Typography } from '@mui/joy'

import { useAuth } from '../../../../app/AuthProvider.js'
import {
  ensureLeagueFromPlan,
  listLeagues,
} from '../../services/pdbLeague.firestore.js'
import LeagueModal from '../modals/LeagueModal.js'
import { clean, createSeasonKey } from '../modals/leagueModalUtils.js'
import {
  getLeagueLevelLabel,
  getLeagueRegionLabel,
  getLeagueSeasonRows,
} from './leagueUtils.js'
import { leagueSx as sx } from './league.sx.js'

const t = {
  detailsTitle: '\u05e4\u05e8\u05d8\u05d9 \u05dc\u05d9\u05d2\u05d4',
  seasonsTitle: '\u05e2\u05d5\u05e0\u05d5\u05ea',
  edit: '\u05e2\u05e8\u05d5\u05da',
  save: '\u05e9\u05de\u05d5\u05e8',
  cancel: '\u05d1\u05d9\u05d8\u05d5\u05dc',
  addSeason: '\u05d4\u05d5\u05e1\u05e3 \u05e2\u05d5\u05e0\u05d4',
  openTable: '\u05e4\u05ea\u05d7 \u05d8\u05d1\u05dc\u05ea \u05dc\u05d9\u05d2\u05d4',
  leagueName: '\u05e9\u05dd \u05dc\u05d9\u05d2\u05d4',
  ageGroup: '\u05e7\u05d1\u05d5\u05e6\u05ea \u05d2\u05d9\u05dc',
  level: '\u05e8\u05de\u05d4',
  region: '\u05d0\u05d6\u05d5\u05e8',
  leagueNum: '\u05de\u05e1\u05e4\u05e8 \u05dc\u05d9\u05d2\u05d4',
  leagueId: '\u05de\u05d6\u05d4\u05d4 \u05dc\u05d9\u05d2\u05d4',
  season: '\u05e2\u05d5\u05e0\u05d4',
  birthYear: '\u05e9\u05e0\u05ea\u05d5\u05df',
  clubsCount: '\u05de\u05e1\u05e4\u05e8 \u05de\u05d5\u05e2\u05d3\u05d5\u05e0\u05d9\u05dd',
  loaded: '\u05e0\u05d8\u05e2\u05e0\u05d5',
  snapshots: '\u05e6\u05d9\u05dc\u05d5\u05de\u05d9\u05dd',
  latestSnapshot: '\u05e6\u05d9\u05dc\u05d5\u05dd \u05d0\u05d7\u05e8\u05d5\u05df',
  noSeasons: '\u05d0\u05d9\u05df \u05e2\u05d5\u05e0\u05d5\u05ea \u05e2\u05d3\u05d9\u05d9\u05df',
  detailsSaveError: '\u05e9\u05de\u05d9\u05e8\u05ea \u05e4\u05e8\u05d8\u05d9 \u05d4\u05dc\u05d9\u05d2\u05d4 \u05e0\u05db\u05e9\u05dc\u05d4',
  seasonSaveError: '\u05d4\u05d5\u05e1\u05e4\u05ea \u05e2\u05d5\u05e0\u05d4 \u05e0\u05db\u05e9\u05dc\u05d4',
}

const createDetailsForm = (league = {}) => ({
  leagueName: league.leagueName || '',
  ageGroupLabel: league.ageGroupLabel || '',
  region: league.region || '',
  leagueNum: league.leagueNum ?? '',
})

const createSeasonForm = () => ({
  seasonId: '',
  birthYear: '',
  clubsCount: '',
})

const InfoValue = ({ label, value }) => (
  <Box sx={sx.infoItem}>
    <Typography level="body-xs" sx={sx.infoLabel}>
      {label}
    </Typography>
    <Typography level="body-sm" sx={sx.infoValue}>
      {value || '-'}
    </Typography>
  </Box>
)

export default function Board() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [selectedId, setSelectedId] = useState('')
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
      leagues.find((league) => league.id === selectedId) ||
      leagues[0] ||
      null,
    [leagues, selectedId]
  )

  const selectedSeasonRows = useMemo(
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
      setSelectedId((current) => {
        const currentExists = nextLeagues.some(
          (league) => league.id === current
        )

        return currentExists
          ? current
          : nextLeagues[0]?.id || ''
      })
    } catch (err) {
      setLoadError(err?.message || 'טעינת ליגות נכשלה')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    setDetailsForm(createDetailsForm(selectedLeague || {}))
    setEditingDetails(false)
    setDetailsError('')
    setAddingSeason(false)
    setSeasonForm(createSeasonForm())
    setSeasonError('')
  }, [selectedLeague?.id])

  const updateDetails = (field, value) => {
    setDetailsForm((current) => ({
      ...current,
      [field]: value,
    }))
    setDetailsError('')
  }

  const updateSeason = (field, value) => {
    setSeasonForm((current) => ({
      ...current,
      [field]: value,
    }))
    setSeasonError('')
  }

  const handleLeagueSaved = async (league) => {
    await load()

    if (league?.id) {
      setSelectedId(league.id)
    }
  }

  const handleLeagueSelect = (leagueId) => {
    setSelectedId(leagueId)
  }

  const handleOpenLeague = () => {
    if (!selectedLeague?.id) return

    navigate(
      `/players-database/leagues/${encodeURIComponent(selectedLeague.id)}`
    )
  }

  const saveDetails = async () => {
    if (!selectedLeague || savingDetails) return

    const leagueNum = Number(detailsForm.leagueNum)
    if (!clean(detailsForm.leagueName) || !Number.isInteger(leagueNum)) {
      setDetailsError(t.detailsSaveError)
      return
    }

    setSavingDetails(true)
    setDetailsError('')

    try {
      const nextLeague = {
        ...selectedLeague,
        leagueName: clean(detailsForm.leagueName),
        ageGroupLabel: clean(detailsForm.ageGroupLabel),
        region: clean(detailsForm.region),
        leagueNum,
        updatedBy: user?.uid || selectedLeague.updatedBy || '',
      }

      await ensureLeagueFromPlan(nextLeague)
      await load()
      setEditingDetails(false)
    } catch (err) {
      setDetailsError(err?.message || t.detailsSaveError)
    } finally {
      setSavingDetails(false)
    }
  }

  const saveSeason = async () => {
    if (!selectedLeague || savingSeason) return

    const seasonId = clean(seasonForm.seasonId)
    const seasonKey = createSeasonKey(seasonId)
    const birthYear = Number(seasonForm.birthYear)
    const clubsCount = Number(seasonForm.clubsCount)

    if (
      !seasonId ||
      !Number.isInteger(birthYear) ||
      !Number.isInteger(clubsCount)
    ) {
      setSeasonError(t.seasonSaveError)
      return
    }

    setSavingSeason(true)
    setSeasonError('')

    try {
      const nextLeague = {
        ...selectedLeague,
        seasons: {
          ...(selectedLeague.seasons || {}),
          [seasonKey]: {
            seasonId,
            birthYears: [birthYear],
            primaryBirthYear: birthYear,
            clubsCount,
            loadedClubsCount: 0,
            clubIds: [],
            latestSnapshotId: null,
            latestSnapshotAt: null,
            snapshotsCount: 0,
          },
        },
        updatedBy: user?.uid || selectedLeague.updatedBy || '',
      }

      await ensureLeagueFromPlan(nextLeague)
      await load()
      setAddingSeason(false)
      setSeasonForm(createSeasonForm())
    } catch (err) {
      setSeasonError(err?.message || t.seasonSaveError)
    } finally {
      setSavingSeason(false)
    }
  }

  return (
    <Sheet sx={sx.board}>
      <Box sx={sx.boardTop}>
        <Box>
          <Typography level="title-lg" sx={sx.title}>
            ליגות המאגר
          </Typography>

          <Typography level="body-sm" sx={sx.meta}>
            הליגות נטענות מתוך dbLeagues. טעינת טבלאות וצילומים
            מתבצעת מתוך ליגה קיימת.
          </Typography>
        </Box>

        <Box sx={sx.navControls}>
          <Button
            size="sm"
            variant="soft"
            color="neutral"
            loading={loading}
            onClick={load}
          >
            רענן
          </Button>

          <Button
            size="sm"
            color="primary"
            onClick={() => setOpen(true)}
          >
            יצירת ליגה
          </Button>
        </Box>
      </Box>

      {loadError && (
        <Typography sx={sx.error}>
          {loadError}
        </Typography>
      )}

      {!leagues.length && !loading ? (
        <Box sx={sx.emptyState}>
          <Chip size="sm" variant="soft" color="neutral">
            אין ליגות פעילות להצגה
          </Chip>

          <Typography level="h4" sx={sx.emptyTitle}>
            צור ליגה ראשונה כדי להתחיל לבנות היסטוריה
          </Typography>

          <Typography level="body-sm" sx={sx.emptyText}>
            לאחר יצירת הליגה ניתן יהיה להוסיף לה עונות,
            שנתונים, מועדונים וצילומי טבלה.
          </Typography>
        </Box>
      ) : (
        <Box sx={sx.stage}>
          <Box
            className="dpScrollThin"
            sx={sx.list}
          >
            {leagues.map((league) => {
              const selected = league.id === selectedLeague?.id

              return (
                <Button
                  key={league.id}
                  size="sm"
                  variant="plain"
                  color="neutral"
                  className={selected ? 'isSelected' : ''}
                  onClick={() => handleLeagueSelect(league.id)}
                  sx={sx.listItem}
                >
                  <Box sx={sx.listText}>
                    <Typography
                      level="body-sm"
                      sx={sx.listTitle}
                    >
                      {league.ageGroupLabel} | {league.leagueName}
                    </Typography>

                    <Typography
                      level="body-xs"
                      sx={sx.listMeta}
                    >
                      {getLeagueLevelLabel(league.level)}
                      {' | '}
                      {getLeagueRegionLabel(league.region)}
                      {' | '}
                      #{league.leagueNum}
                    </Typography>
                  </Box>
                </Button>
              )
            })}
          </Box>

          <Box sx={sx.tablePanel}>
            <Box sx={sx.metaBar}>
              <Typography
                level="title-md"
                sx={sx.sectionTitle}
              >
                {selectedLeague?.leagueName}
                {' | '}
                {selectedLeague?.ageGroupLabel}
              </Typography>

              <Box sx={sx.chips}>
                <Chip size="sm" variant="soft" color="neutral">
                  מזהה {selectedLeague?.id}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  רמה {getLeagueLevelLabel(selectedLeague?.level)}
                </Chip>

                <Chip size="sm" variant="soft" color="neutral">
                  {getLeagueRegionLabel(selectedLeague?.region)}
                </Chip>
              </Box>

              <Button
                size="sm"
                color="primary"
                disabled={!selectedLeague}
                onClick={handleOpenLeague}
              >
                {t.openTable}
              </Button>
            </Box>

            <Box
              className="dpScrollThin"
              sx={sx.managementWrap}
            >
              <Box sx={sx.managementGrid}>
                <Box sx={sx.infoPanel}>
                  <Box sx={sx.infoHeader}>
                    <Typography level="title-md" sx={sx.sectionTitle}>
                      {t.detailsTitle}
                    </Typography>

                    {editingDetails ? (
                      <Box sx={sx.inlineActions}>
                        <Button
                          size="sm"
                          color="primary"
                          loading={savingDetails}
                          onClick={saveDetails}
                        >
                          {t.save}
                        </Button>

                        <Button
                          size="sm"
                          variant="soft"
                          color="neutral"
                          disabled={savingDetails}
                          onClick={() => {
                            setDetailsForm(createDetailsForm(selectedLeague || {}))
                            setEditingDetails(false)
                            setDetailsError('')
                          }}
                        >
                          {t.cancel}
                        </Button>
                      </Box>
                    ) : (
                      <Button
                        size="sm"
                        variant="soft"
                        color="neutral"
                        disabled={!selectedLeague}
                        onClick={() => setEditingDetails(true)}
                      >
                        {t.edit}
                      </Button>
                    )}
                  </Box>

                  {editingDetails ? (
                    <Box sx={sx.editGrid}>
                      <Box>
                        <Typography level="body-xs" sx={sx.infoLabel}>
                          {t.leagueName}
                        </Typography>
                        <Input
                          size="sm"
                          value={detailsForm.leagueName}
                          disabled={savingDetails}
                          onChange={(event) => updateDetails('leagueName', event.target.value)}
                        />
                      </Box>

                      <Box>
                        <Typography level="body-xs" sx={sx.infoLabel}>
                          {t.ageGroup}
                        </Typography>
                        <Input
                          size="sm"
                          value={detailsForm.ageGroupLabel}
                          disabled={savingDetails}
                          onChange={(event) => updateDetails('ageGroupLabel', event.target.value)}
                        />
                      </Box>

                      <Box>
                        <Typography level="body-xs" sx={sx.infoLabel}>
                          {t.region}
                        </Typography>
                        <Input
                          size="sm"
                          value={detailsForm.region}
                          disabled={savingDetails}
                          onChange={(event) => updateDetails('region', event.target.value)}
                        />
                      </Box>

                      <Box>
                        <Typography level="body-xs" sx={sx.infoLabel}>
                          {t.leagueNum}
                        </Typography>
                        <Input
                          type="number"
                          size="sm"
                          value={detailsForm.leagueNum}
                          disabled={savingDetails}
                          slotProps={{
                            input: {
                              min: 1,
                              step: 1,
                            },
                          }}
                          onChange={(event) => updateDetails('leagueNum', event.target.value)}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={sx.infoGrid}>
                      <InfoValue label={t.leagueName} value={selectedLeague?.leagueName} />
                      <InfoValue label={t.ageGroup} value={selectedLeague?.ageGroupLabel} />
                      <InfoValue label={t.level} value={getLeagueLevelLabel(selectedLeague?.level)} />
                      <InfoValue label={t.region} value={getLeagueRegionLabel(selectedLeague?.region)} />
                      <InfoValue label={t.leagueNum} value={selectedLeague?.leagueNum} />
                      <InfoValue label={t.leagueId} value={selectedLeague?.id} />
                    </Box>
                  )}

                  {detailsError && (
                    <Typography sx={sx.inlineError}>
                      {detailsError}
                    </Typography>
                  )}
                </Box>

                <Box sx={sx.infoPanel}>
                  <Box sx={sx.infoHeader}>
                    <Typography level="title-md" sx={sx.sectionTitle}>
                      {t.seasonsTitle}
                    </Typography>

                    <Button
                      size="sm"
                      variant={addingSeason ? 'soft' : 'solid'}
                      color={addingSeason ? 'neutral' : 'primary'}
                      disabled={!selectedLeague || savingSeason}
                      onClick={() => {
                        setAddingSeason((current) => !current)
                        setSeasonError('')
                      }}
                    >
                      {addingSeason ? t.cancel : t.addSeason}
                    </Button>
                  </Box>

                  <Box sx={sx.seasonList}>
                    {selectedSeasonRows.length ? (
                      selectedSeasonRows.map((season) => (
                        <Box key={season.key} sx={sx.seasonItem}>
                          <Box>
                            <Typography level="body-sm" sx={sx.seasonTitle}>
                              {season.seasonId}
                            </Typography>

                            <Typography level="body-xs" sx={sx.seasonMeta}>
                              {t.birthYear}: {season.primaryBirthYear || season.birthYears?.join(', ') || '-'}
                              {' | '}
                              {t.clubsCount}: {season.clubsCount ?? '-'}
                              {' | '}
                              {t.latestSnapshot}: {season.latestSnapshotAt || '-'}
                            </Typography>
                          </Box>

                          <Box sx={sx.seasonStats}>
                            <Chip size="sm" variant="soft" color="neutral">
                              {t.loaded}: {season.loadedClubsCount ?? 0}
                            </Chip>
                            <Chip size="sm" variant="soft" color="neutral">
                              {t.snapshots}: {season.snapshotsCount ?? 0}
                            </Chip>
                          </Box>
                        </Box>
                      ))
                    ) : (
                      <Typography level="body-sm" sx={sx.emptyText}>
                        {t.noSeasons}
                      </Typography>
                    )}
                  </Box>

                  {addingSeason && (
                    <Box sx={sx.addSeasonBox}>
                      <Input
                        size="sm"
                        placeholder="2026-2027"
                        value={seasonForm.seasonId}
                        disabled={savingSeason}
                        onChange={(event) => updateSeason('seasonId', event.target.value)}
                      />

                      <Input
                        type="number"
                        size="sm"
                        placeholder={t.birthYear}
                        value={seasonForm.birthYear}
                        disabled={savingSeason}
                        onChange={(event) => updateSeason('birthYear', event.target.value)}
                      />

                      <Input
                        type="number"
                        size="sm"
                        placeholder={t.clubsCount}
                        value={seasonForm.clubsCount}
                        disabled={savingSeason}
                        onChange={(event) => updateSeason('clubsCount', event.target.value)}
                      />

                      <Button
                        size="sm"
                        color="primary"
                        loading={savingSeason}
                        onClick={saveSeason}
                      >
                        {t.save}
                      </Button>
                    </Box>
                  )}

                  {seasonError && (
                    <Typography sx={sx.inlineError}>
                      {seasonError}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box component="table" sx={sx.hiddenTable}>
                <thead>
                  <tr>
                    <th>עונה</th>
                    <th>שנתון</th>
                    <th>מועדונים</th>
                    <th>נטענו</th>
                    <th>צילומים</th>
                    <th>צילום אחרון</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedSeasonRows.map((season) => (
                    <tr key={season.key}>
                      <td>{season.seasonId}</td>

                      <td>
                        {season.primaryBirthYear ||
                          season.birthYears?.join(', ') ||
                          '-'}
                      </td>

                      <td>{season.clubsCount ?? '-'}</td>
                      <td>{season.loadedClubsCount ?? 0}</td>
                      <td>{season.snapshotsCount ?? 0}</td>
                      <td>{season.latestSnapshotAt || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <LeagueModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={handleLeagueSaved}
      />
    </Sheet>
  )
}
