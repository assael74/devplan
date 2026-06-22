// C:\projects\devplan\src\features\playersDatabase\components\modals\PasteModal.js

import React, { useMemo, useState } from 'react'
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import { PLAYERS_DATABASE_CLUBS_CATALOG } from '../../catalog/clubs.catalog.js'
import {
  buildLeagueSnapshotWritePlanFromPreview,
  buildLeagueTablePastePreview,
} from '../../import/logic/leagueTablePastePreview.js'
import { saveLeagueSnapshot } from '../../services/pdbLeague.firestore.js'
import { formatLtr } from '../../../../shared/format/direction.js'
import {
  clean,
  getPasteRowStatus,
} from './pasteModalUtils.js'
import { pasteModalSx as sx } from './sx/pasteModal.sx.js'

const createCaptureDate = () =>
  new Date().toISOString().slice(0, 10)

const getClubById = clubId =>
  PLAYERS_DATABASE_CLUBS_CATALOG.find(
    club => club.id === clean(clubId)
  ) || null

export default function PasteModal({
  open,
  onClose,
  league,
  season,
  onSaved,
}) {
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadInfo, setUploadInfo] = useState('')
  const [roundNumber, setRoundNumber] = useState('')
  const [capturedAt, setCapturedAt] = useState(
    createCaptureDate
  )
  const [pasteText, setPasteText] = useState('')
  const [clubFixes, setClubFixes] = useState({})
  const [teamSlotFixes, setTeamSlotFixes] = useState({})

  const preview = useMemo(
    () =>
      buildLeagueTablePastePreview(pasteText, {
        expectedRows: season?.clubsCount || 0,
        clubOverrides: clubFixes,
        teamSlotOverrides: teamSlotFixes,
        leagueId: league?.id,
        leagueName: league?.leagueName,
        leagueLevel: league?.level,
        seasonId: season?.seasonId,
        ageGroupId: league?.ageGroupId,
        ageGroupLabel: league?.ageGroupLabel,
      }),
    [
      clubFixes,
      league?.ageGroupId,
      league?.ageGroupLabel,
      league?.id,
      league?.leagueName,
      league?.level,
      pasteText,
      season?.clubsCount,
      season?.seasonId,
      teamSlotFixes,
    ]
  )

  const previewRows = Array.isArray(preview?.rows)
    ? preview.rows
    : []

  const roundMissing =
    Boolean(clean(pasteText)) &&
    !clean(roundNumber)

  const canSave =
    Boolean(preview?.ok) &&
    !roundMissing &&
    !uploading &&
    Boolean(league) &&
    Boolean(season)

  const clearContent = () => {
    setPasteText('')
    setClubFixes({})
    setTeamSlotFixes({})
    setUploadError('')
    setUploadInfo('')
  }

  const reset = () => {
    clearContent()
    setRoundNumber('')
    setCapturedAt(createCaptureDate())
  }

  const close = () => {
    if (uploading) return

    reset()
    onClose?.()
  }

  const setClubFix = (rowIndex, club) => {
    setClubFixes(current => {
      const next = {
        ...current,
      }

      if (club?.id) {
        next[rowIndex] = club.id
      } else {
        delete next[rowIndex]
      }

      return next
    })

    setUploadError('')
    setUploadInfo('')
  }

  const setTeamSlotFix = (rowIndex, value) => {
    setTeamSlotFixes(current => ({
      ...current,
      [rowIndex]: value,
    }))

    setUploadError('')
    setUploadInfo('')
  }

  const save = async () => {
    if (!league || !season || !preview?.ok) {
      return
    }

    if (!clean(roundNumber)) {
      setUploadError(
        'חובה למלא מחזור לפני שמירת צילום'
      )
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadInfo('')

    try {
      const writePlan =
        buildLeagueSnapshotWritePlanFromPreview(
          preview,
          {
            leagueId: league.id,
            leagueName: league.leagueName,
            level: league.level,
            region: league.region,
            leagueNum: league.leagueNum,
            ageGroupId: league.ageGroupId,
            ageGroupLabel: league.ageGroupLabel,
            seasonId: season.seasonId,
            primaryBirthYear:
              season.primaryBirthYear,
            clubsCount: season.clubsCount,
            roundNumber,
            capturedAt,
          }
        )

      await saveLeagueSnapshot(writePlan, {
        source: {
          type: 'paste',
        },
      })

      const savedSnapshot =
        writePlan.leagueSnapshotsToCreate?.[0] ||
        null

      setUploadInfo('הצילום נשמר')
      await onSaved?.(savedSnapshot)

      reset()
      onClose?.()
    } catch (err) {
      if (
        err?.message ===
        'snapshot already exists'
      ) {
        setUploadError(
          'כבר קיים צילום למחזור ולתאריך האלה'
        )
      } else {
        setUploadError(
          err?.message ||
            'שמירת צילום נכשלה'
        )
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
    >
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={uploading} />

        <Typography
          level="title-lg"
          sx={sx.title}
        >
          טעינת צילום ליגה
        </Typography>

        <Typography
          level="body-sm"
          sx={sx.meta}
        >
          {season
            ? `${league?.leagueName} | ${season.seasonId} | שנתון ${season.primaryBirthYear}`
            : 'צריך ליצור עונה לליגה לפני טעינת צילום'}
        </Typography>

        <Sheet
          variant="outlined"
          sx={sx.importZone}
        >
          <Box sx={sx.formGrid}>
            <Box>
              <Typography sx={sx.fieldLabel}>
                מחזור
              </Typography>

              <Input
                type="number"
                size="sm"
                value={roundNumber}
                disabled={!season || uploading}
                color={
                  roundMissing
                    ? 'danger'
                    : 'neutral'
                }
                slotProps={{
                  input: {
                    min: 1,
                    step: 1,
                  },
                }}
                onChange={event => {
                  setRoundNumber(event.target.value)
                  setUploadError('')
                  setUploadInfo('')
                }}
                sx={sx.fieldControl}
              />
            </Box>

            <Box>
              <Typography sx={sx.fieldLabel}>
                תאריך צילום
              </Typography>

              <Input
                type="date"
                size="sm"
                value={capturedAt}
                disabled={!season || uploading}
                onChange={event => {
                  setCapturedAt(event.target.value)
                  setUploadError('')
                  setUploadInfo('')
                }}
                sx={sx.fieldControl}
              />
            </Box>
          </Box>

          <Box
            component="textarea"
            className="dpScrollThin"
            value={pasteText}
            disabled={!season || uploading}
            onChange={event => {
              setPasteText(event.target.value)
              setClubFixes({})
              setUploadError('')
              setUploadInfo('')
            }}
            placeholder="הדבק כאן טבלת ליגה"
            sx={sx.pasteBox}
          />
        </Sheet>

        <Sheet
          variant="outlined"
          sx={sx.previewZone}
        >
          <Box sx={sx.previewTop}>
            <Box sx={sx.summaryChips}>
              <Chip
                size="sm"
                variant="soft"
              >
                {preview?.summary?.total || 0} שורות
              </Chip>

              <Chip
                size="sm"
                color="success"
                variant="soft"
              >
                {preview?.summary?.valid || 0} תקינות
              </Chip>

              <Chip
                size="sm"
                color="danger"
                variant="soft"
              >
                {preview?.summary?.error || 0} שגיאות
              </Chip>

              {roundMissing && (
                <Chip
                  size="sm"
                  color="danger"
                  variant="soft"
                >
                  חסר מחזור
                </Chip>
              )}
            </Box>

            {(pasteText || uploadError) && (
              <Typography
                level="body-sm"
                color={
                  preview?.ok &&
                  !roundMissing &&
                  !uploadError
                    ? 'success'
                    : 'danger'
                }
              >
                {uploadError ||
                  (roundMissing
                    ? 'חובה למלא מחזור לפני שמירת צילום'
                    : preview?.message)}
              </Typography>
            )}
          </Box>

          <Sheet
            variant="outlined"
            className="dpScrollThin"
            sx={sx.tableWrap}
          >
            <Table
              size="sm"
              stickyHeader
              sx={sx.table}
            >
              <thead>
                <tr>
                  <th>סטטוס</th>
                  <th>מקום</th>
                  <th>קבוצה</th>
                  <th>קבוצה במועדון</th>
                  <th>משחקים</th>
                  <th>נצ'</th>
                  <th>תיקו</th>
                  <th>הפ'</th>
                  <th>זכות</th>
                  <th>חובה</th>
                  <th>הפרש</th>
                  <th>נקודות</th>
                </tr>
              </thead>

              <tbody>
                {!previewRows.length ? (
                  <tr>
                    <td colSpan={12}>
                      אין עדיין שורות להצגה
                    </td>
                  </tr>
                ) : (
                  previewRows.map(row => {
                    const data = row.data || {}
                    const status =
                      getPasteRowStatus(row)

                    return (
                      <tr key={row.displayIndex}>
                        <td>
                          <Chip
                            size="sm"
                            color={status.color}
                            variant="soft"
                          >
                            {status.label}
                          </Chip>
                        </td>

                        <td>
                          {data.leaguePosition || '-'}
                        </td>

                        <td>
                          {data.clubId ? (
                            data.clubCatalogName ||
                            data.clubName
                          ) : (
                            <Autocomplete
                              size="sm"
                              options={
                                PLAYERS_DATABASE_CLUBS_CATALOG
                              }
                              getOptionLabel={option =>
                                option?.name || ''
                              }
                              isOptionEqualToValue={(
                                option,
                                value
                              ) =>
                                option?.id ===
                                value?.id
                              }
                              value={getClubById(
                                clubFixes[
                                  row.displayIndex
                                ]
                              )}
                              onChange={(_, value) =>
                                setClubFix(
                                  row.displayIndex,
                                  value
                                )
                              }
                              placeholder={
                                data.clubName ||
                                'בחר מועדון'
                              }
                              sx={sx.clubAutocomplete}
                            />
                          )}
                        </td>

                        <td>
                          <Input
                            type="number"
                            size="sm"
                            value={data.teamSlot || 1}
                            disabled={uploading}
                            slotProps={{
                              input: {
                                min: 1,
                                max: 9,
                                step: 1,
                                title: data.teamSeasonKey || data.teamSlotId || '',
                              },
                            }}
                            onChange={event =>
                              setTeamSlotFix(
                                row.displayIndex,
                                event.target.value
                              )
                            }
                            sx={sx.slotInput}
                          />
                        </td>

                        <td>{data.games ?? '-'}</td>
                        <td>{data.wins ?? '-'}</td>
                        <td>{data.draws ?? '-'}</td>
                        <td>{data.losses ?? '-'}</td>
                        <td>{data.goalsFor ?? '-'}</td>
                        <td>{data.goalsAgainst ?? '-'}</td>
                        <td>{data.goalDifference == null ? '-' : formatLtr(data.goalDifference)}</td>
                        <td>{data.points ?? '-'}</td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </Table>
          </Sheet>
        </Sheet>

        <Box sx={sx.actions}>
          <Button
            size="sm"
            color="success"
            disabled={!canSave}
            loading={uploading}
            onClick={save}
          >
            שמור צילום
          </Button>

          <Button
            size="sm"
            variant="plain"
            color="neutral"
            disabled={uploading}
            onClick={close}
          >
            סגור
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={!pasteText || uploading}
            onClick={clearContent}
          >
            נקה תוכן
          </Button>
        </Box>

        {uploadInfo && (
          <Typography sx={sx.success}>
            {uploadInfo}
          </Typography>
        )}
      </ModalDialog>
    </Modal>
  )
}
