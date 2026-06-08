// features/squadSimulator/ui/components/SimulatorToolbar.js

import { Box, Button, Chip, FormControl, FormLabel, Input, Sheet, Typography } from '@mui/joy'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import TeamSelectField from '../../../../ui/fields/selectUi/teams/TeamSelectField.js'
import {
  EXACT_TARGET_OPTIONS,
  FORMATION_OPTIONS,
  GAME_TIME_OPTIONS,
  TARGET_PROFILE_OPTIONS,
} from '../simulatorUi.constants.js'
import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'
import { toolbarSx } from './sx/toolbar.sx.js'
import SelectField from './SelectField.js'

export default function SimulatorToolbar({
  selectedTeamId,
  teams = [],
  targetMode,
  targetProfile,
  targetPosition,
  leagueNumGames,
  leagueGameTime,
  formation,
  targetContext,
  onTeamSelect,
  onTargetModeChange,
  onTargetProfileChange,
  onTargetPositionChange,
  onLeagueNumGamesChange,
  onLeagueGameTimeChange,
  onFormationChange,
}) {
  return (
    <Sheet sx={{ ...sx.panel, ...toolbarSx.panel }}>
      <Box sx={toolbarSx.toolbar}>
        <FormControl size="sm" sx={sx.control}>
          <FormLabel>סוג יעד</FormLabel>
          <Box sx={toolbarSx.targetModeButtons}>
            <Button
              size="sm"
              variant={targetMode === 'range' ? 'solid' : 'outlined'}
              startDecorator={iconUi({ id: 'flag', size: 'sm' })}
              onClick={() => onTargetModeChange('range')}
            >
              אזור טבלה
            </Button>
            <Button
              size="sm"
              variant={targetMode === 'exact' ? 'solid' : 'outlined'}
              startDecorator={iconUi({ id: 'position', size: 'sm' })}
              onClick={() => onTargetModeChange('exact')}
            >
              מיקום מדויק
            </Button>
          </Box>
        </FormControl>

        {targetMode === 'range' ? (
          <SelectField
            label="אזור יעד"
            value={targetProfile}
            options={TARGET_PROFILE_OPTIONS}
            startDecorator={iconUi({ id: 'flag', size: 'sm' })}
            onChange={onTargetProfileChange}
          />
        ) : (
          <SelectField
            label="מיקום יעד"
            value={targetPosition}
            options={EXACT_TARGET_OPTIONS}
            startDecorator={iconUi({ id: 'position', size: 'sm' })}
            onChange={onTargetPositionChange}
          />
        )}

        <TeamSelectField
          label="שם קבוצה"
          placeholder="בחר קבוצה"
          value={selectedTeamId}
          options={teams}
          onChange={onTeamSelect}
          chip={false}
        />

        <FormControl size="sm" sx={sx.control}>
          <FormLabel>משחקים</FormLabel>
          <Input
            type="number"
            value={leagueNumGames}
            startDecorator={iconUi({ id: 'calendar', size: 'sm' })}
            sx={{ ...sx.rtlField, ...toolbarSx.compactNumberField }}
            onChange={event => onLeagueNumGamesChange(event.target.value)}
          />
        </FormControl>

        <SelectField
          label="דקות משחק"
          value={leagueGameTime}
          options={GAME_TIME_OPTIONS}
          startDecorator={iconUi({ id: 'hour', size: 'sm' })}
          onChange={onLeagueGameTimeChange}
          selectSx={toolbarSx.compactSelectField}
        />

        <SelectField
          label="מערך"
          value={formation}
          options={FORMATION_OPTIONS}
          startDecorator={iconUi({ id: 'position', size: 'sm' })}
          onChange={onFormationChange}
        />

        <FormControl size="sm" sx={sx.control}>
          <FormLabel>פרופיל מחושב</FormLabel>
          <Box sx={toolbarSx.profileStatus}>
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              פרופיל
            </Typography>
            <Chip
              size="sm"
              variant="soft"
              color="primary"
              startDecorator={iconUi({ id: 'profile', size: 'sm' })}
              sx={toolbarSx.iconChip}
            >
              {targetContext.label || targetContext.targetProfileId || '-'}
            </Chip>
          </Box>
        </FormControl>
      </Box>
    </Sheet>
  )
}
