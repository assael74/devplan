import {
  Event,
  EventBusy,
  EventAvailable,
  AlarmOn,
  AlarmOff,
  EditCalendar,
  CalendarMonth
} from '@mui/icons-material';

export const meetingIcons = {
  meeting: <Event />,
  meetings: <CalendarMonth />,
  meetingsPlan: <EditCalendar />,
  meetingCancel: <EventBusy />,
  meetingDone: <EventAvailable />,
  meetingReminder: <AlarmOn />,
  meetingOffReminder: <AlarmOff />,
};
