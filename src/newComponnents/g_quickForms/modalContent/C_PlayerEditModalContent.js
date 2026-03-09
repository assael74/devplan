import React from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import PlayerFirstNameField from '../../f_forms/allFormInputs/inputUi/PlayerFirstNameField.js'
import PlayerLastNameField from '../../f_forms/allFormInputs/inputUi/PlayerLastNameField.js'
import PlayerShortNameField from '../../f_forms/allFormInputs/inputUi/PlayerShortNameField.js'
import MonthYearPicker from '../../f_forms/allFormInputs/dateUi/MonthYearPicker.js'
import BirthDateField from '../../f_forms/allFormInputs/dateUi/BirthDateField.js'
import PhoneField from '../../f_forms/allFormInputs/inputUi/PhoneField.js'
import PlayerActiveSelector from '../../f_forms/allFormInputs/checkUi/PlayerActiveSelector.js'
import PlayerTypeSelector from '../../f_forms/allFormInputs/checkUi/PlayerTypeSelector.js'
import ProjectStatusSelectField from '../../f_forms/allFormInputs/selectUi/ProjectStatusSelectField.js'
import PlayerPositionsSelect from '../../f_forms/allFormInputs/selectUi/PlayerPositionsSelect.js'
import PlayerIfaLinkField from '../../f_forms/allFormInputs/inputUi/PlayerIfaLinkField.js'

export default function PlayerEditModalContent({
  coach,
  update,
  isDirty,
  isUpdate,
  isMobile,
  onChange,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
}) {
  const isPlayerName = actionItem === 'playerName';
  const isPlayerInfo = actionItem === 'playerInfo';
  const isPlayerAge = actionItem === 'playerAge';
  const isPlayerPosition = actionItem === 'playerPosition';

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isPlayerName && (
        <>
          <Grid xs={6} md={4}>
            <PlayerFirstNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.playerFirstName}
              onChange={(val) => onChange((prev) => ({ ...prev, playerFirstName: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <PlayerLastNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.playerLastName}
              onChange={(val) => onChange((prev) => ({ ...prev, playerLastName: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <PlayerShortNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.playerShortName}
              onChange={(val) => onChange((prev) => ({ ...prev, playerShortName: val }))}
            />
          </Grid>
        </>
      )}

      {isPlayerInfo && (
        <>
          <Grid xs={12} md={9}>
            <PlayerTypeSelector
              size={isMobile ? 'sm' : 'md'}
              value={update.type}
              onChange={(val) => onChange((prev) => ({ ...prev, type: val }))}
            />
          </Grid>
          <Grid xs={12} md={10}>
            <ProjectStatusSelectField
              size={isMobile ? 'sm' : 'md'}
              value={update.projectStatus}
              onChange={(val) => onChange((prev) => ({ ...prev, projectStatus: val }))}
            />
          </Grid>
          <Grid xs={6} md={3} sx={{ mt: { md: 4 } }}>
            <PlayerActiveSelector
              size={isMobile ? 'sm' : 'md'}
              value={update.active}
              onChange={(val) => onChange((prev) => ({ ...prev, active: val }))}
            />
          </Grid>
          <Grid xs={6} md={4}>
            <PhoneField
              size={isMobile ? 'sm' : 'md'}
              value={update.phone}
              onChange={(val) => onChange((prev) => ({ ...prev, phone: val }))}
            />
          </Grid>
          <Grid xs={12} md={12}>
            <PlayerIfaLinkField
              size={isMobile ? 'sm' : 'md'}
              value={update.ifaLink}
              onChange={(val) => onChange((prev) => ({ ...prev, ifaLink: val }))}
            />
          </Grid>
        </>
      )}

      {isPlayerAge && (
        <>
          <Grid xs={12} md={8}>
            <MonthYearPicker
              required
              size={isMobile ? 'sm' : 'md'}
              key={update.birth}
              context="birth"
              label="שנתון"
              value={update.birth}
              onChange={(val) => onChange((prev) => ({ ...prev, birth: val }))}
            />
          </Grid>
          <Grid xs={12} md={4}>
            <BirthDateField
              size={isMobile ? 'sm' : 'md'}
              value={update.birthDay}
              birth={update.birth}
              onChange={(val) => onChange((prev) => ({ ...prev, birthDay: val }))}
            />
          </Grid>
        </>
      )}

      {isPlayerPosition && (
        <Grid xs={12} md={10}>
          <PlayerPositionsSelect
            value={update.positions}
            onChange={(val) => onChange((prev) => ({ ...prev, positions: val }))}
          />
        </Grid>
      )}

      <Grid xs={12}>
        <Box
          sx={{
            mt: actionItem === 'playerPosition' ? 0 : 2,
            pt: actionItem === 'playerPosition' ? 0 : 2,
            display: 'flex',
            gap: 1,
            flexDirection: 'row-reverse'
          }}
         >
          <Button
            {...updateButtProps('players', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן שחקן
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
