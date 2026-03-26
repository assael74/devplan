// src/features/videoHub/components/modal/VideoShareModal.js

import React, { useMemo, useState, useEffect } from 'react'
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Select, Option, Box, Typography } from '@mui/joy'

export default function VideoShareModal({ open, onClose, video, context, onSave }) {
  const teams = context?.teams || []
  const players = context?.players || []

  const [teamId, setTeamId] = useState('')
  const [playerId, setPlayerId] = useState('')

  useEffect(() => {
    setTeamId('')
    setPlayerId('')
  }, [open, video?.id])

  const canSave = useMemo(() => !!(teamId || playerId), [teamId, playerId])

  const handleSave = () => {
    const now = Date.now()
    const prev = video || {}
    const sharedWith = prev.sharedWith || { teams: [], players: [] }

    const next = {
      sharedAt: Array.from(new Set([...(prev.sharedAt || []), now])),
      sharedWith: {
        teams: teamId ? Array.from(new Set([...(sharedWith.teams || []), teamId])) : (sharedWith.teams || []),
        players: playerId ? Array.from(new Set([...(sharedWith.players || []), playerId])) : (sharedWith.players || []),
      },
    }

    onSave(next)
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>שיתוף וידאו</DialogTitle>
        <DialogContent>
          <Typography level="body-sm">{video?.title || ''}</Typography>

          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } }} mt={1}>
            <Select value={teamId} onChange={(e, v) => setTeamId(v || '')} placeholder="שיתוף עם קבוצה">
              <Option value="">ללא</Option>
              {teams.map((t) => <Option key={t.id} value={t.id}>{t.teamName || t.name}</Option>)}
            </Select>

            <Select value={playerId} onChange={(e, v) => setPlayerId(v || '')} placeholder="שיתוף עם שחקן">
              <Option value="">ללא</Option>
              {players.map((p) => (
                <Option key={p.id} value={p.id}>
                  {[p.playerFirstName, p.playerLastName].filter(Boolean).join(' ')}
                </Option>
              ))}
            </Select>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="plain" onClick={onClose}>ביטול</Button>
          <Button disabled={!canSave} onClick={handleSave}>שיתוף</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
