import React, { useState } from 'react';
import moment from 'moment';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { iconUi } from '../b_styleObjects/icons/IconIndex.js';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps, yearGroupBoxProps } from './X_Style';
import { useTheme } from '@mui/joy/styles';
import { generateTeamId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import useGenericActions from './X_UseGenericActions';
import { validateBeforeSave } from './X_Actions';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import TeamNameField from './allFormInputs/inputUi/TeamNameField.js';
import TeamProjectSelector from './allFormInputs/checkUi/TeamProjectSelector.js';
import ClubSelectField from './allFormInputs/selectUi/ClubSelectField.js';
import YearTeamSelectField from './allFormInputs/selectUi/YearTeamSelectField.js';
import TeamIfaLinkField from './allFormInputs/inputUi/TeamIfaLinkField.js';

export default function NewTeamForm({ onSave, ...props }) {
  const { formProps, disabled, idNav } = props;
  const { showSnackbar } = useSnackbar();
  const clubs = formProps?.clubs
  const teams = formProps?.teams

  const initialState = {
    clubId: '',
    teamName: '',
    teamYear: '',
    project: false,
    ifaLink: ''
  };

  const validationRules = {
    clubId: (val) => !String(val).trim(),
    teamName: (val) => !String(val).trim(),
    teamYear: (val) => !String(val).trim(),
  };

  const [isAdding, setIsAdding] = useState(false);

  const {
    data: update,
    errors: localErrors,
    isSubmitted,
    handleChange,
    handleSubmit,
    handleClose,
    resetForm,
  } = useGenericActions({
    initialState,
    validationRules,
    onSubmit: async (formData) => {
      const validationResult = validateBeforeSave(formData, { teams }, 'team');

      if (validationResult !== true) {
        alert(validationResult); // מציג הודעת שגיאה אם יש
        return;
      }

      setIsAdding(true);

      try {
        const finalData = {
          ...formData,
          id: generateTeamId(formData.teamName),
        };

        await onSave?.(finalData); // אם onSave היא async
        showSnackbar('קבוצה נוספה בהצלחה', 'success', 'teams');
        setOpen(false);
      } catch (err) {
        console.error('שגיאה בהוספה:', err);
        showSnackbar('שגיאה בהוספת קבוצה', 'error', 'error');
      } finally {
        setIsAdding(false); // ✅ סיום לואדינג
      }
    },
  });

  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  const age =
    update.teamYear === 'adult'
      ? '21+'
      : moment(update.teamYear, 'YYYY', true).isValid()
      ? moment().diff(moment(update.teamYear, 'YYYY'), 'years')
      : '';

  return (
    <>
      {isTrulyMobile ? (
        <IconButton {...addIconButtProps('newTeam', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newTeam' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newTeam', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף קבוצה
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס קבוצה חדשה</Typography>
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

          <Box {...boxContentWraperProps('teams', isMobile)}>
            <Box className="content-inner">
              {/* Section: שיוך */}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">שיוך</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={6} md={6}>
                    <TeamNameField
                      required
                      error={localErrors.teamName}
                      value={update.teamName}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('teamName', val)}
                      helperText={localErrors.teamName ? 'שדה חובה' : ''}
                    />
                  </Grid>

                  <Grid xs={6} md={6}>
                    <ClubSelectField
                      error={localErrors.clubId}
                      options={clubs}
                      size={isMobile ? 'sm' : 'md'}
                      value={update.clubId}
                      onChange={(val) => handleChange('clubId', val)}
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
                  <Grid xs={8} md={6}>
                    <YearTeamSelectField
                      error={localErrors.teamYear}
                      value={update.teamYear}
                      size={isMobile ? 'sm' : 'md'}
                      onChange={(val) => handleChange('teamYear', val)}
                      helperText={localErrors.teamYear ? 'שדה חובה' : ''}
                    />
                  </Grid>

                  <Grid xs={4} md={6}>
                    <Box {...yearGroupBoxProps(isMobile)}>
                      <Typography level="body-xs" sx={{ mb: 0.5 }}>
                        גיל
                      </Typography>
                      <Box>{age || '00'}</Box>
                    </Box>
                  </Grid>

                  <Grid xs={6} md={8}>
                    <TeamProjectSelector
                      error={localErrors.project}
                      size={isMobile ? 'md' : 'lg'}
                      value={update.project}
                      onChange={(val) => handleChange('project', val)}
                    />
                  </Grid>

                  <Grid xs={6} md={8}>
                    <TeamIfaLinkField
                      size={isMobile ? 'md' : 'lg'}
                      value={update.ifaLink}
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
                הוסף קבוצה
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>
    </>
  )


}
