// src/features/playersDatabase/ui/components/teamSignals/TeamSignalDetails.js

import { Box, Chip, Typography } from '@mui/joy'
import { getTeamDiagnosticSignalLabel } from '../../pages/teamPage/scouting/model/teamDiagnosticSignalTask.presentation.js'
import { CLUB_METRIC_LABELS } from '../../pages/teamPage/information/model/teamClubComparison.presentation.js'
import { teamSignalsSx as sx } from './teamSignals.sx.js'

const labels = {
  competition: 'שינוי ברמת התחרות', rank: 'שינוי במיקום', offense: 'התקפה', defense: 'הגנה',
  professionalProfiles: 'פרופילים מקצועיים', underuseProfiles: 'פרופילי חוסר שימוש',
  squad: 'שימוש בסגל', departures: 'עזיבת שחקנים', 'level-change': 'שינוי ברמה הצפויה',
  'league-vs-club': 'פער מול רמת המועדון', 'historical-competition': 'תחרות ביחס לנורמה ההיסטורית',
  'historical-performance': 'ביצועים ביחס לנורמה ההיסטורית', 'historical-squad': 'סגל ביחס לנורמה ההיסטורית',
  direction: 'עזיבה לרמה גבוהה', professional: 'עזיבת בעלי פרופיל מקצועי',
  up: 'עלייה צפויה ברמת התחרות', down: 'ירידה צפויה ברמת התחרות', equal: 'ללא שינוי צפוי',
  stable: 'ללא שינוי צפוי',
  LOW_CLASSIFICATION_COVERAGE: 'בסיס סגל צר', HIGH_CLASSIFICATION_COVERAGE: 'בסיס סגל רחב',
}

const label = id => labels[id] || CLUB_METRIC_LABELS[id] || getTeamDiagnosticSignalLabel(id) || 'ממצא'
const status = item => item.level === null ? 'מידע חסר' : item.level === 2 ? 'לחקירה' : item.level === 1 ? 'למעקב' : 'ללא איתות'

const evidenceText = sub => {
  if (sub.id === 'change') return sub.delta === 0 ? 'ללא שינוי' : `שינוי של ${sub.delta > 0 ? '+' : ''}${sub.delta}`
  if (sub.id === 'gap') return `רמת ליגה ${sub.leagueLevel} · רמת מועדון ${sub.clubLevel}`
  if (sub.count !== undefined) {
    const title = sub.id === 'direction' && sub.includesSameLevel ? 'עזיבה לרמה זהה או גבוהה' : label(sub.id)
    return `${title}: ${sub.count} · סף ${sub.threshold}`
  }
  if (sub.delta !== undefined && sub.delta !== null) return `${label(sub.id)}: פער ${Number(sub.delta.toFixed(1))} מהנורמה`
  return label(sub.id)
}

export default function TeamSignalDetails({ family }) {
  if (!family) return null
  return (
    <Box sx={sx.details} aria-label='איתותים ותתי־איתותים'>
      {Object.values(family.signalsById).map(item => (
        <Box component='details' key={item.id} sx={sx.signal}>
          <Box component='summary' sx={sx.signalHeading}>
            <Typography component='span' level='title-sm'>{label(item.id)}</Typography>
            <Chip component='span' size='sm' color={item.level === 2 ? 'warning' : item.level === 1 ? 'primary' : 'neutral'}>
              {status(item)}
            </Chip>
          </Box>
          <Box sx={sx.subSignals}>
            {Object.values(item.subSignalsById || {}).length ? Object.values(item.subSignalsById).map(sub => (
              <Typography key={sub.id} level='body-sm'>{evidenceText(sub)}</Typography>
            )) : <Typography level='body-sm'>אין מספיק מידע לפירוט האיתות.</Typography>}
          </Box>
        </Box>
      ))}
    </Box>
  )
}
