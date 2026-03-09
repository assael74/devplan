// teamProfile/modules/games/components/TeamGameEditModal.js
import React, { useMemo, useState, useEffect } from 'react'
import {
  Modal,
  ModalDialog,
  Typography,
  Box,
  Button,
  Input,
  Select,
  Option,
  Divider,
  Switch,
} from '@mui/joy'
import DeleteRounded from '@mui/icons-material/DeleteRounded'
import SaveRounded from '@mui/icons-material/SaveRounded'

import { GAME_TYPE, GAME_DIFFICULTY } from '../../../../../../shared/games/games.constants.js'

const safe = (v) => (v == null ? '' : String(v))

const resultOptions = [
  { id: '', label: 'לא מוגדר' },
  { id: 'win', label: 'ניצחון' },
  { id: 'draw', label: 'תיקו' },
  { id: 'loss', label: 'הפסד' },
]

const buildTypeOptions = () => (GAME_TYPE || []).filter((x) => !x.disabled)
const buildDiffOptions = () => (GAME_DIFFICULTY || []).filter((x) => !x.disabled)

const genId = () => `g_${Date.now()}_${Math.floor(Math.random() * 1000)}`

export default function PlayerGameEditModal({ open, mode = 'create', row, onClose, onSave, onDelete }) {
  const typeOptions = useMemo(buildTypeOptions, [])
  const diffOptions = useMemo(buildDiffOptions, [])

  const [gameId, setGameId] = useState('')
  const [date, setDate] = useState('')
  const [hour, setHour] = useState('')
  const [rival, setRival] = useState('')
  const [isHome, setIsHome] = useState(true)

  const [type, setType] = useState('friendly')
  const [difficulty, setDifficulty] = useState('')

  const [result, setResult] = useState('')
  const [goalsFor, setGoalsFor] = useState('')
  const [goalsAgainst, setGoalsAgainst] = useState('')
  const [points, setPoints] = useState('')

  useEffect(() => {
    if (!open) return

    const r = row || {}
    const g = r.game || {}

    const id = safe(r?.id || r?.gameId || g?.id).trim() || (mode === 'create' ? genId() : '')
    setGameId(id)

    setDate(safe(g?.gameDate || r?.dateRaw).slice(0, 10))
    setHour(safe(g?.gameHour || r?.hour))
    setRival(safe(g?.rivel || g?.rivalName || g?.opponent || r?.rival))
    setIsHome(!!(g?.home ?? r?.isHome))

    setType(safe(g?.type || r?.type).toLowerCase().trim() || 'friendly')
    setDifficulty(safe(g?.difficulty || r?.difficulty).toLowerCase().trim())

    setResult(safe(g?.result || r?.result).trim())

    const st = r.stats || {}
    const gf = st?.goalsFor ?? g?.goalsFor
    const ga = st?.goalsAgainst ?? g?.goalsAgainst
    const pts = st?.points ?? g?.points ?? r?.points

    setGoalsFor(gf == null ? '' : String(gf))
    setGoalsAgainst(ga == null ? '' : String(ga))
    setPoints(pts == null ? '' : String(pts))
  }, [open, mode, row])

  const canSave = !!safe(date).trim() && !!safe(rival).trim()

  const buildPack = () => {
    const id = safe(gameId).trim() || genId()
    const gf = goalsFor === '' ? null : Number(goalsFor)
    const ga = goalsAgainst === '' ? null : Number(goalsAgainst)
    const pts = points === '' ? null : Number(points)

    return {
      gameId: id,
      game: {
        id,
        gameDate: safe(date).slice(0, 10),
        gameHour: safe(hour).trim(),
        opponent: safe(rival).trim(),
        home: !!isHome,
        type: safe(type).toLowerCase().trim() || 'friendly',
        difficulty: safe(difficulty).toLowerCase().trim(),
        result: safe(result).trim(),
      },
      stats: {
        goalsFor: gf == null || Number.isNaN(gf) ? 0 : gf,
        goalsAgainst: ga == null || Number.isNaN(ga) ? 0 : ga,
        points: pts == null || Number.isNaN(pts) ? 0 : pts,
      },
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog sx={{ width: { xs: '92vw', md: 560 } }}>
        <Typography level="title-md">
          {mode === 'create' ? 'הוספת משחק' : 'עריכת משחק'}
        </Typography>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
          <Input
            size="sm"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="תאריך"
          />

          <Input
            size="sm"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="שעה (HH:MM)"
          />

          <Box sx={{ gridColumn: { xs: '1 / -1', md: '1 / -1' } }}>
            <Input
              size="sm"
              value={rival}
              onChange={(e) => setRival(e.target.value)}
              placeholder="יריב"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography level="body-xs" sx={{ opacity: 0.75 }}>בית</Typography>
            <Switch checked={isHome} onChange={(e) => setIsHome(e.target.checked)} />
            <Typography level="body-xs" sx={{ opacity: 0.75 }}>חוץ</Typography>
          </Box>

          <Select size="sm" value={type} onChange={(e, v) => setType(v || 'friendly')}>
            {typeOptions.map((x) => (
              <Option key={x.id} value={x.id}>{x.labelH}</Option>
            ))}
          </Select>

          <Select size="sm" value={difficulty} onChange={(e, v) => setDifficulty(v || '')}>
            <Option value="">—</Option>
            {diffOptions.map((x) => (
              <Option key={x.id} value={x.id}>{x.labelH}</Option>
            ))}
          </Select>

          <Select size="sm" value={result} onChange={(e, v) => setResult(v || '')}>
            {resultOptions.map((x) => (
              <Option key={x.id || 'empty'} value={x.id}>{x.label}</Option>
            ))}
          </Select>

          <Input
            size="sm"
            value={goalsFor}
            onChange={(e) => setGoalsFor(e.target.value)}
            placeholder="שערים לזכות"
            inputMode="numeric"
          />

          <Input
            size="sm"
            value={goalsAgainst}
            onChange={(e) => setGoalsAgainst(e.target.value)}
            placeholder="שערים לחובה"
            inputMode="numeric"
          />

          <Input
            size="sm"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="נקודות"
            inputMode="numeric"
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {mode === 'edit' ? (
              <Button
                color="danger"
                variant="soft"
                startDecorator={<DeleteRounded />}
                onClick={() => onDelete && onDelete(gameId)}
              >
                מחיקה
              </Button>
            ) : null}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" onClick={onClose}>ביטול</Button>
            <Button
              startDecorator={<SaveRounded />}
              disabled={!canSave}
              onClick={() => onSave && onSave(buildPack())}
            >
              שמירה
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
