import * as React from 'react';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { Box, Typography, Chip, Divider, Grid, IconButton, Tooltip, Button } from '@mui/joy';
import GenericInputField from '../../../../f_forms/allFormInputs/inputUi/GenericInputField';
import GoalsField from '../../../../f_forms/allFormInputs/inputUi/GoalsField.js'

export default function DesktopLeagueInfo({
  formData,
  editState = {},
  onChange,
  onToggle,
  team,
  onReset,
  onSave,
  isChanged,
}) {
  if (!formData) return null;

  return (
    <Box>
      {/* מידע ליגה */}
      <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', mb: 2, }}>
        {/* כפתור עריכה - בצד ימין */}
        <Tooltip title={editState.leagueInfo ? 'ביטול עריכה' : 'ערוך'}>
          <IconButton
            variant="solid"
            size="sm"
            color={editState.leagueInfo ? 'danger' : 'neutral'}
            onClick={() => onToggle('leagueInfo')}
            sx={{ flexShrink: 0 }}
          >
            {iconUi({ id: editState.leagueInfo ? 'close' : 'edit' })}
          </IconButton>
        </Tooltip>

        {/* כותרת עם Divider - באמצע */}
        <Box sx={{ flexGrow: 1, mx: 1, ml: -4, mr: 4 }}>
          <Divider>
            <Typography level="title-md" fontWeight="lg">
              ביצועי קבוצה
            </Typography>
          </Divider>
        </Box>

        {/* אלמנט ריק לאיזון בצד שמאל */}
        <Box sx={{ width: 32 }} />
      </Box>

      <Box sx={{ gridTemplateColumns: '1fr 1fr', gap: 1, ml: editState.leagueInfo ? -2 : 0 }}>
        <Grid container spacing={2} onClick={(e) => e.stopPropagation()} sx={{ width: '100%' }}>
          <Grid xs={3}>
            <GenericInputField
              label="שם ליגה"
              readOnly={!editState.leagueInfo}
              value={formData.league}
              onChange={(val) => onChange('league', val)}
            />
          </Grid>
          <Grid xs={3}>
            <GenericInputField
              label="מיקום"
              readOnly={!editState.leagueInfo}
              value={formData.position}
              type='number'
              onChange={(val) => onChange('position', val)}
            />
          </Grid>
          <Grid xs={3}>
            <GenericInputField
              label="נקודות"
              readOnly={!editState.leagueInfo}
              value={formData.points}
              onChange={(val) => onChange('points', val)}
            />
          </Grid>
          <Grid xs={3}>
            <GoalsField
              value={formData.goals}
              readOnly={!editState.leagueInfo}
              onChange={(val) => onChange('goals', val)}
            />
          </Grid>
        </Grid>
      </Box>

      {editState.leagueInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2, ml: -1.5, pr: 1 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onReset('leagueInfo')}
          >
            איפוס
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="success"
            disabled={!isChanged.leagueInfo}
            onClick={() => onSave('leagueInfo')}
          >
            שמירה
          </Button>
        </Box>
      )}
    </Box>
  );
}
