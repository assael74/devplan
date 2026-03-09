import * as React from 'react';
import moment from 'moment';
import 'moment/locale/he';
import {
  Modal,
  ModalDialog,
  Sheet,
  Typography,
  Button,
  Input,
  Stack,
  Divider,
  Box,
} from '@mui/joy';
import MeetingTypeSelect from './allFormInputs/selectUi/MeetingTypeSelectField.js';
import PlayerSelectField from './allFormInputs/selectUi/PlayerSelectField.js';
import MonthYearPicker from './allFormInputs/dateUi/MonthYearPicker.js';

moment.locale('he');

// עזר אוניברסלי לחילוץ ערך מכל סוג של onChange
function valFromChange(...args) {
  const [a, b] = args;
  if (b !== undefined) return b;
  if (a && a.target && a.target.value !== undefined) return a.target.value;
  return a;
}

// מזהה פגישה ייחודי
function generateMeetingId(seed = '') {
  return (
    crypto?.randomUUID?.() ||
    `m_${Date.now()}_${Math.abs(
      [...seed].reduce((h, c) => ((h << 5) - h) + c.charCodeAt(0), 0)
    )}`
  );
}

export default function NewMeetingFormv2({
  isMobile,
  open = false,
  onClose = () => {},
  onSave = () => {},
  initialData = {},
  players = [],
  formProps = {},
}) {
  const emptyForm = {
    meetingDate: '',
    meetingFor: '',
    meetingHour: '',
    playerId: '',
    type: '',
  };

  const [form, setForm] = React.useState(emptyForm);

  React.useEffect(() => {
    if (initialData && open) {
      const meetingDate = initialData.meetingDate || moment().format('YYYY-MM-DD');
      setForm({
        ...emptyForm,
        ...initialData,
        meetingDate,
        meetingHour: initialData.meetingHour || moment().format('HH:mm'),
        meetingFor: initialData.meetingFor || moment(meetingDate).format('MM-YYYY'),
      });
    }
  }, [initialData, open]);

  const resetForm = () => setForm(emptyForm);

  const handleSave = () => {
    const meetingObj = {
      ...form,
      isInGoogleCalendar: false,
      eventId: null,
      videoLink: '',
      id: generateMeetingId(`${form.meetingDate}${form.playerId}`),
      created: moment().toISOString(),
    };
    onSave(meetingObj);
    resetForm();
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleCancel}>
      <ModalDialog variant="outlined" sx={{ minWidth: 400, borderRadius: 'lg', p: 2 }}>
        <Typography level="title-md" textAlign="center">
          יצירת פגישה חדשה
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Stack spacing={1.5}>
          <Input
            size="sm"
            type="date"
            label="תאריך פגישה"
            value={form.meetingDate}
            onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
          />

          <Input
            size="sm"
            type="time"
            label="שעת התחלה"
            value={form.meetingHour}
            onChange={(e) => setForm({ ...form, meetingHour: e.target.value })}
          />

          <PlayerSelectField
            options={players}
            size={isMobile ? 'sm' : 'md'}
            value={form.playerId}
            required
            formProps={formProps}
            onChange={(...args) =>
              setForm((prev) => ({
                ...prev,
                playerId: valFromChange(...args) || '',
              }))
            }
          />

          <MeetingTypeSelect
            required
            size={isMobile ? 'sm' : 'md'}
            value={form.type}
            onChange={(...args) =>
              setForm((prev) => ({ ...prev, type: valFromChange(...args) || '' }))
            }
          />

          <MonthYearPicker
            required
            size={isMobile ? 'sm' : 'md'}
            context="meeting"
            helperText="עבור איזה חודש הפגישה מיועדת"
            value={form.meetingFor}
            onChange={(...args) =>
              setForm((prev) => ({
                ...prev,
                meetingFor: valFromChange(...args) || '',
              }))
            }
          />
        </Stack>

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Button variant="plain" color="neutral" onClick={handleCancel}>
            בטל
          </Button>
          <Button variant="solid" color="primary" onClick={handleSave}>
            שמור פגישה
          </Button>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
