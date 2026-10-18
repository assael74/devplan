// src/features/playersDatabase/ui/pages/teamPage/notes/useTeamNotebookDraft.js

import * as React from 'react'
import {
  createFindingDraft,
  createNotebookView,
  EMPTY_FILTERS,
  filterNotebookFindings,
} from './model/teamNotebook.ui.js'

// Ephemeral UI state. No persistence, save callbacks, effects, subscriptions or browser storage.
// The parent mounts a new session on every opening and when teamId changes.
export default function useTeamNotebookDraft({ notes, playerOptions, initialInsightId, initialSeasonId }) {
  const [original] = React.useState(() => createNotebookView(notes))
  const [findings, setFindings] = React.useState(original.findings)
  const [generalText, setGeneralText] = React.useState(original.generalText)
  const [tab, setTab] = React.useState('findings')
  const [selectedId, setSelectedId] = React.useState('')
  const [navigationIds, setNavigationIds] = React.useState([])
  const [filters, setFilters] = React.useState({ ...EMPTY_FILTERS })
  const [showExtraFilters, setShowExtraFilters] = React.useState(false)
  const [confirmClose, setConfirmClose] = React.useState(false)
  const nextDraft = React.useRef(0)

  const originalById = React.useMemo(() => new Map(
    original.findings.map(finding => [finding.id, JSON.stringify(finding)])
  ), [original])
  const dirtyIds = React.useMemo(() => new Set(findings.filter(finding => (
    originalById.get(finding.id) !== JSON.stringify(finding)
  )).map(finding => finding.id)), [findings, originalById])
  const hasChanges = dirtyIds.size > 0 || generalText !== original.generalText
  const visibleFindings = React.useMemo(() => (
    filterNotebookFindings(findings, filters, playerOptions)
  ), [findings, filters, playerOptions])
  const selectedFinding = findings.find(finding => finding.id === selectedId) || null
  const navigationIndex = navigationIds.indexOf(selectedId)

  const selectFinding = id => {
    // Freeze the browsing order while editing so a draft does not jump out of a filter.
    setNavigationIds(visibleFindings.map(finding => finding.id))
    setSelectedId(id)
  }

  const addDraft = () => {
    let id
    do {
      nextDraft.current += 1
      id = `notebook-ui-draft-${nextDraft.current}`
    } while (findings.some(finding => finding.id === id))
    const draft = createFindingDraft({
      id,
      insightId: filters.insightId || initialInsightId,
      seasonId: initialSeasonId,
    })
    setFindings(current => [draft, ...current])
    setNavigationIds([id, ...visibleFindings.map(finding => finding.id)])
    setSelectedId(id)
    setTab('findings')
  }

  const changeFinding = patch => {
    setFindings(current => current.map(finding => (
      finding.id === selectedId ? { ...finding, ...patch } : finding
    )))
  }

  const moveFinding = offset => {
    const target = navigationIds[navigationIndex + offset]
    if (target) setSelectedId(target)
  }

  const changeFilter = (key, value) => setFilters(current => ({ ...current, [key]: value }))

  return {
    findings, generalText, setGeneralText, tab, setTab,
    selectedFinding, visibleFindings, dirtyIds, hasChanges,
    filters, changeFilter, clearFilters: () => setFilters({ ...EMPTY_FILTERS }),
    showExtraFilters, setShowExtraFilters,
    selectedId, selectFinding, backToList: () => setSelectedId(''),
    navigationIndex, navigationCount: navigationIds.length, moveFinding,
    addDraft, changeFinding, confirmClose, setConfirmClose,
  }
}
