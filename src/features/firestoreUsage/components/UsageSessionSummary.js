import React from 'react'
import {
  Box,
  Card,
  Divider,
  Typography,
} from '@mui/joy'

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
})

function SummaryRow({ label, value }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 2,
        py: 1,
      }}
    >
      <Typography level="body-sm" textColor="text.tertiary">
        {label}
      </Typography>

      <Typography level="title-md">
        {value}
      </Typography>
    </Box>
  )
}

export default function UsageSessionSummary({ summary, totals }) {
  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 'lg', boxShadow: 'sm' }}>
      <Typography level="title-lg" sx={{ mb: 1 }}>
        Snapshot הסשן
      </Typography>

      <SummaryRow
        label="סה״כ פעולות"
        value={numberFormatter.format(summary.totalOperations)}
      />

      <Divider />

      <SummaryRow
        label="Collections פעילים"
        value={summary.collectionsCount}
      />

      <Divider />

      <SummaryRow
        label="Features פעילים"
        value={summary.featuresCount}
      />

      <Divider />

      <SummaryRow
        label="Actions פעילים"
        value={summary.actionsCount}
      />

      <Divider />

      <SummaryRow
        label="Listeners פתוחים"
        value={numberFormatter.format(totals.listeners)}
      />

      <Divider />

      <SummaryRow
        label="נפח כולל משוער"
        value={`${numberFormatter.format(summary.totalEstimatedKb)} KB`}
      />
    </Card>
  )
}
