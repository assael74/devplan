// src/features/finance/FinancePage.js

import React, { useMemo, useState } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Chip,
  Input,
  Option,
  Select,
  Sheet,
  Table,
  Typography,
} from '@mui/joy'

import { useCoreData } from '../../coreData/CoreDataProvider.js'
import {
  buildFinanceAttention,
  buildFinanceMonths,
  buildFinanceRows,
  buildFinanceSummary,
  filterFinanceRows,
} from '../../shared/payments/finance.logic.js'
import { iconUi } from '../../ui/core/icons/iconUi.js'
import { financeSx as sx } from './sx/finance.sx.js'

const money = value => `${Number(value || 0).toLocaleString('he-IL')} ₪`

const PLAYER_KIND_OPTIONS = [
  { value: 'all', label: 'הכל', iconId: 'payments' },
  { value: 'private', label: 'פרטיים', iconId: 'private' },
  { value: 'project', label: 'פרויקט', iconId: 'project' },
]

const STATUS_OPTIONS = [
  { value: 'all', label: 'כל הסטטוסים' },
  { value: 'open', label: 'פתוח' },
  { value: 'done', label: 'שולם' },
  { value: 'overdue', label: 'באיחור' },
]

function FinanceKpis({ summary }) {
  const items = [
    {
      id: 'open',
      label: 'פתוח לגבייה',
      value: summary.open,
      note: 'כולל יתרות פרטיים',
      iconId: 'paymentRequest',
      tone: 'primary',
    },
    {
      id: 'overdue',
      label: 'באיחור',
      value: summary.overdue,
      note: 'רק מועד שניתן לאימות',
      iconId: 'warning',
      tone: summary.overdue > 0 ? 'danger' : 'neutral',
    },
    {
      id: 'expected',
      label: 'צפוי החודש',
      value: summary.expected,
      note: 'מתשלומים מתוזמנים',
      iconId: 'projection',
      tone: 'info',
    },
    {
      id: 'received',
      label: 'התקבל החודש',
      value: summary.received,
      note: 'לפי מידע זמין',
      iconId: 'isPaid',
      tone: 'success',
    },
  ]

  return (
    <Box sx={sx.kpis}>
      {items.map(item => (
        <Sheet key={item.id} variant="plain" sx={sx.kpi(item.tone)}>
          <Box sx={sx.kpiHeader}>
            <Box sx={sx.kpiIcon(item.tone)}>
              {iconUi({ id: item.iconId, size: 'sm' })}
            </Box>
            <Typography level="body-sm" sx={sx.kpiLabel}>
              {item.label}
            </Typography>
          </Box>

          <Typography level="h3" sx={sx.kpiValue(item.tone)}>
            {money(item.value)}
          </Typography>

          <Typography level="body-xs" sx={sx.mutedText}>
            {item.note}
          </Typography>
        </Sheet>
      ))}
    </Box>
  )
}

function PlayerKindFilter({ value, onChange }) {
  return (
    <Box sx={sx.kindGroup}>
      {PLAYER_KIND_OPTIONS.map((item, index) => {
        const active = value === item.value

        return (
          <Button
            key={item.value}
            size="sm"
            variant="plain"
            onClick={() => onChange(item.value)}
            startDecorator={iconUi({ id: item.iconId, size: 'sm' })}
            sx={sx.kindButton(active, index)}
          >
            {item.label}
          </Button>
        )
      })}
    </Box>
  )
}

function FinanceFilters({ filters, onChange }) {
  return (
    <Sheet variant="plain" sx={sx.filters}>
      <PlayerKindFilter
        value={filters.playerKind}
        onChange={value => onChange('playerKind', value)}
      />

      <Select
        size="sm"
        value={filters.status}
        onChange={(_, value) => onChange('status', value || 'all')}
        sx={sx.select}
      >
        {STATUS_OPTIONS.map(item => (
          <Option key={item.value} value={item.value}>{item.label}</Option>
        ))}
      </Select>

      <Input
        size="sm"
        value={filters.search}
        placeholder="חיפוש שחקן"
        startDecorator={iconUi({ id: 'search', size: 'sm' })}
        onChange={event => onChange('search', event.target.value)}
        sx={sx.search}
      />
    </Sheet>
  )
}

