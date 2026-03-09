// src/features/tagsHub/utils/tagEditor.patch.js
const toStr = (v) => (v == null ? '' : String(v))
const clean = (v) => toStr(v).trim()

export function buildComparableTagForm(form, { isGroup }) {
  const f = form || {}
  return {
    tagName: clean(f.tagName) || null,
    tagType: clean(f.tagType) || null,
    parentId: isGroup ? null : clean(f.parentId) || null,
    notes: clean(f.notes) || null,
    isActive: !!f.isActive,
    order: Number.isFinite(Number(f.order)) ? Number(f.order) : 0,
  }
}

export function buildPatch(nextComparable, initialComparable) {
  const patch = {}
  Object.keys(nextComparable || {}).forEach((k) => {
    if (nextComparable[k] !== initialComparable[k]) patch[k] = nextComparable[k]
  })
  return patch
}

export function validateTagEditorForm(nextComparable, { isGroup, childrenCount, usageCount }) {
  const errs = {}

  if (!nextComparable.tagType) errs.tagType = true
  if (!nextComparable.tagName) errs.tagName = true
  if (!isGroup && !nextComparable.parentId) errs.parentId = true

  // guards:
  // 1) group with children cannot change type (to avoid tree break)
  if (isGroup && childrenCount > 0) {
    // tagType change is detected at patch phase; here only a hint
  }

  // 2) child tag changing type is risky if in use (recommended block)
  if (!isGroup && usageCount > 0) {
    // optional policy: block type change when usage > 0 (handled in drawer with initial compare)
  }

  return { ok: Object.keys(errs).length === 0, errs }
}
