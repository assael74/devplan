// src/features/tagsHub/sharedUi/TagEditorDrawer.js

import React, { useMemo, useCallback } from 'react'

import DrawerShell from '../../../ui/patterns/drawer/DrawerShell'
import DrawerHeaderShell from '../../../ui/patterns/drawer/DrawerHeaderShell'
import TagsCreateFields from '../../../ui/forms/ui/tags/TagsCreateFields.js'

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'
import { useLifecycle } from '../../../ui/domains/entityLifecycle/LifecycleProvider'

import { useTagEditorState } from '../hooks/useTagEditorState'
import {
  buildComparableTagForm,
  buildPatch,
  validateTagEditorForm,
} from '../utils/tagEditor.patch.js'

import { safeId, safeStr } from '../../../shared/tags/tags.normalize'

const toStr = (v) => (v == null ? '' : String(v))
const clean = (v) => toStr(v).trim()

function getTagEntityId(tagType) {
  const tt = clean(tagType)
  const isAnalysis = tt === 'analysis' || tt === 'videoAnalysis'
  return isAnalysis ? 'videoAnalysis' : 'videoGeneral'
}

function buildEditorLayout(isMobile) {
  return {
    topCols: '1fr',
    mainCols: isMobile ? '1fr 1fr' : '1fr 1fr',
    metaCols: isMobile ? '.8fr 1.2fr' : '1fr 1fr',
  }
}

