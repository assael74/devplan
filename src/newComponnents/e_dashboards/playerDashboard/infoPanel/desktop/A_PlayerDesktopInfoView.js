import * as React from 'react';
import { boxSectionsProps } from './X_Style'
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import playerImage from '../../../../b_styleObjects/images/playerImage.jpg';
import clubImage from '../../../../b_styleObjects/images/clubImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { optionTypePlayer } from '../../../../x_utils/optionLists.js'
import { Box, Typography, Chip, Divider, Grid, IconButton, Tooltip, Button, Stack } from '@mui/joy';
import ClubSelectField from '../../../../f_forms/allFormInputs/selectUi/ClubSelectField';
import TeamSelectField from '../../../../f_forms/allFormInputs/selectUi/TeamSelectField';
import PhoneField from '../../../../f_forms/allFormInputs/inputUi/PhoneField.js';
import PlayerActiveSelector from '../../../../f_forms/allFormInputs/checkUi/PlayerActiveSelector';
import PlayerTypeSelector from '../../../../f_forms/allFormInputs/checkUi/PlayerTypeSelector';
import PlayerFirstNameField from '../../../../f_forms/allFormInputs/inputUi/PlayerFirstNameField';
import PlayerLastNameField from '../../../../f_forms/allFormInputs/inputUi/PlayerLastNameField';
import PlayerShortNameField from '../../../../f_forms/allFormInputs/inputUi/PlayerShortNameField';
import MonthYearPicker from '../../../../f_forms/allFormInputs/dateUi/MonthYearPicker';
import BirthDateField from '../../../../f_forms/allFormInputs/dateUi/BirthDateField';

