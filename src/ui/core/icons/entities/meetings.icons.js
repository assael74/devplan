import {
  Event,
  EventBusy,
  EventAvailable,
  AlarmOn,
  AlarmOff,
} from '@mui/icons-material';

export const meetingIcons = {
  meeting: <Event />,
  meetingCancel: <EventBusy />,
  meetingDone: <EventAvailable />,
  meetingReminder: <AlarmOn />,
  meetingOffReminder: <AlarmOff />,
};
