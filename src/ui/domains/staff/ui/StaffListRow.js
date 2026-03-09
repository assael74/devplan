// C:\projects\devplan\src\ui\domains\staff\ui\StaffListRow.js

import React from 'react'
import { Avatar, Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import roleImage from '../../../core/images/roleImage.png'
import { iconUi } from '../../../core/icons/iconUi.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'
import { formatPhoneNumber } from '../../../../shared/format/contactUtiles.js'
import { staffSx } from './staff.sx.js'


export default function StaffListRow({
  staff,
  disabled = false,
  pending = false,
  onRemove,
  showActions = true,
  formatPhone,
  compact = false,
}) {
  const roleMeta = STAFF_ROLE_OPTIONS.find((item) => item.id === staff.type) || {}
  const roleLabel = staff.roleLabel || roleMeta.labelH || 'ללא תפקיד'
  const roleIcon = roleMeta.idIcon || 'role'
  const phoneText = formatPhone ? staff.phone : (staff.phone || 'ללא טלפון')

  return (
    <Box sx={staffSx.row(compact)}>
      <Avatar
        src={staff.photo || roleImage}
        alt={staff.fullName || ''}
        sx={staffSx.avatar(compact)}
      />

      <Box sx={staffSx.rowMain(compact)}>
        <Box sx={staffSx.nameRow(compact)}>
          <Typography level={compact ? 'body-sm' : 'title-sm'} sx={staffSx.name(compact)}>
            {staff.fullName || '—'}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: roleIcon })}
            sx={staffSx.roleChip(compact)}
          >
            {roleLabel}
          </Chip>
        </Box>

        <Box sx={staffSx.contactRow(compact)}>
          <Box sx={staffSx.contactItem(compact)}>
            {iconUi({ id: 'phone' })}
            <Typography noWrap sx={staffSx.contactText(compact)}>
              {formatPhoneNumber(phoneText)}
            </Typography>
          </Box>

          {!compact ? (
            <Box sx={staffSx.contactItem(compact)}>
              {iconUi({ id: 'email' })}
              <Typography noWrap sx={staffSx.contactText(compact)}>
                {staff.email || 'ללא אימייל'}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      {showActions ? (
        <Box sx={staffSx.actions(compact)}>
          <Tooltip title="הסר איש צוות">
            <span>
              <IconButton
                size="sm"
                variant="plain"
                sx={staffSx.removeBtn(compact)}
                disabled={disabled || pending}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(staff.raw || staff)
                }}
              >
                {iconUi({ id: 'remove' })}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ) : null}
    </Box>
  )
}