export default function TagEditorDrawer({
  open,
  onClose,
  tag,
  parentOptions = [],
  isMobile = false,
}) {
  const t = tag || {}
  const lifecycle = useLifecycle()

  const {
    form,
    setForm,
    initial,
    reset,
    isGroup,
    childrenCount,
    usageCount,
  } = useTagEditorState({ open, tag: t })

  const entityName = useMemo(() => {
    return clean(t?.tagName) || (isGroup ? 'קטגוריה' : 'תג')
  }, [t?.tagName, isGroup])

  const idColor = useMemo(() => {
    return getTagEntityId(form.tagType)
  }, [form.tagType])

  const editorLayout = useMemo(() => {
    return buildEditorLayout(isMobile)
  }, [isMobile])

  const initialComparable = useMemo(() => {
    return buildComparableTagForm(initial, { isGroup })
  }, [initial, isGroup])

  const nextComparable = useMemo(() => {
    return buildComparableTagForm(form, { isGroup })
  }, [form, isGroup])

  const patch = useMemo(() => {
    return buildPatch(nextComparable, initialComparable)
  }, [nextComparable, initialComparable])

  const dirty = Object.keys(patch).length > 0

  const { ok: valid, errs } = useMemo(() => {
    return validateTagEditorForm(nextComparable, {
      isGroup,
      childrenCount,
      usageCount,
    })
  }, [nextComparable, isGroup, childrenCount, usageCount])

  const typeChange = patch.tagType != null

  const blockTypeChange =
    (isGroup && childrenCount > 0 && typeChange) ||
    (!isGroup && usageCount > 0 && typeChange)

  const { runUpdate, pending } = useUpdateAction({
    routerEntityType: 'tags',
    snackEntityType: 'tag',
    id: t?.id,
    entityName,
    requireAnyUpdated: true,
    createIfMissing: false,
  })

  const canSave = Boolean(t?.id) && dirty && valid && !blockTypeChange && !pending

  const deleteDisabled = pending || (isGroup && childrenCount > 0)

  const parentOptsFiltered = useMemo(() => {
    const arr = Array.isArray(parentOptions) ? parentOptions : []
    const tt = clean(form.tagType)
    const selfId = safeId(t?.id)

    return arr
      .filter((x) => safeId(x?.id) && safeId(x?.id) !== selfId)
      .filter((x) => x?.isActive !== false)
      .filter((x) => (tt ? clean(x?.tagType) === tt : true))
      .filter((x) => clean(x?.kind) === 'group')
      .map((x) => ({
        id: safeId(x.id),
        value: safeId(x.id),
        labelH: safeStr(x.tagName || x.slug || x.id),
        idIcon: x.iconId || 'tags',
        color: x.color || '',
        tagType: x.tagType || '',
        isActive: x.isActive !== false,
      }))
  }, [parentOptions, form.tagType, t?.id])

  const validity = useMemo(() => {
    return {
      kind: isGroup ? 'group' : 'tag',
      isGroup,
      tagName: form.tagName || '',
      tagType: form.tagType || '',
      parentId: form.parentId || '',
      notes: form.notes || '',
      order: form.order ?? 0,
      isActive: form.isActive !== false,
      parentOptions: parentOptsFiltered,
      errors: errs || {},
      isValid: valid,
    }
  }, [
    isGroup,
    form.tagName,
    form.tagType,
    form.parentId,
    form.notes,
    form.order,
    form.isActive,
    parentOptsFiltered,
    errs,
    valid,
  ])

  const onCloseAndReset = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const onSave = useCallback(async () => {
    if (!canSave) return

    const nextPatch = { ...patch }

    if (!isGroup && nextPatch.tagType != null) {
      nextPatch.parentId = null
    }

    await runUpdate(nextPatch, {
      section: isMobile ? 'tagEditorDrawerMobile' : 'tagEditorDrawer',
    })

    onClose()
  }, [canSave, patch, isGroup, runUpdate, onClose, isMobile])

  const handleDelete = useCallback(() => {
    if (!tag?.id) return

    lifecycle.openLifecycle(
      {
        entityType: 'tag',
        id: tag.id,
        name: `${tag?.tagName}`,
      },
      {
        onAfterSuccess: ({ action, entityType, id }) => {
          if (action !== 'delete') return
          if (entityType !== 'tag') return
          if (id !== tag.id) return

          onClose()
        },
      }
    )
  }, [lifecycle, tag?.id, tag?.tagName, onClose])

  const title = isGroup
    ? `עריכת קטגוריה: ${entityName}`
    : `עריכת תג: ${entityName}`

  const header = (
    <DrawerHeaderShell
      entity={idColor}
      title={title}
      subline={isGroup ? 'ניהול קטגוריית תגיות' : 'ניהול תג משויך'}
      titleIconId={isGroup ? 'parents' : 'children'}
      meta={
        isGroup
          ? `תגים משויכים: ${childrenCount} · שימושים: ${usageCount}`
          : `שימושים: ${usageCount}`
      }
      metaIconId="analytics"
      chipLabel={form.isActive ? 'פעיל' : 'בארכיון'}
      chipColor={form.isActive ? '#16A34A' : '#6B7280'}
      chipIconId={form.isActive ? 'check' : 'archive'}
    />
  )

  return (
    <DrawerShell
      open={open}
      onClose={onCloseAndReset}
      header={header}
      entity={idColor}
      anchor={isMobile ? 'bottom' : 'right'}
      size={isMobile ? 'lg' : 'md'}
      saving={pending}
      isDirty={dirty}
      canSave={canSave}
      saveIconId={idColor}
      actions={{
        onSave,
        onReset: reset,
        onDelete: handleDelete,
      }}
      texts={{
        save: 'שמור',
        saving: 'שומר...',
        cancel: 'סגור',
        statusSaving: 'שומר את עדכון התג...',
        statusDirty: 'יש שינויים שלא נשמרו',
        statusClean: 'אין שינויים',
      }}
      tooltips={{
        reset: 'איפוס שינויים',
        delete: isGroup ? 'מחיקת קטגוריה' : 'מחיקת תג',
      }}
      status={{
        text: blockTypeChange
          ? 'לא ניתן לשנות סוג לתג או קטגוריה שכבר בשימוש'
          : !valid
            ? isGroup
              ? 'יש למלא סוג קטגוריה ושם קטגוריה'
              : 'יש למלא סוג תג, קטגוריה ושם תג'
            : undefined,
        color: blockTypeChange || !valid ? 'danger' : undefined,
      }}
      deleteButtonProps={{
        disabled: deleteDisabled,
      }}
    >
      <TagsCreateFields
        mode="edit"
        draft={form}
        onDraft={setForm}
        layout={editorLayout}
        validity={validity}
        disabled={pending}
        showKindSelector={false}
        showOrder
        showActive
        lockTagType
      />
    </DrawerShell>
  )
}
