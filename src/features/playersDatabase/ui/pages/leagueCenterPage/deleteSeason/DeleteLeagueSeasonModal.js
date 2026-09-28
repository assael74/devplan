// src/features/playersDatabase/ui/pages/leagueCenterPage/deleteSeason/DeleteLeagueSeasonModal.js

import { Alert, Box, Button, Typography } from '@mui/joy'
import RegularModal from '../../../components/modals/RegularModal.js'
import { DELETE_SEASON_STEPS } from './useDeleteLeagueSeason.js'
import { deleteSeasonSx as sx } from './deleteSeason.sx.js'

export default function DeleteLeagueSeasonModal({ flow }) {
  const locked = ['preparing', 'writing', 'steps'].includes(flow.status)
  const impact = flow.proposal?.impact
  const step = DELETE_SEASON_STEPS[flow.stepIndex]
  return (
    <RegularModal open={Boolean(flow.selected)} onClose={flow.close} persistent={locked} busy={locked} title='מחיקת עונת ליגה'>
      <Box sx={sx.body}>
        <Typography level='title-md'>{flow.selected?.leagueName} · {flow.selected?.seasonKey}</Typography>
        <Alert color='warning'>העונה והגדרותיה יוסרו מהליגה וממרכז הליגות. זהות הליגה ועונות אחרות יישמרו. אין מחיקה של קבוצות או שחקנים בפעולה הזאת.</Alert>
        {impact && <Typography>מסמך הליגה: {impact.leagueWrites} לעדכון · מרכז הליגות: {impact.masterWrites} לעדכון</Typography>}
        {flow.proposal?.retryState === 'season_absent_master_stale' && <Typography>העונה כבר הוסרה. נדרש להשלים את עדכון מרכז הליגות.</Typography>}
        {flow.proposal?.retryState === 'season_absent_clean' && <Typography>העונה כבר הוסרה והמאסטר תואם. תבוצע ביקורת להשלמת הפעולה.</Typography>}
        {flow.message && <Alert color={flow.status === 'succeeded' ? 'success' : 'danger'}>{flow.message}</Alert>}
        {flow.status === 'preparing' && <Typography>קורא את נתוני העונה מהשרת…</Typography>}
        {flow.status === 'writing' && <Typography>מבצע את השלב הנוכחי…</Typography>}
        {flow.proposal && <Box component='details' sx={sx.details}>
          <Box component='summary'>פירוט המסמכים</Box>
          {DELETE_SEASON_STEPS.filter(item => item.id !== 'audit').map(item => {
            const count = flow.counts[item.id] || { written: 0, skipped: 0, failed: 0 }
            return <Box component='details' key={item.id} sx={sx.details}>
              <Box component='summary'>{item.label}</Box>
              <Typography>{count.written} נכתבו · {count.skipped} דולגו · {count.failed} נכשלו</Typography>
            </Box>
          })}
        </Box>}
        {flow.status === 'steps' && <Typography>השלב הבא: {step.label}</Typography>}
        <Box sx={sx.actions}>
          <Button disabled={locked} variant='plain' onClick={flow.close}>סגירה</Button>
          {flow.status === 'preview' && <Button color='danger' onClick={flow.approve}>אישור מחיקת העונה</Button>}
          {flow.status === 'steps' && <Button onClick={flow.next}>ביצוע: {step.label}</Button>}
          {flow.status === 'failed' && <Button onClick={flow.retry}>הכנה ואישור מחדש</Button>}
        </Box>
      </Box>
    </RegularModal>
  )
}
