// playerProfile/sharedUi/insights/playerGames/sections/MainDiagnosis.js

import React from 'react'
import { Box, Chip, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'

import { mainDiagnosisSx as sx } from './sx/mainDiagnosis.sx.js'

const JOY_COLORS = [
  'primary',
  'neutral',
  'danger',
  'success',
  'warning',
]

const normalizeColor = (value, fallback = 'neutral') => {
  if (JOY_COLORS.includes(value)) return value
  return fallback
}

const isHexColor = (value) => {
  return typeof value === 'string' && value.startsWith('#')
}

function RoleChip({ role }) {
  const roleColor = role?.color || ''
  const chipColor = normalizeColor(roleColor, 'neutral')

  const customSx = isHexColor(roleColor)
    ? {
        bgcolor: roleColor,
        color: '#fff',
        '& .MuiChip-startDecorator': {
          color: '#fff',
        },
      }
    : null

  return (
    <Chip
      size="sm"
      variant={isHexColor(roleColor) ? 'solid' : 'soft'}
      color={chipColor}
      startDecorator={iconUi({
        id: role?.icon || 'squad',
        size: 'sm',
      })}
      sx={{
        fontWeight: 700,
        '--Chip-minHeight': '24px',
        ...customSx,
      }}
    >
      {role?.label || 'לא הוגדר מעמד'}
    </Chip>
  )
}

function DiagnosisChip({ diagnosis }) {
  const color = normalizeColor(diagnosis?.tone)

  return (
    <Chip
      size="sm"
      variant="soft"
      color={color}
      startDecorator={iconUi({
        id: diagnosis?.icon || 'insights',
        size: 'sm',
      })}
      sx={sx.statusChip}
    >
      {diagnosis?.title || 'אבחנה חסרה'}
    </Chip>
  )
}

function ReliabilityChip({ reliability }) {
  const color = normalizeColor(reliability?.tone)

  return (
    <Chip
      size="sm"
      variant="outlined"
      color={color}
      startDecorator={iconUi({
        id: reliability?.icon || 'info',
        size: 'xs',
      })}
      sx={sx.reliabilityChip}
    >
      {`מהימנות: ${reliability?.label || 'לא ידועה'}`}
    </Chip>
  )
}

function SummaryFact({ item }) {
  if (!item) return null

  return (
    <Box sx={sx.fact}>
      <Box sx={sx.factIcon}>
        {iconUi({
          id: item.icon || 'info',
          size: 'xs',
        })}
      </Box>

      <Typography level="body-xs" sx={sx.factLabel}>
        {item.label}
      </Typography>

      <Typography level="body-sm" sx={sx.factValue}>
        {item.value || '—'}
      </Typography>
    </Box>
  )
}

function SummaryFacts({ items = [] }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : []

  if (!safeItems.length) return null

  return (
    <Box sx={sx.factsRow}>
      {safeItems.slice(0, 2).map((item) => (
        <SummaryFact key={item.id || item.label} item={item} />
      ))}
    </Box>
  )
}

export default function MainDiagnosis({
  data,
}) {
  if (!data) {
    return null
  }

  const role = data?.role || {}
  const diagnosis = data?.diagnosis || {}
  const reliability = data?.reliability || {}

  return (
    <Sheet variant="plain" sx={sx.root(diagnosis?.tone)}>
      <Box sx={sx.topRow}>
        <Box sx={sx.chipsRow}>
          <RoleChip role={role} />
        </Box>

        <ReliabilityChip reliability={reliability} />
      </Box>

      <Box sx={sx.body}>
        <Box sx={sx.titleRow}>
          <Typography level="title-md" sx={sx.title}>
            {diagnosis?.title || 'אין אבחנה זמינה'}
          </Typography>

          {iconUi({id: diagnosis?.icon || 'insights', size: 'lg'})}
        </Box>

        <Typography level="body-sm" sx={sx.text}>
          {diagnosis?.text || 'אין מספיק נתונים כדי לבנות אבחנה ראשית לשחקן.'}
        </Typography>
      </Box>

      <Box sx={sx.bottomRow}>
        <SummaryFacts items={data.summaryFacts} />

        {diagnosis?.actionText ? (
          <Typography level="body-xs" sx={sx.actionText}>
            {diagnosis.actionText}
          </Typography>
        ) : null}
      </Box>
    </Sheet>
  )
}
