// src/features/tagsHub/components/TagEditorFields.js
import React, { useMemo } from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import TagTypeSelectField from '../../../ui/fields/selectUi/tags/TagTypeSelectField.js'
import TagParentSelectField from '../../../ui/fields/selectUi/tags/TagParentSelectField.js'
import TagNameField from '../../../ui/fields/inputUi/tags/TagNameField.js'
import TagNoteField from '../../../ui/fields/inputUi/tags/TagNoteField.js'
import TagActiveSelector from '../../../ui/fields/checkUi/tags/TagActiveSelector.js'
import TagOrderField from '../../../ui/fields/inputUi/tags/TagOrderField.js'

import { localSx } from './TagEditor.sx.js'
import { safeId, safeStr } from '../../../shared/tags/tags.normalize'

const toStr = (v) => (v == null ? '' : String(v))
const clean = (v) => toStr(v).trim()

export default function TagEditorFields({
  tag,
  form,
  setForm,
  parentOptions,
  isGroup,
  childrenCount,
  usageCount,
  pending,
  errs,
  valid,
}) {
  const typeDisabled = pending || (isGroup && childrenCount > 0) || (!isGroup && usageCount > 0)
  const parentDisabled = pending || !clean(form.tagType)

  const parentOptsFiltered = useMemo(() => {
    const arr = Array.isArray(parentOptions) ? parentOptions : []
    const tt = clean(form.tagType)
    const selfId = safeId(tag?.id)

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
      }))
  }, [parentOptions, form.tagType, tag?.id])

  return (
    <>
      <Box sx={localSx.grid2}>
        <TagTypeSelectField
          value={form.tagType}
          onChange={(v) => setForm((p) => ({ ...p, tagType: v || '', parentId: '' }))}
          disabled={true}
          size="sm"
          label={isGroup ? 'בחירת סוג קטגוריה' : 'בחירת סוג תג'}
          error={!!errs?.tagType}
        />

        {!isGroup ? (
          <TagParentSelectField
            value={form.parentId}
            onChange={(v) => setForm((p) => ({ ...p, parentId: v || '' }))}
            options={parentOptsFiltered}
            disabled={parentDisabled}
            error={!!errs?.parentId}
            size="sm"
            label="בחירת קטגוריה"
          />
        ) : (
          <Box />
        )}
      </Box>

      {isGroup && childrenCount > 0 && (
        <Typography level="body-xs" sx={{ color: 'neutral.200' }}>
          לא ניתן לשנות סוג לקטגוריה עם תגים משויכים ({childrenCount})
        </Typography>
      )}

      {!isGroup && usageCount > 0 && (
        <Typography level="body-xs" sx={{ color: 'neutral.200' }}>
          לא ניתן לשנות סוג לתג שכבר בשימוש ({usageCount})
        </Typography>
      )}

      <Box sx={localSx.grid1}>
        <TagNameField
          value={form.tagName}
          onChange={(v) => setForm((p) => ({ ...p, tagName: v }))}
          disabled={pending}
          error={!!errs?.tagName}
          size="sm"
          label={isGroup ? 'שם קטגוריה' : 'שם תג'}
          placeholder={isGroup ? 'שם קטגוריה' : 'שם תג'}
        />
      </Box>

      <Divider sx={{ my: 2 }}>
        <Typography level="body-sm">{isGroup ? 'פרטי קטגוריה' : 'פרטי התג'}</Typography>
      </Divider>

      <Box sx={localSx.grid3}>
        <TagOrderField
          value={form.order}
          onChange={(v) => setForm((p) => ({ ...p, order: v }))}
          disabled={pending}
          size="sm"
          variant='soft'
          color='success'
        />

        <TagNoteField
          value={form.notes}
          onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
          disabled={pending}
          size="sm"
          maxLength={20}
          label={isGroup ? 'הסבר קטגוריה' : 'הסבר תג'}
        />
      </Box>



      <Box sx={localSx.grid1}>
        <TagActiveSelector
          value={!!form.isActive}
          onChange={(v) => setForm((p) => ({ ...p, isActive: !!v }))}
          disabled={pending}
          size="sm"
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {isGroup && (
          <Typography level="body-xs" sx={{ color: 'neutral.600' }}>
            תגים משויכים: {childrenCount}
          </Typography>
        )}
        <Typography level="body-xs" sx={{ color: 'neutral.600' }}>
          שימושים: {usageCount}
        </Typography>
      </Box>

      {!valid && (
        <Typography level="body-xs" sx={{ color: 'danger.600' }}>
          {isGroup ? 'יש למלא: סוג קטגוריה + שם קטגוריה' : 'יש למלא: סוג תג + קטגוריה + שם תג'}
        </Typography>
      )}
    </>
  )
}
