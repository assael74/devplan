// src/ui/forms/gameStatsForm/steps/SummaryStep.js

import React from 'react'
import {
  Avatar,
  Box,
  Chip,
  Sheet,
  Typography,
} from '@mui/joy'

import { summaryStepSx as sx } from './sx/summaryStep.sx.js'
import playerImage from '../../../core/images/playerImage.jpg'
import { iconUi } from '../../../core/icons/iconUi.js'

import {
  buildEntryFields,
  buildStatsSummaryRows,
  buildStatsSummaryTotals,
  getVisibleParms,
} from '../logic/index.js'

const isPlayerScopeDraft = draft => {
  return draft?.scope === 'player' || draft?.meta?.scope === 'player'
}

const getEditablePlayerId = draft => {
  return (
    draft?.editablePlayerId ||
    draft?.meta?.editablePlayerId ||
    draft?.meta?.playerId ||
    ''
  )
}

const isLockedSummaryRow = ({ row, draft }) => {
  if (!isPlayerScopeDraft(draft)) return false

  const editablePlayerId = getEditablePlayerId(draft)

  return Boolean(editablePlayerId) && row?.playerId !== editablePlayerId
}

const getRowStats = ({ draft, playerId }) => {
  const rows = Array.isArray(draft?.playerStats) ? draft.playerStats : []

  return rows.find(row => row?.playerId === playerId) || {}
}

const getFieldLabel = field => {
  if (field?.type === 'triplet') return field.label || field.id

  return (
    field?.parm?.statsParmShortName ||
    field?.parm?.statsParmName ||
    field?.id ||
    ''
  )
}

const formatValue = value => {
  if (value === null || value === undefined || value === '') return '—'

  const num = Number(value)

  if (Number.isFinite(num)) {
    return Number.isInteger(num) ? String(num) : num.toFixed(1)
  }

  return String(value)
}

const hasPositiveValue = value => {
  const num = Number(value)

  return Number.isFinite(num) && num > 0
}

const getRegularFieldValue = ({ field, row }) => {
  return formatValue(row[field.id])
}

const getTripletFieldValue = ({ field, row }) => {
  const total = row[field.totalKey]
  const success = row[field.successKey]
  const rate = row[field.rateKey]

  if (!hasPositiveValue(total)) return '—'

  return `${formatValue(success)}/${formatValue(total)} · ${formatValue(rate)}%`
}

const getFieldValue = ({ field, row }) => {
  if (field?.type === 'triplet') {
    return getTripletFieldValue({ field, row })
  }

  return getRegularFieldValue({ field, row })
}

const getFieldType = field => {
  return field?.statsParmType || field?.parm?.statsParmType || 'general'
}

function SummaryTotals({ totals }) {
  return (
    <Sheet variant="outlined" sx={sx.summaryStatsCard}>
      <Chip size="sm" variant="soft" color="primary">
        השלמה {totals.completionRate}%
      </Chip>

      <Chip size="sm" variant="soft" color="success">
        מלאים {totals.completedPlayers}/{totals.totalPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="warning">
        חלקיים {totals.partialPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        ריקים {totals.emptyPlayers}
      </Chip>

      <Chip size="sm" variant="soft" color="neutral">
        שדות {totals.filledFields}/{totals.totalFields}
      </Chip>
    </Sheet>
  )
}

function PlayerInfoCell({ row }) {
  const photo = row?.photo || playerImage
  const icon = row?.isStarting ? 'isStart' : 'isSquad'

  return (
    <Box sx={sx.summaryPlayerInfo}>
      <Avatar src={photo} sx={{ width: 26, height: 26 }} />

      <Box sx={{ minWidth: 0 }}>
        <Typography level="body-sm" fontWeight={700} noWrap>
          {row.name}
        </Typography>

        <Typography level="body-xs" color="neutral" startDecorator={iconUi({ id: icon })}>
          {row.isStarting ? 'הרכב' : 'ספסל'} · {row.timePlayed || 0} דק׳
        </Typography>
      </Box>
    </Box>
  )
}

function StatusCell({ row, locked }) {
  const color = row.isComplete
    ? 'success'
    : row.isPartial
      ? 'warning'
      : 'neutral'

  return (
    <Box sx={sx.summaryStatusCell}>
      {locked ? (
        <Chip size="sm" variant="soft" color="warning">
          נעול
        </Chip>
      ) : null}

      <Chip size="sm" variant="soft" color={color}>
        {row.filled}/{row.total}
      </Chip>

      <Typography level="body-xs" color="neutral">
        {row.rate}%
      </Typography>
    </Box>
  )
}

function SummaryFieldCell({ field, rowStats }) {
  const value = getFieldValue({ field, row: rowStats })
  const isEmpty = value === '—'

  return (
    <Box sx={sx.summaryFieldCell(getFieldType(field), isEmpty)}>
      <Typography level="body-xs" sx={sx.summaryFieldLabel} noWrap>
        {getFieldLabel(field)}
      </Typography>

      <Typography level="body-sm" sx={sx.summaryFieldValue} noWrap>
        {value}
      </Typography>
    </Box>
  )
}

function SummaryPlayerRow({ row, draft, fields, locked, onOpenPlayer }) {
  const rowStats = getRowStats({ draft, playerId: row.playerId })

  const handleOpen = () => {
    if (locked) return

    onOpenPlayer(row.playerId)
  }

  const handleKeyDown = event => {
    if (locked) return
    if (event.key !== 'Enter' && event.key !== ' ') return

    event.preventDefault()
    onOpenPlayer(row.playerId)
  }

  return (
    <Box
      role={locked ? 'presentation' : 'button'}
      tabIndex={locked ? -1 : 0}
      sx={sx.summaryDetailedRow({ locked, row })}
      onClick={handleOpen}
      onKeyDown={handleKeyDown}
    >
      <PlayerInfoCell row={row} />

      <StatusCell row={row} locked={locked} />

      <Box sx={sx.summaryFieldsGrid}>
        {fields.map(field => (
          <SummaryFieldCell
            key={field.id}
            field={field}
            rowStats={rowStats}
          />
        ))}
      </Box>
    </Box>
  )
}

export function SummaryStep({ draft, onDraft, onStep }) {
  const selectedParmIds = draft?.selectedParmIds || []
  const visibleParms = getVisibleParms(selectedParmIds)
  const fields = buildEntryFields(visibleParms)

  const summaryRows = buildStatsSummaryRows({ draft, fields })
  const totals = buildStatsSummaryTotals(summaryRows)

  const openPlayer = playerId => {
    onDraft({ activePlayerId: playerId })
    onStep('entry')
  }

  return (
    <Box sx={sx.stepContent}>
      <Box>
        <Typography level="title-sm">
          סיכום סטטיסטיקה
        </Typography>

        <Typography level="body-sm" color="neutral">
          סקירה מפורטת של כל השחקנים והפרמטרים שנבחרו לפני שמירה.
        </Typography>
      </Box>

      <SummaryTotals totals={totals} />

      <Sheet variant="outlined" sx={sx.summaryDetailedList}>
        {summaryRows.map(row => (
          <SummaryPlayerRow
            key={row.playerId}
            row={row}
            draft={draft}
            fields={fields}
            locked={isLockedSummaryRow({ row, draft })}
            onOpenPlayer={openPlayer}
          />
        ))}
      </Sheet>
    </Box>
  )
}
