// src/features/bulkActions/players/import/components/PlayersBulkPasteDrawer.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  LinearProgress,
  ModalClose,
  Sheet,
  Typography,
} from '@mui/joy'

import PlayersBulkPasteInput from './PlayersBulkPasteInput.js'
import PlayersBulkImportPreview from './PlayersBulkImportPreview.js'
import { buildPlayersImportPreview } from '../index.js'

import { playersImportSx as sx } from './sx/playersImport.sx.js'

const SAMPLE_TEXT = `שם פרטי	שם משפחה	תאריך לידה	קישור שחקן
דניאל	כהן	01/2010	https://www.football.org.il/
נועם	לוי	04/2011
איתי	ישראלי	07/2010	`

function clean(value) {
  return String(value == null ? '' : value).trim()
}

function getRowKey(row = {}) {
  const data = row?.data || {}

  const identityKey = [
    clean(data.playerFirstName),
    clean(data.playerLastName),
    clean(data.birth),
    clean(data.ifaLink),
  ].join('|')

  return `${row?.rowIndex ?? row?.displayIndex ?? ''}|${identityKey}`
}

function countPreviewRows(rows = []) {
  return rows.reduce(
    (summary, row) => {
      summary.total += 1

      if (row?.status === 'valid') summary.valid += 1
      if (row?.status === 'warning') summary.warning += 1
      if (row?.status === 'error') summary.error += 1
      if (row?.status === 'existing') summary.existing += 1

      return summary
    },
    {
      total: 0,
      valid: 0,
      warning: 0,
      error: 0,
      existing: 0,
    }
  )
}

function getPreviewMessage(summary = {}) {
  if (!summary.total) return 'לא נותרו שורות לייבוא'
  if (summary.error) return 'יש שורות עם שגיאות שיש לתקן או להסיר'
  if (summary.existing) return 'יש שחקנים שכבר קיימים ויש להסיר אותם מהרשימה'
  if (summary.warning) return 'יש שורות עם אזהרות שיש לטפל בהן או להסיר'

  return 'כל השורות טופלו והנתונים מוכנים לייבוא'
}

function buildVisiblePreview(preview = {}, removedRowKeys = []) {
  const removedKeysSet = new Set(removedRowKeys)

  const rows = Array.isArray(preview?.rows)
    ? preview.rows.filter(row => !removedKeysSet.has(getRowKey(row)))
    : []

  const summary = countPreviewRows(rows)

  const allRowsHandled = Boolean(
    rows.length &&
    rows.every(row => {
      return (
        row?.status === 'valid' &&
        row?.valid === true &&
        row?.alreadyExists !== true
      )
    })
  )

  return {
    ...preview,
    rows,
    summary,
    ok: allRowsHandled,
    allRowsHandled,
    message: getPreviewMessage(summary),
  }
}

function getImportablePlayers(preview = {}) {
  if (!preview?.allRowsHandled) return []

  return (preview?.rows || [])
    .filter(row => {
      return (
        row?.valid === true &&
        row?.status === 'valid' &&
        row?.alreadyExists !== true
      )
    })
    .map(row => row.data)
}

