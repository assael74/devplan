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
import PlayerTypeSelector from './allFormInputs/checkUi/PlayerTypeSelector.js';
import PlayerFirstNameField from './allFormInputs/inputUi/PlayerFirstNameField.js';
import PlayerLastNameField from './allFormInputs/inputUi/PlayerLastNameField.js';
import PlayerShortNameField from './allFormInputs/inputUi/PlayerShortNameField.js';
import ClubSelectField from './allFormInputs/selectUi/ClubSelectField.js';
import TeamSelectField from './allFormInputs/selectUi/TeamSelectField.js';
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js';
import PlayerIfaLinkField from './allFormInputs/inputUi/PlayerIfaLinkField.js';

export default function NewPlayerForm(props) {
  const { clubs, teams, players, initialData, onSave, idForm, isModal, disabled, formProps, size, idNav } = props;
  const [open, setOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  const computedInitialState = {
    playerFirstName: '',
    playerLastName: '',
    playerShortName: '',
    ifaLink: '',
    clubId: initialData?.clubId || '',
    teamId: initialData?.teamId || '',
    birth: '',
    type: '',
  };

  const validationRules = {
    playerFirstName: (val) => val.trim() === '',
    playerLastName: (val) => val.trim() === '',
    clubId: (val) => val.trim() === '',
    teamId: (val) => val.trim() === '',
    birth: (val) => val.trim() === '',
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
    initialState: computedInitialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { players }, 'player');

      if (validationResult !== true) {
        alert(validationResult); // מציג הודעת שגיאה אם יש
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generatePlayerId(`${formData.playerFirstName}${formData.playerLastName}`),
          targetType: formData.type === 'noneType' ? 'nonPlayers' : 'players',
        };

        await onSave?.(finalData);
        showSnackbar('השחקן נוסף בהצלחה', 'success', 'players');
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
        <IconButton {...addIconButtProps('newPlayer', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newPlayer' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newPlayer', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף שחקן
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס שחקן חדש</Typography>
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
                    <PlayerFirstNameField
                      error={errors.playerFirstName}
                      value={data.playerFirstName}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('playerFirstName', val)}
                      helperText={errors.playerFirstName ? 'שדה חובה' : ''}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <PlayerLastNameField
                      error={errors.playerLastName}
                      value={data.playerLastName}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('playerLastName', val)}
                      helperText={errors.playerLastName ? 'שדה חובה' : ''}
                    />
                  </Grid>

                  <Grid xs={6} md={4}>
                    <PlayerShortNameField
                      error={errors.playerShortName}
                      value={data.playerShortName}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('playerShortName', val)}
                      helperText={errors.playerShortName ? 'שדה חובה' : ''}
                    />
                  </Grid>
                </Grid>
              </Sheet>

              {/* Section: שיוך */}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">שיוך</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={6} md={6}>
                    <ClubSelectField
                      error={errors.clubId}
                      options={formProps?.clubs || clubs}
                      size={isMobile ? 'sm' : 'md'}
                      value={data.clubId}
                      formProps={formProps}
                      disabled={idForm === 'teamDashboard'}
                      onChange={(val) => handleChange('clubId', val)}
                    />
                  </Grid>

                  <Grid xs={6} md={6} sx={{ mt: -0.7 }}>
                    <Tooltip title={idForm === 'teamDashboard' ? 'לא ניתן לשנות מועדון' : ''}>
                      <Box component="span" sx={{ display: 'inline-flex', width: '100%' }}>
                        <TeamSelectField
                          error={errors.teamId}
                          value={data.teamId}
                          formProps={formProps}
                          size={isMobile ? 'sm' : 'md'}
                          disabled={idForm === 'teamDashboard'}
                          onChange={(val) => handleChange('teamId', val)}
                          options={formProps?.teams || teams}
                          clubId={data.clubId}
                        />
                      </Box>
                    </Tooltip>
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

                  <Grid xs={12} md={8} sx={{ mt: !isMobile ? -1 : 0 }}>
                    <PlayerTypeSelector
                      value={data.type}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('type', val)}
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
                הוסף שחקן
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  );
}
