// src/features/hub/teamProfile/sharedUi/players/print/minutesPlan/MinutesPlanContent.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { CollapseBox } from '../../../../../ui/patterns/collapseBox/index.js'

import {
  PlayerCell,
  PositionChips,
  TableColumns,
  TableHead,
} from '../ReportParts.js'

import { getMinutesPlanSx } from './minutesPlan.sx.js'

const DESKTOP_COLUMNS = [
  { key: 'index', label: '#', width: '5%' },
  { key: 'player', label: 'שחקן', width: '36%' },
  { key: 'positions', label: 'עמדות', width: '24%' },
  { key: 'minutesTarget', label: 'כמות דקות', width: '35%' },
]

const MOBILE_COLUMNS = [
  { key: 'player', label: 'שחקן', width: '50%' },
  { key: 'positions', label: 'עמדה', width: '20%' },
  { key: 'minutesTarget', label: 'דקות', width: '30%' },
]

const minutesFormatter = new Intl.NumberFormat('he-IL')

function formatMinutes(value) {
  const number = Number(value)

  return Number.isFinite(number)
    ? minutesFormatter.format(number)
    : '0'
}

function SummaryCard({ item, sx }) {
  const tone = item.tone || (item.id === 'undefined' ? 'warning' : 'accent')

  const label =
    item.countLabel
      ? `${item.label} · ${item.countLabel}`
      : item.requirement
        ? `${item.label} · ${item.requirement}`
        : item.shortLabel || item.label

  return (
    <Sheet variant='outlined' sx={sx.summaryCard}>
      <Box sx={sx.summaryCardContent}>
        <Typography sx={sx.summaryCardValue({ tone })}>
          {item.count}
        </Typography>

        <Typography sx={sx.summaryCardLabel}>
          {label}
        </Typography>
      </Box>

      <Box sx={sx.summaryCardIcon}>
        {iconUi({ id: item.iconId || 'players', size: 'sm' })}
      </Box>
    </Sheet>
  )
}

function SummaryStrip({ title, subtitle, items = [], sx, isPdf, variant = 'default' }) {
  const [open, setOpen] = React.useState(true)
  const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0)

  const content = (
    <Box sx={sx.summaryStripBody}>
      <Box sx={sx.summaryItems({ variant, count: items.length })}>
        {items.map((item, index) => (
          <SummaryCard key={index} item={item} sx={sx} />
        ))}
      </Box>
    </Box>
  )

  if (isPdf) {
    return (
      <Sheet variant='outlined' className='dpPrintSection' sx={sx.summaryStrip}>
        <Box sx={sx.summaryStripHeader}>
          <Box>
            {title}
            {subtitle}
          </Box>

          <Typography sx={sx.summaryStripTotal}>
            {total} שחקנים
          </Typography>
        </Box>

        {content}
      </Sheet>
    )
  }

  return (
    <CollapseBox
      open={open}
      onToggle={() => setOpen(previous => !previous)}
      title={title}
      subtitle={subtitle}
      headerRight={(
        <Typography sx={sx.summaryStripTotal}>
          {total} שחקנים
        </Typography>
      )}
      rootSx={sx.collapseSection}
      headerSx={sx.collapseHeader}
      contentSx={sx.collapseContent}
      innerSx={sx.collapseInner}
    >
      {content}
    </CollapseBox>
  )
}

function TableRow({ row, columns, isMobile, sx }) {
  return (
    <Box component='tr' className='dpPrintRow'>
      {columns.map(column => (
        <Box
          key={column.key}
          component='td'
          sx={[
            sx.td,
            column.key === 'index' ? sx.indexTd : null,
            column.key === 'minutesTarget' ? sx.minutesTd : null,
          ]}
        >
          {column.key === 'index' && row.index}

          {column.key === 'player' && <PlayerCell row={row} styles={sx} />}

          {column.key === 'positions' && (
            <PositionChips
              positions={isMobile ? [row.mainPosition].filter(Boolean) : row.positions}
              styles={sx}
            />
          )}

          {column.key === 'minutesTarget' && row.minutesTargetLabel}
        </Box>
      ))}
    </Box>
  )
}

