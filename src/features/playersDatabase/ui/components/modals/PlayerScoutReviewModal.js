// src/features/playersDatabase/ui/components/modals/PlayerScoutReviewModal.js

import * as React from 'react'
import {
  Box,
  Input,
  Option,
  Select,
  Textarea,
  Typography,
} from '@mui/joy'

import RegularModal from './RegularModal.js'
import { playerScoutReviewModalSx as sx } from './sx/playerScoutReviewModal.sx.js'

const REVIEW_STATUS_OPTIONS = [
  { value: 'unknown', label: 'לא נבדק' },
  { value: 'reviewed', label: 'נבדק' },
]

const YES_NO_UNKNOWN_OPTIONS = [
  { value: 'unknown', label: 'לא ידוע' },
  { value: 'no', label: 'לא' },
  { value: 'yes', label: 'כן' },
]

const IMMEDIACY_OPTIONS = [
  { value: '', label: 'לפי המערכת' },
  { value: 'watch', label: 'מעקב' },
  { value: 'priority', label: 'עדיפות' },
  { value: 'immediate', label: 'מיידי' },
  { value: 'remove', label: 'הסרה' },
]

const MANUAL_REASON_OPTIONS = [
  { value: 'goal_distribution', label: 'פיזור שערים' },
  { value: 'minutes_distribution', label: 'חלוקת דקות' },
  { value: 'visual_review', label: 'צפייה מקצועית' },
  { value: 'agent_status', label: 'מצב סוכן' },
  { value: 'transfer_context', label: 'מעבר קבוצה' },
  { value: 'agent_path_fit', label: 'התאמה למסלול סוכן' },
  { value: 'scout_path_fit', label: 'התאמה למסלול סקאוט' },
  { value: 'profile_not_representative', label: 'הפרופיל לא מייצג' },
  { value: 'other', label: 'אחר' },
]

const buildEntry = (draft, fieldId) => (
  draft?.review?.[fieldId] && typeof draft.review[fieldId] === 'object'
    ? draft.review[fieldId]
    : {}
)

