import React, { useState } from 'react';
import { validateBeforeSave } from './X_Actions';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import useGenericActions from './X_UseGenericActions';
import { generateRoleId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import RoleFullNameField from './allFormInputs/inputUi/RoleFullNameField.js';
import RoleTypeSelect from './allFormInputs/selectUi/RoleTypeSelectField.js'
import ClubSelectField from './allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from './allFormInputs/selectUi/TeamSelectField.js';
import PhoneField from './allFormInputs/inputUi/PhoneField.js'
import EmailField from './allFormInputs/inputUi/EmailField.js'

export default function NewRoleForm({ onSave, formProps, roles, disabled, idNav, ...props }) {
  const initialState = {
    fullName: '',
    type: '',
    clubId: '',
    teamId: '',
    phone: '',
    email: ''
  };

  const validationRules = {
    fullName: (val) => val.trim() === '',
    type: (val) => val.trim() === '',
  };

  const [isAdding, setIsAdding] = useState(false);

  const {
    data,
    errors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm,
  } = useGenericActions({
    initialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { roles }, 'roles');
      if (validationResult !== true) {
        alert(validationResult);
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generateRoleId(formData.fullName),
        };

        await onSave?.(finalData);
        showSnackbar('איש צוות נוסף בהצלחה', 'success', 'roles');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת איש הצוות', 'error', 'error');
      } finally {
        setIsAdding(false);
      }
    }
  });

  const [open, setOpen] = useState(false);

  const { showSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';
  const butSize = isMobile ? 'sm' : 'md'

  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newRole', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newRole' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newRole', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף איש מקצוע
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס איש מקצוע חדש</Typography>
            </Box>
            <IconButton
              size={isMobile ? 'sm' : 'md'}
              onClick={() => {
                resetForm();
                setOpen(false);
              }}
             >
               {iconUi({id: 'close' })}
              </IconButton>
          </Box>
          <Divider />

          <Box {...boxContentWraperProps('roles', isMobile)}>
            <Box className="content-inner">
              <Grid container spacing={2}>

                <Grid xs={6} md={6}>
                  <RoleFullNameField
                    value={data.fullName}
                    error={errors.fullName}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(val) => handleChange('fullName', val)}
                  />
                </Grid>

                <Grid xs={12} md={6}>
                  <RoleTypeSelect
                    required
                    value={data.type}
                    error={errors.type}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(val) => handleChange('type', val)}
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
                    value={data.clubId}
                    formProps={formProps}
                    onChange={(val) => handleChange('clubId', val)}
                  />
                </Grid>

                <Grid xs={6} md={6}>
                  <TeamSelectField
                    options={formProps?.teams}
                    size={isMobile ? 'sm' : 'md'}
                    value={data.teamId}
                    formProps={formProps}
                    clubId={data.clubId}
                    onChange={(val) => handleChange('teamId', val)}
                  />
                </Grid>

                <Grid xs={12} md={12}>
                  <Divider sx={{ '&::before, &::after': { borderColor: 'primary.solidBg' } }}>
                    <Typography level="title-md">פרטי התקשרות</Typography>
                  </Divider>
                </Grid>

                <Grid xs={6} md={6}>
                  <PhoneField
                    value={data.phone}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(val) => handleChange('phone', val)}
                  />
                </Grid>

                <Grid xs={6} md={6}>
                  <EmailField
                    value={data.email}
                    size={isMobile ? 'sm' : 'md'}
                    onChange={(val) => handleChange('email', val)}
                  />
                </Grid>

              </Grid>
            </Box>
          </Box>

          <Box slot="footer" sx={{ px: isMobile ? 2 : 4, mt: 1 }}>
            <Stack direction="row" spacing={1}>
              <Tooltip title="ניקוי שדות">
                <IconButton {...clearButtProps} onClick={handleClose}>
                  {iconUi({ id: 'clear' })}
                </IconButton>
              </Tooltip>
              <Button
                fullWidth
                color="success"
                variant="solid"
                onClick={handleSubmit}
                loading={isAdding}
                disabled={isAdding}
              >
                הוסף איש מקצוע
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
