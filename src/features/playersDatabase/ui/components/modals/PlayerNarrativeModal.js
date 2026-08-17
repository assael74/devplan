// src/features/playersDatabase/ui/components/modals/PlayerNarrativeModal.js

import * as React from 'react'

import { Box, Button, Chip, Textarea, Typography } from '@mui/joy'

import RegularModal from './RegularModal.js'
import { playerNarrativeModalSx as sx } from './sx/playerNarrativeModal.sx.js'

const ENTITY_PRIORITY = {
  player: 1,
  club: 2,
  team: 3,
  league: 4,
  ageGroup: 5,
  birthYear: 6,
  profile: 7,
}

const ACTION_VIEW = {
  immediate: {
    interestLabel: 'בדיקה מיידית',
    timingLabel: 'מיידי',
    color: 'danger',
    variant: 'solid',
  },
  priority: {
    interestLabel: 'עדיפות גבוהה',
    timingLabel: 'בקרוב',
    color: 'warning',
    variant: 'soft',
  },
  watch: {
    interestLabel: 'מעקב',
    timingLabel: 'המשך מעקב',
    color: 'neutral',
    variant: 'soft',
  },
  exposed: {
    interestLabel: 'חשיפה גבוהה',
    timingLabel: 'יתרון תזמון נמוך',
    color: 'primary',
    variant: 'soft',
  },
}

const FUTURE_OUTLOOK_VIEW = {
  competition_down: {
    label: 'רמת התחרות צפויה לרדת',
    shortLabel: '↓ רמת התחרות צפויה לרדת',
    color: 'warning',
  },
  competition_up: {
    label: 'רמת התחרות צפויה לעלות',
    shortLabel: '↑ רמת התחרות צפויה לעלות',
    color: 'primary',
  },
  competition_stable: {
    label: 'רמת התחרות צפויה להישאר דומה',
    shortLabel: '→ התחרות צפויה להישאר דומה',
    color: 'neutral',
  },
}

const CERTAINTY_VIEW = {
  high: 'גבוהה',
  medium: 'בינונית',
  low: 'נמוכה',
}

