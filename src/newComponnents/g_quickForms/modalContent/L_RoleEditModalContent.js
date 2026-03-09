import React from 'react';
import { Box, IconButton, Button, Grid, Divider, Typography } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import RoleFullNameField from '../../f_forms/allFormInputs/inputUi/RoleFullNameField.js';
import RoleTypeSelect from '../../f_forms/allFormInputs/selectUi/RoleTypeSelectField.js'
import ClubSelectField from '../../f_forms/allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from '../../f_forms/allFormInputs/selectUi/TeamSelectField.js';
import PhoneField from '../../f_forms/allFormInputs/inputUi/PhoneField.js'
import EmailField from '../../f_forms/allFormInputs/inputUi/EmailField.js'

export default function RoleEditModalContent({
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
}) {
  const isRolesInfo = actionItem === 'rolesInfo';

  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isRolesInfo && (
        <>
          <Grid xs={6} md={6}>
            <RoleFullNameField
              required
              size={isMobile ? 'sm' : 'md'}
              value={update.fullName}
              onChange={(val) => onChange((prev) => ({ ...prev, fullName: val }))}
            />
          </Grid>
          <Grid xs={6} md={6}>
            <RoleTypeSelect
              required
              value={update.type}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, type: val }))}
            />
          </Grid>
          <Grid xs={12} md={12}>
            <Divider sx={{ '&::before, &::after': { borderColor: 'primary.solidBg' } }}>
              <Typography level="title-md">שיוך</Typography>
            </Divider>
          </Grid>
          <Grid xs={6} md={6}>
            <ClubSelectField
              options={formProps?.clubs}
              size={isMobile ? 'sm' : 'md'}
              value={update.clubId}
              formProps={formProps}
              onChange={(val) => onChange((prev) => ({ ...prev, clubId: val }))}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <TeamSelectField
              options={formProps?.teams}
              size={isMobile ? 'sm' : 'md'}
              value={update.teamId}
              formProps={formProps}
              clubId={update.clubId}
              onChange={(val) => onChange((prev) => ({ ...prev, teamId: val }))}
            />
          </Grid>
          <Grid xs={12} md={12}>
            <Divider sx={{ '&::before, &::after': { borderColor: 'primary.solidBg' } }}>
              <Typography level="title-md">פרטי התקשרות</Typography>
            </Divider>
          </Grid>
          <Grid xs={6} md={6}>
            <PhoneField
              value={update.phone}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, phone: val }))}
            />
          </Grid>
          <Grid xs={6} md={6}>
            <EmailField
              value={update.email}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, email: val }))}
            />
          </Grid>
        </>
      )}

      <Grid xs={12}>
        <Box sx={{ mt: 2, pt: 2, display: 'flex', gap: 1, flexDirection: 'row-reverse' }}>
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
