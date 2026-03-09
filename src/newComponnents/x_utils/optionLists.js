import { useMemo } from 'react';

/// STAFF
export const STAFF_ROLE_OPTIONS = [
  { id: 'coach', labelH: 'מאמן ראשי', idIcon: 'coach' },
  { id: 'assistant', labelH: 'עוזר מאמן', idIcon: 'assistant' },
  { id: 'analyst', labelH: 'אנליסט', idIcon: 'analyst' },
  { id: 'fitness', labelH: 'מאמן כושר', idIcon: 'fitness' },
  { id: 'scout', labelH: 'סקאוט', idIcon: 'scout' },
  { id: 'contactPerson', labelH: 'איש קשר', idIcon: 'contactPerson' },
  { id: 'teamAdministrator', labelH: 'מנהל קבוצה', idIcon: 'teamAdministrator' },
  { id: 'administrator', labelH: 'מנהל כללי', idIcon: 'administrator' },
  { id: 'psychologist', labelH: 'פסיכולוג ספורט', idIcon: 'psychologist' },
  { id: 'sportingDirector', labelH: 'מנהל מקצועי', idIcon: 'sportingDirector' },
];

export function useAvailableStaffRoles(currentList = []) {
  return useMemo(() => {
    return STAFF_ROLE_OPTIONS.filter(({ role }) => {
      const existing = currentList.find((item) => item.role === role);
      return !existing || existing.fullName.trim() === '';
    });
  }, [currentList]);
}

/// MEETINGS
export const statusMeetingList = [
  {id: 'new', label: 'New Meeting Scheduled', labelH: 'נקבעה', idIcon: 'meeting', disabled: false},
  {id: 'canceled', label: 'Meeting Canceled', labelH: 'בוטלה', idIcon: 'meetingCancel', disabled: false},
  {id: 'done', label: 'Meeting Done', labelH: 'התקיימה', idIcon: 'meetingDone', disabled: false},
]

export const optionTypeMeeting = [
  {id: 'personal', lable: 'Personal Meeting', labelH: 'אישית', idIcon: 'meetings', disabled: false},
  {id: 'team', lable: 'Team Meeting', labelH: 'קבוצתית', idIcon: 'meetings', disabled: true},
  {id: 'group', lable: 'Group Meeting', labelH: 'חלקית', idIcon: 'meetings', disabled: true},
]

/// PLAYERS
export const optionTypePlayer = [
  { id: 'project', label: 'פרויקט', labelH: 'פרויקט', idIcon: 'project', disabled: false },
  { id: 'noneType', label: 'כללי', labelH: 'כללי', idIcon: 'noneType', disabled: false },
  { id: 'tracking', label: 'במעקב', labelH: 'במעקב', idIcon: 'noneType', disabled: true },
  { id: 'individual', label: 'פרטי', labelH: 'פרטי', idIcon: 'noneType', disabled: true },
]

const warningColor = '#f7d397'
const succssesColor = '#11eb61'
const dangerColor = '#f80303'
const white = '#ffffff'
const black = '#000000'
const gray = '#5b5b5b'

export const optionProjectStatus = [
  { id: 'candidate', labelH: 'מועמד', idIcon: 'candidate', color: succssesColor, icCol: black },
  { id: 'messageSent', labelH: 'נשלחה הודעה ראשונית', idIcon: 'messageSent', color: '#a5c9ea', icCol: black },
  { id: 'awaitingReply', labelH: 'בהמתנה לתגובה', idIcon: 'awaitingReply',  color: warningColor, icCol: gray },
  { id: 'callscheduled', labelH: 'שיחה מתואמת', idIcon: 'callscheduled',  color: warningColor, icCol: gray },
  { id: 'reschedule', labelH: 'דחיית שיחה', idIcon: 'reschedule', color: dangerColor, icCol: white },
  { id: 'thinking', labelH: 'זמן מחשבה', idIcon: 'thinking', color: warningColor, icCol: gray },
  { id: 'approved', labelH: 'אושרה הצטרפות', idIcon: 'approved', color: succssesColor, icCol: black },
  { id: 'declined', labelH: 'סירוב הצטרפות', idIcon: 'declined', color: dangerColor, icCol: white },
];

/// games
export const gameTypeOptions = [
  { id: 'league', label: '', labelH: 'משחק ליגה', idIcon: 'league', disabled: false },
  { id: 'cup', label: '', labelH: 'משחק גביע', idIcon: 'cup', disabled: false },
  { id: 'friendly', label: '', labelH: 'משחק ידידות', idIcon: 'friendly', disabled: false },
]

export const gameDifficultyOptions = [
  { id: 'easy', label: '', labelH: 'רמה קלה', idIcon: 'easy', disabled: false },
  { id: 'equal', label: '', labelH: 'אותה רמה', idIcon: 'equal', disabled: false },
  { id: 'hard', label: '', labelH: 'רמה קשה', idIcon: 'hard', disabled: false },
]
