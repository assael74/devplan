import {
  AlarmOff,
  AlarmOn,
  CalendarMonth,
  EditCalendar,
  Event,
  EventAvailable,
  EventBusy,
} from '@mui/icons-material';

export const meetingIcons = {
  meeting: <Event />,
  meetingCancel: <EventBusy />,
  meetingDone: <EventAvailable />,
  meetingOffReminder: <AlarmOff />,
  meetingReminder: <AlarmOn />,
  meetings: <CalendarMonth />,
  meetingsPlan: <EditCalendar />,
};
