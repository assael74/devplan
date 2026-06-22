// src/features/playersDatabase/components/modals/players/PlayersImportModal.js

import React, { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import { buildPlayersImportPreview } from './playersImportPreview.js'
import { savePlayersImportPreview } from '../../../services/pdbPlayers.firestore.js'
import {
  getPlayerImportRowStatus,
  getRowIssueText,
} from './playersImportUtils.js'
import { playersImportModalSx as sx } from './sx/playersImportModal.sx.js'

const ph = [
  'מס׳',
  'מועדון',
  'עונה',
  'שנתון',
  'חודש/שנת לידה',
  'קבוצה',
  'שם הקבוצה',
  'קבוצת גיל',
  'ליגה',
  'שם שחקן',
  'Player ID',
  'קישור שחקן',
  'Team ID',
  'קישור קבוצה',
].join('\t')

export default function PlayersImportModal({
  open,
  teamContext = {},
  existingPlayers = [],
  onClose,
  onConnected,
}) {
  const [pasteText, setPasteText] = useState('')
  const [info, setInfo] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const preview = useMemo(
    () => buildPlayersImportPreview(pasteText, teamContext, existingPlayers),
    [pasteText, teamContext, existingPlayers]
  )

  const rows = Array.isArray(preview.rows)
    ? preview.rows
    : []
  const canConnect = Boolean(preview.ok)

  const clearContent = () => {
    setPasteText('')
    setInfo('')
    setError('')
  }

  const close = () => {
    clearContent()
    onClose?.()
  }

  const connect = async () => {
    if (!canConnect) return

    setSaving(true)
    setInfo('')
    setError('')

    try {
      await savePlayersImportPreview(preview)

      onConnected?.(preview)
      clearContent()
      onClose?.()
    } catch (err) {
      setError(err?.message || 'שמירת שחקנים נכשלה')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={close}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose />

        <Typography level="title-lg" sx={sx.title}>
          חיבור שחקנים
        </Typography>

        <Typography level="body-sm" sx={sx.meta}>
          הדבק טבלת שחקנים מאתר ההתאחדות. כל שורה תהפוך לזהות שחקן ולשיוך עונתי לקבוצה.
        </Typography>

        <Sheet variant="outlined" sx={sx.importZone}>
          <Box
            component="textarea"
            className="dpScrollThin"
            value={pasteText}
            onChange={event => {
              setPasteText(event.target.value)
              setInfo('')
            }}
            placeholder={ph}
            sx={sx.pasteBox}
          />
        </Sheet>

        <Sheet variant="outlined" sx={sx.previewZone}>
          <Box sx={sx.previewTop}>
            <Box sx={sx.summaryChips}>
              <Chip size="sm" variant="soft">
                {preview.summary.total} שורות
              </Chip>

              <Chip size="sm" color="success" variant="soft">
                {preview.summary.valid} תקינות
              </Chip>

              <Chip size="sm" color="danger" variant="soft">
                {preview.summary.error} שגיאות
              </Chip>

              <Chip size="sm" color="primary" variant="soft">
                {preview.summary.uniquePlayers} שחקנים
              </Chip>

              <Chip size="sm" color="warning" variant="soft">
                {preview.summary.playerSeasonLinks} שיוכים
              </Chip>

              <Chip size="sm" color="neutral" variant="soft">
                {preview.summary.matchedClubs} מועדונים זוהו
              </Chip>

              <Chip size="sm" color="neutral" variant="soft">
                {preview.summary.matchedLeagues} ליגות זוהו
              </Chip>
            </Box>

            {pasteText && (
              <Typography
                level="body-sm"
                color={preview.ok ? 'success' : 'danger'}
              >
                {preview.message}
              </Typography>
            )}
          </Box>

          <Sheet
            variant="outlined"
            className="dpScrollThin"
            sx={sx.tableWrap}
          >
            <Table size="sm" stickyHeader sx={sx.table}>
              <thead>
                <tr>
                  <th>סטטוס</th>
                  <th>מס׳</th>
                  <th>שחקן</th>
                  <th>Player ID</th>
                  <th>מסמך שחקן</th>
                  <th>שנתון</th>
                  <th>עונה</th>
                  <th>מועדון</th>
                  <th>Club ID</th>
                  <th>חודש/שנת לידה</th>
                  <th>קבוצה</th>
                  <th>Team ID</th>
                  <th>Slot ID</th>
                  <th>ליגה</th>
                  <th>League ID</th>
                  <th>מסמך שיוך</th>
                </tr>
              </thead>

              <tbody>
                {!rows.length ? (
                  <tr>
                    <td colSpan={16}>
                      אין עדיין שורות להצגה
                    </td>
                  </tr>
                ) : (
                  rows.map(row => {
                    const data = row.source || {}
                    const status = getPlayerImportRowStatus(row)

                    return (
                      <tr key={row.rowId} title={getRowIssueText(row)}>
                        <td>
                          <Chip
                            size="sm"
                            color={status.color}
                            variant="soft"
                          >
                            {status.label}
                          </Chip>
                        </td>

                        <td>{data.position || '-'}</td>
                        <td>{data.fullName || '-'}</td>
                        <td className="isLtr">{data.externalPlayerId || '-'}</td>
                        <td className="isLtr">{row.playerDocId || '-'}</td>
                        <td>{data.birthYear || '-'}</td>
                        <td>{data.seasonId || '-'}</td>
                        <td>{data.clubName || '-'}</td>
                        <td>{row.clubMatch?.id || '-'}</td>
                        <td>{data.birthDate || '-'}</td>
                        <td>{row.clubMatch?.name || data.clubName || data.teamName || '-'}</td>
                        <td className="isLtr">{data.externalTeamId || '-'}</td>
                        <td className="isLtr">{row.teamMatch?.id || '-'}</td>
                        <td>{data.leagueName || '-'}</td>
                        <td className="isLtr">{row.leagueMatch?.id || '-'}</td>
                        <td className="isLtr">{row.playerSeasonDocId || '-'}</td>
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
            disabled={!canConnect || saving}
            loading={saving}
            onClick={connect}
          >
            אשר חיבור
          </Button>

          <Button
            size="sm"
            variant="plain"
            color="neutral"
            disabled={saving}
            onClick={close}
          >
            סגור
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={!pasteText || saving}
            onClick={clearContent}
          >
            נקה תוכן
          </Button>
        </Box>

        {info && (
          <Typography sx={sx.success}>
            {info}
          </Typography>
        )}

        {error && (
          <Typography sx={sx.error}>
            {error}
          </Typography>
        )}
      </ModalDialog>
    </Modal>
  )
}
