// src/features/videoHub/components/modal/VideoCreateModal.js
import React, { useMemo, useState } from 'react'
import { Modal, ModalDialog, DialogTitle, DialogContent, DialogActions, Button, Input, Select, Option, Box } from '@mui/joy'
import { VIDEO_TAB } from '../../videoHub.model'
import { videoComponentsSx as sx } from '../components.sx'

export default function VideoCreateModal({ open, onClose, tab, context, onSave }) {
  const teams = context?.teams || []
  const players = context?.players || []

  const isAnalysis = tab === VIDEO_TAB.ANALYSIS
  const title = isAnalysis ? 'ניתוח וידאו חדש' : 'הוספת וידאו'

  const [draft, setDraft] = useState({ title: '', url: '', source: 'youtube', teamId: '', playerId: '', tagsStr: '' })

  const canSave = useMemo(() => {
    if (!draft.title.trim()) return false
    if (!isAnalysis && !draft.url.trim()) return false
    return true
  }, [draft, isAnalysis])

  const patch = (p) => setDraft((x) => ({ ...x, ...p }))

  const handleSave = () => {
    const tags = String(draft.tagsStr || '')
      .split(',')
      .map((x) => x.trim())
      .filter(Boolean)

    const payload = isAnalysis
      ? { title: draft.title, tags, teamId: draft.teamId || null, playerId: draft.playerId || null }
      : { title: draft.title, tags, url: draft.url, source: draft.source || 'link' }

    onSave(payload)
    setDraft({ title: '', url: '', source: 'youtube', teamId: '', playerId: '', tagsStr: '' })
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Box sx={sx.createGrid}>
            <Input
              value={draft.title}
              onChange={(e) => patch({ title: e.target.value })}
              placeholder="שם וידאו"
              sx={sx.createFull}
            />

            {isAnalysis ? (
              <>
                <Select value={draft.teamId} onChange={(e, v) => patch({ teamId: v || '' })} placeholder="קבוצה">
                  <Option value="">ללא</Option>
                  {teams.map((t) => <Option key={t.id} value={t.id}>{t.teamName || t.name}</Option>)}
                </Select>

                <Select value={draft.playerId} onChange={(e, v) => patch({ playerId: v || '' })} placeholder="שחקן">
                  <Option value="">ללא</Option>
                  {players.map((p) => (
                    <Option key={p.id} value={p.id}>
                      {[p.playerFirstName, p.playerLastName].filter(Boolean).join(' ')}
                    </Option>
                  ))}
                </Select>
              </>
            ) : (
              <>
                <Select value={draft.source} onChange={(e, v) => patch({ source: v || 'link' })} placeholder="מקור">
                  <Option value="youtube">YouTube</Option>
                  <Option value="instagram">Instagram</Option>
                  <Option value="link">קישור</Option>
                </Select>
                <Input
                  value={draft.url}
                  onChange={(e) => patch({ url: e.target.value })}
                  placeholder="קישור"
                />
              </>
            )}

            <Input
              value={draft.tagsStr}
              onChange={(e) => patch({ tagsStr: e.target.value })}
              placeholder="תגים (מופרדים בפסיקים)"
              sx={sx.createFull}
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="plain" onClick={onClose}>ביטול</Button>
          <Button disabled={!canSave} onClick={handleSave}>שמירה</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
