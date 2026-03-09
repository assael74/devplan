// teamProfile/modules/abilities/components/DrilldownModal.js
import React, { useMemo, useState } from 'react'
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Box,
  Input,
  Chip,
  Button,
  Table,
  Typography,
  Avatar,
  Tooltip,
} from '@mui/joy'
import SearchRounded from '@mui/icons-material/SearchRounded'
import * as sx from './DrilldownModal.sx'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

const defaultFilter = (row, q) => {
  const s = String(q || '').trim().toLowerCase()
  if (!s) return true
  const name = (row?.name || row?.fullName || row?.title || '').toLowerCase()
  const pos = (row?.pos || row?.position || '').toLowerCase()
  return name.includes(s) || pos.includes(s)
}

export default function DrilldownModal({
  open,
  onClose,
  title,
  subtitle,
  chips = [],
  countLabel,
  note,

  // data
  rows = [],
  columns = [],
  idIcon,
  initialSort = { key: null, dir: 'desc' },
  rowFilter = defaultFilter,
  onRowClick,
  footerActions = null,
  sx: sxOverrides = {},
}) {
  const S = useMemo(() => ({ ...sx.drilldownModalSx, ...sxOverrides }), [sxOverrides])

  const [q, setQ] = useState('')
  const [sortKey, setSortKey] = useState(initialSort.key)
  const [sortDir, setSortDir] = useState(initialSort.dir || 'desc')

  const effectiveCols = useMemo(() => columns.filter((c) => !!c?.key), [columns])

  const filtered = useMemo(() => {
    return (rows || []).filter((r) => rowFilter(r, q))
  }, [rows, rowFilter, q])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const col = effectiveCols.find((c) => c.key === sortKey)
    const get = col?.sortValue || ((r) => r?.[sortKey])

    const arr = [...filtered]
    arr.sort((a, b) => {
      const av = get(a)
      const bv = get(b)
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      if (typeof av === 'number' && typeof bv === 'number') return av - bv
      return String(av).localeCompare(String(bv), 'he')
    })

    return sortDir === 'asc' ? arr : arr.reverse()
  }, [filtered, sortKey, sortDir, effectiveCols])

  const onHeadClick = (col) => {
    if (col?.sortable === false) return
    if (!col?.key) return
    if (sortKey !== col.key) {
      setSortKey(col.key)
      setSortDir('desc')
      return
    }
    setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
  }

  const renderCell = (col, row) => {
    if (col.render) return col.render(row)
    const v = row[col.key]
    return v == null || v === '' ? '—' : String(v)
  }

  return (
    <Modal open={!!open} onClose={onClose}>
      <ModalDialog sx={S.dialog}>
        <Box sx={S.header}>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {idIcon ? <Box sx={{ display: 'flex', alignItems: 'center' }}>{iconUi({id: idIcon})}</Box> : null}
              <Typography level="title-md">{title || 'פירוט'}</Typography>
            </Box>
          </DialogTitle>

          {(subtitle || countLabel || note || chips.length > 0) && (
            <Box sx={S.subHeaderRow}>
              {subtitle && (
                <Typography level="body-sm" sx={{ color: 'neutral.600' }}>
                  {subtitle}
                </Typography>
              )}

              {countLabel && <Chip size="sm" variant="soft">{countLabel}</Chip>}

              {note && (
                <Chip size="sm" variant="soft" color="warning" title={note}>
                  {note}
                </Chip>
              )}

              {chips.map((c, idx) => (
                <Chip
                  key={idx}
                  size="sm"
                  variant={c.variant || 'soft'}
                  color={c.color || 'neutral'}
                  title={c.title}
                >
                  {c.label}
                </Chip>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={S.controlsRow}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Input
              size="sm"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="חיפוש…"
              startDecorator={<SearchRounded fontSize="small" />}
              sx={{ minWidth: 260 }}
            />

            {sortKey && (
              <Chip size="sm" variant="outlined">
                מיון: {effectiveCols.find((c) => c.key === sortKey)?.title || sortKey} ({sortDir})
              </Chip>
            )}
          </Box>

          <Button size="sm" variant="soft" onClick={onClose}>
            סגור
          </Button>
        </Box>

        <DialogContent sx={S.content}>
          {sorted.length === 0 ? (
            <Box sx={S.empty}>אין נתונים להצגה לפי הסינון הנוכחי.</Box>
          ) : (
            <Box sx={S.tableWrap}>
              <Table stickyHeader hoverRow sx={S.table}>
                <thead>
                  <tr>
                    {effectiveCols.map((c) => {
                      const head = (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent:
                              c.align === 'center' ? 'center' : c.align === 'left' ? 'flex-end' : 'flex-start',
                            gap: 0.5,
                          }}
                        >
                          {c.icon ? <Box sx={{ display: 'flex', alignItems: 'center' }}>{c.icon}</Box> : null}
                          <span>{c.title}</span>
                        </Box>
                      )

                      return (
                        <th
                          key={c.key}
                          style={{
                            width: c.width || 'auto',
                            textAlign: c.align || 'right',
                            cursor: c.sortable === false ? 'default' : 'pointer',
                          }}
                          onClick={c.sortable === false ? undefined : () => onHeadClick(c)}
                          title={c.sortable === false ? undefined : 'לחץ למיון'}
                        >
                          {c.titleTip ? <Tooltip title={c.titleTip}>{head}</Tooltip> : head}
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {sorted.map((r, idx) => (
                    <tr
                      key={r?.id || idx}
                      onClick={onRowClick ? () => onRowClick(r) : undefined}
                      style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                    >
                      {effectiveCols.map((c) => (
                        <td key={c.key} style={{ textAlign: c.align || 'right' }}>
                          {renderCell(c, r)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          )}
        </DialogContent>

        {(footerActions || onRowClick) && <Box sx={S.footer}>{footerActions}</Box>}
      </ModalDialog>
    </Modal>
  )
}

export const renderPlayerCell = (row) => {
  const name = row?.name || row?.fullName || row?.playerName || '—'
  const img = row?.img || row?.photoUrl || row?.avatarUrl || null

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar size="sm" src={img || undefined}>
        {String(name || '').slice(0, 1)}
      </Avatar>

      <Typography level="body-sm" sx={{ fontWeight: 700 }}>
        {name}
      </Typography>
    </Box>
  )
}

export const renderPosChipsCell = (row) => {
  const txt = row?.pos || row?.position || ''
  const parts = String(txt || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

  if (!parts.length) return '—'

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'flex-start' }}>
      {parts.map((p) => (
        <Chip key={p} size="sm" variant="soft" sx={{ px: 0.8, py: 0.2 }}>
          {p}
        </Chip>
      ))}
    </Box>
  )
}