export default function PlayersBulkPasteDrawer({
  open,
  onClose,
  team,
  existingPlayers = [],
  title = 'ייבוא שחקנים',
  onPreviewReady,
  saving = false,
  error = '',
}) {
  const [text, setText] = useState('')
  const [savingSeconds, setSavingSeconds] = useState(0)
  const [removedRowKeys, setRemovedRowKeys] = useState([])
  const [existingPlayersSnapshot, setExistingPlayersSnapshot] = useState([])

  useEffect(() => {
    if (!saving) {
      setSavingSeconds(0)
      return undefined
    }

    const intervalId = setInterval(() => {
      setSavingSeconds(value => value + 1)
    }, 1000)

    return () => clearInterval(intervalId)
  }, [saving])

  useEffect(() => {
    if (!open) return

    setExistingPlayersSnapshot(
      Array.isArray(existingPlayers)
        ? existingPlayers
        : []
    )
  }, [open])

  useEffect(() => {
    if (open) return

    setText('')
    setRemovedRowKeys([])
    setExistingPlayersSnapshot([])
  }, [open])

  const defaults = useMemo(() => {
    return {
      active: true,
    }
  }, [])

  const teamContext = useMemo(() => {
    return {
      teamId: team?.id || team?.teamId || '',
      clubId: team?.clubId || team?.club?.id || '',
    }
  }, [team])

  const sourcePreview = useMemo(() => {
    return buildPlayersImportPreview(text, {
      defaults,
      existingPlayers: existingPlayersSnapshot,
    })
  }, [
    text,
    defaults,
    existingPlayersSnapshot,
  ])

  const preview = useMemo(() => {
    return buildVisiblePreview(
      sourcePreview,
      removedRowKeys
    )
  }, [
    sourcePreview,
    removedRowKeys,
  ])

  const importablePlayers = useMemo(() => {
    return getImportablePlayers(preview)
  }, [preview])

  const importableCount = importablePlayers.length

  const canImport = Boolean(
    preview?.allRowsHandled &&
    importableCount > 0 &&
    teamContext.teamId &&
    teamContext.clubId &&
    !saving
  )

  function handleTextChange(value) {
    if (saving) return

    setText(value)
    setRemovedRowKeys([])
  }

  function handleUseSample() {
    if (saving) return

    setText(SAMPLE_TEXT)
    setRemovedRowKeys([])
  }

  function handleClear() {
    if (saving) return

    setText('')
    setRemovedRowKeys([])
  }

  function handleRemoveRow(row) {
    if (saving) return

    const rowKey = getRowKey(row)

    if (!rowKey) return

    setRemovedRowKeys(current => {
      if (current.includes(rowKey)) return current

      return [
        ...current,
        rowKey,
      ]
    })
  }

  function handleConfirmPreview() {
    if (!canImport) return

    const players = getImportablePlayers(preview)

    if (!players.length) return

    const finalPayload = {
      players: players.map(player => ({
        ...player,
        teamId: teamContext.teamId,
        clubId: teamContext.clubId,
      })),
      teamId: teamContext.teamId,
      clubId: teamContext.clubId,
    }

    onPreviewReady({
      preview,
      payload: finalPayload,
    })
  }

  function handleClose() {
    if (saving) return

    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={handleClose}
      anchor="right"
      size="lg"
      slotProps={{
        content: {
          sx: sx.drawerContent,
        },
      }}
    >
      <Sheet sx={sx.drawerSheet}>
        <Box sx={sx.drawerHeader}>
          <Box sx={sx.drawerTitleWrap}>
            <Typography level="title-lg">
              {title}
            </Typography>

            <Typography level="body-sm" sx={sx.mutedText}>
              הדבק טבלת שחקנים מאקסל, טפל בכל השורות ורק לאחר מכן בצע ייבוא.
            </Typography>
          </Box>

          {!saving ? <ModalClose /> : null}
        </Box>

        <Box sx={sx.teamContext}>
          <Typography level="body-xs" sx={sx.mutedText}>
            קבוצה
          </Typography>

          <Typography level="title-sm">
            {team?.teamName || team?.name || 'לא נבחרה קבוצה'}
          </Typography>
        </Box>

        <Box sx={sx.statusStack}>
          {saving ? (
            <Sheet
              variant="soft"
              color="primary"
              sx={sx.savingSheet}
            >
              <Box sx={sx.savingHeader}>
                <CircularProgress size="sm" />

                <Box sx={sx.savingTextWrap}>
                  <Typography level="title-sm">
                    מייבא שחקנים...
                  </Typography>

                  <Typography level="body-xs" sx={sx.mutedText}>
                    הפעולה מתבצעת כעת. אין לסגור את החלון עד לסיום.
                    {savingSeconds > 0
                      ? ` זמן שעבר: ${savingSeconds} שניות`
                      : ''}
                  </Typography>
                </Box>
              </Box>

              <LinearProgress />
            </Sheet>
          ) : null}

          {error ? (
            <Sheet
              variant="soft"
              color="danger"
              sx={sx.errorSheet}
            >
              <Typography level="body-sm">
                {error}
              </Typography>
            </Sheet>
          ) : null}
        </Box>

        <Divider />

        <Box sx={sx.drawerBody}>
          <PlayersBulkPasteInput
            value={text}
            onChange={handleTextChange}
            placeholder={SAMPLE_TEXT}
            disabled={saving}
          />

          <PlayersBulkImportPreview
            preview={preview}
            onRemoveRow={handleRemoveRow}
            disabled={saving}
          />
        </Box>

        <Box sx={sx.drawerFooter}>
          <Box sx={sx.drawerFooterGroup}>
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              disabled={saving}
              onClick={handleUseSample}
            >
              טען דוגמה
            </Button>

            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={!text || saving}
              onClick={handleClear}
            >
              נקה
            </Button>
          </Box>

          <Box sx={sx.drawerFooterGroup}>
            <Button
              size="sm"
              variant="plain"
              color="neutral"
              disabled={saving}
              onClick={handleClose}
            >
              סגור
            </Button>

            <Button
              size="sm"
              color="primary"
              disabled={!canImport}
              loading={saving}
              onClick={handleConfirmPreview}
            >
              {saving
                ? 'מייבא שחקנים...'
                : `ייבוא ${importableCount} שחקנים`}
            </Button>
          </Box>
        </Box>
      </Sheet>
    </Drawer>
  )
}
