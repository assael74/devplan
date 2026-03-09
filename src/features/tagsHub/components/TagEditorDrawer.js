// src/features/tagsHub/components/TagEditorDrawer.js
import React, { useMemo, useCallback } from 'react'
import { Drawer, Sheet, DialogTitle, DialogContent, ModalClose, Divider } from '@mui/joy'

import { useUpdateAction } from '../../../ui/domains/entityActions/updateAction.js'
import { useLifecycle } from '../../../ui/domains/entityLifecycle/LifecycleProvider'
import { getEntityColors } from '../../../ui/core/theme/Colors'

import { sx as pageSx } from '../tags.sx'
import { useTagEditorState } from '../hooks/useTagEditorState'
import { buildComparableTagForm, buildPatch, validateTagEditorForm } from '../utils/tagEditor.patch'

import TagEditorFields from './TagEditorFields'
import TagEditorFooter from './TagEditorFooter'

const toStr = (v) => (v == null ? '' : String(v))
const clean = (v) => toStr(v).trim()

export default function TagEditorDrawer({ open, onClose, tag, parentOptions = [] }) {
  const t = tag || {}
  const lifecycle = useLifecycle()

  const { form, setForm, initial, reset, isGroup, childrenCount, usageCount } = useTagEditorState({ open, tag: t })

  const entityName = useMemo(() => clean(t?.tagName) || (isGroup ? 'קטגוריה' : 'תג'), [t?.tagName, isGroup])

  const initialComparable = useMemo(() => buildComparableTagForm(initial, { isGroup }), [initial, isGroup])
  const nextComparable = useMemo(() => buildComparableTagForm(form, { isGroup }), [form, isGroup])

  const patch = useMemo(() => buildPatch(nextComparable, initialComparable), [nextComparable, initialComparable])
  const dirty = Object.keys(patch).length > 0

  const { ok: valid, errs } = useMemo(
    () => validateTagEditorForm(nextComparable, { isGroup, childrenCount, usageCount }),
    [nextComparable, isGroup, childrenCount, usageCount]
  )

  // Policy guards (type change)
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

  const idColor = useMemo(() => {
    const tt = clean(form.tagType)
    const isAnalysis = tt === 'analysis' || tt === 'videoAnalysis'
    return isAnalysis ? 'videoAnalysis' : 'videoGeneral'
  }, [form.tagType])

  const typeColor = useMemo(() => getEntityColors(idColor).bg, [idColor])

  const onCloseAndReset = useCallback(() => {
    reset()
    onClose()
  }, [reset, onClose])

  const onSave = useCallback(async () => {
    if (!t?.id) return
    if (!dirty || pending) return
    if (!valid) return
    if (blockTypeChange) return

    const nextPatch = { ...patch }
    if (!isGroup && nextPatch.tagType != null) nextPatch.parentId = null

    await runUpdate(nextPatch, { section: 'tagEditorDrawer' })
    onClose()
  }, [t?.id, dirty, pending, valid, blockTypeChange, patch, isGroup, runUpdate, onClose])

  const onDelete = useCallback(() => {
    if (!t?.id) return
    lifecycle.openLifecycle({ entityType: 'tag', id: t.id, name: entityName }, t._meta)
  }, [lifecycle, t?.id, entityName, t?._meta])

  return (
    <Drawer
      size="md"
      variant="plain"
      open={!!open}
      onClose={onCloseAndReset}
      slotProps={{ content: { sx: { bgcolor: 'transparent', p: { md: 2, sm: 0 }, boxShadow: 'none' } } }}
    >
      <Sheet sx={pageSx.drawerSheet(typeColor)}>
        <DialogTitle sx={pageSx.drawerTitle}>
          {isGroup ? `עריכת קטגוריה: ${entityName}` : `עריכת תג: ${entityName}`}
        </DialogTitle>
        <ModalClose />

        <DialogContent sx={{ gap: 1.25, pt: 4 }}>
          <TagEditorFields
            tag={t}
            form={form}
            setForm={setForm}
            parentOptions={parentOptions}
            isGroup={isGroup}
            childrenCount={childrenCount}
            usageCount={usageCount}
            pending={pending}
            errs={errs}
            valid={valid}
          />
        </DialogContent>

        <Divider sx={{ mt: 'auto' }} />

        <TagEditorFooter
          isGroup={isGroup}
          childrenCount={childrenCount}
          dirty={dirty}
          pending={pending}
          valid={valid}
          blockTypeChange={blockTypeChange}
          typeColor={typeColor}
          idColor={idColor}
          onDelete={onDelete}
          onReset={reset}
          onClose={onCloseAndReset}
          onSave={onSave}
        />
      </Sheet>
    </Drawer>
  )
}
