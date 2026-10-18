// src/features/playersDatabase/ui/pages/teamPage/positionClassification/hooks/useTeamPositionClassificationColumns.js
import * as React from 'react'
import { Box, IconButton, Tooltip, Typography } from '@mui/joy'

import PlayerLineClassificationChip from '../../../../components/playerMeta/PlayerLineClassificationChip.js'
import PlayerGoalsValue from '../../../../components/playerMeta/PlayerGoalsValue.js'
import ScoutProfileChip from '../../../../components/scout/profile/ScoutProfileChip.js'
import { iconUi } from '../../../../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../../../../ui/core/images/playerImage.jpg'
import {
  displayClassificationValue,
  displayGamesStarts,
  getMinutesPresentation,
  getPlayerInterestLabel,
  getPlayerInterestLevel,
  getPlayerStatusPresentation,
  getSubstitutionPresentation,
} from '../model/teamPositionClassification.presentation.js'
import { buildTableScoutProfileChip } from '../model/teamPositionScoutProfile.presentation.js'
import { teamPositionClassificationTableSx as sx } from '../sx/teamPositionClassificationTable.sx.js'

const renderPlayerName = (row, showTooltips) => {
  const status = getPlayerStatusPresentation(row)

  return (
    <Box sx={sx.playerNameContent}>
      <Typography sx={sx.player}>{row.name}</Typography>
      {status ? (
        <Tooltip title={showTooltips ? status.label : ''}>
          <Box component='span' aria-label={status.label} sx={sx.playerStatusBadge(status.color)}>
            {iconUi({ id: status.iconId, size: 'sm' })}
          </Box>
        </Tooltip>
      ) : null}
    </Box>
  )
}

const renderMinutes = (row, showTooltips) => {
  const presentation = getMinutesPresentation(row)

  return (
    <Tooltip
      title={showTooltips ? presentation.tooltip : ''}
      placement='bottom'
      variant='soft'
      color={presentation.tooltipColor}
      slotProps={{ tooltip: { sx: sx.progressTooltip } }}
    >
      <Box sx={sx.minutesProgress}>
        <Box sx={sx.minutesValues}>
          <Typography sx={sx.minutesValue}>{displayClassificationValue(row.minutes)}</Typography>
          <Typography sx={sx.minutesRate}>{presentation.hasRate ? `· ${row.minutesRate}%` : '· —'}</Typography>
        </Box>
        <Box sx={sx.minutesProgressTrack}>
          <Box sx={sx.minutesProgressValue({ progress: presentation.progress, tone: presentation.tone })} />
        </Box>
      </Box>
    </Tooltip>
  )
}

const renderSubstitutions = (row, showTooltips) => {
  const presentation = getSubstitutionPresentation(row)

  return (
    <Tooltip
      title={showTooltips ? presentation.tooltip : ''}
      placement='bottom'
      variant='soft'
      color={presentation.tooltipColor}
      slotProps={{ tooltip: { sx: sx.progressTooltip } }}
    >
      <Box sx={sx.substitutionsProgress}>
        <Box sx={sx.substitutionsValues}>
          <Typography sx={sx.substitutionsValue}>{displayClassificationValue(row.substitutedOut)}</Typography>
          <Typography sx={sx.substitutionsRate}>{presentation.hasRate ? `· ${row.substitutionRate}%` : '· —'}</Typography>
        </Box>
        <Box sx={sx.substitutionsProgressTrack}>
          <Box sx={sx.substitutionsProgressValue({ progress: presentation.progress, tone: presentation.tone })} />
        </Box>
      </Box>
    </Tooltip>
  )
}

const renderScoutProfile = (row, showTooltips) => {
  const scoutProfileChip = buildTableScoutProfileChip(row.player)
  if (!scoutProfileChip) return null

  return (
    <Box sx={sx.scoutProfileCell}>
      <ScoutProfileChip {...scoutProfileChip} size='compact' showTooltip={showTooltips} showConditions showConditionsDepth />
    </Box>
  )
}

