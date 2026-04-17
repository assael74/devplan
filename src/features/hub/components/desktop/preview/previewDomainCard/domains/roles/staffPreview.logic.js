// C:\projects\devplan\src\features\hub\components\preview\previewDomainCard\domains\roles\staffPreview.logic.js

import { useCallback, useEffect, useMemo, useState } from 'react'
import { STAFF_ROLE_OPTIONS } from '../../../../../../../../shared/roles/roles.constants.js'

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

const buildMetaMap = () => {
  const m = new Map()
  for (const opt of STAFF_ROLE_OPTIONS) m.set(opt.id, opt)
  return m
}

export const makeInitDraft = (staff) => ({
  fullName: staff?.fullName || '',
  type: staff?.type || '',
  clubsId: asIdArray(staff?.clubsId),
  teamsId: asIdArray(staff?.teamsId),
  active: staff?.active ?? true,
  phone: staff?.phone || '',
  email: staff?.email || '',
  photo: staff?.photo || '',
})

const cloneDraft = (d) => ({
  ...d,
  clubsId: Array.isArray(d?.clubsId) ? [...d.clubsId] : [],
  teamsId: Array.isArray(d?.teamsId) ? [...d.teamsId] : [],
})

export function useStaffPreviewDraft(staff) {
  const initDraft = useMemo(() => makeInitDraft(staff), [staff])

  const [draft, setDraft] = useState(initDraft)
  const [baseline, setBaseline] = useState(initDraft)

  useEffect(() => {
    const next = cloneDraft(initDraft)
    setDraft(next)
    setBaseline(next)
  }, [initDraft])

  const isDirty = useMemo(() => {
    const staffId = staff?.id || ''
    if (!staffId) return false
    if (draft.fullName !== baseline.fullName) return true
    if (draft.type !== baseline.type) return true
    if (!sameArr(draft.clubsId, baseline.clubsId)) return true
    if (!sameArr(draft.teamsId, baseline.teamsId)) return true
    if (draft.active !== baseline.active) return true
    if (draft.phone !== baseline.phone) return true
    if (draft.email !== baseline.email) return true
    return false
  }, [draft, baseline, staff])

  const buildPatch = useCallback(() => {
    const patch = {}
    if (draft.fullName !== baseline.fullName) patch.fullName = draft.fullName
    if (draft.type !== baseline.type) patch.type = draft.type
    if (!sameArr(draft.clubsId, baseline.clubsId)) patch.clubsId = uniq(draft.clubsId)
    if (!sameArr(draft.teamsId, baseline.teamsId)) patch.teamsId = uniq(draft.teamsId)
    if (draft.active !== baseline.active) patch.active = draft.active
    if (draft.phone !== baseline.phone) patch.phone = draft.phone
    if (draft.email !== baseline.email) patch.email = draft.email
    return patch
  }, [draft, baseline])

  const resetDraft = useCallback(() => {
    setDraft(cloneDraft(baseline))
  }, [baseline])

  const commitBaseline = useCallback(() => {
    setBaseline(cloneDraft(draft))
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

export function useStaffRoleMeta(type) {
  const metaById = useMemo(buildMetaMap, [])
  return useMemo(() => (type ? metaById.get(type) : null), [metaById, type])
}
