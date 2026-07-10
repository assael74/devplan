// src/features/hub/teamProfile/sharedUi/players/print/ReportParts.js

import React from 'react'
import { Avatar, Box, Chip, Sheet, Typography } from '@mui/joy'

import playerImage from '../../../../../../ui/core/images/playerImage.jpg'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import JoyStarRatingStatic from '../../../../../../ui/domains/ratings/JoyStarRating.js'

import { sharedSx as sx } from './sx/shared.sx.js'

export function TableColumns({ columns }) {
  return (
    <colgroup>
      {columns.map(column => (
        <col key={column.key} style={{ width: column.width }} />
      ))}
    </colgroup>
  )
}

export function TableHead({ columns }) {
  return (
    <Box component='thead'>
      <Box component='tr'>
        {columns.map(column => (
          <Box key={column.key} component='th' sx={sx.th}>
            {column.label}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function PlayerCell({ row }) {
  return (
    <Box sx={sx.playerCell}>
      <Avatar src={row.photo || playerImage} sx={sx.avatar} />

      <Box sx={sx.playerText}>
        <Typography component='span' sx={sx.playerName}>
          {row.name}
        </Typography>

        <Typography component='span' sx={sx.playerSubline}>
          {row.subline}
        </Typography>
      </Box>
    </Box>
  )
}

export function PositionChips({ positions = [] }) {
  if (!positions.length) return null

  return (
    <Box sx={sx.positionChips}>
      {positions.map(position => (
        <Chip
          key={position}
          size='sm'
          variant='soft'
          color='primary'
          startDecorator={iconUi({ id: position, size: 'xs' })}
          sx={sx.positionChip}
        />
      ))}
    </Box>
  )
}

export function SeasonPlanStatusChip({ status }) {
  const iconId = status && status.iconId ? status.iconId : 'notReviewed'
  const iconColor = status && status.iconColor ? status.iconColor : '#64748B'
  const label = status && status.shortLabel ? status.shortLabel : status && status.label ? status.label : 'לא נבחן'

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({ id: iconId, sx: { color: iconColor } })}
      sx={sx.seasonPlanStatusChip}
    >
      {label}
    </Chip>
  )
}

export function RoleChip({ role }) {
  if (!role || !role.defined) return null

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({ id: role.iconId, sx: { color: role.iconColor }, })}
      sx={sx.roleChip}
    >
      {role.label}
    </Chip>
  )
}

export function ProjectChip({ project }) {
  const iconId = project && project.iconId ? project.iconId : 'noneType'
  const iconColor = project && project.iconColor ? project.iconColor : '#64748B'

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({ id: iconId, sx: { color: iconColor }, })}
      sx={sx.projectChip}
    />
  )
}

export function SummaryItem({ item }) {
  return (
    <Sheet variant='outlined' sx={sx.summaryItem}>
      <Box sx={sx.summaryIcon}>
        {iconUi({ id: item.iconId || 'players', sx: { color: item.iconColor || '#64748B' }, })}
      </Box>

      <Box sx={sx.summaryCopy}>
        <Typography sx={sx.summaryValue}>
          {item.count}
        </Typography>

        <Typography sx={sx.summaryLabel}>
          {item.shortLabel || item.label}
        </Typography>
      </Box>
    </Sheet>
  )
}

export function SummarySection({ title, subtitle, items = [], columns = 1 }) {
  const total = items.reduce((sum, item) => {
    return sum + Number(item.count || 0)
  }, 0)

  return (
    <Sheet variant='outlined' className='dpPrintSection' sx={sx.summarySection}>
      <Box sx={sx.summarySectionHeader}>
        <Box>
          <Typography level='title-sm' sx={sx.summarySectionTitle}>
            {title}
          </Typography>

          <Typography level='body-xs' sx={sx.summarySectionSubtitle}>
            {subtitle}
          </Typography>
        </Box>

        <Typography sx={sx.summarySectionTotal}>
          {total} שחקנים
        </Typography>
      </Box>

      <Box sx={sx.summaryGrid({ columns })}>
        {items.map(item => (
          <SummaryItem key={item.id} item={item} />
        ))}
      </Box>
    </Sheet>
  )
}

function renderCellByKey(key, row, flags) {
  if (key === 'index') {
    return row.index
  }

  if (key === 'player') {
    return <PlayerCell row={row} />
  }

  if (key === 'positions') {
    const positions = flags.isMobile
      ? [row.mainPosition || row.positions?.[0]].filter(Boolean)
      : row.positions

    return <PositionChips positions={positions} />
  }

  if (key === 'seasonPlanStatus' && flags.showSeasonPlanStatus) {
    return <SeasonPlanStatusChip status={row.seasonPlanStatus} />
  }

  if (key === 'squadRole' && flags.showSquadRole) {
    return <RoleChip role={row.role} />
  }

  if (key === 'level') {
    return (
      <Box sx={sx.potentialCell}>
        <JoyStarRatingStatic value={row.level} size='sm' />
      </Box>
    )
  }

  if (key === 'project') {
    return <ProjectChip project={row.project} />
  }

  return null
}

function SquadRow({ row, columns, showSeasonPlanStatus, showSquadRole, isMobile }) {
  const visibleColumns = Array.isArray(columns) ? columns : []

  return (
    <Box component='tr' className='dpPrintRow'>
      {visibleColumns.map(column => {
        const key = column.key
        const isMiddle = key === 'player' || key === 'positions'
        const isCenter =
          key === 'index' ||
          key === 'seasonPlanStatus' ||
          key === 'squadRole' ||
          key === 'level' ||
          key === 'project'

        const cellContent = renderCellByKey(key, row, {
          showSeasonPlanStatus,
          showSquadRole,
          isMobile,
        })

        if (cellContent == null) {
          return null
        }

        return (
          <Box
            key={key}
            component='td'
            sx={[
              sx.td,
              isMiddle ? sx.middleTd : null,
              isCenter ? sx.centerTd : null,
              key === 'index' ? sx.indexTd : null,
            ]}
          >
            {cellContent}
          </Box>
        )
      })}
    </Box>
  )
}

export function SquadTable({
  rows = [],
  columns = [],
  showSeasonPlanStatus = false,
  showSquadRole = false,
  isMobile = false,
}) {
  return (
    <Box component='table' sx={sx.table}>
      <TableColumns columns={columns} />
      <TableHead columns={columns} />

      <Box component='tbody'>
        {rows.map(row => (
          <SquadRow
            key={row.id}
          row={row}
          columns={columns}
          showSeasonPlanStatus={showSeasonPlanStatus}
          showSquadRole={showSquadRole}
          isMobile={isMobile}
        />
      ))}
      </Box>
    </Box>
  )
}
