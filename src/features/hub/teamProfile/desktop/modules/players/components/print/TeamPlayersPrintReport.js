// teamProfile/desktop/modules/players/components/print/TeamPlayersPrintReport.js

import React from 'react'
import { Avatar, Box, Chip, Typography } from '@mui/joy'

import JoyStarRatingStatic from '../../../../../../../../ui/domains/ratings/JoyStarRating.js'
import PlayerMetricChip from '../sections/ui/PlayerMetricChip.js'
import playerImage from '../../../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../../../ui/core/icons/iconUi.js'

import {
  PLAYER_ROW_METRIC_TONES,
  buildMetricIconSx,
  resolvePlayerMetricTone,
} from '../sections/ui/playerMetricTones.js'

import {
  PERFORMANCE_PRINT_COLUMNS,
  SQUAD_PRINT_COLUMNS,
  TEAM_PLAYERS_PRINT_MODES,
  getPerformancePrintRow,
  getPrintKpiItems,
  getPrintReportMeta,
  getSquadPrintRow,
  getTodayLabel,
  sortPerformancePrintRows,
} from './ui/index.js'

import { printSx as sx } from './sx/print.sx.js'

function ReportHeader({ title, teamName, subtitle, rowsCount }) {
  return (
    <Box sx={sx.header} className="dpPrintSection">
      <Box sx={sx.titleWrap}>
        <Typography sx={sx.title}>
          {title}
        </Typography>

        {teamName ? (
          <Typography sx={sx.teamName}>
            {teamName}
          </Typography>
        ) : null}

        {subtitle ? (
          <Typography sx={sx.subtitle}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>

      <Box sx={sx.meta}>
        <Box>תאריך: {getTodayLabel()}</Box>
        <Box>שחקנים: {rowsCount}</Box>
      </Box>
    </Box>
  )
}

function ReportKpiStrip({ items }) {
  return (
    <Box sx={sx.kpiStrip} className="dpPrintSection">
      {items.map(item => (
        <Box key={item.key} sx={sx.kpiBox}>
          {item.value ? (
            <Box sx={sx.kpiValue}>
              {item.value}
            </Box>
          ) : null}

          {item.label ? (
            <Box sx={sx.kpiLabel}>
              {item.label}
            </Box>
          ) : null}
        </Box>
      ))}
    </Box>
  )
}

function PlayerPrintCell({ item }) {
  return (
    <Box sx={sx.playerCell}>
      <Avatar src={item.photo || playerImage} sx={sx.avatar} />

      <Box sx={sx.playerText}>
        <Box sx={sx.name}>
          {item.name}
        </Box>

        <Box sx={sx.sub}>
          {item.subline}
        </Box>
      </Box>
    </Box>
  )
}

function CompactMetaChip({ meta }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color={meta.tone === 'custom' ? 'neutral' : meta.tone || 'neutral'}
      startDecorator={iconUi({
        id: meta.iconId,
        sx: meta.textColor ? { color: meta.textColor } : undefined,
      })}
      sx={[
        sx.compactMetaChip,
        meta.tone === 'custom' && {
          bgcolor: meta.bgColor || undefined,
          color: meta.textColor || 'inherit',
        },
      ]}
    >
      {meta.label}
    </Chip>
  )
}

function RoleChip({ meta }) {
  return (
    <Chip
      size="sm"
      variant="soft"
      color="warning"
      startDecorator={iconUi({
        id: meta.iconId,
        sx: { color: meta.color },
      })}
      sx={sx.roleChip}
    >
      {meta.label}
    </Chip>
  )
}

function PositionPrintChips({ items }) {
  if (!items.length) return '—'

  return (
    <Box sx={sx.positionChips}>
      {items.map(position => (
        <Chip
          key={position}
          size="sm"
          variant="soft"
          color="primary"
          startDecorator={iconUi({ id: position, size: 'xs' })}
          sx={sx.positionChip}
        />
      ))}
    </Box>
  )
}

function getTargetIconSx(item) {
  const tone = resolvePlayerMetricTone({
    metricKey: item.metricKey,
    tones: PLAYER_ROW_METRIC_TONES,
  })

  return buildMetricIconSx(tone)
}

function TargetsPrintChips({ items }) {
  return (
    <Box sx={sx.metricChips}>
      {items.map(item => (
        <Chip
          key={item.key}
          size="sm"
          variant="soft"
          color="neutral"
          startDecorator={iconUi({
            id: item.icon,
            sx: getTargetIconSx(item),
          })}
          sx={sx.targetMetricChip}
        >
          {item.value}
        </Chip>
      ))}
    </Box>
  )
}

function PerformanceTopChips({ items }) {
  return (
    <Box sx={sx.performanceTopChips}>
      {items.map(item => (
        <Chip
          key={item.key}
          size="sm"
          variant="soft"
          color={item.tone || 'neutral'}
          startDecorator={item.icon ? iconUi({ id: item.icon }) : null}
          sx={[
            sx.performanceTopChip,
            item.iconOnly && sx.performanceIconChip,
          ]}
        >
          {item.iconOnly ? null : item.label}
        </Chip>
      ))}
    </Box>
  )
}

function PerformanceStatChips({ items }) {
  return (
    <Box sx={[sx.metricChips, sx.performanceStatChips]}>
      {items.map(item => (
        <PlayerMetricChip
          key={item.key}
          metricKey={item.metricKey}
          icon={item.icon}
          value={item.value}
          metricTones={PLAYER_ROW_METRIC_TONES}
          sx={[sx.metricChip, sx.performanceStatChip]}
        />
      ))}
    </Box>
  )
}

function TableColumns({ columns }) {
  return (
    <colgroup>
      {columns.map(column => (
        <col key={column.key} style={{ width: column.width }} />
      ))}
    </colgroup>
  )
}

function TableHead({ columns }) {
  return (
    <Box component="thead">
      <Box component="tr">
        {columns.map(column => (
          <Box key={column.key} component="th" sx={sx.th}>
            {column.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

function SquadRow({ row, index }) {
  const item = getSquadPrintRow(row)

  return (
    <Box component="tr" className="dpPrintRow">
      <Box component="td" sx={[sx.td, sx.indexTd]}>
        {index + 1}
      </Box>

      <Box component="td" sx={[sx.td, sx.middleTd]}>
        <PlayerPrintCell item={item} />
      </Box>

      <Box component="td" sx={[sx.td, sx.middleTd]}>
        <PositionPrintChips items={item.positions} />
      </Box>

      <Box component="td" sx={[sx.td, sx.centerTd]}>
        <RoleChip meta={item.role} />
      </Box>

      <Box component="td" sx={[sx.td, sx.centerTd]}>
        <Box sx={sx.starsCell}>
          <JoyStarRatingStatic value={item.level} size="sm" />
        </Box>
      </Box>

      <Box component="td" sx={[sx.td, sx.centerTd]}>
        <CompactMetaChip meta={item.project} />
      </Box>

      <Box component="td" sx={sx.td}>
        <TargetsPrintChips items={item.targets} />
      </Box>
    </Box>
  )
}

function PerformanceRow({ row, index }) {
  const item = getPerformancePrintRow(row)

  return (
    <Box component="tr" className="dpPrintRow">
      <Box component="td" sx={[sx.td, sx.indexTd]}>
        {index + 1}
      </Box>

      <Box component="td" sx={[sx.td, sx.middleTd]}>
        <PlayerPrintCell item={item} />
      </Box>

      <Box component="td" sx={[sx.td, sx.middleTd]}>
        <PositionPrintChips items={item.positions} />
      </Box>

      <Box component="td" sx={sx.td}>
        <TargetsPrintChips items={item.targets} />
      </Box>

      <Box component="td" sx={[sx.td, sx.middleTd]}>
        <PerformanceTopChips items={item.performanceTopItems} />
      </Box>

      <Box component="td" sx={sx.td}>
        <PerformanceStatChips items={item.stats} />
      </Box>
    </Box>
  )
}

function SquadTable({ rows }) {
  return (
    <Box component="table" sx={sx.table}>
      <TableColumns columns={SQUAD_PRINT_COLUMNS} />
      <TableHead columns={SQUAD_PRINT_COLUMNS} />

      <Box component="tbody">
        {rows.map((row, index) => (
          <SquadRow
            key={row?.id || row?.playerId || index}
            row={row}
            index={index}
          />
        ))}
      </Box>
    </Box>
  )
}

function PerformanceTable({ rows }) {
  const sortedRows = sortPerformancePrintRows(rows)

  return (
    <Box component="table" sx={sx.table}>
      <TableColumns columns={PERFORMANCE_PRINT_COLUMNS} />
      <TableHead columns={PERFORMANCE_PRINT_COLUMNS} />

      <Box component="tbody">
        {sortedRows.map((row, index) => (
          <PerformanceRow
            key={row?.id || row?.playerId || index}
            row={row}
            index={index}
          />
        ))}
      </Box>
    </Box>
  )
}

export default function TeamPlayersPrintReport({
  rows = [],
  filters,
  summary,
  teamName = '',
  seasonLabel = '',
  mode = TEAM_PLAYERS_PRINT_MODES.SQUAD,
}) {
  const safeRows = Array.isArray(rows) ? rows : []
  const report = getPrintReportMeta({ teamName, seasonLabel, mode })
  const kpiItems = getPrintKpiItems({ filters, summary })

  return (
    <Box sx={sx.root}>
      <ReportHeader
        title={report.title}
        teamName={report.teamName}
        subtitle={report.subtitle}
        rowsCount={safeRows.length}
      />

      <ReportKpiStrip items={kpiItems} />

      {safeRows.length === 0 ? (
        <Typography sx={sx.empty}>
          אין שחקנים להצגה בדוח.
        </Typography>
      ) : report.isPerformance ? (
        <PerformanceTable rows={safeRows} />
      ) : (
        <SquadTable rows={safeRows} />
      )}

      <Box sx={sx.footer}>
        הדוח מבוסס על רשימת השחקנים המסוננת שמוצגת במערכת בזמן ההדפסה.
      </Box>
    </Box>
  )
}
