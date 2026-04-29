// features/insightsHub/overview/data/overview.domains.js
import { getEntityColors } from '../../../../ui/core/theme/Colors.js'

const c = (entity) => getEntityColors(entity)

export const DOMAIN_OPTIONS = [
  {
    id: 'games',
    label: 'משחקים',
    subtitle: 'תובנות ומדדים שנאספים ממשחקים',
    iconId: 'games',
    color: c('teams').bg,
    disabled: false,
  },
  {
    id: 'videos',
    label: 'וידאו',
    subtitle: 'תובנות ומדדים שנוצרו על ידי האנליסט בניתוחי הוידאו',
    iconId: 'video',
    color: c('videoAnalysis').bg,
    disabled: false,
  },
  {
    id: 'abilities',
    label: 'יכולות',
    subtitle: 'בקרוב: תובנות מתוך טפסי יכולות, כיסוי ופוטנציאל',
    iconId: 'abilities',
    color: 'neutral',
    disabled: true,
  },
  {
    id: 'meetings',
    label: 'פגישות',
    subtitle: 'בקרוב: תובנות מתוך פגישות, סטטוסים ותדירות ליווי',
    iconId: 'meetings',
    color: 'neutral',
    disabled: true,
  },
]
