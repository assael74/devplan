import * as React from 'react';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { Box, Typography, Chip, Divider, Grid, IconButton, Tooltip, Button } from '@mui/joy';
import TeamNameField from '../../../../f_forms/allFormInputs/inputUi/TeamNameField';
import TeamProjectSelector from '../../../../f_forms/allFormInputs/checkUi/TeamProjectSelector';
import TeamActiveSelector from '../../../../f_forms/allFormInputs/checkUi/TeamActiveSelector';
import YearTeamSelectField from '../../../../f_forms/allFormInputs/selectUi/YearTeamSelectField';
import MobileLeagueInfo from './C_MobileLeagueInfo'
import MobileStaffView from './B_MobileStaffView';

export default function MobileInfoView({
  formData,
  editState = {},
  onChange,
  onToggle,
  team,
  onReset,
  onSave,
  isChanged,
  handleStaffChange
}) {
  if (!formData) return null;

  return (
    <Box sx={{ px: 2, py: 1 }}>
      {/* אזור עיקרי: כותרת עם Divider */}
      <Box sx={{ display: 'flex', alignItems: 'center', direction: 'rtl', mb: 2, }}>
        {/* כפתור עריכה - בצד ימין */}
        <Tooltip title={editState.teamDetails ? 'ביטול עריכה' : 'ערוך'}>
          <IconButton
            variant="solid"
            size="sm"
            color={editState.teamDetails ? 'danger' : 'neutral'}
            onClick={() => onToggle('teamDetails')}
            sx={{ flexShrink: 0 }}
          >
            {iconUi({ id: editState.teamDetails ? 'close' : 'edit' })}
          </IconButton>
        </Tooltip>

        {/* כותרת עם Divider - באמצע */}
        <Box sx={{ flexGrow: 1, mx: 1, ml: -4, mr: 4 }}>
          <Divider>
            <Typography level="title-md" fontWeight="lg">
              פרטי קבוצה
            </Typography>
          </Divider>
        </Box>

        {/* אלמנט ריק לאיזון בצד שמאל */}
        <Box sx={{ width: 32 }} />

      </Box>

      {/* תוכן אזור עיקרי */}
      <Grid container spacing={2}>
        <Grid xs={6} sm={6}>
          {editState.teamDetails ? (
            <TeamNameField
              value={formData.teamName}
              onChange={(val) => onChange('teamName', val)}
            />
          ) : (
            <>
              <Typography level="body-xs" color="neutral">שם הקבוצה</Typography>
              <Typography level="body-md" fontWeight="md">{formData.teamName}</Typography>
            </>
          )}
        </Grid>

        <Grid xs={6} sm={6}>
          <Typography level="body-xs" color="neutral">מועדון</Typography>
          <Typography level="body-md">{team.teamClub?.clubName || '---'}</Typography>
        </Grid>

        <Grid xs={4} sm={4} sx={{ ml: -2 }}>
          {editState.teamDetails ? (
            <TeamProjectSelector
              value={formData.project}
              onChange={(val) => onChange('project', val)}
            />
          ) : (
            <Chip startDecorator={iconUi({ id: 'project' })} variant="soft" color={formData.project ? 'success' : 'neutral'}>
              פרוייקט
            </Chip>
          )}
        </Grid>

        <Grid xs={4} sm={4} sx={{ ml: -2 }}>
          {editState.teamDetails ? (
            <TeamActiveSelector value={formData.active} onChange={(val) => onChange('active', val)} />
          ) : (
            <Chip startDecorator={iconUi({ id: 'active' })} variant="soft" color={formData.active ? 'success' : 'neutral'}>
              פעילה
            </Chip>
          )}
        </Grid>

        <Grid xs={6} sm={6}>
          {editState.teamDetails ? (
            <YearTeamSelectField value={formData.teamYear} onChange={(val) => onChange('teamYear', val)} />
          ) : (
            <>
              <Typography level="body-xs" color="neutral">שנתון</Typography>
              <Typography level="body-md">{formData.teamYear || '---'}</Typography>
            </>
          )}
        </Grid>
      </Grid>

      {/* כפתורים */}
      {editState.teamDetails && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            onClick={() => onReset('teamDetails')}
          >
            איפוס
          </Button>
          <Button
            size="sm"
            variant="solid"
            color="success"
            disabled={!isChanged.teamDetails}
            onClick={() => onSave('teamDetails')}
          >
            שמירה
          </Button>
        </Box>
      )}

      {/* אזור משני: Staff */}

      <MobileStaffView
        formData={formData}
        editState={editState}
        isChanged={isChanged}
        onChange={onChange}
        onToggle={onToggle}
        onSave={onSave}
        onReset={onReset}
        handleStaffChange={handleStaffChange}
      />

      {/* אזור משני: League Info */}

      <MobileLeagueInfo
        formData={formData}
        editState={editState}
        isChanged={isChanged}
        onChange={onChange}
        onToggle={onToggle}
        onSave={onSave}
        onReset={onReset}
      />
    </Box>
  );
}