export default function PlayerDesktopInfoView({
  formData,
  editState = {},
  onChange,
  onToggle,
  onReset,
  onSave,
  isChanged,
  formProps
}) {
  if (!formData) return null;

  const renderSectionHeader = (title, sectionId) => (
    <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', p: 1, mt: 2 }}>
      <Tooltip title={editState[sectionId] ? 'ביטול עריכה' : 'ערוך'}>
        <IconButton
          variant="solid"
          size="sm"
          color={editState[sectionId] ? 'danger' : 'neutral'}
          onClick={() => onToggle(sectionId)}
        >
          {iconUi({ id: editState[sectionId] ? 'close' : 'edit' })}
        </IconButton>
      </Tooltip>
      <Box sx={{ flexGrow: 1, mx: 1, ml: -4, mr: 4 }}>
        <Divider>
          <Typography level="title-md" fontWeight="lg">{title}</Typography>
        </Divider>
      </Box>
      <Box sx={{ width: 32 }} />
    </Box>
  );

  const renderActionButtons = (sectionId) => (
    editState[sectionId] && (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, p: 1, mt: 2 }}>
        <Button size="sm" variant="outlined" onClick={() => onReset(sectionId)}>איפוס</Button>
        <Button
          size="sm"
          variant="solid"
          color="success"
          disabled={!isChanged[sectionId]}
          onClick={() => onSave(sectionId)}
        >
          שמירה
        </Button>
      </Box>
    )
  );

  const type = optionTypePlayer.filter(p=>p.id === formData.type)[0]

  const clubId = formData.clubId
  const playerTeam = formProps.teams?.find((t) => t.id === formData.teamId);
  const playerClub = formProps.clubs?.find((t) => t.id === formData.clubId);

  return (
    <Box sx={{ py: 2, maxWidth: 1000, mx: 'auto', gap: 3 }}>

      <Stack direction="row" spacing={4}>
        {/* עמודה ראשונה */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* פרטי שחקן */}
          <Box {...boxSectionsProps}>
            {renderSectionHeader('סטטוס וטלפון', 'playerDetails')}
            <Grid container spacing={2}>
              <Grid xs={6} sx={{ pt: 3.5 }}>
                {editState.playerDetails ?
                  <PlayerActiveSelector
                   value={formData.active}
                   onChange={(val) => onChange('active', val)}
                  />
                  :
                  <Chip
                    size='lg'
                    startDecorator={iconUi({id: 'active'})}
                    sx={{ mt: -3.5 }}
                    variant="outlined"
                    color={formData.active ? 'success' : 'neutral'}
                  >
                    פעיל
                  </Chip>}
              </Grid>
              <Grid xs={6}>
                {editState.playerDetails ? <PhoneField value={formData.phone} onChange={(val) => onChange('phone', val)} /> :
                  <>
                    <Typography level="body-xs">טלפון</Typography>
                    <Typography level="body-md">{formData.phone || '---'}</Typography>
                  </>}
              </Grid>
              <Grid xs={12}>
                {editState.playerDetails ?
                  <PlayerTypeSelector value={formData.type} onChange={(val) => onChange('type', val)} />
                  :
                  <Chip
                  size='lg'
                  variant="outlined"
                  color={formData.type === 'project' ? 'success' : 'neutral'}
                  startDecorator={iconUi({id: type.idIcon})}
                  >
                  {type.labelH}
                  </Chip>}
              </Grid>
            </Grid>
            {renderActionButtons('playerDetails')}
          </Box>
          {/* שמות */}
          <Box {...boxSectionsProps}>
            {renderSectionHeader('שמות שחקן', 'playerNameDetails')}
            <Grid container spacing={2}>
              <Grid xs={6}>
                {editState.playerNameDetails ?
                  <PlayerFirstNameField
                    value={formData.playerFirstName}
                    onChange={(val) => onChange('playerFirstName', val)}
                  />
                  :
                  <>
                    <Typography level="body-xs">שם פרטי</Typography>
                    <Typography level="body-md">{formData.playerFirstName || '---'}</Typography>
                  </>
                }
              </Grid>
              <Grid xs={6}>
              {editState.playerNameDetails ?
                <PlayerLastNameField
                  value={formData.playerLastName}
                  onChange={(val) => onChange('playerLastName', val)}
                />
                :
                <>
                  <Typography level="body-xs">שם משפחה</Typography>
                  <Typography level="body-md">{formData.playerLastName || '---'}</Typography>
                </>
              }
              </Grid>
              <Grid xs={6}>
              {editState.playerNameDetails ?
                <PlayerShortNameField
                  value={formData.playerShortName}
                  onChange={(val) => onChange('playerShortName', val)}
                />
                :
                <>
                  <Typography level="body-xs">כינוי</Typography>
                  <Typography level="body-md">{formData.playerShortName || '---'}</Typography>
                </>
              }
              </Grid>
            </Grid>
            {renderActionButtons('playerNameDetails')}
          </Box>
        </Box>

        {/* עמודה שנייה */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box {...boxSectionsProps}>
            {/* גיל ושיוך */}
            {renderSectionHeader('גיל ושיוך', 'playerAgeDetails')}
            <Grid container spacing={2}>
              <Grid xs={editState.playerAgeDetails ? 12 : 6}>
              {editState.playerAgeDetails ?
                <MonthYearPicker
                  value={formData.birth}
                  onChange={(val) => onChange('birth', val)}
                />
                :
                <>
                  <Typography level="body-xs">שנתון</Typography>
                  <Typography level="body-md">{formData.birth || '---'}</Typography>
                </>
              }
              </Grid>
              <Grid xs={editState.playerAgeDetails ? 8 : 6}>
              {editState.playerAgeDetails ?
                <BirthDateField
                  value={formData.birthDay}
                  onChange={(val) => onChange('birthDay', val)}
                />
                :
                <>
                  <Typography level="body-xs">יום הולדת</Typography>
                  <Typography level="body-md">{formData.birthDay || '---'}</Typography>
                </>
              }
              </Grid>
              <Grid xs={6}>
              {editState.playerAgeDetails ?
                <ClubSelectField
                  value={formData.clubId}
                  options={formProps.clubs}
                  disabled={true}
                />
                :
                <>
                  <Typography level="body-xs">מועדון</Typography>
                  <Typography level="body-md">{playerClub?.clubName || '---'}</Typography>
                </>
              }
              </Grid>
              <Grid xs={6}>
              {editState.playerAgeDetails ?
                <TeamSelectField
                  value={formData.teamId}
                  onChange={(val) => onChange('teamId', val)}
                  options={formProps.teams}
                  clubId={clubId}
                  error={formData.teamId === ''}
                />
                :
                <>
                  <Typography level="body-xs">קבוצה</Typography>
                  <Typography level="body-md">{playerTeam?.teamName || '---'}</Typography>
                </>
              }
              </Grid>
            </Grid>
            {renderActionButtons('playerAgeDetails')}
          </Box>

          <Box {...boxSectionsProps}>
            {/* מדדים פיזיים */}
            {renderSectionHeader('מדדים פיזיים', 'physical')}
            <Typography level="body-sm">(שדות BMI, גובה, משקל יוצגו כאן)</Typography>
            {renderActionButtons('physical')}
          </Box>
        </Box>
      </Stack>

    </Box>
  );
}
