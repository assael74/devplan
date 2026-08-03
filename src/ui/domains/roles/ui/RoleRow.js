// src/ui/domains/roles/ui/RoleRow.js

import React from 'react'
import { Avatar, Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import roleImage from '../../../core/images/roleImage.png'
import { iconUi } from '../../../core/icons/iconUi.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'
import { formatPhoneNumber } from '../../../../shared/format/contactUtils.js'
import { rolesSx } from './roles.sx.js'


export default function RoleRow({
  role,
  disabled = false,
  pending = false,
  onRemove,
  showActions = true,
  formatPhone,
  compact = false,
}) {
  const roleMeta = STAFF_ROLE_OPTIONS.find((item) => item.id === role.type) || {}
  const roleLabel = role.roleLabel || roleMeta.labelH || 'ללא תפקיד'
  const roleIcon = roleMeta.idIcon || 'role'
  const phoneText = formatPhone ? role.phone : (role.phone || 'ללא טלפון')

  return (
    <Box sx={rolesSx.row(compact)}>
      <Avatar
        src={role.photo || roleImage}
        alt={role.fullName || ''}
        sx={rolesSx.avatar(compact)}
      />

      <Box sx={rolesSx.rowMain(compact)}>
        <Box sx={rolesSx.nameRow(compact)}>
          <Typography level={compact ? 'body-sm' : 'title-sm'} sx={rolesSx.name(compact)}>
            {role.fullName || '—'}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            startDecorator={iconUi({ id: roleIcon })}
            sx={rolesSx.roleChip(compact)}
          >
            {roleLabel}
          </Chip>


          {!role.teamsId?.length && !role.clubsId?.length ? (
            <Chip size="sm" variant="outlined" color="neutral">
              לא משויך
            </Chip>
          ) : null}
        </Box>

        <Box sx={rolesSx.contactRow(compact)}>
          <Box sx={rolesSx.contactItem(compact)}>
            {iconUi({ id: 'phone' })}
            <Typography noWrap sx={rolesSx.contactText(compact)}>
              {formatPhoneNumber(phoneText)}
            </Typography>
          </Box>

          {!compact ? (
            <Box sx={rolesSx.contactItem(compact)}>
              {iconUi({ id: 'email' })}
              <Typography noWrap sx={rolesSx.contactText(compact)}>
                {role.email || 'ללא אימייל'}
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>

      {showActions ? (
        <Box sx={rolesSx.actions(compact)}>
          <Tooltip title="הסר איש צוות">
            <span>
              <IconButton
                size="sm"
                variant="plain"
                sx={rolesSx.removeBtn(compact)}
                disabled={disabled || pending}
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(role.raw || role)
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
