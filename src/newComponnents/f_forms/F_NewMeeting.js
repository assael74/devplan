import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/joy/styles';
import { useSnackbar } from '../h_componnetsUtils/SnackBar/SnackbarProvider';
import { generateMeetingId } from './helpers/generateId.js'
import useMediaQuery from '@mui/material/useMediaQuery';
import { validateBeforeSave } from './X_Actions';
import { iconUi } from '../b_styleObjects/icons/IconIndex';
import { addButtProps, clearButtProps, addIconButtProps, drawerConsProps, sheetWraperProps, footerBoxProps } from './X_Style';
import { boxContentWraperProps } from './X_Style';
import useGenericActions from './X_UseGenericActions';
import { createEventInGoogleCalendar } from '../a_google/calendarUtils.js';
import { IconButton, Button, Stack, Typography, Tooltip, Sheet, Box, Drawer, Divider, Grid } from '@mui/joy';
import MeetingTypeSelect from './allFormInputs/selectUi/MeetingTypeSelectField.js';
import PlayerSelectField from './allFormInputs/selectUi/PlayerSelectField.js';
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js';
import DateInputField from './allFormInputs/dateUi/DateInputField.js';
import VideoLinkField from './allFormInputs/inputUi/VideoLinkField.js';
import PostMeetingActionsDialog from './FB_PostMeetingActionsDialog';

export default function NewMeetingForm(props) {
  const { meetings, players, clubs, teams, initialData, onSave, idForm, disabled, formProps, idNav } = props;
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  const { showSnackbar } = useSnackbar();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const butSize = isMobile ? 'sm' : 'md'
  const isTrulyMobile = isMobile && idNav !== 'defaultEmpty';

  const computedInitialState = {
    videoLink: '',
    meetingFor: '',
    meetingDate: '',
    meetingHour: '',
    type: '',
    playersId: [],
    playerId: initialData?.playerId || '',
  };

  const validationRules = {
    type: (val) => val.trim() === '',
    playerId: (val) => val.trim() === '',
    meetingDate: (val) => val.trim() === '',
    meetingHour: (val) => val.trim() === '',
    meetingFor: (val) => val.trim() === '',
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
    onSubmit: () => {
      const validationResult = validateBeforeSave(data, { meetings }, 'meeting');

      if (validationResult !== true) {
        alert(validationResult);
        return;
      }

      setConfirmedData(data);
      setDialogOpen(true);
    },
  });

  useEffect(() => {
    if (open && initialData?.playerId) {
      resetForm({
        ...computedInitialState,
        ...initialData,
      });
    }
  }, [open, initialData]);

  const handleFinalSave = async (currentData, addToCalendar) => {
    setIsAdding(true);

    try {
      const playerName = formProps.players.find(i => i.id === currentData.playerId)?.playerFullName || 'שחקן';

      let finalData = {
        ...currentData,
        id: generateMeetingId(`${currentData.meetingDate}${currentData.playerId}`),
        playerName,
        isInGoogleCalendar: !!addToCalendar,
      };

      if (addToCalendar) {
        try {
          const eventResult = await createEventInGoogleCalendar(finalData);
          finalData.eventId = eventResult.eventId;
        } catch (err) {
          console.error('שגיאה בהוספה ליומן:', err);
        }
      }

      onSave(finalData);
      showSnackbar('הפגישה נשמרה בהצלחה', 'success', 'meetings');
      setDialogOpen(false);
      setOpen(false);
    } catch (err) {
      console.log('❌ שגיאה בשמירת הפגישה:', err);
      showSnackbar('שגיאה בשמירת הפגישה', 'error', 'calendar');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <>
      {isMobile ? (
        <IconButton {...addIconButtProps('newMeeting', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          {iconUi({ id: 'newMeeting' })}
        </IconButton>
      ) : (
        <Button {...addButtProps('newMeeting', butSize)} onClick={() => setOpen(true)} disabled={disabled}>
          הוסף פגישה
        </Button>
      )}

      <Drawer {...drawerConsProps(open, setOpen)}>
        <Sheet {...sheetWraperProps}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography level="h5" fontWeight='lg'>טופס פגישה חדשה</Typography>
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
          <Box {...boxContentWraperProps('meetings', isMobile)}>
            <Box className="content-inner">
              {/* Section: מאפיינים*/}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">שיוך</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={7} md={6}>
                    <MeetingTypeSelect
                      required
                      size={isMobile ? 'sm' : 'md'}
                      errors={errors.type}
                      value={data.type}
                      onChange={(val) => handleChange('type', val)}
                    />
                  </Grid>

                  <Grid xs={12} md={6}>
                    <Tooltip title={idForm === 'playerDashboard' ? 'לא ניתן לשנות שחקן מתוך פרופיל שחקן' : ''}>
                      <PlayerSelectField
                        error={errors.playerId}
                        options={formProps.players}
                        size={isMobile ? 'sm' : 'md'}
                        value={data.playerId}
                        required={true}
                        formProps={formProps}
                        readOnly={idForm === 'playerDashboard'}
                        onChange={(val) => handleChange('playerId', val)}
                      />
                    </Tooltip>
                  </Grid>
                </Grid>
              </Sheet>

              {/* Section: זמני פגישה*/}
              <Sheet variant="soft" sx={{ p: 2, borderRadius: 'md', mb: 1.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography level="title-md">זמני פגישה</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  <Grid xs={12} md={8}>
                    <DateInputField
                      value={data.meetingDate}
                      timeValue={data.meetingHour}
                      onChange={(val) => handleChange('meetingDate', val)}
                      onTimeChange={(val) => handleChange('meetingHour', val)}
                      context="meeting"
                      required
                      size={isMobile ? 'sm' : 'md'}
                      error={errors.meetingDate}
                    />
                  </Grid>

                  <Grid xs={12} md={8}>
                    <MonthYearPicker
                      required
                      size={isMobile ? 'sm' : 'md'}
                      context="meeting"
                      helperText="עבור איזה חודש הפגישה מיועדת"
                      value={data.meetingFor}
                      onChange={(val) => handleChange('meetingFor', val)}
                      error={errors.meetingFor}
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
                הוסף פגישה
              </Button>
            </Stack>
          </Box>
        </Sheet>
      </Drawer>

      <PostMeetingActionsDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={({ addToCalendar }) => handleFinalSave(confirmedData, addToCalendar)}
      />
    </>
  );
}
