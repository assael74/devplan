import * as React from 'react';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { Box, Typography, Chip, Divider, Grid, IconButton, Tooltip, Button } from '@mui/joy';
import GenericInputField from '../../../../f_forms/allFormInputs/inputUi/GenericInputField';

export default function MobileLeagueInfo({
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

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, ml: editState.leagueInfo ? -2 : 0 }}>
        {editState.leagueInfo ? (
          <>
            <GenericInputField
              label="שם ליגה"
              value={formData.leagueName}
              onChange={(val) => onChange('leagueName', val)}
            />
            <GenericInputField
              label="מיקום"
              value={formData.leaguePosition}
              onChange={(val) => onChange('leaguePosition', val)}
            />
            <GenericInputField
              label="מערך התקפי"
              value={formData.attackShape}
              onChange={(val) => onChange('attackShape', val)}
            />
            <GenericInputField
              label="מערך הגנתי"
              value={formData.defenseShape}
              onChange={(val) => onChange('defenseShape', val)}
            />
            <GenericInputField
              label="נקודות"
              value={formData.points}
              onChange={(val) => onChange('points', val)}
              type="number"
            />
            <GenericInputField
              label="הפרש שערים"
              value={formData.goalDifference}
              onChange={(val) => onChange('goalDifference', val)}
              type="number"
            />
          </>
        ) : (
          <>
            <Typography level="body-sm">ליגה: {formData.leagueName || '---'}</Typography>
            <Typography level="body-sm">מיקום בטבלה: {formData.leaguePosition || '---'}</Typography>
            <Typography level="body-sm">מערך התקפי: {formData.attackShape || '---'}</Typography>
            <Typography level="body-sm">מערך הגנתי: {formData.defenseShape || '---'}</Typography>
            <Typography level="body-sm">נקודות: {formData.points ?? '---'}</Typography>
            <Typography level="body-sm">הפרש שערים: {formData.goalDifference ?? '---'}</Typography>
          </>
        )}
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
