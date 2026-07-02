// src/features/hub/teamProfile/sharedUi/players/print/MinutesPlanPrintContent.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

import {
  PlayerCell,
  PositionChips,
  TableColumns,
  TableHead,
} from './PlayersPrintShared.js'
import { minutePlanSx as sx } from './sx/minutePlan.sx.js'

const MINUTES_TABLE_COLUMNS = [
  { key: 'index', label: '#', width: '5%' },
  { key: 'player', label: 'שחקן', width: '36%' },
  { key: 'positions', label: 'עמדות', width: '24%' },
  { key: 'minutesTarget', label: 'כמות דקות', width: '35%' },
]

const minutesFormatter = new Intl.NumberFormat('he-IL')

function formatMinutes(value) {
  const number = Number(value)
  return Number.isFinite(number) ? minutesFormatter.format(number) : '0'
}

function SummaryCard({ item }) {
  const valueTone = item.tone || (item.id === 'undefined' ? 'warning' : 'accent')

  return (
    <Sheet variant='outlined' sx={sx.summaryCard}>
      <Box sx={sx.summaryCardIcon}>
        {iconUi({
          id: item.iconId || 'players',
          size: 'sm',
        })}
      </Box>

      <Box sx={sx.summaryCardContent}>
        <Typography sx={sx.summaryCardValueTone({ tone: valueTone })}>
          {item.count}
        </Typography>

        <Typography sx={sx.summaryCardLabel}>
          {item.countLabel
            ? `${item.label} · ${item.countLabel}`
            : item.requirement
              ? `${item.label} · ${item.requirement}`
              : item.shortLabel || item.label}
        </Typography>
      </Box>
    </Sheet>
  )
}

function SummaryStrip({
  title,
  subtitle,
  items = [],
  columns = 1,
  dense = false,
  layout = 'grid',
}) {
  return (
    <Sheet
      variant='outlined'
      className='dpPrintSection'
      sx={sx.summaryStrip({ dense })}
    >
      <Box sx={sx.summaryStripHeader}>
        <Box>
          <Typography level='title-sm' sx={sx.summaryStripTitle}>
            {title}
          </Typography>

          <Typography level='body-xs' sx={sx.summaryStripSubtitle}>
            {subtitle}
          </Typography>
        </Box>

        <Typography sx={sx.summaryStripTotal}>
          {items.reduce((total, item) => {
            return total + Number(item.count || 0)
          }, 0)} שחקנים
        </Typography>
      </Box>

      <Box sx={sx.summaryItems({ columns, layout })}>
        {items.map(item => (
          <SummaryCard key={item.id} item={item} />
        ))}
      </Box>
    </Sheet>
  )
}

function MinutesTableRow({ row, index }) {
  return (
    <Box component='tr' className='dpPrintRow'>
      <Box component='td' sx={[sx.tableCell, sx.indexCell]}>
        {index + 1}
      </Box>

      <Box component='td' sx={sx.tableCell}>
        <PlayerCell row={row} />
      </Box>

      <Box component='td' sx={sx.tableCell}>
        <PositionChips positions={row.positions} />
      </Box>

      <Box component='td' sx={[sx.tableCell, sx.minutesCell]}>
        {row.minutesTargetLabel}
      </Box>
    </Box>
  )
}

function MinutesTableSummary({ group }) {
  return (
    <Box component='tr'>
      <Box component='td' colSpan={2} sx={sx.summaryLabelCell}>
        סיכום {group.shortLabel}
      </Box>

      <Box component='td' sx={sx.summaryValueCell}>
        {group.count} שחקנים
      </Box>

      <Box component='td' sx={sx.summaryValueCell}>
        {formatMinutes(group.totalMinutes)} דקות
      </Box>
    </Box>
  )
}

function MinutesTableSection({ group }) {
  if (!group.rows.length) return null

  return (
    <Sheet
      variant='outlined'
      className='dpPrintTableSection'
      sx={sx.tableSection}
    >
      <Box sx={sx.tableSectionHeader}>
        <Box>
          <Typography level='title-sm' sx={sx.tableSectionTitle}>
            {group.title}
          </Typography>

          <Typography level='body-xs' sx={sx.tableSectionSubtitle}>
            {group.minutesLabel}
          </Typography>
        </Box>

        <Box sx={sx.tableSectionMeta}>
          <Box sx={sx.tableSectionChip}>
            {group.count} שחקנים
          </Box>

          <Box sx={sx.tableSectionChip}>
            {group.minutesTarget
              ? `${formatMinutes(group.minutesTarget)} דק׳ לשחקן`
              : 'ללא יעד'}
          </Box>
        </Box>
      </Box>

      <Box component='table' sx={sx.table}>
        <TableColumns columns={MINUTES_TABLE_COLUMNS} />
        <TableHead columns={MINUTES_TABLE_COLUMNS} />

        <Box component='tbody'>
          {group.rows.map((row, index) => (
            <MinutesTableRow
              key={row.id}
              row={row}
              index={index}
            />
          ))}

          <MinutesTableSummary group={group} />
        </Box>
      </Box>
    </Sheet>
  )
}

export default function MinutesPlanPrintContent({ model }) {
  const roleItems = model.squadRoleSummary || []
  const primaryPositionItems = model.primaryPositionSummary || []

  return (
    <>
      <Box sx={sx.summarySections}>
        <SummaryStrip
          title='לפי מעמד בסגל'
          subtitle='חלוקה לפי מעמד ויעד דקות לכל שחקן'
          items={roleItems}
          columns={3}
        />

        <SummaryStrip
          title='לפי חוליות'
          subtitle='פיזור השחקנים לפי השכבה הראשית'
          items={model.layerSummary || []}
          columns={3}
        />

        <SummaryStrip
          title='לפי עמדות ראשיות'
          subtitle='שוער, בלם, מגנים, קשרים, כנפיים וחלוץ'
          items={primaryPositionItems}
          columns={3}
        />
      </Box>

      <Box sx={sx.tables}>
        {model.minutesGroups.map(group => (
          <MinutesTableSection
            key={group.id}
            group={group}
          />
        ))}
      </Box>
    </>
  )
}
