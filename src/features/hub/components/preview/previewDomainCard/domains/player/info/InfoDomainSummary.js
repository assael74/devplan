// src/features/players/components/preview/PreviewDomainCard/domains/player/InfoDomainSummary.js
import React from 'react'
import { Box, Chip, Typography } from '@mui/joy'
import { domainBoxSx } from '../../domain.sx'

const last = (arr) => (Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null)

const isPlaceholderPhone = (v) => {
  const s = String(v || '').trim()
  if (!s) return true
  return s === '000-000000' || s === '0000000000' || s === '000000000'
}

const Row = ({ label, value, color }) => {
  const has = value != null && String(value) !== ''
  return (
    <Box {...domainBoxSx}>
      <Typography level="body-xs" sx={{ fontSize: '0.5rem', fontWeight: 700, opacity: 0.9 }}>
        {label}
      </Typography>
      <Chip size="sm" variant="soft" color={has ? color : 'neutral'}>
        {has ? value : '—'}
      </Chip>
    </Box>
  )
}

export default function InfoDomainSummary({ entity }) {
  const p = entity || {}

  const birthDay = p.birthDay || '—'
  const phone = p.phone || '—'
  const height = last(p.height) ?? '—'
  const weight = last(p.weight) ?? '—'
  const bodyFat = last(p.bodyFat) ?? '—'

  const phoneOk = !isPlaceholderPhone(phone)
  const hasBirth = birthDay !== '—' && String(birthDay).trim() !== ''

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6, width: '100%' }}>
      <Row label="תאריך לידה" value={birthDay} color={hasBirth ? 'primary' : 'neutral'} />
      <Row label="טלפון" value={phone} color={phoneOk ? 'primary' : 'warning'} />
    </Box>
  )
}
