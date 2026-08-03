import React from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  LinearProgress,
  Typography,
} from '@mui/joy'

import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

const toNumber = value => {
  const next = Number(value)
  return Number.isFinite(next) ? next : 0
}

const formatNumber = value =>
  new Intl.NumberFormat('he-IL').format(toNumber(value))

const formatCurrency = (value, currency = 'ILS') =>
  new Intl.NumberFormat('he-IL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value))

const resolvePercent = (value, limit) => {
  const safeLimit = toNumber(limit)
  if (!safeLimit) return 0
  return Math.min(100, (toNumber(value) / safeLimit) * 100)
}

const resolveRisk = rows => {
  const maxPercent = Math.max(...rows.map(row => row.percent), 0)

  if (maxPercent >= 100) return { label: 'חריגה מהמכסה החינמית', color: 'danger' }
  if (maxPercent >= 75) return { label: 'קרוב לחיוב', color: 'warning' }
  return { label: 'בתוך המכסה החינמית', color: 'success' }
}

const KPI_META = {
  reads: {
    icon: VisibilityRoundedIcon,
    helper: 'קריאות מסמכים היום',
    color: 'primary',
    accent: 'primary.500',
    surface: 'primary.50',
  },
  writes: {
    icon: EditRoundedIcon,
    helper: 'כתיבות מסמכים היום',
    color: 'success',
    accent: 'success.500',
    surface: 'success.50',
  },
  deletes: {
    icon: DeleteOutlineRoundedIcon,
    helper: 'מחיקות מסמכים היום',
    color: 'danger',
    accent: 'danger.500',
    surface: 'danger.50',
  },
}

function OfficialKpiCard({ row }) {
  const meta = KPI_META[row.id] || KPI_META.reads
  const Icon = meta.icon
  const color = row.percent >= 100
    ? 'danger'
    : row.percent >= 75
      ? 'warning'
      : 'success'

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: 1.75,
        borderRadius: 'lg',
        borderWidth: 1,
        borderColor: meta.accent,
        boxShadow: 'md',
        minWidth: 0,
        bgcolor: meta.surface,
        '&::before': {
          content: '""',
          position: 'absolute',
          insetBlock: 0,
          insetInlineStart: 0,
          width: 5,
          bgcolor: meta.accent,
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography level="body-sm" fontWeight={700}>
            {row.label}
          </Typography>

          <Typography level="body-xs" textColor="text.tertiary">
            {meta.helper}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'background.surface',
            color: meta.accent,
            boxShadow: 'sm',
            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mt: 1.25 }}>
        <Typography level="h1" sx={{ lineHeight: 1, fontWeight: 700 }}>
          {formatNumber(row.value)}
        </Typography>

        <Typography level="body-xs" textColor="text.tertiary">
          מתוך {formatNumber(row.limit)}
        </Typography>
      </Box>

      <LinearProgress
        determinate
        value={row.percent}
        color={color}
        sx={{ mt: 1.25 }}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
        <Typography level="body-xs" textColor="text.tertiary">
          {row.percent.toFixed(2)}%
        </Typography>

        <Chip size="sm" variant="soft" color={color}>
          נותרו {formatNumber(Math.max(0, row.limit - row.value))}
        </Chip>
      </Box>
    </Card>
  )
}

export default function UsageOfficialStatus({ source, official, onRefresh }) {
  const links = Array.isArray(source?.links) ? source.links : []
  const data = official?.data || null
  const connected = official?.status === 'connected' && data

  const rows = connected
    ? [
        {
          id: 'reads',
          label: 'Reads היום',
          value: data.reads,
          limit: data.limits?.reads,
        },
        {
          id: 'writes',
          label: 'Writes היום',
          value: data.writes,
          limit: data.limits?.writes,
        },
        {
          id: 'deletes',
          label: 'Deletes היום',
          value: data.deletes,
          limit: data.limits?.deletes,
        },
      ].map(row => ({
        ...row,
        value: toNumber(row.value),
        limit: toNumber(row.limit),
        percent: resolvePercent(row.value, row.limit),
      }))
    : []

  const risk = resolveRisk(rows)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
      <Card
        variant="outlined"
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 'lg',
          boxShadow: 'sm',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Typography level="title-md">Firestore רשמי</Typography>

            <Chip
              size="sm"
              variant="soft"
              color={connected ? risk.color : 'warning'}
            >
              {connected ? risk.label : `${source?.plan || 'Blaze'} · לא מחובר`}
            </Chip>

            {connected && (
              <Typography level="body-xs" textColor="text.tertiary">
                עודכן {data.updatedAt || official?.lastUpdatedAt || ''}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            <Button
              size="sm"
              variant="outlined"
              color="neutral"
              startDecorator={<RefreshRoundedIcon />}
              onClick={onRefresh}
              loading={official?.status === 'loading'}
            >
              רענון
            </Button>

            {links.slice(0, 2).map(link => (
              <Button
                key={link.id}
                component="a"
                href={link.href}
                target="_blank"
                rel="noreferrer"
                size="sm"
                variant="plain"
                color="neutral"
                endDecorator={<OpenInNewRoundedIcon />}
              >
                {link.label}
              </Button>
            ))}
          </Box>
        </Box>

        {official?.status === 'error' && (
          <Alert color="danger" variant="soft" sx={{ mt: 1 }}>
            {official.error}
          </Alert>
        )}
      </Card>
      {connected && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: data.cost
                ? 'repeat(4, minmax(0, 1fr))'
                : 'repeat(3, minmax(0, 1fr))',
            },
            gap: 1.25,
          }}
        >
          {rows.map(row => (
            <OfficialKpiCard key={row.id} row={row} />
          ))}

          {data.cost && (
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 'lg', boxShadow: 'none' }}>
              <Typography level="body-sm" fontWeight={700}>עלות Firestore</Typography>
              <Typography level="h2" sx={{ mt: 1 }}>
                {formatCurrency(data.cost.amount, data.cost.currency || 'ILS')}
              </Typography>
              <Typography level="body-xs" textColor="text.tertiary" sx={{ mt: 0.75 }}>
                {data.cost.periodLabel || 'תקופת החיוב הנוכחית'}
              </Typography>
            </Card>
          )}
        </Box>
      )}
    </Box>
  )
}
