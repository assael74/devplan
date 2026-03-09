import React, { useState  } from 'react';
import { iconUi } from '../../b_styleObjects/icons/IconIndex.js';
import { clearButtProps, updateButtProps } from './X_Style';
import { Box, IconButton, Button, Grid } from '@mui/joy';

import ClubNameField from '../../f_forms/allFormInputs/inputUi/ClubNameField.js'
import ColorPickerField from '../../f_forms/allFormInputs/inputUi/ColorPickerField.js'
import ProManEditField from '../../f_forms/allFormInputs/inputUi/ProManEditField.js'
import ClubIfaLinkField from '../../f_forms/allFormInputs/inputUi/ClubIfaLinkField.js'
import StaffTable from '../../h_componnetsUtils/staffList/StaffTable.js'

export default function ClubEditModalContent({
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
  const isClubInfo = actionItem === 'clubInfo';
  const isClubRoles = actionItem === 'clubRoles';
  
  return (
    <Grid container spacing={2} onClick={(e) => e.stopPropagation()}>
      {isClubInfo && (
        <>
          <Grid xs={12}>
            <ClubNameField
              required
              value={update.clubName}
              size={isMobile ? 'sm' : 'md'}
              onChange={(val) => onChange((prev) => ({ ...prev, clubName: val }))}
            />
          </Grid>
          <Grid xs={12}>
            <ClubIfaLinkField
              size={isMobile ? 'sm' : 'md'}
              value={update.ifaLink}
              onChange={(val) => onChange((prev) => ({ ...prev, ifaLink: val }))}
            />
          </Grid>
          <Grid xs={12}>
            <ColorPickerField
              size={isMobile ? 'sm' : 'md'}
              value={update.color}
              onChange={(val) => onChange((prev) => ({ ...prev, color: val }))}
            />
          </Grid>
        </>
      )}

      {isClubRoles && (
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
            {...updateButtProps('clubs', isMobile)}
            disabled={!isDirty || isUpdate}
            onClick={handleSubmit}
            loading={isUpdate}
          >
            עדכן מועדון
          </Button>
          <IconButton {...clearButtProps(isMobile)} onClick={handleReset}>
            {iconUi({ id: 'clear' })}
          </IconButton>
        </Box>
      </Grid>
    </Grid>
  );
}
