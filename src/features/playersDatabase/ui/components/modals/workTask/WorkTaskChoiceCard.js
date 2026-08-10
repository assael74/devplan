// src/features/playersDatabase/ui/components/modals/workTask/WorkTaskChoiceCard.js

import * as React from 'react'
import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import ScoutBadge from '../../scout/ScoutBadge.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import {
  TABLE_STATUS,
  clean,
  isPositiveLevel,
} from './workTask.model.js'
import { workTaskChoiceCardSx as sx } from './sx/workTaskChoiceCard.sx.js'

export function RouteChoiceCard({
  title,
  description,
  selected,
  onClick,
}) {
  return (
    <Button
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.routeCard,
        selected && sx.routeCardSelected,
      ]}
      onClick={onClick}
    >
      <Typography sx={sx.routeCardTitle}>
        {title}
      </Typography>
      <Typography level='body-xs' sx={sx.routeCardDescription}>
        {description}
      </Typography>
    </Button>
  )
}

function LevelStatusIcon({ missingCount }) {
  const complete = missingCount === 0

  return (
    <Box
      aria-label={complete ? 'תקין' : 'חסרות טבלאות'}
      sx={[
        sx.levelStatusIcon,
        complete ? sx.levelStatusIconSuccess : sx.levelStatusIconDanger,
      ]}
    >
      {complete ? '✓' : '!'}
    </Box>
  )
}

export function LevelChoiceCard({
  label,
  selected,
  seasons,
  onClick,
}) {
  return (
    <Button
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.levelCard,
        selected && sx.levelCardSelected,
      ]}
      onClick={onClick}
    >
      <Typography sx={sx.levelCardTitle}>
        {label}
      </Typography>

      <Box sx={sx.levelSeasonList}>
        {seasons.map(item => (
          <Box key={item.key} sx={sx.levelSeasonRow}>
            <Box sx={sx.levelSeasonMain}>
              <Typography sx={sx.levelSeasonName}>
                {item.season}
              </Typography>
              <LevelStatusIcon missingCount={item.missingCount} />
            </Box>

            <Typography level='body-xs' sx={sx.levelSeasonStatus}>
              {item.statusLabel}
            </Typography>
          </Box>
        ))}
      </Box>
    </Button>
  )
}

export function LeagueChoiceCard({ row, selected, onClick }) {
  const status = TABLE_STATUS[row.tableStatus] || TABLE_STATUS.missing
  const leagueName = clean(row.leagueName || row.name) || 'ליגה ללא שם'
  const seasonLabel = clean(row.seasonKey || row.seasonId) || 'עונה לא מוגדרת'
  const disabled = row.tableStatus === 'full'

  return (
    <Button
      disabled={disabled}
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.leagueCard,
        selected && sx.leagueCardSelected,
        disabled && sx.leagueCardDisabled,
      ]}
      onClick={disabled ? undefined : onClick}
    >
      <Box sx={sx.leagueCardHead}>
        <Typography sx={sx.leagueName}>
          {leagueName}
        </Typography>
        <Chip size='sm' color={status.tone} variant='soft'>
          {status.label}
        </Chip>
      </Box>

      <Box sx={sx.leagueSeasonWrap}>
        <Typography sx={sx.leagueSeasonLabel}>
          עונה
        </Typography>
        <Typography sx={sx.leagueSeasonValue}>
          {seasonLabel}
        </Typography>
      </Box>

      <Box sx={sx.leagueCardFoot}>
        <Typography level='body-xs' sx={sx.leagueTaskLabel}>
          {disabled ? 'אין משימת ליגה' : 'משימה צפויה'}
        </Typography>
        <Typography
          level='body-xs'
          sx={[
            sx.leagueAction,
            !disabled && sx.leagueActionActive,
          ]}
        >
          {status.action}
        </Typography>
      </Box>
    </Button>
  )
}

export function TeamPrioritySignals({ team }) {
  const attackPositive = isPositiveLevel(team?.attackPriority)
  const defensePositive = isPositiveLevel(team?.defensePriority)

  if (!attackPositive && !defensePositive) return null

  return (
    <Box sx={sx.teamPrioritySignals}>
      {attackPositive ? (
        <Box sx={sx.teamPrioritySignal}>
          <Typography level='body-xs' sx={sx.teamPriorityLabel}>
            התקפי
          </Typography>
          <ScoutBadge
            value={team.attackPriority}
            short
            fontSize={10}
          />
        </Box>
      ) : null}

      {defensePositive ? (
        <Box sx={sx.teamPrioritySignal}>
          <Typography level='body-xs' sx={sx.teamPriorityLabel}>
            הגנתי
          </Typography>
          <ScoutBadge
            value={team.defensePriority}
            short
            fontSize={10}
          />
        </Box>
      ) : null}
    </Box>
  )
}


function TaskStateIcon({ iconId, exists, label }) {
  return (
    <Box
      aria-label={label}
      title={label}
      sx={[
        sx.taskStateIcon,
        exists ? sx.taskStateIconExists : sx.taskStateIconMissing,
      ]}
    >
      {iconUi({id: iconId, size: 'sm'})}
    </Box>
  )
}

export function TeamWorkChoiceCard({
  team,
  selected,
  disabled,
  stateLabel,
  stateIconId,
  onClick,
}) {
  return (
    <Button
      disabled={disabled}
      variant={selected ? 'soft' : 'outlined'}
      sx={[
        sx.workChoiceCard,
        selected && sx.workChoiceCardSelected,
      ]}
      onClick={onClick}
    >
      <Box sx={sx.workChoiceHead}>
        <Typography sx={sx.teamAppearanceLeague}>
          {team.name}
        </Typography>
        <TaskStateIcon
          iconId={stateIconId}
          exists={disabled}
          label={stateLabel}
        />
      </Box>

      <Box sx={sx.workChoiceBody}>
        <TeamPrioritySignals team={team} />
      </Box>
    </Button>
  )
}
