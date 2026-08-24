// src/features/playersDatabase/ui/components/modals/PlayerNarrativeModal.js

import * as React from 'react'

import { Box, Button, Chip, Textarea, Typography } from '@mui/joy'

import RegularModal from './RegularModal.js'
import { playerNarrativeModalSx as sx } from './sx/playerNarrativeModal.sx.js'
import { formatNarrativeTextNumbers } from '../../logic/narrativeText.logic.js'

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
    label: 'בדיקה מיידית',
    color: 'success',
    variant: 'solid',
  },
  priority: {
    label: 'עדיפות גבוהה לבדיקה',
    color: 'success',
    variant: 'soft',
  },
  watch: {
    label: 'מעקב',
    color: 'neutral',
    variant: 'soft',
  },
  exposed: {
    label: 'מעקב · חשיפה גבוהה',
    color: 'primary',
    variant: 'soft',
  },
}

const INTEREST_VIEW = {
  super_interesting: {
    label: 'מעניין מאוד',
    color: 'success',
    variant: 'solid',
  },
  interesting: {
    label: 'מעניין',
    color: 'primary',
    variant: 'soft',
  },
  reasonable: {
    label: 'עניין מוגבל',
    color: 'neutral',
    variant: 'soft',
  },
}

const FUTURE_OUTLOOK_VIEW = {
  competition_down: {
    label: '↓ רמת התחרות צפויה לרדת',
    color: 'warning',
    variant: 'solid',
  },
  competition_up: {
    label: '↑ רמת התחרות צפויה לעלות',
    color: 'primary',
    variant: 'soft',
  },
  competition_stable: {
    label: '→ התחרות צפויה להישאר דומה',
    color: 'neutral',
    variant: 'soft',
  },
  competition_mixed: {
    label: '↔ תחזית התחרות מעורבת',
    color: 'neutral',
    variant: 'soft',
  },
}

const STRENGTH_LABELS = {
  elite: 'חריג',
  very_high: 'גבוה מאוד',
  high: 'גבוה',
  strong: 'חזק',
  medium: 'בינוני',
  moderate: 'בינוני',
  low: 'נמוך',
  weak: 'חלש',
}

