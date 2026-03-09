import React, { useMemo } from 'react';
import { Box, IconButton, Button, Grid } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps, pickTeamColorValue } from './X_Style';
import TeamNameField from '../../f_forms/allFormInputs/inputUi/TeamNameField.js';
import ColorPickerField from '../../f_forms/allFormInputs/inputUi/ColorPickerField.js'
import TeamProjectSelector from '../../f_forms/allFormInputs/checkUi/TeamProjectSelector.js';
import TeamActiveSelector from '../../f_forms/allFormInputs/checkUi/TeamActiveSelector.js';
import TeamIfaLinkField from '../../f_forms/allFormInputs/inputUi/TeamIfaLinkField.js'
import StaffTable from '../../h_componnetsUtils/staffList/StaffTable.js'
import GenericInputField from '../../f_forms/allFormInputs/inputUi/GenericInputField';
import GoalsField from '../../f_forms/allFormInputs/inputUi/GoalsField.js'

export default function TeamEditModalContent({
  coach,
  update,
  isDirty,
  isUpdate,
  isMobile,
  onChange,
  formProps,
  actionItem,
  handleReset,
  handleClose,
  handleSubmit,
  handleCoachChange,
}) {
  const isTeamInfo = actionItem === 'teamInfo';
  const isTeamCoach = actionItem === 'teamCoach';
  const isTeamPro = actionItem === 'teamPro';
  const size = isMobile ? 'sm' : 'md'

  const displayColor = useMemo(
    () => pickTeamColorValue(update, formProps),
    [update?.color, update?.clubId, update?.id, formProps?.clubs, formProps?.teams]
  );

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isTeamInfo && (
        <>
          <Grid xs={10}>
            <TeamNameField
              required
              size={size}
              value={update.teamName}
              onChange={(val) => onChange((prev) => ({ ...prev, teamName: val }))}
            />
          </Grid>
          <Grid xs={4}>
            <TeamProjectSelector
              size={size}
              value={update.project}
              onChange={(val) => onChange((prev) => ({ ...prev, project: val }))}
            />
          </Grid>
          <Grid xs={4}>
            <TeamActiveSelector
              size={size}
              value={update.active}
              onChange={(val) => onChange((prev) => ({ ...prev, active: val }))}
              sx={{ mt: { xs: 0, sm: -2 } }}
            />
          </Grid>
          <Grid xs={12}>
            <TeamIfaLinkField
              size={size}
              value={update.ifaLink}
              onChange={(val) => onChange((prev) => ({ ...prev, ifaLink: val }))}
              sx={{ mt: { xs: 0, sm: -2 } }}
            />
          </Grid>
          <Grid xs={12}>
            <ColorPickerField
              size={size}
              value={displayColor}
              onChange={(val) => onChange((prev) => ({ ...prev, color: val }))}
            />
          </Grid>
        </>
      )}

      {isTeamPro && (
        <>
          <Grid xs={10}>
            <GenericInputField
              label="שם ליגה"
              value={update.league}
              onChange={(val) => onChange((prev) => ({ ...prev, league: val }))}
            />
          </Grid>
          <Grid xs={4}>
            <GenericInputField
              label="מיקום"
              value={update.position}
              type='number'
              onChange={(val) => onChange((prev) => ({ ...prev, position: val }))}
            />
          </Grid>
          <Grid xs={4}>
            <GenericInputField
              label="נקודות"
              value={update.points}
              onChange={(val) => onChange((prev) => ({ ...prev, points: val }))}
            />
          </Grid>
          <Grid xs={12}>
            <GoalsField
              value={update.goals}
              onChange={(val) => onChange((prev) => ({ ...prev, goals: val }))}
            />
          </Grid>
        </>
      )}

      {isTeamCoach && (
        <>
          <Grid xs={12}>
            <StaffTable
              isMobile={isMobile}
              value={update.roles}
              formProps={formProps}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, roles: val }))}
             />
          </Grid>
        </>
      )}

      <Grid xs={12}>
        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
          <Button
            {...updateButtProps('teams', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן קבוצה
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
