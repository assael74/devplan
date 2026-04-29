// src/ui/forms/ui/tags/TagsCreateFields.js

import React from 'react'
import { Box, Typography, Divider } from '@mui/joy'

import TagTypeSelectField from '../../../fields/selectUi/tags/TagTypeSelectField.js'
import TagParentSelectField from '../../../fields/selectUi/tags/TagParentSelectField.js'
import TagNameField from '../../../fields/inputUi/tags/TagNameField.js'
import TagNoteField from '../../../fields/inputUi/tags/TagNoteField.js'
import TagKindSelectField from '../../../fields/checkUi/tags/TagKindSelectField.js'
import TagActiveSelector from '../../../fields/checkUi/tags/TagActiveSelector.js'
import TagOrderField from '../../../fields/inputUi/tags/TagOrderField.js'

import { vaSx } from './sx/form.sx.js'

const NOTE_MAX = 20

export default function TagsCreateFields({
  draft = {},
  onDraft,
  layout,
  validity = {},
  disabled = false,

  mode = 'create',
  showKindSelector,
  showActive = false,
  showOrder = false,
  lockTagType = false,
}) {
  const isEdit = mode === 'edit'

  const shouldShowKindSelector =
    typeof showKindSelector === 'boolean'
      ? showKindSelector
      : !isEdit

  const isGroup = Boolean(validity.isGroup)
  const kind = validity.kind || draft?.kind || 'tag'
  const tagName = validity.tagName || draft?.tagName || ''
  const tagType = validity.tagType || draft?.tagType || ''
  const parentId = validity.parentId || draft?.parentId || ''
  const notes = validity.notes || draft?.notes || ''
  const order = validity.order ?? draft?.order ?? 0
  const isActive = validity.isActive ?? draft?.isActive ?? true

  const parentOptions = Array.isArray(validity.parentOptions)
    ? validity.parentOptions
    : []

  const errors = validity.errors || {}
  const isValid = Boolean(validity.isValid)

  const patch = (nextPatch) => {
    if (typeof onDraft !== 'function') return
    onDraft({ ...draft, ...(nextPatch || {}) })
  }

  return (
    <Box sx={vaSx.root(layout)}>
      {shouldShowKindSelector ? (
        <>
          <Box sx={vaSx.block(layout?.topCols, 1)}>
            <TagKindSelectField
              value={kind}
              onChange={(val) => patch({ kind: val || 'tag', parentId: '' })}
              disabled={disabled}
              size="sm"
            />
          </Box>

          <Divider>
            <Typography level="body-sm">
              {isGroup ? 'פרטי קטגוריה' : 'פרטי התג'}
            </Typography>
          </Divider>
        </>
      ) : null}

      <Box sx={vaSx.block(layout?.mainCols, 1)}>
        <TagTypeSelectField
          value={tagType}
          onChange={(val) => patch({ tagType: val || '', parentId: '' })}
          required
          label={isGroup ? 'בחירת סוג הקטגוריה' : 'בחירת סוג התג'}
          error={Boolean(errors.tagType)}
          disabled={disabled || lockTagType}
          size="sm"
        />

        {!isGroup ? (
          <TagParentSelectField
            value={parentId}
            onChange={(val) => patch({ parentId: val || '' })}
            options={parentOptions}
            size="sm"
            error={Boolean(errors.parentId)}
            disabled={disabled || !tagType}
            label="בחירת קטגוריה"
          />
        ) : null}
      </Box>

      <Divider sx={{ my: isEdit ? 2 : 0 }}>
        <Typography level="body-sm">
          {isGroup ? 'שם והסבר קטגוריה' : 'שם והסבר תג'}
        </Typography>
      </Divider>

      <Box sx={vaSx.block(layout?.metaCols, 1)}>
        <Box sx={{ minWidth: 0 }}>
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
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <TagNoteField
            value={notes}
            onChange={(val) => patch({ notes: val })}
            disabled={disabled}
            size="sm"
            label={isGroup ? 'הסבר קטגוריה' : 'הסבר תג'}
            maxLength={NOTE_MAX}
          />
        </Box>
      </Box>

      {showOrder || showActive ? (
        <>
          <Divider sx={{ my: isEdit ? 2 : 0 }}>
            <Typography level="body-sm">
              ניהול תג
            </Typography>
          </Divider>

          <Box sx={vaSx.block(layout?.mainCols, 1)}>
            {showOrder ? (
              <Box sx={{ minWidth: 0 }}>
                <TagOrderField
                  value={order}
                  onChange={(val) => patch({ order: val })}
                  disabled={disabled}
                  size="sm"
                  variant="soft"
                  color="success"
                />
              </Box>
            ) : null}

            {showActive ? (
              <Box sx={{ minWidth: 0, pt: 3.5 }}>
                <TagActiveSelector
                  value={Boolean(isActive)}
                  onChange={(val) => patch({ isActive: Boolean(val) })}
                  disabled={disabled}
                  size="sm"
                />
              </Box>
            ) : null}
          </Box>
        </>
      ) : null}
    </Box>
  )
}
