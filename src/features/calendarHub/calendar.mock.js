// src/features/calendar/calendar.mock.js

export const MOCK_CALENDARS = [
  { id: 'team_kadima_u14', type: 'team', label: 'קדימה צורן נערים ב׳', color: 'primary' },
  { id: 'team_kadima_u16', type: 'team', label: 'קדימה צורן נערים א׳', color: 'success' },
  { id: 'staff_assael', type: 'staff', label: 'יומן אנליסט: עשהאל', color: 'warning' },
]

export const EVENT_TYPES = {
  training: { label: 'אימון', icon: '🏋️‍♂️' },
  match: { label: 'משחק', icon: '⚽' },
  meeting_player: { label: 'פגישה אישית', icon: '👤' },
  meeting_team: { label: 'פגישה קבוצתית', icon: '👥' },
  attendance: { label: 'נוכחות', icon: '🎥' },
}

export const mockBuildEvents = (weekStart) => {
  // weekStart: Date (Sunday)
  const d = (dayOffset, hh, mm = 0) => {
    const x = new Date(weekStart)
    x.setDate(x.getDate() + dayOffset)
    x.setHours(hh, mm, 0, 0)
    return x
  }

  return [
    // Team U14
    {
      id: 'e1',
      calendarId: 'team_kadima_u14',
      type: 'training',
      title: 'אימון – טכניקה + מעברים',
      startAt: d(1, 18, 0), // Mon
      endAt: d(1, 19, 30),
    },
    {
      id: 'e2',
      calendarId: 'team_kadima_u14',
      type: 'match',
      title: 'משחק חוץ – יריבה X',
      startAt: d(5, 10, 30), // Fri
      endAt: d(5, 12, 30),
      meta: { isWeekend: true },
    },

    // Team U16
    {
      id: 'e3',
      calendarId: 'team_kadima_u16',
      type: 'training',
      title: 'אימון – משחק נגד צפיפות',
      startAt: d(2, 19, 0), // Tue
      endAt: d(2, 20, 30),
    },
    {
      id: 'e4',
      calendarId: 'team_kadima_u16',
      type: 'match',
      title: 'משחק בית – יריבה Y',
      startAt: d(6, 12, 0), // Sat
      endAt: d(6, 14, 0),
      meta: { isWeekend: true },
    },

    // Staff (Analyst)
    {
      id: 'e5',
      calendarId: 'staff_assael',
      type: 'meeting_player',
      title: 'פגישה: שחקן #12',
      startAt: d(1, 17, 0),
      endAt: d(1, 17, 30),
    },
    {
      id: 'e6',
      calendarId: 'staff_assael',
      type: 'attendance',
      title: 'נוכחות צילום – משחק U14',
      startAt: d(5, 10, 0),
      endAt: d(5, 13, 0),
      meta: { matchId: 'match_u14_001', isWeekend: true },
    },
  ]
}
