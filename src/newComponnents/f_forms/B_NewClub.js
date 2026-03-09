import React, { useState } from 'react';
import { validateBeforeSave } from './X_Actions';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import useGenericActions from './X_UseGenericActions';
import { generateClubId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import ClubNameField from './allFormInputs/inputUi/ClubNameField.js';
import ClubIfaLinkField from './allFormInputs/inputUi/ClubIfaLinkField.js';

export default function NewClubForm({ onSave, clubs, disabled, idNav, ...props }) {
  const initialState = {
    clubName: '',
    ifaLink: '',
  };

  const validationRules = {
    clubName: (val) => val.trim() === '',
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
      const validationResult = validateBeforeSave(formData, { clubs }, 'club');
      if (validationResult !== true) {
        alert(validationResult);
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generateClubId(formData.clubName),
        };

        await onSave?.(finalData);
        showSnackbar('המועדון נוסף בהצלחה', 'success', 'clubs');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת מועדון', 'error', 'error');
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
        <IconButton {...addIconButtProps('newClub', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newClub' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newClub', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף מועדון
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)} >
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס מועדון חדש</Typography>
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

          <Box {...boxContentWraperProps('clubs', isMobile)}>
            <Box className="content-inner">
              {/* Section: פרטי הקבוצות */}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">פרטי הקבוצה</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={12} md={6}>
                    <ClubNameField
                      value={data.clubName}
                      error={errors.clubName}
                      size={isMobile ? 'sm' : 'md'}
                      helperText={errors.clubName ? 'שדה חובה' : ''}
                      onChange={(val) => handleChange('clubName', val)}
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    <ClubIfaLinkField
                      value={data.ifaLink}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('ifaLink', val)}
                    />
                  </Grid>
                </Grid>
              </Sheet>
            </Box>
          </Box>

          <Box {...footerBoxProps}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
              spacing={1.2}
            >
              {/* פעולות משניות */}
              <Stack direction="row" spacing={0.8}>
                <Button
                  variant="soft"
                  color="neutral"
                  size={isMobile ? 'sm' : 'md'}
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                  startDecorator={iconUi({ id: 'close', size: isMobile ? 'sm' : 'md' })}
                >
                  בטל
                </Button>
                <Tooltip title="נקה שדות">
                  <IconButton
                    variant="plain"
                    size={isMobile ? 'sm' : 'md'}
                    color="neutral"
                    onClick={() => resetForm()}
                    sx={{ borderRadius: 'xl' }}
                  >
                    {iconUi({ id: 'clear', size: isMobile ? 'sm' : 'md' })}
                  </IconButton>
                </Tooltip>
              </Stack>

              {/* פעולה ראשית */}
              <Button
                color="success"
                variant="solid"
                size={isMobile ? 'sm' : 'md'}
                disabled={isAdding}
                onClick={handleSubmit}
                startDecorator={iconUi({ id: 'check', size: isMobile ? 'sm' : 'md' })}
                sx={{ minWidth: { xs: '100%', sm: 160 }, borderRadius: 'lg' }}
              >
                הוסף מועדון
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