function FinanceAttention({ items }) {
  return (
    <Sheet variant="plain" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleRow}>
          <Box sx={sx.sectionIcon('danger')}>
            {iconUi({ id: 'warning', size: 'sm' })}
          </Box>
          <Box>
            <Typography level="title-md" sx={sx.sectionTitle}>דורש טיפול</Typography>
            <Typography level="body-xs" sx={sx.mutedText}>
              איחורים וחשבוניות פתוחות שניתן לזהות מהמידע הקיים
            </Typography>
          </Box>
        </Box>

        <Chip size="sm" variant="soft" sx={sx.attentionCount}>
          {items.length}
        </Chip>
      </Box>

      {items.length === 0 ? (
        <Typography level="body-sm" sx={sx.emptyText}>
          אין כרגע פריטים שמסומנים לטיפול.
        </Typography>
      ) : (
        <Box sx={sx.attentionList}>
          {items.slice(0, 8).map(item => (
            <Box key={item.id} sx={sx.attentionRow}>
              <Box sx={sx.attentionMain}>
                <Typography level="title-sm" noWrap sx={sx.playerName}>
                  {item.playerName}
                </Typography>
                <Chip size="sm" variant="soft" sx={sx.playerKindChip(item.playerKind)}>
                  {item.playerKindLabel}
                </Chip>
                <Typography level="body-xs" noWrap sx={sx.mutedText}>
                  {item.paymentFor || 'תשלום'}
                </Typography>
              </Box>

              <Box sx={sx.attentionMeta}>
                <Typography level="title-sm" sx={sx.amountText}>
                  {money(item.remainingAmount)}
                </Typography>
                <Chip size="sm" variant="soft" sx={sx.statusChip(item.attentionColor)}>
                  {item.attentionLabel}
                </Chip>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Sheet>
  )
}

function FinanceMonths({ items }) {
  return (
    <Sheet variant="plain" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleRow}>
          <Box sx={sx.sectionIcon('info')}>
            {iconUi({ id: 'calendar', size: 'sm' })}
          </Box>
          <Box>
            <Typography level="title-md" sx={sx.sectionTitle}>חודשים אחרונים</Typography>
            <Typography level="body-xs" sx={sx.mutedText}>
              תקבולים ויתרות לפי מידע חודשי מפורש; הסכמים פרטיים אינם נפרסים בהערכה
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={sx.monthsGrid}>
        {items.map(item => (
          <Box key={item.key} sx={sx.monthItem}>
            <Typography level="body-xs" sx={sx.monthLabel}>{item.label}</Typography>
            <Box sx={sx.monthMetric}>
              <Typography level="body-xs" sx={sx.mutedText}>התקבל</Typography>
              <Typography level="title-md" sx={sx.monthReceived}>{money(item.received)}</Typography>
            </Box>
            <Box sx={sx.monthMetric}>
              <Typography level="body-xs" sx={sx.mutedText}>פתוח</Typography>
              <Typography level="body-sm" sx={sx.monthOpen}>{money(item.open)}</Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Sheet>
  )
}

function FinanceTable({ rows, onOpenPlayer }) {
  return (
    <Sheet variant="plain" sx={sx.section}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleRow}>
          <Box sx={sx.sectionIcon('primary')}>
            {iconUi({ id: 'payments', size: 'sm' })}
          </Box>
          <Box>
            <Typography level="title-md" sx={sx.sectionTitle}>כל התשלומים</Typography>
            <Typography level="body-xs" sx={sx.mutedText}>
              תמונת Financial Control מאוחדת לשחקנים פרטיים ושחקני פרויקט
            </Typography>
          </Box>
        </Box>
        <Typography level="body-xs" sx={sx.mutedText}>{rows.length} רשומות</Typography>
      </Box>

      <Box sx={sx.tableWrap}>
        <Table hoverRow size="sm" stickyHeader sx={sx.table}>
          <thead>
            <tr>
              <th>שחקן</th>
              <th>סוג שחקן</th>
              <th>סוג תשלום</th>
              <th>עבור</th>
              <th>סכום</th>
              <th>שולם</th>
              <th>יתרה</th>
              <th>מועד</th>
              <th>סטטוס</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                <td>
                  <Button
                    size="sm"
                    variant="plain"
                    onClick={() => onOpenPlayer(row.playerId)}
                    sx={sx.playerButton}
                  >
                    {row.playerName}
                  </Button>
                </td>
                <td>
                  <Chip size="sm" variant="soft" sx={sx.playerKindChip(row.playerKind)}>
                    {row.playerKindLabel}
                  </Chip>
                </td>
                <td>{row.typeLabel}</td>
                <td>{row.paymentFor || '—'}</td>
                <td>{money(row.amount)}</td>
                <td>{money(row.paidAmount)}</td>
                <td>{money(row.remainingAmount)}</td>
                <td>{row.dueMonth || row.startDate || '—'}</td>
                <td>
                  <Chip size="sm" variant="soft" sx={sx.statusChip(row.statusColor)}>
                    {row.statusLabel}
                  </Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Box>

      {rows.length === 0 ? (
        <Typography level="body-sm" sx={sx.emptyText}>
          אין תשלומים בהתאמה לפילטרים.
        </Typography>
      ) : null}
    </Sheet>
  )
}

export default function FinancePage() {
  const navigate = useNavigate()
  const { players = [], privatePlayers = [], loading, error } = useCoreData()
  const [filters, setFilters] = useState({
    search: '',
    playerKind: 'all',
    status: 'all',
  })

  const rows = useMemo(
    () => buildFinanceRows({ players, privatePlayers }),
    [players, privatePlayers]
  )
  const summary = useMemo(() => buildFinanceSummary(rows), [rows])
  const months = useMemo(() => buildFinanceMonths(rows), [rows])
  const attention = useMemo(() => buildFinanceAttention(rows), [rows])
  const filteredRows = useMemo(
    () => filterFinanceRows(rows, filters),
    [rows, filters]
  )

  const handleFilterChange = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }))
  }

  const handleOpenPlayer = playerId => {
    if (!playerId) return
    navigate(`/players/${playerId}/payments`)
  }

  if (loading) {
    return (
      <Box sx={sx.loading}>
        <Typography level="body-sm" sx={sx.mutedText}>טוען נתוני כספים...</Typography>
      </Box>
    )
  }

  return (
    <Box component="main" sx={sx.root}>
      <Box className="dpScrollThin" sx={sx.scroll}>
        <Box sx={sx.content}>
          <Box sx={sx.header}>
            <Box>
              <Typography level="h2" sx={sx.pageTitle}>כספים</Typography>
              <Typography level="body-sm" sx={sx.pageDescription}>
                תמונת מצב פיננסית של שחקנים פרטיים ושחקני פרויקט
              </Typography>
            </Box>

            <Chip
              size="sm"
              variant="soft"
              startDecorator={iconUi({ id: 'calendar', size: 'sm' })}
              sx={sx.monthChip}
            >
              {moment().format('MM/YYYY')} · קריאה בלבד
            </Chip>
          </Box>

          {error ? (
            <Sheet variant="soft" sx={sx.errorBox}>
              <Box sx={sx.errorContent}>
                {iconUi({ id: 'warning', size: 'sm' })}
                <Typography level="body-sm">חלק מנתוני הליבה לא נטענו במלואם.</Typography>
              </Box>
            </Sheet>
          ) : null}

          <FinanceKpis summary={summary} />
          <FinanceFilters filters={filters} onChange={handleFilterChange} />
          <FinanceAttention items={attention} />
          <FinanceMonths items={months} />
          <FinanceTable rows={filteredRows} onOpenPlayer={handleOpenPlayer} />
        </Box>
      </Box>
    </Box>
  )
}
