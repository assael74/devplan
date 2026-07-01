// src/features/playersDatabase/components/leagues/page/TeamLinkModal.js

import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy'
import LinkIcon from '@mui/icons-material/Link'

import { tableSx as sx } from './sx/table.sx.js'

const clean = value => String(value ?? '').trim()

export default function TeamLinkModal({
  open,
  row,
  saving = false,
  error = '',
  onClose,
  onSave,
}) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) {
      setValue(clean(row?.teamUrl))
    }
  }, [open, row?.teamUrl])

  const teamName = clean(row?.clubName || row?.teamName)
  const identity = clean(row?.teamSeasonKey || row?.teamSlotId)

  return (
    <Modal open={open} onClose={saving ? undefined : onClose}>
      <ModalDialog sx={sx.teamLinkDialog}>
        <ModalClose disabled={saving} />

        <Box sx={sx.teamLinkHead}>
          <LinkIcon color="primary" />

          <Box>
            <Typography level="title-md">
              עריכת קישור קבוצה
            </Typography>

            <Typography level="body-sm" sx={sx.teamLinkMeta}>
              {teamName || '-'}
            </Typography>
          </Box>
        </Box>

        <Box sx={sx.teamLinkIdentity}>
          <Typography level="body-xs" sx={sx.teamLinkLabel}>
            מזהה קבוצה
          </Typography>

          <Typography level="body-sm" sx={sx.teamLinkValue}>
            {identity || '-'}
          </Typography>
        </Box>

        <Box>
          <Typography level="body-xs" sx={sx.teamLinkLabel}>
            קישור באתר ההתאחדות
          </Typography>

          <Input
            size="sm"
            value={value}
            placeholder="https://www.football.org.il/team-details/..."
            disabled={saving}
            onChange={event => setValue(event.target.value)}
          />
        </Box>

        {error ? (
          <Typography sx={sx.teamLinkError}>
            {error}
          </Typography>
        ) : null}

        <Box sx={sx.teamLinkActions}>
          <Button
            size="sm"
            color="primary"
            loading={saving}
            onClick={() => onSave?.(value)}
          >
            שמור קישור
          </Button>

          <Button
            size="sm"
            variant="soft"
            color="neutral"
            disabled={saving}
            onClick={onClose}
          >
            ביטול
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  )
}
