// src/ui/domains/roles/ui/RoleRow.js

import React from 'react'
import { Avatar, Box, Chip, IconButton, Tooltip, Typography } from '@mui/joy'

import roleImage from '../../../core/images/roleImage.png'
import { iconUi } from '../../../core/icons/iconUi.js'
import { STAFF_ROLE_OPTIONS } from '../../../../shared/roles/roles.constants.js'
import { formatPhoneNumber } from '../../../../shared/format/contactUtils.js'
import { rolesSx } from './roles.sx.js'

function AssignmentLine({ icon, label }) {
  return (
    <Box sx={rolesSx.assignmentLine}>
      {iconUi({ id: icon, size: 'xs' })}
      <Typography level="body-xs" noWrap sx={rolesSx.assignmentText}>
        {label}
      </Typography>
    </Box>
  )
}

export default function RoleRow({
  role,
  disabled = false,
  pending = false,
  onRemove,
  onOpenDrawer,
  selected = false,
  showActions = true,
  formatPhone,
  compact = false,
  pageMode = false,
}) {
  const roleMeta = STAFF_ROLE_OPTIONS.find((item) => item.id === role.type) || {}
  const roleLabel = role.roleLabel || roleMeta.labelH || 'לא הוגדר תפקיד'
  const roleIcon = role.roleIcon || roleMeta.idIcon || 'role'
  const phoneText = role.phone || ''
  const emailText = role.email || ''
  const renderedPhoneText =
    typeof formatPhone === 'function'
      ? formatPhone(phoneText)
      : formatPhone
        ? phoneText
        : formatPhoneNumber(phoneText)
  const missingContact = !role.phone && !role.email
  const showEmail = emailText && (!compact || !phoneText)
  const teamLabels = Array.isArray(role.teamLabels) ? role.teamLabels : []
  const clubLabels = Array.isArray(role.clubLabels) ? role.clubLabels : []
  const hasTeamAssignment = teamLabels.length > 0
  const hasAnyAssignment = hasTeamAssignment || clubLabels.length > 0
  const visibleTeams = teamLabels.slice(0, 2)
  const visibleClub = clubLabels[0] || ''
  const hiddenAssignments = Math.max(
    teamLabels.length + clubLabels.length - visibleTeams.length - Math.min(clubLabels.length, 1),
    0
  )
  const openDrawer = (mode) => (event) => {
    event.stopPropagation()
    onOpenDrawer?.(mode, role)
  }

  return (
    <Box sx={rolesSx.row(compact, pageMode, selected)}>
      <Box sx={rolesSx.identityCell(compact)}>
        <Avatar
          src={role.photo || roleImage}
          alt={role.fullName || ''}
          sx={rolesSx.avatar(compact)}
        />

        <Box sx={rolesSx.identityText}>
          <Typography level={compact ? 'body-sm' : 'title-sm'} sx={rolesSx.name(compact)}>
            {role.fullName || 'ללא שם'}
          </Typography>

          <Chip
            size="sm"
            variant="soft"
            color="neutral"
            startDecorator={iconUi({ id: roleIcon })}
            sx={rolesSx.roleChip(compact)}
          >
            {roleLabel}
          </Chip>
        </Box>
      </Box>

      <Box sx={rolesSx.contactCell(compact)}>
        {missingContact ? (
          <Chip size="sm" variant="soft" color="warning" sx={rolesSx.statusChip}>
            אין טלפון או מייל
          </Chip>
        ) : (
          <>
            {phoneText ? (
              <Box sx={rolesSx.contactItem(compact)}>
                {iconUi({ id: 'phone' })}
                <Typography noWrap sx={rolesSx.contactText(compact)}>
                  {renderedPhoneText}
                </Typography>
              </Box>
            ) : null}

            {showEmail ? (
              <Box sx={rolesSx.contactItem(compact)}>
                {iconUi({ id: 'email' })}
                <Typography noWrap sx={rolesSx.contactText(compact)}>
                  {emailText}
                </Typography>
              </Box>
            ) : null}
          </>
        )}
      </Box>

      {!compact ? (
        <Box sx={rolesSx.assignmentCell}>
          {hasAnyAssignment ? (
            <>
              {visibleTeams.map((label) => (
                <AssignmentLine key={`team-${label}`} icon="teams" label={`${label} · ${roleLabel}`} />
              ))}

              {!hasTeamAssignment ? (
                <Chip
                  size="sm"
                  variant="soft"
                  color="warning"
                  startDecorator={iconUi({ id: 'teams' })}
                  sx={rolesSx.statusChip}
                >
                  לא משויך לקבוצה
                </Chip>
              ) : null}

              {visibleClub ? (
                <AssignmentLine icon="clubs" label={`${visibleClub} · מועדון`} />
              ) : null}

              {hiddenAssignments > 0 ? (
                <Chip size="sm" variant="soft" color="neutral" sx={rolesSx.assignmentMoreChip}>
                  {`+${hiddenAssignments} שיוכים`}
                </Chip>
              ) : null}
            </>
          ) : (
            <Chip
              size="sm"
              variant="soft"
              color="warning"
              startDecorator={iconUi({ id: 'link' })}
              sx={rolesSx.statusChip}
            >
              לא משויך לקבוצה
            </Chip>
          )}
        </Box>
      ) : null}

      <Box sx={rolesSx.actions(compact)}>
        {pageMode ? (
          <>
            <Tooltip title="עריכת פרטים">
              <span>
                <IconButton size="sm" variant="plain" sx={rolesSx.actionBtn} onClick={openDrawer('edit')}>
                  {iconUi({ id: 'edit' })}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="ניהול שיוכים">
              <span>
                <IconButton size="sm" variant="plain" sx={rolesSx.actionBtn} onClick={openDrawer('assignments')}>
                  {iconUi({ id: 'link' })}
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="פעולות נוספות">
              <span>
                <IconButton size="sm" variant="plain" sx={rolesSx.actionBtn} onClick={openDrawer('more')}>
                  {iconUi({ id: 'more' })}
                </IconButton>
              </span>
            </Tooltip>
          </>
        ) : null}

        {showActions ? (
          <Tooltip title="הסרת איש צוות מהשיוך הנוכחי">
            <span>
              <IconButton
                size="sm"
                variant="plain"
                sx={rolesSx.removeBtn(compact)}
                disabled={disabled || pending}
                onClick={(event) => {
                  event.stopPropagation()
                  onRemove(role.raw || role)
                }}
              >
                {iconUi({ id: 'remove' })}
              </IconButton>
            </span>
          </Tooltip>
        ) : null}
      </Box>
    </Box>
  )
}
