// src/features/playersDatabase/ui/pages/leaguePage/clear/ClearLeagueTeamsModal.js

import { Alert, Box, Button, Typography } from '@mui/joy'
import RegularModal from '../../../components/modals/RegularModal.js'
import { CLEAR_LEAGUE_STEPS } from '../../../../domain/leagueV2/clear/clearLeagueTeamsPlan.builder.js'
import { clearLeagueTeamsSx as sx } from './clearLeagueTeams.sx.js'

export default function ClearLeagueTeamsModal({ flow, seasonKey }) {
  const locked = ['preparing', 'writing', 'steps'].includes(flow.status)
  const impact = flow.proposal?.impact
  const step = CLEAR_LEAGUE_STEPS[flow.stepIndex]
  return (
    <RegularModal open={flow.open} onClose={flow.close} title='מחיקת קבוצות העונה'>
      <Box sx={sx.body}>
        <Typography level='title-md'>עונה {seasonKey}</Typography>
        <Alert color='warning'>הפעולה מסירה את קבוצות העונה, טבלת התוצאות, מסמכי עונת הקבוצה ותחזיות היעד. עונת הליגה, הגדרותיה ועונות אחרות נשמרות.</Alert>
        {impact && <Typography>קבוצות בטבלה: {impact.teams} · מסמכי עונת קבוצה: {impact.teamSeasons} · אינדקסי קבוצות: {impact.teamIndexes} · מועדונים לעדכון: {impact.clubs}</Typography>}
        {flow.message && <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'}>{flow.message}</Alert>}
        {flow.status === 'preparing' && <Typography>קורא נתונים מהשרת ומכין את המחיקה…</Typography>}
        {flow.status === 'writing' && <Typography>מבצע את השלב הנוכחי…</Typography>}
        {flow.proposal && (
          <Box component='details' sx={sx.details}>
            <Box component='summary'>פירוט המסמכים</Box>
            {CLEAR_LEAGUE_STEPS.map(item => {
              const count = flow.counts[item.id] || { written: 0, skipped: 0, failed: 0 }
              const total = flow.proposal.operations.filter(operation => operation.kind === item.id).length
              return (
                <Box component='details' key={item.id} sx={sx.details}>
                  <Box component='summary'>{item.label}: {count.written} נכתבו, {count.skipped} דולגו, {count.failed} נכשלו</Box>
                  <Typography level='body-sm'>יעדים בתוכנית: {total}{item.id === 'team' ? ' — כל יעד כולל עונת קבוצה והפנייתה, בעדכון אטומי משותף.' : ''}</Typography>
                </Box>
              )
            })}
          </Box>
        )}
        {flow.status === 'steps' && <Typography>הפעולה הבאה: {step?.label || 'ביקורת מהשרת וסיום'}</Typography>}
        <Box sx={sx.actions}>
          <Button variant='plain' disabled={locked} onClick={flow.close}>סגירה</Button>
          {flow.status === 'preview' && <Button color='danger' onClick={flow.approve}>אישור תוכנית המחיקה</Button>}
          {flow.status === 'steps' && <Button onClick={flow.next}>{step ? `ביצוע: ${step.label}` : 'ביקורת וסיום'}</Button>}
          {flow.status === 'failed' && <Button onClick={flow.retry}>הכנה ואישור מחדש</Button>}
        </Box>
      </Box>
    </RegularModal>
  )
}
