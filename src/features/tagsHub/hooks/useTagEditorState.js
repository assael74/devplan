// src/features/tagsHub/hooks/useTagEditorState.js
import { useMemo, useState, useEffect, useCallback } from 'react'

const toStr = (v) => (v == null ? '' : String(v))
const clean = (v) => toStr(v).trim()

export function buildInitialTagEditorForm(tag) {
  const t = tag || {}
  const isGroup = clean(t.kind) === 'group'

  return {
    tagName: toStr(t.tagName),
    tagType: toStr(t.tagType),
    parentId: isGroup ? '' : toStr(t.parentId),
    notes: toStr(t.notes),
    isActive: t.isActive !== false,
    order: Number.isFinite(Number(t.order)) ? Number(t.order) : 0,
  }
}

export function useTagEditorState({ open, tag }) {
  const initial = useMemo(() => buildInitialTagEditorForm(tag), [tag?.id])
  const [form, setForm] = useState(initial)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  const isGroup = useMemo(() => clean(tag?.kind) === 'group', [tag?.kind])
  const childrenCount = useMemo(() => Number(tag?._meta?.children) || 0, [tag?._meta?.children])
  const usageCount = useMemo(() => Number(tag?._meta?.usage) || 0, [tag?._meta?.usage])

  const reset = useCallback(() => setForm(initial), [initial])

  return { form, setForm, initial, reset, isGroup, childrenCount, usageCount }
}
