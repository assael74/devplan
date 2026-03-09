// src/features/players/components/preview/PreviewDomainCard/domains/payments/PaymentsDomainModal.js
import React, { useMemo, useState } from 'react'
import { Box, Button, Chip, Divider, Input, Sheet, Table, Typography } from '@mui/joy'
import {
  PAYMENT_TYPES,
  PAYMENT_STATUSES,
} from '../../../../../../../../shared/payments/payments.constants.js'
import SearchRounded from '@mui/icons-material/SearchRounded'

const getLabelById = (list, id) => list.find((x) => x.id === id)?.labelH || ''

const safe = (v) => (v == null ? '' : String(v))

const n = (v) => {
  const x = Number(v)
  return Number.isFinite(x) ? x : 0
}

const statusChip = (statusId) => {
  const s = safe(statusId).toLowerCase()
  if (!s) return <Chip size="sm" variant="soft">—</Chip>
  if (s === 'done' || s === 'paid') return <Chip size="sm" color="success" variant="soft">שולם</Chip>
  if (s === 'new') return <Chip size="sm" color="warning" variant="soft">ממתין</Chip>
  if (s === 'invoice') return <Chip size="sm" color="neutral" variant="soft">חשבונית</Chip>
  return <Chip size="sm" variant="soft">{s}</Chip>
}

export default function PaymentsDomainModal({ items, entity, onClose, onSave }) {
  const data = useMemo(() => {
    if (Array.isArray(items) && items.length) return items
    return entity.payments
  }, [items])

  const [q, setQ] = useState('')

  const withLabels = useMemo(() => {
    const typeMap = new Map(PAYMENT_TYPES.map((x) => [x.id, x]))
    const statusMap = new Map(PAYMENT_STATUSES.map((x) => [x.id, x]))

    return (data || []).map((p) => {
      const typeMeta = typeMap.get(p?.type)
      const statusMeta = statusMap.get(p?.status?.id)

      return {
        ...p,
        typeLabel: typeMeta?.labelH || p?.type || '—',
        statusLabel: statusMeta?.labelH || p?.status?.id || '—',
        statusId: p?.status?.id || '', // נשמור כדי לצבוע Chip נכון
      }
    })
  }, [data])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return withLabels
    return withLabels.filter((p) => {
      const hay = [
        p.id,
        p.paymentFor,
        p.type,
        p.typeLabel,
        p.price,
        p.statusId,
        p.statusLabel,
        p?.status?.time,
      ]
        .map(safe)
        .join(' ')
        .toLowerCase()
      return hay.includes(s)
    })
  }, [withLabels, q])

  return (
    <Box sx={{ minWidth: 0 }}>
      <Sheet variant="soft" sx={{ p: 1, borderRadius: 'md' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SearchRounded fontSize="small" />
          <Input
            size="sm"
            placeholder="חיפוש לפי חודש / סטטוס / סוג..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            sx={{ flex: 1 }}
          />
          <Chip size="sm" variant="soft">{filtered.length}</Chip>
        </Box>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'hidden' }}>
        <Table size="sm" stickyHeader hoverRow>
          <thead>
            <tr>
              <th style={{ width: 180 }}>חודש</th>
              <th style={{ width: 120 }}>סטטוס</th>
              <th style={{ width: 60 }}>סוג</th>
              <th style={{ width: 110, textAlign: 'center' }}>סכום</th>
              <th style={{ width: 130 }}>עודכן</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{safe(p.paymentFor) || '—'}</td>
                <td>{statusChip(p.statusLabel)}</td>
                <td>{safe(p.typeLabel) || '—'}</td>
                <td style={{ textAlign: 'center' }}>₪{n(p.price)}</td>
                <td>{safe(p?.status?.time) || '—'}</td>
              </tr>
            ))}

            {!filtered.length ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-sm" sx={{ opacity: 0.7, py: 1 }}>
                    לא נמצאו תשלומים לפי החיפוש.
                  </Typography>
                </td>
              </tr>
            ) : null}
          </tbody>
        </Table>
      </Sheet>

      <Divider sx={{ my: 1.25 }} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="outlined" onClick={onClose}>סגור</Button>
      </Box>
    </Box>
  )
}
