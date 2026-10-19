// src/features/playersDatabase/ui/pages/teamPage/notes/useTeamNotebookDraft.js

import * as React from 'react'
import { TEAM_NOTE_SECTION_IDS } from '../../../../model/team/teamNotes.model.js'
import { mentionContentText, mentionIds, normalizeMentionContent } from '../../../../../../ui/patterns/mentions/mentionContent.model.js'
import { TEAM_INSIGHTS } from '../information/model/teamWorkspace.navigation.js'
import { PLAYERS_DATABASE_UI_ROUTES } from '../../../logic/routeBuilders.js'

const routeLabels = [
  'מסלול ביצוע',
  'מסלול איזון',
  'תנועת שנתון',
  'שינוי בצפי תחרות',
  'השנתון בתוך המועדון',
]

export const NOTEBOOK_STEPS = Object.freeze([
  ...TEAM_INSIGHTS.map((route, index) => ({
    id: route.id,
    label: routeLabels[index],
    title: route.title,
  })),
  { id: 'general', label: 'הערות כלליות', title: 'הערות כלליות' },
  { id: 'summary', label: 'סיכום', title: 'סיכום המחברת' },
])

const editableSteps = NOTEBOOK_STEPS.filter(step => TEAM_NOTE_SECTION_IDS.includes(step.id))
const initialIndicator = notes => Boolean(notes && typeof notes === 'object' && notes.showInvestigationIndicator === true)
const initialContents = (notes, mentionOptions, teamId) => {
  const source = notes && typeof notes === 'object' ? notes : {}
  const generalText = typeof notes === 'string' ? notes : source.generalText
  const mentionLinks = new Map(mentionOptions.map(option => [option.id, option.href]))
  return Object.fromEntries(editableSteps.map(step => [step.id, normalizeMentionContent(
    Array.isArray(source[step.id]?.content)
      ? source[step.id].content.map(part => part.type === 'mention'
        ? {
          ...part,
          href: mentionLinks.get(part.id) || PLAYERS_DATABASE_UI_ROUTES.player({
            playerId: part.id,
            teamId,
          }),
        }
        : part)
      : step.id === 'general'
      ? (typeof generalText === 'string' ? generalText : '')
      : (typeof source.routeTextsById?.[step.id] === 'string' ? source.routeTextsById[step.id] : '')
  )]))
}

export default function useTeamNotebookDraft({
  open,
  notes,
  mentionOptions,
  teamId,
  initialInsightId,
}) {
  const [original, setOriginal] = React.useState(() => initialContents(notes, mentionOptions, teamId))
  const [contentsById, setContentsById] = React.useState(original)
  const [originalIndicator, setOriginalIndicator] = React.useState(() => initialIndicator(notes))
  const [showInvestigationIndicator, setShowInvestigationIndicator] = React.useState(originalIndicator)
  const [stepIndex, setStepIndex] = React.useState(() => {
    const index = NOTEBOOK_STEPS.findIndex(step => step.id === initialInsightId)
    return index >= 0 && index < editableSteps.length ? index : 0
  })
  const [confirmClose, setConfirmClose] = React.useState(false)
  const wasOpen = React.useRef(false)
  const dirtyIds = editableSteps.filter(step => (
    JSON.stringify(contentsById[step.id]) !== JSON.stringify(original[step.id])
  )).map(step => step.id)
  const textsById = Object.fromEntries(editableSteps.map(step => [
    step.id,
    mentionContentText(contentsById[step.id]),
  ]))
  const relatedPlayerIdsById = Object.fromEntries(editableSteps.map(step => [
    step.id,
    mentionIds(contentsById[step.id]),
  ]))

  React.useEffect(() => {
    if (open && !wasOpen.current) {
      const nextContents = initialContents(notes, mentionOptions, teamId)
      const index = NOTEBOOK_STEPS.findIndex(step => step.id === initialInsightId)
      setOriginal(nextContents)
      setContentsById(nextContents)
      setOriginalIndicator(initialIndicator(notes))
      setShowInvestigationIndicator(initialIndicator(notes))
      setStepIndex(index >= 0 && index < editableSteps.length ? index : 0)
      setConfirmClose(false)
    }
    wasOpen.current = open
  }, [open, notes, mentionOptions, teamId, initialInsightId])

  const selectStep = index => {
    if (index < 0 || index >= NOTEBOOK_STEPS.length) return
    setStepIndex(index)
  }

  const changeContent = (id, value) => {
    if (!(id in original)) return
    setContentsById(current => ({ ...current, [id]: normalizeMentionContent(value) }))
  }

  return {
    textsById,
    contentsById,
    relatedPlayerIdsById,
    showInvestigationIndicator,
    setShowInvestigationIndicator,
    stepIndex,
    selectStep,
    changeContent,
    dirtyIds,
    hasChanges: dirtyIds.length > 0 || showInvestigationIndicator !== originalIndicator,
    confirmClose,
    setConfirmClose,
  }
}