function SummaryRow({ group, columns, sx }) {
  return (
    <Box component='tr'>
      <Box
        component='td'
        colSpan={Math.max(columns.length - 2, 1)}
        sx={sx.summaryLabelTd}
      >
        סיכום {group.shortLabel}
      </Box>

      <Box component='td' sx={sx.summaryValueTd}>
        {group.count} שחקנים
      </Box>

      <Box component='td' sx={sx.summaryValueTd}>
        {formatMinutes(group.totalMinutes)} דקות
      </Box>
    </Box>
  )
}

function TableSection({ group, columns, isMobile, sx, showHeader = true }) {
  if (!group.rows.length) return null

  return (
    <Box>
      {showHeader && (
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
              {group.minutesTarget ? `${formatMinutes(group.minutesTarget)} דקות לשחקן` : 'לא הוגדר'}
            </Box>
          </Box>
        </Box>
      )}

      <Box component='table' sx={sx.table}>
        <TableColumns columns={columns} />
        <TableHead columns={columns} styles={sx} />

        <Box component='tbody'>
          {group.rows.map(row => (
            <TableRow
              key={row.id}
              row={row}
              columns={columns}
              isMobile={isMobile}
              sx={sx}
            />
          ))}

          {!isMobile && <SummaryRow group={group} columns={columns} sx={sx} />}
        </Box>
      </Box>
    </Box>
  )
}

function Section({ group, columns, isMobile, isPdf, sx, defaultOpen = false }) {
  const [open, setOpen] = React.useState(defaultOpen)

  if (!group.rows.length) return null

  const content = (
    <TableSection
      sx={sx}
      group={group}
      columns={columns}
      isMobile={isMobile}
      showHeader={isPdf}
    />
  )

  if (isPdf) {
    return content
  }

  return (
    <CollapseBox
      open={open}
      onToggle={() => setOpen(previous => !previous)}
      title={(
        <Typography level='title-sm' sx={sx.tableSectionTitle}>
          {group.title}
        </Typography>
      )}
      subtitle={(
        <Typography level='body-xs' sx={sx.tableSectionSubtitle}>
          {group.minutesLabel}
        </Typography>
      )}
      headerRight={(
        <Typography sx={sx.tableSectionChip}>
          {group.count} שחקנים
        </Typography>
      )}
      rootSx={sx.collapseSection}
      headerSx={sx.collapseHeader}
      contentSx={sx.collapseContent}
      innerSx={sx.collapseInner}
    >
      {content}
    </CollapseBox>
  )
}

export default function MinutesPlanContent({ model, presentation, device }) {
  const isMobile = device === 'mobile'
  const isPdf = presentation === 'pdf'
  const sx = getMinutesPlanSx({ presentation, device })

  const summary = model.summary || {}
  const groups = Array.isArray(model.sections) ? model.sections : []

  const columns = isMobile ? MOBILE_COLUMNS : DESKTOP_COLUMNS

  return (
    <>
      <Box sx={sx.summarySections}>
        <SummaryStrip
          title={(
            <Typography level='title-sm' sx={sx.tableSectionTitle}>
              לפי מעמד בסגל
            </Typography>
          )}
          subtitle={(
            <Typography level='body-xs' sx={sx.tableSectionSubtitle}>
              חלוקה לפי מעמד ויעד דקות לכל שחקן
            </Typography>
          )}
          items={summary.squadRoles || []}
          sx={sx}
          isPdf={isPdf}
          variant='roleSummary'
        />

        <SummaryStrip
          title={(
            <Typography level='title-sm' sx={sx.tableSectionTitle}>
              לפי חוליות
            </Typography>
          )}
          subtitle={(
            <Typography level='body-xs' sx={sx.tableSectionSubtitle}>
              פיזור השחקנים לפי חוליה
            </Typography>
          )}
          items={summary.layers || []}
          sx={sx}
          isPdf={isPdf}
        />

        <SummaryStrip
          title={(
            <Typography level='title-sm' sx={sx.tableSectionTitle}>
              לפי עמדות ראשיות
            </Typography>
          )}
          subtitle={(
            <Typography level='body-xs' sx={sx.tableSectionSubtitle}>
              חלוקת השחקנים לפי העמדה הראשית
            </Typography>
          )}
          items={summary.positions || []}
          sx={sx}
          isPdf={isPdf}
        />
      </Box>

      <Box sx={sx.tables}>
        {groups.map((group, index) => (
          <Section
            key={group.id}
            group={group}
            columns={columns}
            isMobile={isMobile}
            isPdf={isPdf}
            sx={sx}
            defaultOpen={index === 0 || isPdf}
          />
        ))}
      </Box>
    </>
  )
}
