import { Box, Chip, Typography } from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerDecisionContentSx as sx } from './sx/playerDecisionContent.sx.js'

export default function PlayerChecksSection({ questions = {} }) {
  const checks = (Array.isArray(questions.checks) ? questions.checks : [])
    .filter(check => !check.answered)
    .slice()
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))
    .slice(0, 2)

  return (
    <Box sx={sx.sectionCard}>
      <Box sx={sx.sectionHeader}>
        <Box sx={sx.sectionTitleContainer}>
          <Box sx={sx.sectionTitleRow}>
            <Box sx={sx.sectionTitleIcon}>{iconUi({ id: 'check', size: 'sm' })}</Box>
            <Typography level='title-lg' sx={sx.sectionTitle}>מה כדאי לבדוק</Typography>
          </Box>
        </Box>
        {checks.length ? <Chip size='sm' variant='soft' color='warning'>{checks.length} בדיקות בעדיפות</Chip> : null}
      </Box>

      {checks.length ? (
        <Box sx={sx.checksGrid}>
          {checks.map((check, index) => (
            <Box key={check.id || index} sx={sx.checkCard}>
              <Box sx={sx.checkNumber}>{index + 1}</Box>
              <Box sx={sx.checkBody}>
                <Typography level='title-sm' sx={sx.checkTitle}>{check.label}</Typography>
                <Typography level='body-xs' sx={sx.checkExplanation}>
                  {check.score
                    ? `אימות הבדיקה יעזור לצמצם אי־ודאות בהחלטה. תועלת מיידית ${check.score}.`
                    : 'אימות הבדיקה יעזור לצמצם אי־ודאות בהחלטה המקצועית.'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.emptyText}>אין כרגע בדיקות מקצועיות בעדיפות גבוהה.</Typography>
      )}
    </Box>
  )
}
