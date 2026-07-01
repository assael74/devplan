// src/features/hub/teamProfile/sharedUi/players/print/PlayersPrintShared.js

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
  return (
    <Chip
      dir='rtl'
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({
        id: status?.iconId || 'notReviewed',
        sx: { color: status?.iconColor || '#64748B' },
      })}
      sx={sx.seasonPlanStatusChip}
    >
      {status?.shortLabel || status?.label || 'לא נבחן'}
    </Chip>
  )
}

export function RoleChip({ role }) {
  if (!role?.defined) return null

  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({
        id: role.iconId,
        sx: { color: role.iconColor },
      })}
      sx={sx.roleChip}
    >
      {role.label}
    </Chip>
  )
}

export function ProjectChip({ project }) {
  return (
    <Chip
      size='sm'
      variant='soft'
      color='neutral'
      startDecorator={iconUi({
        id: project?.iconId || 'noneType',
        sx: { color: project?.iconColor || '#64748B' },
      })}
      sx={sx.projectChip}
    />
  )
}

export function SummaryItem({ item }) {
  return (
    <Sheet variant='outlined' sx={sx.summaryItem}>
      <Box sx={sx.summaryIcon}>
        {iconUi({
          id: item.iconId || 'players',
          sx: { color: item.iconColor || '#64748B' },
        })}
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
          {items.reduce((total, item) => total + item.count, 0)} שחקנים
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

export function ActiveFilters({ items = [] }) {
  if (!items.length) return null

  return (
    <Box sx={sx.filters} className='dpPrintSection'>
      <Typography sx={sx.filtersLabel}>
        פילטרים פעילים
      </Typography>

      <Box sx={sx.filterChips}>
        {items.map(item => (
          <Chip key={item} size='sm' variant='soft' color='neutral'>
            {item}
          </Chip>
        ))}
      </Box>
    </Box>
  )
}

function SquadRow({
  row,
  showSeasonPlanStatus,
  showSquadRole,
}) {
  return (
    <Box component='tr' className='dpPrintRow'>
      <Box component='td' sx={[sx.td, sx.indexTd]}>
        {row.index}
      </Box>

      <Box component='td' sx={[sx.td, sx.middleTd]}>
        <PlayerCell row={row} />
      </Box>

      <Box component='td' sx={[sx.td, sx.middleTd]}>
        <PositionChips positions={row.positions} />
      </Box>

      {showSeasonPlanStatus ? (
        <Box component='td' sx={[sx.td, sx.centerTd]}>
          <SeasonPlanStatusChip status={row.seasonPlanStatus} />
        </Box>
      ) : null}

      {showSquadRole ? (
        <Box component='td' sx={[sx.td, sx.centerTd]}>
          <RoleChip role={row.role} />
        </Box>
      ) : null}

      <Box component='td' sx={[sx.td, sx.centerTd]}>
        <Box sx={sx.potentialCell}>
          <JoyStarRatingStatic value={row.level} size='sm' />
        </Box>
      </Box>

      <Box component='td' sx={[sx.td, sx.centerTd]}>
        <ProjectChip project={row.project} />
      </Box>
    </Box>
  )
}

export function SquadTable({
  rows = [],
  columns = [],
  showSeasonPlanStatus = false,
  showSquadRole = false,
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
            showSeasonPlanStatus={showSeasonPlanStatus}
            showSquadRole={showSquadRole}
          />
        ))}
      </Box>
    </Box>
  )
}
