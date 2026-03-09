import React from 'react';
import { getAgeFromBirth } from '../x_utils/dateUtiles.js'
import { nameBoxProps, boxDrawerProps } from './X_Style'
import { Typography, Sheet, Stack, Input, Box, Divider, Grid } from '@mui/joy';
import ClubSelectField from '../f_forms/allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from '../f_forms/allFormInputs/selectUi/TeamSelectField.js';
import DateInputField from '../f_forms/allFormInputs/dateUi/DateInputField.js';
import GameHomeSelector from '../f_forms/allFormInputs/checkUi/GameHomeSelector.js'
import GameDifficultySelectField from '../f_forms/allFormInputs/selectUi/GameDifficultySelectField.js'
import GameDurationSelectField from '../f_forms/allFormInputs/selectUi/GameDurationSelectField.js'
import GenericInputField from '../f_forms/allFormInputs/inputUi/GenericInputField.js'

export default function EditGameStatsCard({ value, onChange, actions, ...props }) {

  const handleChange = (field) => (e) => {
    //console.log(e?.target?.value ?? e)
    const newValue = e?.target?.value ?? e; // תמיכה גם בשדות מותאמים
    onChange((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 'md', backgroundColor: '#f9f9f9' }}>
      <Box {...boxDrawerProps}>

        {actions.actionItem.id === 'gameInfo' && (
          <>
            <Grid container spacing={2}>
              {/*club*/}
              <Grid xs={8} md={8}>
                <ClubSelectField
                  options={props.formProps.clubs}
                  value={value.clubId}
                  disabled={true}
                />
              </Grid>
              {/*home*/}
              <Grid xs={4} md={4} sx={{ pl: { md: 4 }}}>
                <GameHomeSelector
                  value={value.home}
                  onChange={(val) => handleChange('home')(val)}
                />
              </Grid>
              {/*team*/}
              <Grid xs={6} md={4}>
                <TeamSelectField
                  options={props.formProps.teams}
                  clubId={value.clubId}
                  value={value.teamId}
                  onChange={(val) => handleChange('teamId')(val)}
                />
              </Grid>
              {/*rivel*/}
              <Grid xs={6} md={4}>
                <GenericInputField
                  error={value.rivel === ''}
                  value={value.rivel}
                  label='קבוצה יריבה'
                  //disabled={idForm === 'teamDashboard'}
                  onChange={(val) => handleChange('rivel')(val)}
                />
              </Grid>
            </Grid>
          </>
        )}

        {actions.actionItem.id === 'gameTime' && (
          <>
            <Grid container spacing={2}>

              <Grid xs={12} sx={{ my: 1 }}>
                <Divider sx={{ '--Divider-childPosition': `${50}%` }}>
                  <Typography level="title-md" gutterBottom> זמני המשחק</Typography>
                </Divider>
              </Grid>

              {/*date + hour*/}
              <Grid xs={12} md={8}>
                <DateInputField
                  value={value.gameDate}
                  timeValue={value.gameHour}
                  onChange={(val) => handleChange('gameDate')(val)}
                  onTimeChange={(val) => handleChange('gameHour')(val)}
                  context="game"
                  required
                  label="תאריך משחק"
                  labelTime="שעת המשחק"
                  error={value.gameDate === ''}
                />
              </Grid>

              {/*Duration*/}
              <Grid xs={6} md={4}>
                <GameDurationSelectField
                  value={value.gameDuration}
                  placeholder="משך משחק בדקות"
                  onChange={(val) => handleChange('gameDuration')(val)}
                />
              </Grid>

            </Grid>
          </>
        )}
      </Box>
    </Sheet>
  );
}
