// src/shared/players/filters/playerFilterGroups.js
import { iconUi } from '../../../ui/core/icons/iconUi'

const warningColor = '#f7d397'
const succssesColor = '#11eb61'
const dangerColor = '#f80303'
const white = '#ffffff'
const black = '#000000'
const gray = '#5b5b5b'

export const playerFilterGroups = [
  {
    key: 'active',
    title: 'פעילים',
    options: [
      { value: 'all', label: 'כולם', startDecorator: iconUi({ id: 'players' }) },
      { value: 'active', label: 'פעילים', startDecorator: iconUi({ id: 'active' }) },
      { value: 'nonActive', label: 'לא פעילים', startDecorator: iconUi({ id: 'notActive' }) },
    ],
  },
  {
    key: 'type',
    title: 'סוג שחקן',
    options: [
      { value: 'all', label: 'כל הסוגים', startDecorator: iconUi({ id: 'players' }) },
      { value: 'project', label: 'פרויקט', startDecorator: iconUi({ id: 'project' }) },
      { value: 'noneType', label: 'כללי', startDecorator: iconUi({ id: 'noneType' }) },
    ],
  },
  {
    key: 'candidate',
    title: 'בתהליך קליטה',
    options: [
      { value: 'all', label: 'כל הסוגים', startDecorator: iconUi({ id: 'project' }) },
      { value: 'candidate', label: 'מועמד', startDecorator: iconUi({ id: 'candidate', sx: { color: succssesColor } }) },
      { value: 'messageSent', label: 'נשלחה הודעה ראשונית', startDecorator: iconUi({ id: 'messageSent', sx: { color: '#a5c9ea' } }) },
      { value: 'awaitingReply', label: 'בהמתנה לתגובה', startDecorator: iconUi({ id: 'awaitingReply', sx: { color: warningColor } }) },
      { value: 'callscheduled', label: 'שיחה מתואמת', startDecorator: iconUi({ id: 'callscheduled', sx: { color: warningColor } }) },
      { value: 'reschedule', label: 'דחיית שיחה', startDecorator: iconUi({ id: 'reschedule', sx: { color: dangerColor } }) },
      { value: 'thinking', label: 'זמן מחשבה', startDecorator: iconUi({ id: 'thinking', sx: { color: warningColor } }) },
      { value: 'approved', label: 'אושרה הצטרפות', startDecorator: iconUi({ id: 'approved', sx: { color: succssesColor } }) },
      { value: 'declined', label: 'סירוב הצטרפות', startDecorator: iconUi({ id: 'declined', sx: { color: dangerColor } }) },
    ],
  },
]
