// src/features/playersDatabase/components/leagues/players/DelPlayersModal.js

import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

import { modalSx as sx } from './sx/modal.sx.js'

const clean = value => String(value ?? '').trim()

export default function DelPlayersModal({
  open,
  rows = [],
  loading = false,
  error = '',
  onClose,
  onConfirm,
}) {
  const [confirm, setConfirm] = useState('')
  const count = rows.length
  const ok = clean(confirm) === String(count)

  useEffect(() => {
    if (open) setConfirm('')
  }, [open])

  const title = useMemo(
    () => count === 1 ? 'מחיקת שחקן' : 'מחיקת שחקנים',
    [count]
  )

  return (
    <Modal open={open} onClose={loading ? undefined : onClose}>
      <ModalDialog sx={sx.dialog}>
        <ModalClose disabled={loading} />

        <Box sx={sx.head}>
          <DeleteOutlineIcon color="error" />

          <Box>
            <Typography level="title-md">{title}</Typography>
            <Typography level="body-sm" color="neutral">
              המחיקה תסיר גם את מסמכי הסטטיסטיקה של השחקנים שנבחרו.
            </Typography>
          </Box>
        </Box>

        {error ? (
          <Alert color="danger" variant="soft">
            {error}
          </Alert>
        ) : null}

        <Box sx={sx.summary}>
          <Typography level="body-xs" color="neutral">שחקנים למחיקה</Typography>
          <Typography level="h3">{count}</Typography>
        </Box>

        <Sheet variant="outlined" className="dpScrollThin" sx={sx.preview}>
          <Table size="sm" stickyHeader>
            <thead>
              <tr>
                <th>שם שחקן</th>
                <th>קבוצה</th>
                <th>סטטיסטיקה</th>
              </tr>
            </thead>

            <tbody>
              {rows.map(row => (
                <tr key={row.id}>
                  <td>{clean(row.fullName || row.playerName) || '-'}</td>
                  <td>{clean(row.clubName || row.teamName) || '-'}</td>
                  <td>{row.statsDoc?.id ? 'תימחק' : '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Sheet>

        <Box sx={sx.footer}>
          <Box sx={sx.confirm}>
            <Typography level="body-sm">
              להמשך הקלד את מספר השחקנים למחיקה: {count}
            </Typography>

            <Input
              size="sm"
              value={confirm}
              placeholder={String(count)}
              disabled={loading}
              onChange={event => setConfirm(event.target.value)}
            />
          </Box>

          <Box sx={sx.actions}>
            <Button
              size="sm"
              color="danger"
              loading={loading}
              disabled={!ok || !count || loading}
              startDecorator={<DeleteOutlineIcon fontSize="small" />}
              onClick={() => onConfirm?.(rows)}
            >
              מחק שחקנים
            </Button>

            <Button
              size="sm"
              color="neutral"
              variant="soft"
              disabled={loading}
              onClick={onClose}
            >
              ביטול
            </Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