function clean(value) {
  return String(value || '').trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function resolveParagraphs(summary = '') {
  return String(summary || '')
    .split(/\n\s*\n/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function normalizeEntities(presentation = {}) {
  const entities = Array.isArray(presentation?.entities)
    ? presentation.entities
    : []
  const seen = new Set()

  return entities
    .map((entity) => ({
      type: clean(entity?.type),
      label: clean(entity?.label),
    }))
    .filter((entity) => {
      if (!entity.label) return false

      const key = entity.label.toLocaleLowerCase('he')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => (
      right.label.length - left.label.length ||
      (ENTITY_PRIORITY[left.type] || 99) - (ENTITY_PRIORITY[right.type] || 99)
    ))
}

function buildHighlightRegex(entities) {
  if (!entities.length) return null

  return new RegExp(`(${entities.map((entity) => escapeRegExp(entity.label)).join('|')})`, 'giu')
}

function findEntity(entities, value) {
  const normalized = clean(value).toLocaleLowerCase('he')
  return entities.find((entity) => entity.label.toLocaleLowerCase('he') === normalized) || null
}

function resolveDecisionView(presentation = {}) {
  const decision = presentation?.decision || {}
  const actionStatus = clean(decision.actionStatus)
  const futureOutlook = clean(decision.futureOutlook)
  const certaintyLevel = clean(decision.certaintyLevel)
  const certaintyScore = Number(decision.certaintyScore)

  return {
    actionStatus,
    futureOutlook,
    action: ACTION_VIEW[actionStatus] || null,
    future: FUTURE_OUTLOOK_VIEW[futureOutlook] || null,
    certaintyScore: Number.isFinite(certaintyScore) ? certaintyScore : null,
    certaintyLabel: CERTAINTY_VIEW[certaintyLevel] || '',
    currentCompetitionLevel: decision.currentCompetitionLevel,
    nextCompetitionLevel: decision.nextCompetitionLevel,
  }
}

function resolveDecisionParagraph(paragraphs = []) {
  if (paragraphs.length < 4) return ''
  return paragraphs[paragraphs.length - 1]
}

function resolveStoryParagraphs(paragraphs = []) {
  if (paragraphs.length < 4) return paragraphs
  return paragraphs.slice(0, -1)
}

function resolveCompetitionDetail(decisionView = {}) {
  if (!decisionView.future || decisionView.futureOutlook === 'competition_stable') return ''

  const current = Number(decisionView.currentCompetitionLevel)
  const next = Number(decisionView.nextCompetitionLevel)
  if (!Number.isFinite(current) || !Number.isFinite(next)) return ''

  return `רמה ${current} → רמה ${next}`
}

function HighlightedText({ text, presentation }) {
  const entities = normalizeEntities(presentation)
  const regex = buildHighlightRegex(entities)
  if (!regex) return text

  return String(text || '').split(regex).map((part, index) => {
    const entity = findEntity(entities, part)
    if (!entity) return part

    return (
      <Box
        component='span'
        key={`${entity.type}-${index}-${part}`}
        sx={sx.entity(entity.type)}
      >
        {part}
      </Box>
    )
  })
}

function DecisionChip({ label, color = 'neutral', variant = 'soft', emphasis = false }) {
  if (!label) return null

  return (
    <Chip
      size={emphasis ? 'md' : 'sm'}
      variant={variant}
      color={color}
      sx={sx.decisionChip(emphasis)}
    >
      {label}
    </Chip>
  )
}

export default function PlayerNarrativeModal({
  open,
  session,
  presentation,
  refining,
  saving,
  onRefine,
  onClose,
  onApprove,
}) {
  const [instruction, setInstruction] = React.useState('')
  const content = session?.draft || {}
  const paragraphs = resolveParagraphs(content.summary)
  const decisionView = resolveDecisionView(presentation)
  const decisionParagraph = resolveDecisionParagraph(paragraphs)
  const storyParagraphs = resolveStoryParagraphs(paragraphs)
  const competitionDetail = resolveCompetitionDetail(decisionView)
  const certaintyText = decisionView.certaintyScore !== null
    ? `${decisionView.certaintyScore}${decisionView.certaintyLabel ? ` · ${decisionView.certaintyLabel}` : ''}`
    : decisionView.certaintyLabel || 'לא נקבעה'

  const handleRefine = async () => {
    const safeInstruction = clean(instruction)
    if (!safeInstruction || !onRefine || refining || saving) return

    const updated = await onRefine(safeInstruction)
    if (updated) setInstruction('')
  }

  return (
    <RegularModal
      open={open}
      title='סיפור שחקן'
      description='תצוגה מקדימה לפני שמירה.'
      confirmLabel='אשר ושמור'
      cancelLabel='ביטול'
      busy={saving || refining}
      onConfirm={onApprove}
      onClose={onClose}
    >
      <Box sx={sx.body}>
        <Box sx={sx.storyHeader}>
          <Box sx={sx.storyMark} />
          <Typography level='h3' sx={sx.title}>
            <HighlightedText text={content.title || 'תמונת מצב מקצועית'} presentation={presentation} />
          </Typography>
        </Box>

        <Box sx={sx.decisionCard(decisionView)}>
          <Box sx={sx.decisionHeader}>
            <Typography level='title-sm' sx={sx.decisionTitle}>
              מסקנה מקצועית
            </Typography>

            <Box sx={sx.decisionChips}>
              <DecisionChip
                label={decisionView.action
                  ? decisionView.action.interestLabel
                  : 'מידיות: לא נקבעה'}
                color={decisionView.action ? decisionView.action.color : 'neutral'}
                variant={decisionView.actionStatus === 'immediate' ? 'solid' : 'soft'}
                emphasis={decisionView.actionStatus === 'immediate'}
              />

              <DecisionChip
                label={`ודאות ${certaintyText}`}
                color={decisionView.certaintyLabel === 'גבוהה'
                  ? 'success'
                  : decisionView.certaintyLabel === 'נמוכה'
                    ? 'warning'
                    : 'neutral'}
              />

              <DecisionChip
                label={decisionView.future
                  ? `${decisionView.future.shortLabel}${competitionDetail ? ` · ${competitionDetail}` : ''}`
                  : 'עונה הבאה: לא נקבע'}
                color={decisionView.future ? decisionView.future.color : 'neutral'}
                variant={decisionView.futureOutlook === 'competition_down' ? 'solid' : 'soft'}
                emphasis={decisionView.futureOutlook === 'competition_down'}
              />
            </Box>
          </Box>

          {decisionParagraph ? (
            <Typography level='body-sm' sx={sx.recommendationText}>
              <HighlightedText text={decisionParagraph} presentation={presentation} />
            </Typography>
          ) : null}
        </Box>

        {storyParagraphs.length ? (
          <Box sx={sx.storyBody}>
            {storyParagraphs.map((paragraph, index) => {
              const isLead = index === 0
              const isClosing = index === storyParagraphs.length - 1 && storyParagraphs.length > 1

              return (
                <Box
                  key={`${index}-${paragraph.slice(0, 24)}`}
                  sx={isLead
                    ? sx.leadParagraph
                    : isClosing
                      ? sx.closingParagraph
                      : sx.paragraph}
                >
                  {isClosing ? (
                    <Typography level='body-xs' sx={sx.closingLabel}>
                      מה עדיין צריך לבדוק
                    </Typography>
                  ) : null}

                  <Typography level={isLead ? 'body-lg' : 'body-md'} sx={sx.summary}>
                    <HighlightedText text={paragraph} presentation={presentation} />
                  </Typography>
                </Box>
              )
            })}
          </Box>
        ) : (
          <Typography level='body-md' sx={sx.summary}>
            אין כרגע מספיק מידע להצגת סיפור.
          </Typography>
        )}

        {onRefine ? (
          <Box sx={sx.refineBox}>
            <Typography level='body-xs' sx={sx.refineLabel}>
              חידוד עם AI
            </Typography>

            <Box sx={sx.refineRow}>
              <Textarea
                value={instruction}
                minRows={1}
                maxRows={3}
                placeholder='לדוגמה: קצר יותר, תן יותר דגש על ההקשר ההגנתי...'
                disabled={refining || saving}
                onChange={event => setInstruction(event.target.value)}
                sx={sx.refineInput}
              />

              <Button
                size='sm'
                variant='soft'
                disabled={!clean(instruction) || refining || saving}
                onClick={handleRefine}
                sx={sx.refineButton}
              >
                {refining ? 'מחדד...' : 'חדד'}
              </Button>
            </Box>
          </Box>
        ) : null}
      </Box>
    </RegularModal>
  )
}
