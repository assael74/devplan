// src/features/playersDatabase/ui/pages/playerPage/PlayerNarrativeCard.js

import {
  Box,
  Button,
  Chip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { playerNarrativeCardSx as sx } from './sx/playerNarrativeCard.sx.js'

const formatDate = value => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

const firstParagraph = summary => String(summary || '')
  .split(/\n\s*\n/)
  .map(item => item.trim())
  .filter(Boolean)[0] || ''

const buildBasisLabel = (approved, dataDepth) => {
  const seasons = Array.isArray(approved?.seasonKeys)
    ? approved.seasonKeys.filter(Boolean)
    : []

  if (seasons.length === 1) return `מבוסס על עונת ${seasons[0]}`
  if (seasons.length > 1) return `מבוסס על ${seasons.length} עונות`

  return dataDepth?.label || 'מבוסס על המידע המקצועי הקיים'
}

export default function PlayerNarrativeCard({
  view = {},
  narrativeView = {},
  loading = false,
  onOpen,
  onGenerate,
}) {
  const approved = narrativeView?.approved
  const content = approved?.content || {}
  const approvedAt = formatDate(approved?.approvedAt || approved?.generatedAt)
  const updateAvailable = narrativeView?.state === 'updateAvailable'

  if (!approved) {
    return (
      <Box sx={[sx.card, sx.emptyCard]}>
        <Box sx={sx.iconWrap}>
          {iconUi({id: 'profile', size: 'md'})}
        </Box>

        <Box sx={sx.main}>
          <Box sx={sx.headingRow}>
            <Typography level='title-md' sx={sx.eyebrow}>
              סיפור מקצועי
            </Typography>

            <Chip size='sm' variant='soft' color='neutral' sx={sx.statusChip}>
              טרם נוצר
            </Chip>
          </Box>

          <Typography level='h3' sx={sx.title}>
            עדיין לא נוצר סיפור מקצועי לשחקן
          </Typography>

          <Typography level='body-sm' sx={sx.summary}>
            הנתונים כבר זמינים. ניתן לחבר את המעמד, ההקשר והמסלול לתמונה מקצועית אחת.
          </Typography>

          <Box sx={sx.footer}>
            <Typography level='body-xs' sx={sx.metaText}>
              {view.dataDepth?.note || 'הסיפור ייווצר לפי המידע הקיים כרגע.'}
            </Typography>

            <Button
              size='sm'
              loading={loading}
              startDecorator={iconUi({id: 'profile', size: 'sm'})}
              onClick={onGenerate}
            >
              צור סיפור
            </Button>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={[sx.card, sx.approvedCard, updateAvailable ? sx.updateAvailableCard : null]}>
      <Box sx={sx.iconWrap}>
        {iconUi({id: 'profile', size: 'md'})}
      </Box>

      <Box sx={sx.main}>
        <Box sx={sx.headingRow}>
          <Typography level='title-md' sx={sx.eyebrow}>
            סיפור מקצועי
          </Typography>

          <Chip
            size='sm'
            variant='soft'
            color={updateAvailable ? 'warning' : 'success'}
            sx={sx.statusChip}
          >
            {updateAvailable ? 'יש נתונים חדשים' : 'סיפור קיים'}
          </Chip>
        </Box>

        <Typography level='h3' sx={sx.title}>
          {content.title || 'תמונת מצב מקצועית'}
        </Typography>

        <Typography level='body-sm' sx={sx.summary}>
          {firstParagraph(content.summary) || 'הסיפור המקצועי נשמר ומוכן לצפייה.'}
        </Typography>

        <Box sx={sx.footer}>
          <Box sx={sx.metaRow}>
            <Typography level='body-xs' sx={sx.metaText}>
              {buildBasisLabel(approved, view.dataDepth)}
            </Typography>

            {approvedAt ? (
              <Typography level='body-xs' sx={sx.metaText}>
                {`עודכן ${approvedAt}`}
              </Typography>
            ) : null}
          </Box>

          <Box sx={sx.actions}>
            <Button
              size='sm'
              startDecorator={iconUi({id: 'view', size: 'sm'})}
              onClick={onOpen}
            >
              פתח סיפור מלא
            </Button>

            {updateAvailable ? (
              <Button
                size='sm'
                variant='outlined'
                loading={loading}
                startDecorator={iconUi({id: 'trend', size: 'sm'})}
                onClick={onGenerate}
              >
                עדכן סיפור
              </Button>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
