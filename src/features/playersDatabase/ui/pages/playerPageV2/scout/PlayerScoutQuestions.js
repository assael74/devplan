// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutQuestions.js

import {
  Box,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

export default function PlayerScoutQuestions({ questions = {} }) {
  const checks = Array.isArray(questions.checks) ? questions.checks : []
  const completion = questions.completion || {}
  const answered = Number(completion.answered || 0)
  const total = Number(completion.total || checks.length || 0)
  const openCount = Math.max(0, total - answered)

  return (
    <Box sx={[sx.bottomDecisionCard, sx.questionsCard]}>
      <Box sx={sx.bottomDecisionHeader}>
        <Box sx={[sx.sectionIcon, sx.sectionIconTone.question]}>
          {iconUi({ id: 'warning', size: 'sm' })}
        </Box>

        <Box sx={sx.bottomDecisionHeading}>
          <Typography level='title-md' sx={sx.sectionTitle}>
            מה עדיין צריך לברר
          </Typography>

          <Typography level='body-xs' sx={sx.sectionSubtitle}>
            החוסרים המקצועיים שעדיין משפיעים על איכות ההחלטה
          </Typography>
        </Box>

        {total ? (
          <Chip size='sm' variant='soft' color={openCount ? 'warning' : 'success'}>
            {openCount ? `${openCount} פתוחות` : 'הושלם'}
          </Chip>
        ) : null}
      </Box>

      {checks.length ? (
        <Box sx={sx.openQuestionsList}>
          {checks.slice(0, 4).map(check => (
            <Box key={check.id} sx={sx.openQuestionRow}>
              <Box sx={[sx.questionBullet, check.answered ? sx.questionDone : sx.questionOpen]}>
                {check.answered ? '✓' : '!'}
              </Box>

              <Box sx={sx.questionText}>
                <Typography level='body-sm' sx={sx.questionLabel}>
                  {check.label}
                </Typography>

                {check.score ? (
                  <Typography level='body-xs' sx={sx.questionMeta}>
                    {`תועלת מיידית ${check.score}`}
                  </Typography>
                ) : null}
              </Box>
            </Box>
          ))}
        </Box>
      ) : (
        <Typography level='body-sm' sx={sx.bottomEmptyText}>
          אין כרגע בדיקות מקצועיות פתוחות לשחקן.
        </Typography>
      )}
    </Box>
  )
}
