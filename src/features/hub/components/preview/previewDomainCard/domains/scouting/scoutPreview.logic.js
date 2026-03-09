// hub/components/preview/previewDomainCard/domains/scouting/scoutPreview.logic.js

import { useCallback, useEffect, useMemo, useState } from 'react'

const asArray = (x) => (Array.isArray(x) ? x : [])
export const uniq = (arr) => Array.from(new Set(asArray(arr).filter(Boolean).map(String)))

export const asIdArray = (v) => (Array.isArray(v) ? v.filter(Boolean).map(String) : [])

export const sameArr = (a, b) => {
  const A = uniq(a).sort()
  const B = uniq(b).sort()
  if (A.length !== B.length) return false
  for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return false
  return true
}

export const makeInitDraft = (scout) => ({
  playerName: scout?.playerName || '',
  clubName: scout?.clubName || '',
  teamName: scout?.teamName || '',
  active: scout?.active ?? true,
  phone: scout?.phone || '',
  positions: scout?.positions || [],
  notes: scout?.notes || '',
  ifaLink: scout?.ifaLink || '',
  birth: scout?.birth || '',
  league: scout?.league || ''
})

export function useScoutPreviewDraft(scout) {
  const initDraft = useMemo(() => makeInitDraft(scout), [scout])

  const [draft, setDraft] = useState(initDraft)
  const [baseline, setBaseline] = useState(initDraft)

  useEffect(() => {
    const next = initDraft
    setDraft(next)
    setBaseline(next)
  }, [initDraft])

  const isDirty = useMemo(() => {
    const scoutId = scout?.id || ''
    if (!scoutId) return false
    if (draft.playerName !== baseline.playerName) return true
    if (draft.clubName !== baseline.clubName) return true
    if (draft.teamName !== baseline.teamName) return true
    if (draft.active !== baseline.active) return true
    if (draft.phone !== baseline.phone) return true
    if (draft.league !== baseline.league) return true
    if (draft.ifaLink !== baseline.ifaLink) return true
    if (draft.birth !== baseline.birth) return true
    if (draft.notes !== baseline.notes) return true
    return false
  }, [draft, baseline, scout])

  const buildPatch = useCallback(() => {
    const patch = {}
    if (draft.playerName !== baseline.playerName) patch.playerName = draft.playerName
    if (draft.clubName !== baseline.clubName) patch.clubName = draft.clubName
    if (draft.teamName !== baseline.teamName) patch.teamName = draft.teamName
    if (draft.active !== baseline.active) patch.active = draft.active
    if (draft.phone !== baseline.phone) patch.phone = draft.phone
    if (draft.league !== baseline.league) patch.league = draft.league
    if (draft.ifaLink !== baseline.ifaLink) patch.ifaLink = draft.ifaLink
    if (draft.birth !== baseline.birth) patch.birth = draft.birth
    if (draft.notes !== baseline.notes) patch.notes = draft.notes
    return patch
  }, [draft, baseline])

  const resetDraft = useCallback(() => {
    setDraft(baseline)
  }, [baseline])

  const commitBaseline = useCallback(() => {
    setBaseline(draft)
  }, [draft])

  return {
    draft,
    setDraft,
    baseline,
    setBaseline,
    isDirty,
    buildPatch,
    resetDraft,
    commitBaseline,
  }
}
