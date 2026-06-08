// features/squadSimulator/ui/components/PlayerRow.js

import { useCallback } from 'react'
import { Avatar, Box, Chip, IconButton, Option, Select, Sheet, Typography } from '@mui/joy'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import playerImage from '../../../../ui/core/images/playerImage.jpg'
import {
  CONFIDENCE_LEVEL_OPTIONS,
  GOAL_TIER_ICON_IDS,
  ROLE_OPTIONS,
  SIMULATOR_POSITION_OPTIONS,
} from '../simulatorUi.constants.js'
import { getMinutesBucketLabel } from '../simulatorUi.utils.js'
import { squadSimulatorSx } from './sx/squadSimulator.sx.js'
import { rosterSx } from './sx/roster.sx.js'

export default function PlayerRow({
  row,
  playerBank = [],
  selectedPlayerIds = [],
  positionOptions = SIMULATOR_POSITION_OPTIONS,
  onChange,
  onRemove,
}) {
  const update = useCallback(
    (key, value) => onChange(row.id, { [key]: value }),
    [onChange, row.id]
  )

  const roleIconId = ROLE_OPTIONS.find(option => option.value === row.squadRole)?.idIcon || 'role'
  const confidenceOption = CONFIDENCE_LEVEL_OPTIONS.find(option => option.value === row.confidenceLevel)
  const goalTierIconId = GOAL_TIER_ICON_IDS[row.model.goalTier] || 'noGoalTarget'
  const canRemove = row.rowType === 'bench'
  const namedPlayerOptions = playerBank.filter(player => String(player.fullName || '').trim())
  const selectedPlayer = namedPlayerOptions.find(player => player.id === row.selectedPlayerId) || null

  return (
    <Sheet sx={rosterSx.playerRow}>
      <Select
        size="sm"
        value={row.selectedPlayerId || ''}
        placeholder="בחר שחקן"
        sx={squadSimulatorSx.rtlField}
        onChange={(event, value) => update('selectedPlayerId', value || '')}
        renderValue={() => selectedPlayer ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Avatar
              src={selectedPlayer.photo || playerImage}
              alt=""
              sx={{ width: 20, height: 20 }}
            />
            <Typography level="body-sm" noWrap>
              {selectedPlayer.fullName}
            </Typography>
          </Box>
        ) : null}
      >
        <Option value="">בחר שחקן</Option>
        {namedPlayerOptions.map(player => {
          const isSelectedElsewhere =
            selectedPlayerIds.includes(player.id) &&
            player.id !== row.selectedPlayerId

          return (
            <Option key={player.id} value={player.id} disabled={isSelectedElsewhere}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Avatar
                  src={player.photo || playerImage}
                  alt=""
                  sx={{ width: 22, height: 22 }}
                />
                <Typography level="body-sm" noWrap>
                  {player.fullName}
                </Typography>
                {isSelectedElsewhere ? (
                  <Chip size="sm" variant="soft" color="neutral">
                    שובץ
                  </Chip>
                ) : null}
              </Box>
            </Option>
          )
        })}
      </Select>

      <Select
        size="sm"
        value={row.squadRole || ''}
        placeholder="בחר מעמד"
        startDecorator={iconUi({ id: roleIconId, size: 'sm' })}
        sx={squadSimulatorSx.rtlField}
        onChange={(event, value) => update('squadRole', value || '')}
      >
        <Option value="">בחר מעמד</Option>
        {ROLE_OPTIONS.map(option => (
          <Option key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {iconUi({ id: option.idIcon, size: 'sm' })}
              {option.label}
            </Box>
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={row.confidenceLevel || ''}
        placeholder="בחר ודאות"
        startDecorator={iconUi({ id: 'info', size: 'sm' })}
        sx={squadSimulatorSx.rtlField}
        onChange={(event, value) => update('confidenceLevel', value || '')}
        renderValue={() => confidenceOption ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Typography level="body-sm" noWrap>
              {confidenceOption.label}
            </Typography>
            <Chip size="sm" variant="soft" color={confidenceOption.color}>
              {confidenceOption.shortLabel}
            </Chip>
          </Box>
        ) : null}
      >
        <Option value="">לא דורג</Option>
        {CONFIDENCE_LEVEL_OPTIONS.map(option => (
          <Option key={option.value} value={option.value}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Chip size="sm" variant="soft" color={option.color}>
                {option.shortLabel}
              </Chip>
              {option.label}
            </Box>
          </Option>
        ))}
      </Select>

      <Select
        size="sm"
        value={row.primaryPosition || ''}
        startDecorator={iconUi({ id: 'position', size: 'sm' })}
        sx={squadSimulatorSx.rtlField}
        onChange={(event, value) => update('primaryPosition', value || '')}
      >
        <Option value="">עמדה פתוחה</Option>
        {positionOptions.map(position => (
          <Option key={position.value} value={position.value} disabled={position.disabled}>
            {position.value} · {position.label}
          </Option>
        ))}
      </Select>

      <Chip
        size="sm"
        variant="soft"
        color={row.rowType === 'lineup' ? 'primary' : 'neutral'}
        startDecorator={iconUi({ id: 'position', size: 'sm' })}
        sx={rosterSx.iconChip}
      >
        {row.slotId || '-'}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="success"
        startDecorator={iconUi({ id: goalTierIconId, size: 'sm' })}
        sx={rosterSx.iconChip}
      >
        {row.model.excelGoalTierLabel}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="warning"
        startDecorator={iconUi({ id: 'goals', size: 'sm' })}
        sx={rosterSx.iconChip}
      >
        {row.model.goalsTarget || 0} / {row.model.guaranteedGoalsTarget ?? 0}
      </Chip>

      <Chip
        size="sm"
        variant="soft"
        color="neutral"
        startDecorator={iconUi({ id: 'hour', size: 'sm' })}
        sx={rosterSx.iconChip}
      >
        {getMinutesBucketLabel(row.model.minutesTarget)}
      </Chip>

      <IconButton
        size="sm"
        variant="plain"
        color="danger"
        disabled={!canRemove}
        onClick={() => onRemove(row.id)}
      >
        {iconUi({ id: 'remove' }) || <DeleteOutlineRoundedIcon />}
      </IconButton>
    </Sheet>
  )
}
