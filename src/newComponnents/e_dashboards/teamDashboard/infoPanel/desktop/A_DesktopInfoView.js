import * as React from 'react';
import teamImage from '../../../../b_styleObjects/images/teamImage.png';
import { iconUi } from '../../../../b_styleObjects/icons/IconIndex';
import { boxPanelProps } from './X_Style'
import { Box, Typography, Chip, Divider, Grid, IconButton, Tooltip, Button } from '@mui/joy';
import TeamNameField from '../../../../f_forms/allFormInputs/inputUi/TeamNameField';
import ClubSelectField from '../../../../f_forms/allFormInputs/selectUi/ClubSelectField.js';
import TeamProjectSelector from '../../../../f_forms/allFormInputs/checkUi/TeamProjectSelector';
import TeamActiveSelector from '../../../../f_forms/allFormInputs/checkUi/TeamActiveSelector';
import YearTeamSelectField from '../../../../f_forms/allFormInputs/selectUi/YearTeamSelectField';
import DesktopLeagueInfo from './C_DesktopLeagueInfo'
import DesktopStaffView from './B_DesktopStaffView';
import HeaderSection from './AB_HeaderSection';
import StaffTable from '../../../../h_componnetsUtils/staffList/StaffTable.js'

export default function DesktopInfoView({
  team,
  onSave,
  onReset,
  formData,
  isMobile,
  onChange,
  onToggle,
  isChanged,
  formProps,
  editState = {},
  handleStaffChange,
}) {
  if (!formData) return null;
  //console.log(formData)
  return (
    <Box {...boxPanelProps}>
      {/* פרטי קבוצה */}
      <Box>
        <HeaderSection
          title="פרטי קבוצה"
          sectionId="teamDetails"
          isEditing={editState.teamDetails}
          onToggle={onToggle}
          iconId="info"
        />

        <Grid container spacing={2} sx={{ width: 600 }}>
          <Grid md={4}>
            {editState.teamDetails ? (
              <TeamNameField
                value={formData.teamName}
                onChange={(val) => onChange('teamName', val)}
              />
            ) : (
              <>
                <Typography level="body-xs" color="neutral">שם הקבוצה</Typography>
                <Typography level="body-md" fontWeight="md">{team.teamName || '---'}</Typography>
              </>
            )}
          </Grid>

          <Grid md={4}>
            {editState.teamDetails ? (
              <ClubSelectField value={team.teamClub.id} options={formProps.clubs} disabled={true} />
            ) : (
              <>
                <Typography level="body-xs" color="neutral">מועדון</Typography>
                <Typography level="body-md">{team.teamClub.clubName || '---'}</Typography>
              </>
            )}
          </Grid>

          <Grid md={4}>
            {editState.teamDetails ? (
              <YearTeamSelectField value={formData.teamYear} onChange={(val) => onChange('teamYear', val)} />
            ) : (
              <>
                <Typography level="body-xs" color="neutral">שנתון</Typography>
                <Typography level="body-md">{formData.teamYear || '---'}</Typography>
              </>
            )}
          </Grid>

          <Grid md={2}>
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

          <Grid md={2}>
            {editState.teamDetails ? (
              <TeamActiveSelector value={formData.active} onChange={(val) => onChange('active', val)} />
            ) : (
              <Chip startDecorator={iconUi({ id: 'active' })} variant="soft" color={formData.active ? 'success' : 'neutral'}>
                פעילה
              </Chip>
            )}
          </Grid>

        </Grid>

        {editState.teamDetails && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button size="sm" variant="outlined" color="neutral" onClick={() => onReset('teamDetails')}>איפוס</Button>
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
      </Box>

      {/* צוות מקצועי */}
      <HeaderSection
        title="צוות מקצועי"
        sectionId="staffInfo"
        isEditing={editState.staffInfo}
        onToggle={onToggle}
        iconId="roles"
      />
      <StaffTable
        value={formData.roles}
        formProps={formProps}
        editState={editState}
        isChanged={isChanged}
        onToggle={onToggle}
        onSave={onSave}
        onReset={onReset}
        disabled={!editState.staffInfo}
        onChange={(updated) => onChange('roles', updated)}
      />
      {editState.staffInfo && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button size="sm" variant="outlined" color="neutral" onClick={() => onReset('staffInfo')}>איפוס</Button>
          <Button
            size="sm"
            variant="solid"
            color="success"
            disabled={!isChanged.staffInfo}
            onClick={() => onSave('staffInfo')}
          >
          שמירה
          </Button>
        </Box>
      )}

      {/* ביצועי ליגה */}
      <DesktopLeagueInfo
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