export default function useTeamPositionClassificationColumns({
  onPlayerOpen,
  onPlayerRoleEdit,
  onShirtEdit,
  canEditShirt = false,
  favoritePlayerKeys,
  onFavoriteToggle,
  showTooltips = true,
  showProfileTooltips = showTooltips,
  onRowSelect,
  selectedRowKey = '',
}) {
  return React.useMemo(() => [
    {
      key: 'index',
      label: '#',
      sortable: false,
      sx: sx.indexColumn,
      render: (row, index) => onRowSelect ? (
        <IconButton
          size='sm'
          variant={(row.favoriteKey || row.id) === selectedRowKey ? 'soft' : 'plain'}
          color={(row.favoriteKey || row.id) === selectedRowKey ? 'primary' : 'neutral'}
          aria-label={`סימון השחקן ${row.name}`}
          aria-pressed={(row.favoriteKey || row.id) === selectedRowKey}
          onClick={() => onRowSelect(row)}
        >
          {index + 1}
        </IconButton>
      ) : (
        <Box sx={sx.shirtCell}>
          <Typography sx={sx.index}>{index + 1}</Typography>
          {canEditShirt && row.player ? (
            <IconButton
              size='sm'
              variant='soft'
              color='neutral'
              sx={sx.shirtEdit}
              aria-label={`עריכת מספר חולצה עבור ${row.name}`}
              onClick={event => {
                event.stopPropagation()
                onShirtEdit?.(row)
              }}
            >
              {row.player.numShirt || '—'}
            </IconButton>
          ) : null}
        </Box>
      ),
    },
    {
      key: 'avatar',
      label: '',
      sortable: false,
      sx: sx.avatarColumn,
      render: row => (
        <Box sx={sx.avatarWrap}>
          <Box component='img' src={playerImage} alt='' sx={sx.avatar} />
          <Box aria-label={getPlayerInterestLabel(getPlayerInterestLevel(row.player))} sx={sx.avatarInterestBadge(getPlayerInterestLevel(row.player))} />
        </Box>
      ),
    },
    {
      key: 'name',
      label: 'שחקן',
      sx: sx.playerColumn,
      getHref: row => row.playerUrl,
      getLinkAriaLabel: row => `פתיחת עמוד השחקן ${row.name}`,
      linkSx: sx.playerNameLink,
      getSortValue: row => row.name,
      render: row => renderPlayerName(row, showTooltips),
    },
    {
      key: 'favorite',
      label: 'מועדף',
      sortable: false,
      sx: sx.favoriteColumn,
      render: row => {
        const selected = Boolean(row.favoriteKey && favoritePlayerKeys?.has(row.favoriteKey))
        const label = selected ? 'הסרה מהמועדפים הזמניים' : 'הוספה למועדפים זמניים'

        return (
          <Tooltip title={showTooltips ? (row.favoriteKey ? label : 'לא ניתן לסמן שחקן ללא מזהה') : ''}>
            <span>
              <IconButton
                type='button'
                size='sm'
                variant='plain'
                aria-label={`${label}: ${row.name}`}
                aria-pressed={selected}
                disabled={!row.favoriteKey || !onFavoriteToggle}
                sx={sx.favoriteButton(selected)}
                onClick={event => {
                  event.stopPropagation()
                  onFavoriteToggle?.(row)
                }}
              >
                {iconUi({ id: selected ? 'favorite' : 'favoriteOutline', size: 'sm' })}
              </IconButton>
            </span>
          </Tooltip>
        )
      },
    },
    {
      key: 'gamesStarts',
      label: 'משחקים',
      sx: sx.gamesStartsColumn,
      getSortValue: row => Number(row.games) || 0,
      render: displayGamesStarts,
    },
    {
      key: 'minutes',
      label: 'כמות דקות',
      sx: sx.minutesColumn,
      getSortValue: row => row.minutes,
      render: row => renderMinutes(row, showTooltips),
    },
    {
      key: 'substitutedOut',
      label: 'כמות חילופים',
      sx: sx.substitutionsColumn,
      getSortValue: row => row.substitutedOut,
      render: row => renderSubstitutions(row, showTooltips),
    },
    {
      key: 'goals',
      label: 'שערים',
      sx: sx.goalsColumn,
      getSortValue: row => row.goals,
      render: row => <PlayerGoalsValue goals={row.goals} projectedGoals={row.projectedGoals} />,
    },
    {
      key: 'lineClassification',
      label: 'חוליה / עמדה',
      sx: sx.lineClassificationColumn,
      getSortValue: row => {
        if (row.isGoalkeeper) return 0
        const lineOrder = ({ DEFENSE: 1, MIDFIELD: 2, ATTACK: 3 })[row.classification && row.classification.line]
        return lineOrder === undefined ? 4 : lineOrder
      },
      render: row => (
        <Box
          component='button'
          type='button'
          disabled={!row.player || !onPlayerRoleEdit}
          onClick={event => {
            event.stopPropagation()
            if (onPlayerRoleEdit) onPlayerRoleEdit(row.player)
          }}
          sx={sx.classificationEdit}
          aria-label={`עריכת חוליה ועמדה עבור ${row.name}`}
        >
          <PlayerLineClassificationChip
            classification={row.classification}
            primaryPosition={row.primaryPosition}
            positionLayer={row.positionLayer}
            clickable
            compact
            tooltipDetail={`כלל הסיווג: ${row.rule}`}
          />
        </Box>
      ),
    },
    {
      key: 'scoutProfile',
      label: 'פרופיל',
      sx: sx.scoutProfileColumn,
      getSortValue: row => {
        const chip = buildTableScoutProfileChip(row.player)
        return chip ? chip.label || '' : ''
      },
      render: row => renderScoutProfile(row, showProfileTooltips),
    },
    {
      key: 'openPlayer',
      label: '',
      sortable: false,
      sx: sx.openPlayerColumn,
      render: row => (
        <IconButton
          size='sm'
          variant='outlined'
          color='neutral'
          aria-label={`כניסה לעמוד השחקן ${row.name}`}
          disabled={!row.player || !onPlayerOpen}
          sx={sx.openPlayerButton}
          onClick={event => {
            event.stopPropagation()
            if (onPlayerOpen) onPlayerOpen(row.player)
          }}
        >
          {iconUi({ id: 'view', size: 'sm' })}
        </IconButton>
      ),
    },
  ], [favoritePlayerKeys, onFavoriteToggle, onPlayerOpen, onPlayerRoleEdit, onShirtEdit, canEditShirt, showTooltips, showProfileTooltips, onRowSelect, selectedRowKey])
}
