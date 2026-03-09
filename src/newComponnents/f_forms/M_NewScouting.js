import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { generatePlayerId } from './helpers/generateId.js'
import { getAgeFromBirth } from '../x_utils/dateUtiles.js'
import { validateBeforeSave } from './X_Actions';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps, yearGroupBoxProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import useGenericActions from './X_UseGenericActions';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import PlayerShortNameField from './allFormInputs/inputUi/PlayerShortNameField.js';
import ClubNameField from './allFormInputs/inputUi/ClubNameField.js';
import TeamNameField from './allFormInputs/inputUi/TeamNameField.js';
import GenericInputField from './allFormInputs/inputUi/GenericInputField';
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js';
import PlayerIfaLinkField from './allFormInputs/inputUi/PlayerIfaLinkField.js';

export default function NewScoutingForm(props) {
  const { clubs, teams, players, initialData, onSave, idForm, isModal, disabled, formProps, size, idNav, scouting } = props;
  const [open, setOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  const computedInitialState = {
    playerName: '',
    ifaLink: '',
    clubName: '',
    teamName: '',
    birth: '',
    league: ''
  };

  const validationRules = {
    playerName: (val) => val.trim() === '',
    clubName: (val) => val.trim() === '',
    teamName: (val) => val.trim() === '',
    birth: (val) => val.trim() === '',
    league: (val) => val.trim() === '',
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
    initialState: computedInitialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { scouting }, 'scouting');

      if (validationResult !== true) {
        alert(validationResult); // מציג הודעת שגיאה אם יש
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generatePlayerId(`${formData.playerName}${formData.clubName}`),
          targetType: 'scouting',
        };

        await onSave?.(finalData);
        showSnackbar('שחקן למעקב נוסף בהצלחה', 'success', 'scouting');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת שחקן', 'error', 'error');
      } finally {
        setIsAdding(false);
      }
    },
  });

  useEffect(() => {
    if (open && initialData?.teamId && initialData?.clubId) {
      resetForm({
        ...computedInitialState,
        ...initialData,
      });
    }
  }, [open, initialData]);

  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newScout', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newScout' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newScout', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף שחקן למעקב
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס שחקן למעקב</Typography>
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
          <Divider sx={{ mt: 'auto' }} />
          <Box {...boxContentWraperProps('players', isMobile)}>
            <Box className="content-inner">
              {/* Section: ששם*/}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">שיוך</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={6} md={4}>
                    <PlayerShortNameField
                      error={errors.playerName}
                      value={data.playerName}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('playerName', val)}
                      helperText={errors.playerName ? 'שדה חובה' : ''}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <ClubNameField
                      value={data.clubName}
                      error={errors.clubName}
                      size={isMobile ? 'sm' : 'md'}
                      helperText={errors.clubName ? 'שדה חובה' : ''}
                      onChange={(val) => handleChange('clubName', val)}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <TeamNameField
                      value={data.teamName}
                      error={errors.teamName}
                      size={isMobile ? 'sm' : 'md'}
                      helperText={errors.teamName ? 'שדה חובה' : ''}
                      onChange={(val) => handleChange('teamName', val)}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <GenericInputField
                      label="שם ליגה"
                      required
                      value={data.league}
                      error={errors.league}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('league', val)}
                    />
                  </Grid>
                </Grid>
              </Sheet>

              {/* Section: מידע נוסף */}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">מידע נוסף</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={12} md={8} sx={{ mt: { md: -0.5 }}}>
                    <MonthYearPicker
                      required
                      label="שנתון"
                      error={errors.birth}
                      value={data.birth}
                      context="birth"
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('birth', val)}
                    />
                  </Grid>

                  <Grid xs={12} md={6} sx={{ mt: !isMobile ? -1 : 0 }}>
                    <PlayerIfaLinkField
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
                הוסף שחקן למעקב
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
