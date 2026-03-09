// ui/forms/TagsCreateForm.js
import React, { useEffect, useMemo } from 'react'
import { Box, Sheet, Divider, Typography } from '@mui/joy'
import { vaSx } from './sx/form.sx.js'

import TagTypeSelectField from '../fields/selectUi/tags/TagTypeSelectField.js'
import TagParentSelectField from '../fields/selectUi/tags/TagParentSelectField.js'
import TagNameField from '../fields/inputUi/tags/TagNameField.js'
import TagNoteField from '../fields/inputUi/tags/TagNoteField.js'
import TagKindSelectField from '../fields/checkUi/tags/TagKindSelectField.js'

import { buildParentOptions } from '../../shared/tags'

const clean = (v) => String(v ?? '').trim()
const NOTE_MAX = 20

export default function TagsCreateForm({
  draft,
  onDraft,
  onValidChange,
  context,
  disabled = false,
}) {
  const d = draft || {}
  const tags = context.tags

  const kind = d.kind ?? 'tag'
  const isGroup = kind === 'group'

  const parentOptions = useMemo(() => {
    return buildParentOptions({
      tags,
      currentTagId: '',
      tagType: draft?.tagType,
      includeArchived: false,
      lockParentIfHasChildren: true,
    })
  }, [tags, draft?.tagType])

  const tagName = d.tagName ?? ''
  const tagType = d.tagType ?? ''
  const parentId = d.parentId ?? ''
  const notes = String(d.notes ?? '')

  const errors = useMemo(() => {
    const e = {}
    if (!clean(tagType)) e.tagType = true
    if (!clean(tagName)) e.tagName = true
    if (!isGroup && !clean(parentId)) e.parentId = true
    return e
  }, [tagType, tagName, parentId, isGroup])

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors])

  useEffect(() => {
    if (typeof onValidChange === 'function') onValidChange(isValid)
  }, [isValid, onValidChange])

  const patch = (p) => onDraft({ ...d, ...p })

  const parentOptsFiltered = useMemo(() => {
    const arr = Array.isArray(parentOptions) ? parentOptions : []
    return arr
      .filter((o) => o && (o.isActive !== false))
      .filter((o) => !tagType || clean(o.tagType) === tagType)
      .filter((o) => clean(o.id) !== clean(d.id))
  }, [parentOptions, tagType, d.id])

  return (
    <Box sx={vaSx.root}>
      <Sheet variant="outlined" sx={{ p: 1.25, borderRadius: 12 }}>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TagKindSelectField
            value={draft?.kind ?? 'tag'}
            onChange={(val) => onDraft({ ...draft, kind: val, parentId: '' })}
            disabled={disabled}
            size="sm"
          />
        </Box>

        <Divider sx={vaSx.divider}>
          <Typography level="body-sm">{isGroup ? 'סוג קטגוריה' : 'סוג התג'}</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TagTypeSelectField
            value={tagType}
            onChange={(val) => patch({ tagType: val || '', parentId: '' })}
            required
            label={isGroup ? 'בחירת סוג הקטגוריה' : 'בחירת סוג התג'}
            error={Boolean(errors.tagType)}
            disabled={disabled}
            size="sm"
          />

          {!isGroup && (
            <TagParentSelectField
              value={parentId}
              onChange={(val) => patch({ parentId: val || '' })}
              options={parentOptsFiltered}
              size="sm"
              error={Boolean(errors.parentId)}
            />
          )}
        </Box>

        <Divider sx={vaSx.divider}>
          <Typography level="body-sm">{isGroup ? 'פרטי קטגוריה' : 'פרטי התג'}</Typography>
        </Divider>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
          <TagNameField
            value={tagName}
            onChange={(val) => patch({ tagName: val })}
            required
            placeholder={isGroup ? 'שם קטגוריה' : 'שם תג'}
            label={isGroup ? 'שם קטגוריה' : 'שם תג'}
            error={Boolean(errors.tagName)}
            disabled={disabled}
            size="sm"
          />

          <TagNoteField
            value={notes}
            onChange={(val) => patch({ notes: val })}
            disabled={disabled}
            size="sm"
            label={isGroup ? 'הסבר קטגוריה' : 'הסבר תג'}
            maxLength={NOTE_MAX}
          />
        </Box>

        {!isValid && (
          <Typography level="body-xs" sx={{ mt: 1, color: 'danger.600' }}>
            {isGroup
              ? `יש למלא: סוג תג + שם קטגוריה. (הסבר: עד ${NOTE_MAX} תווים)`
              : `יש למלא: סוג תג + קטגוריה (אב) + שם תג. (הסבר: עד ${NOTE_MAX} תווים)`}
          </Typography>
        )}
      </Sheet>
    </Box>
  )
}
