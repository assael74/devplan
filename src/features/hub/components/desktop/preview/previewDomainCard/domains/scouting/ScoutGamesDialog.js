import React, { useMemo } from 'react'
import { Modal, ModalDialog, Box, Typography, Divider, Table, Chip, Button } from '@mui/joy'

const safeArr = (v) => (Array.isArray(v) ? v : [])
const safeNum = (v) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

const fmtDate = (v) => {
  if (!v) return '—'
  try {
    // תומך גם ב־timestamp וגם ב־Date וגם ב־number
    const d = typeof v === 'number' ? new Date(v) : new Date(v)
    if (Number.isNaN(d.getTime())) return String(v)
    return d.toLocaleDateString('he-IL')
  } catch {
    return String(v)
  }
}

export default function ScoutGamesDialog({ open, onClose, games = [] }) {
  const rows = useMemo(() => {
    const arr = safeArr(games)
    // עדיפות ל־gameDate, אחרת gameNum
    return [...arr].sort((a, b) => {
      const da = a?.gameDate ? new Date(a.gameDate).getTime() : 0
      const db = b?.gameDate ? new Date(b.gameDate).getTime() : 0
      if (da && db) return db - da
      return safeNum(b?.gameNum) - safeNum(a?.gameNum)
    })
  }, [games])

  return (
    <Modal open={!!open} onClose={onClose}>
      <ModalDialog sx={{ width: 'min(980px, 94vw)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography level="title-md">רשימת משחקים</Typography>
          <Button size="sm" variant="plain" onClick={onClose}>סגירה</Button>
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ overflow: 'auto', maxHeight: 'min(70vh, 720px)' }}>
          <Table
            size="sm"
            stickyHeader
            sx={{
              '--TableCell-paddingY': '6px',
              '--TableCell-paddingX': '8px',
              '& thead th': { fontWeight: 700, whiteSpace: 'nowrap' },
              '& tbody td': { whiteSpace: 'nowrap', verticalAlign: 'middle' },
            }}
          >
            <thead>
              <tr>
                <th>#</th>
                <th>תאריך</th>
                <th>יריבה</th>
                <th>הרכב</th>
                <th>סגל</th>
                <th>דקות</th>
                <th>שערים</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((g, idx) => {
                const gameNum = g?.gameNum ?? idx + 1
                const date = fmtDate(g?.gameDate)
                const rivel = g?.rivel || '—'
                const isStarting = !!g?.isStarting
                const isSelected = !!g?.isSelected
                const timePlayed = safeNum(g?.timePlayed)
                const gameDuration = safeNum(g?.gameDuration)
                const scored = safeNum(g?.scored)

                return (
                  <tr key={`${gameNum}-${idx}`}>
                    <td>{gameNum}</td>
                    <td>{date}</td>
                    <td>{rivel}</td>
                    <td>
                      <Chip size="sm" variant={isStarting ? 'solid' : 'soft'}>
                        {isStarting ? 'כן' : 'לא'}
                      </Chip>
                    </td>
                    <td>
                      <Chip size="sm" variant={isSelected ? 'solid' : 'soft'}>
                        {isSelected ? 'כן' : 'לא'}
                      </Chip>
                    </td>
                    <td>
                      {timePlayed}/{gameDuration}
                    </td>
                    <td>{scored}</td>
                  </tr>
                )
              })}
            </tbody>
          </Table>

          {rows.length === 0 && (
            <Typography level="body-sm" sx={{ opacity: 0.6, py: 2 }}>
              אין משחקים להצגה
            </Typography>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  )
}
