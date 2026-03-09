// src/shared/performance/filters/statsFilterGroups.js
import { iconUi } from '../../../ui/core/icons/iconUi'

export const statsFilterGroups = [
  {
    key: 'statsParmType',
    title: 'סוג פרמטרים',
    options: [
      { value: 'all', label: 'כולם', startDecorator: iconUi({ id: 'statsParm' }) },
      { value: 'offensive', label: 'התקפה', startDecorator: iconUi({ id: 'offensive' }) },
      { value: 'defensive', label: 'הגנה', startDecorator: iconUi({ id: 'defensive' }) },
      { value: 'mental', label: 'מנטלי', startDecorator: iconUi({ id: 'mental' }) },
      { value: 'goalkeeping', label: 'שוערות', startDecorator: iconUi({ id: 'goalkeeping' }) },
      { value: 'general', label: 'כללי', startDecorator: iconUi({ id: 'generalParm' }) },
    ],
  },
  {
    key: 'type',
    title: 'סוג משחק (לחישוב)',
    options: [
      { value: 'all', label: 'כל הסוגים', startDecorator: iconUi({ id: 'league' }) },
      { value: 'league', label: 'ליגה', startDecorator: iconUi({ id: 'league' }) },
      { value: 'cup', label: 'גביע', startDecorator: iconUi({ id: 'cup' }) },
      { value: 'friendly', label: 'ידידות', startDecorator: iconUi({ id: 'friendly' }) },
    ],
  },
]