function ReviewObservationField({
  label,
  fieldId,
  draft,
  busy,
  onChange,
}) {
  const entry = buildEntry(draft, fieldId)

  return (
    <Box sx={sx.observationField}>
      <Box sx={sx.observationHeader}>
        <Typography level='body-sm' sx={sx.label}>
          {label}
        </Typography>

        <Select
          size='sm'
          value={entry.status || 'unknown'}
          disabled={busy}
          onChange={(_, value) => onChange(fieldId, {
            ...entry,
            status: value || 'unknown',
          })}
          sx={sx.statusSelect}
        >
          {REVIEW_STATUS_OPTIONS.map(option => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </Box>

      <Textarea
        minRows={2}
        value={entry.note || ''}
        disabled={busy}
        placeholder='הערה מקצועית קצרה'
        onChange={event => onChange(fieldId, {
          ...entry,
          note: event.target.value,
        })}
        sx={sx.textarea}
      />
    </Box>
  )
}

export default function PlayerScoutReviewModal({
  open,
  playerName = '',
  seasonKey = '',
  draft,
  busy = false,
  changed = false,
  onDraftChange,
  onConfirm,
  onClose,
}) {
  const safeDraft = draft || { review: {}, manualDecision: {} }
  const review = safeDraft.review || {}
  const manualDecision = safeDraft.manualDecision || {}
  const position = review.position || {}
  const agentStatus = review.agent_status || {}
  const agentPathFit = review.agent_path_fit || {}
  const scoutPathFit = review.scout_path_fit || {}

  const updateReviewField = React.useCallback((fieldId, nextEntry) => {
    onDraftChange({
      ...safeDraft,
      review: {
        ...review,
        [fieldId]: nextEntry,
      },
    })
  }, [onDraftChange, review, safeDraft])

  const updateManualDecision = patch => {
    onDraftChange({
      ...safeDraft,
      manualDecision: {
        ...manualDecision,
        ...patch,
      },
    })
  }

  return (
    <RegularModal
      open={Boolean(open)}
      title='בדיקת שחקן'
      description={[playerName, seasonKey].filter(Boolean).join(' · ')}
      iconId='profile'
      confirmLabel='שמירה'
      confirmIconId='save'
      size='md'
      busy={busy}
      disabled={!changed}
      contentSx={sx.modalContent}
      onConfirm={onConfirm}
      onClose={onClose}
    >
      <Box sx={sx.content}>
        <Box sx={sx.section}>
          <Typography level='title-sm' sx={sx.sectionTitle}>
            מידע על השחקן
          </Typography>

          <Box sx={sx.twoColumns}>
            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                עמדה
              </Typography>

              <Input
                size='sm'
                value={position.value || ''}
                disabled={busy}
                placeholder='לא ידוע'
                onChange={event => updateReviewField('position', {
                  ...position,
                  value: event.target.value,
                })}
              />
            </Box>

            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                סוכן
              </Typography>

              <Select
                size='sm'
                value={agentStatus.value || 'unknown'}
                disabled={busy}
                onChange={(_, value) => updateReviewField('agent_status', {
                  ...agentStatus,
                  value: value || 'unknown',
                })}
              >
                {YES_NO_UNKNOWN_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Box>

            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                מתאים למסלול סוכן
              </Typography>

              <Select
                size='sm'
                value={agentPathFit.value || 'unknown'}
                disabled={busy}
                onChange={(_, value) => updateReviewField('agent_path_fit', {
                  ...agentPathFit,
                  value: value || 'unknown',
                })}
              >
                {YES_NO_UNKNOWN_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Box>

            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                מתאים למסלול סקאוט
              </Typography>

              <Select
                size='sm'
                value={scoutPathFit.value || 'unknown'}
                disabled={busy}
                onChange={(_, value) => updateReviewField('scout_path_fit', {
                  ...scoutPathFit,
                  value: value || 'unknown',
                })}
              >
                {YES_NO_UNKNOWN_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Box>
          </Box>
        </Box>

        <Box sx={sx.section}>
          <Typography level='title-sm' sx={sx.sectionTitle}>
            בדיקות מקצועיות
          </Typography>

          <ReviewObservationField
            label='פיזור שערים'
            fieldId='goal_distribution'
            draft={safeDraft}
            busy={busy}
            onChange={updateReviewField}
          />

          <ReviewObservationField
            label='חלוקת דקות'
            fieldId='minutes_distribution'
            draft={safeDraft}
            busy={busy}
            onChange={updateReviewField}
          />

          <ReviewObservationField
            label='צפייה בשחקן'
            fieldId='visual_review'
            draft={safeDraft}
            busy={busy}
            onChange={updateReviewField}
          />

          <ReviewObservationField
            label='היסטוריית מעבר קבוצות'
            fieldId='transfer_history'
            draft={safeDraft}
            busy={busy}
            onChange={updateReviewField}
          />
        </Box>

        <Box sx={[sx.section, sx.immediacySection]}>
          <Typography level='title-sm' sx={sx.sectionTitle}>
            החלטת מיידיות ידנית
          </Typography>

          <Typography level='body-xs' sx={sx.helperText}>
            הבחירה הידנית אינה ניקוד. היא קובעת ישירות את המיידיות הסופית ונשמרת עם הסבר.
          </Typography>

          <Box sx={sx.twoColumns}>
            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                החלטה
              </Typography>

              <Select
                size='sm'
                value={manualDecision.actionStatus || ''}
                disabled={busy}
                onChange={(_, value) => updateManualDecision({
                  actionStatus: value || '',
                })}
              >
                {IMMEDIACY_OPTIONS.map(option => (
                  <Option key={option.value || 'automatic'} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Box>

            <Box sx={sx.field}>
              <Typography level='body-sm' sx={sx.label}>
                סיבה
              </Typography>

              <Select
                size='sm'
                value={manualDecision.reason || ''}
                disabled={busy || !manualDecision.actionStatus}
                placeholder='בחירת סיבה'
                onChange={(_, value) => updateManualDecision({
                  reason: value || '',
                })}
              >
                {MANUAL_REASON_OPTIONS.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Box>
          </Box>

          <Textarea
            minRows={2}
            value={manualDecision.note || ''}
            disabled={busy}
            placeholder='הערה אופציונלית להחלטה'
            onChange={event => updateManualDecision({
              note: event.target.value,
            })}
            sx={sx.textarea}
          />
        </Box>
      </Box>
    </RegularModal>
  )
}