function clean(value) {
  return String(value || '').trim()
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function normalizeEntities(presentation = {}) {
  const entities = Array.isArray(presentation?.entities)
    ? presentation.entities
    : []
  const seen = new Set()

  return entities
    .map(entity => ({
      type: clean(entity?.type),
      label: clean(entity?.label),
    }))
    .filter(entity => {
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

  return new RegExp(`(${entities.map(entity => escapeRegExp(entity.label)).join('|')})`, 'giu')
}

function findEntity(entities, value) {
  const normalized = clean(value).toLocaleLowerCase('he')
  return entities.find(entity => entity.label.toLocaleLowerCase('he') === normalized) || null
}

function resolveStrengthLabel(value) {
  if (value === null || value === undefined || value === '') return ''

  if (typeof value === 'number') return String(Math.round(value))
  if (typeof value === 'string') return STRENGTH_LABELS[clean(value)] || clean(value)
  if (typeof value !== 'object') return ''

  const depthPct = Number(value.depthPct)
  if (Number.isFinite(depthPct)) return `עומק פרופיל ${Math.round(depthPct)}%`

  if (value.primaryProfileStrength) {
    return resolveStrengthLabel(value.primaryProfileStrength)
  }

  const candidate = value.label || value.level || value.band || value.status || value.strength
  if (candidate !== null && candidate !== undefined && candidate !== '') {
    return STRENGTH_LABELS[clean(candidate)] || clean(candidate)
  }

  const numeric = value.score !== undefined ? value.score : value.value
  if (numeric === null || numeric === undefined || numeric === '') return ''

  const number = Number(numeric)
  return Number.isFinite(number) ? String(Math.round(number)) : clean(numeric)
}

function resolveDecisionView(content = {}, presentation = {}) {
  const action = content.action || {}
  const conclusion = content.conclusion || {}
  const decision = presentation?.decision || {}
  const actionStatus = clean(action.status || decision.actionStatus)
  const interestLevel = clean(conclusion.interestLevel || decision.interestLevel)
  const resolvedFutureOutlook = clean(decision.futureOutlook)
  const futureOutlook = resolvedFutureOutlook === 'competition_stable'
    ? ''
    : resolvedFutureOutlook

  return {
    interestLevel,
    interest: INTEREST_VIEW[interestLevel] || null,
    actionStatus,
    action: ACTION_VIEW[actionStatus] || null,
    actionText: clean(action.text),
    isManual: Boolean(action.isManual || decision.hasManualDecision),
    automaticStatus: clean(action.automaticStatus || decision.automaticActionStatus),
    manualStatus: clean(action.manualStatus || decision.manualActionStatus),
    futureOutlook,
    future: FUTURE_OUTLOOK_VIEW[futureOutlook] || null,
    profileLabel: clean(conclusion.primaryProfile?.profileLabel),
    profileStrength: resolveStrengthLabel(conclusion.profileStrength),
    caseStrength: resolveStrengthLabel(conclusion.caseStrength),
  }
}


function resolveDecisionCallout(decision = {}) {
  if (decision.actionStatus === 'immediate') {
    return 'מומלץ לקדם בדיקה מיידית של השחקן.'
  }

  if (decision.actionStatus === 'priority') {
    return 'המידע הקיים מצדיק מעבר ממעקב לבדיקה ממוקדת.'
  }

  return ''
}

function resolveLegacyContent(content = {}) {
  const summary = clean(content.summary)
  const paragraphs = summary
    .split(/\n\s*\n/)
    .map(item => item.trim())
    .filter(Boolean)

  return {
    conclusionText: clean(content.conclusion?.text) || paragraphs[0] || '',
    whyInteresting: clean(content.whyInteresting) || paragraphs[1] || '',
    professionalContext: clean(content.professionalContext) || paragraphs[2] || '',
    strengths: Array.isArray(content.strengths) ? content.strengths.map(clean).filter(Boolean) : [],
    unknowns: Array.isArray(content.unknowns) ? content.unknowns.map(clean).filter(Boolean) : [],
  }
}

function HighlightedText({ text, presentation }) {
  const safeText = formatNarrativeTextNumbers(text)
  const entities = normalizeEntities(presentation)
  const regex = buildHighlightRegex(entities)
  if (!regex) return safeText

  return safeText.split(regex).map((part, index) => {
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

function NarrativeSection({ title, text, presentation, emphasis = false }) {
  if (!clean(text)) return null

  return (
    <Box sx={emphasis ? sx.leadSection : sx.section}>
      <Typography level='body-xs' sx={sx.sectionLabel}>
        {title}
      </Typography>
      <Typography level={emphasis ? 'body-lg' : 'body-md'} sx={sx.sectionText}>
        <HighlightedText text={text} presentation={presentation} />
      </Typography>
    </Box>
  )
}

function NarrativeListSection({ title, items, presentation }) {
  const safeItems = Array.isArray(items) ? items.map(clean).filter(Boolean) : []
  if (!safeItems.length) return null

  return (
    <Box sx={sx.section}>
      <Typography level='body-xs' sx={sx.sectionLabel}>
        {title}
      </Typography>

      <Box sx={sx.list}>
        {safeItems.map((item, index) => (
          <Box key={`${index}-${item.slice(0, 24)}`} sx={sx.listItem}>
            <Box component='span' sx={sx.listBullet}>•</Box>
            <Typography level='body-md' sx={sx.sectionText}>
              <HighlightedText text={item} presentation={presentation} />
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export function PlayerNarrativeContent({ content = {}, presentation = null }) {
  const structured = resolveLegacyContent(content)
  const decisionView = resolveDecisionView(content, presentation)
  const decisionCallout = resolveDecisionCallout(decisionView)

  return (
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
              label={decisionView.interest ? decisionView.interest.label : ''}
              color={decisionView.interest ? decisionView.interest.color : 'neutral'}
              variant={decisionView.interest ? decisionView.interest.variant : 'soft'}
              emphasis={decisionView.interestLevel === 'super_interesting'}
            />

            <DecisionChip
              label={decisionView.action ? decisionView.action.label : 'פעולה: לא נקבעה'}
              color={decisionView.action ? decisionView.action.color : 'neutral'}
              variant={decisionView.action ? decisionView.action.variant : 'soft'}
              emphasis={decisionView.actionStatus === 'immediate' || decisionView.actionStatus === 'priority'}
            />

            <DecisionChip
              label={decisionView.profileStrength
                ? `חוזק פרופיל · ${decisionView.profileStrength}`
                : ''}
            />

            <DecisionChip
              label={decisionView.future ? decisionView.future.label : ''}
              color={decisionView.future ? decisionView.future.color : 'neutral'}
              variant={decisionView.future ? decisionView.future.variant : 'soft'}
              emphasis={decisionView.futureOutlook === 'competition_down'}
            />

            {decisionView.isManual ? (
              <DecisionChip label='החלטה ידנית' color='warning' variant='outlined' />
            ) : null}
          </Box>
        </Box>

        {decisionCallout ? (
          <Typography level='title-sm' sx={sx.decisionCallout(decisionView)}>
            {decisionCallout}
          </Typography>
        ) : null}

        {decisionView.profileLabel ? (
          <Typography level='body-xs' sx={sx.primaryProfileText}>
            פרופיל מרכזי: <HighlightedText text={decisionView.profileLabel} presentation={presentation} />
          </Typography>
        ) : null}

        {structured.conclusionText ? (
          <Typography level='body-sm' sx={sx.recommendationText}>
            <HighlightedText text={structured.conclusionText} presentation={presentation} />
          </Typography>
        ) : null}
      </Box>

      <Box sx={sx.storyBody}>
        <NarrativeSection
          title='למה הוא מעניין'
          text={structured.whyInteresting}
          presentation={presentation}
          emphasis
        />

        <NarrativeSection
          title='הקשר מקצועי'
          text={structured.professionalContext}
          presentation={presentation}
        />

        <NarrativeListSection
          title='מה מחזק את העניין'
          items={structured.strengths}
          presentation={presentation}
        />

        <NarrativeListSection
          title='מה עדיין צריך לבדוק'
          items={structured.unknowns}
          presentation={presentation}
        />

        <Box sx={sx.actionSection(decisionView)}>
          <Box sx={sx.actionHeader}>
            <Typography level='body-xs' sx={sx.sectionLabel}>
              מה עושים עכשיו
            </Typography>
            {decisionView.isManual ? (
              <Chip size='sm' variant='outlined' color='warning'>
                החלטה ידנית
              </Chip>
            ) : null}
          </Box>

          <Typography level='body-md' sx={sx.actionText}>
            {decisionView.actionText || 'לא נקבעה כרגע המלצת פעולה במודל הסקאוט.'}
          </Typography>
        </Box>
      </Box>
    </Box>
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
      description='טיוטה לעבודה. הסיפור המאושר ישתנה רק לאחר שמירה מפורשת.'
      confirmLabel='שמור כסיפור מאושר'
      cancelLabel='ביטול'
      busy={saving || refining}
      onConfirm={onApprove}
      onClose={onClose}
    >
      <PlayerNarrativeContent
        content={content}
        presentation={presentation}
      />

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
    </RegularModal>
  )
}
