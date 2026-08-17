// src/features/playersDatabase/ui/pages/playerPage/scout/PlayerScoutQuestions.js

import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import { playerScoutOverviewSx as sx } from '../sx/playerScoutOverview.sx.js'

export default function PlayerScoutQuestions({ questions = {}, nextAction = {}, onReview }) {
  const checks = Array.isArray(questions.checks) ? questions.checks : []
  const completion = questions.completion || {}
  const answered = Number(completion.answered || 0)
  const total = Number(completion.total || checks.length || 0)
  const openCount = Math.max(0, total - answered)

  return (
    <Box sx={sx.bottomDecisionGrid}>
      <Box sx={[sx.bottomDecisionCard, sx.questionsCard]}>
        <Box sx={sx.bottomDecisionHeader}>
          <Box sx={[sx.sectionIcon, sx.sectionIconTone.question]}>
            {iconUi({id: 'warning', size: 'sm'})}
          </Box>

          <Box sx={sx.bottomDecisionHeading}>
            <Typography level='title-md' sx={sx.sectionTitle}>
              מה עדיין חסר
            </Typography>

            <Typography level='body-xs' sx={sx.sectionSubtitle}>
              מה עדיין צריך לאמת לפני שמחזקים את המסקנה
            </Typography>
          </Box>

          <Box sx={sx.questionsHeaderActions}>
            {total ? (
              <Chip size='sm' variant='soft' color={openCount ? 'warning' : 'success'}>
                {openCount ? `${openCount} פתוחות` : 'הושלם'}
              </Chip>
            ) : null}

            <Button
              size='sm'
              variant='outlined'
              startDecorator={iconUi({id: 'edit', size: 'sm'})}
              onClick={onReview}
            >
              עדכון בדיקה
            </Button>
          </Box>
        </Box>

        {checks.length ? (
          <Box sx={sx.openQuestionsList}>
            {checks.slice(0, 3).map(check => (
              <Box key={check.id} sx={sx.openQuestionRow}>
                <Box sx={[sx.questionBullet, check.answered ? sx.questionDone : sx.questionOpen]}>
                  {check.answered ? '✓' : '!'}
                </Box>

                <Typography level='body-sm' sx={sx.questionLabel}>
                  {check.label}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography level='body-sm' sx={sx.bottomEmptyText}>
            אין כרגע שאלות אימות פתוחות לשחקן.
          </Typography>
        )}
      </Box>

      <Box sx={[sx.bottomDecisionCard, sx.actionCard]}>
        <Box sx={sx.bottomDecisionHeader}>
          <Box sx={[sx.sectionIcon, sx.actionIcon]}>
            {iconUi({id: 'targets', size: 'sm'})}
          </Box>

          <Box sx={sx.bottomDecisionHeading}>
            <Typography level='title-md' sx={sx.actionTitle}>
              הפעולה הבאה
            </Typography>

            <Typography level='body-xs' sx={sx.actionEyebrow}>
              המשך העבודה מתוך מצב הסקאוטינג הנוכחי
            </Typography>
          </Box>
        </Box>

        <Typography level='title-lg' sx={sx.nextActionTitle}>
          {String(nextAction.title || '').replace('הפעולה הבאה: ', '')}
        </Typography>

        <Typography level='body-sm' sx={sx.nextActionDescription}>
          {nextAction.description}
        </Typography>
      </Box>
    </Box>
  )
}
