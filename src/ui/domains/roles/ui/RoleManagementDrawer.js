// src/ui/domains/roles/ui/RoleManagementDrawer.js

import React from 'react'
import { Box } from '@mui/joy'

import DrawerShell from '../../../patterns/drawer/DrawerShell.js'
import DrawerHeaderShell from '../../../patterns/drawer/DrawerHeaderShell.js'

const DRAWER_META = {
  edit: {
    title: 'עריכת איש צוות',
    icon: 'edit',
    chip: 'פרטים',
  },
  assignments: {
    title: 'ניהול שיוכים',
    icon: 'link',
    chip: 'שיוכים',
  },
  more: {
    title: 'פעולות נוספות',
    icon: 'more',
    chip: 'פעולות',
  },
}

export default function RoleManagementDrawer({
  open,
  mode = 'edit',
  role,
  onClose,
}) {
  const meta = DRAWER_META[mode] || DRAWER_META.edit
  const roleName = role?.fullName || 'איש צוות'
  const roleLabel = role?.roleLabel || 'צוות מקצועי'

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      entity="roles"
      canSave={false}
      isDirty={false}
      header={(
        <DrawerHeaderShell
          title={meta.title}
          subline={roleName}
          meta={roleLabel}
          titleIconId={meta.icon}
          avatar={role?.photo}
          entity="roles"
          chipLabel={meta.chip}
          chipIconId="role"
        />
      )}
      sxOverrides={{
        content: {
          minHeight: 260,
          p: 0,
        },
        footer: {
          display: 'none',
        },
      }}
    >
      <Box />
    </DrawerShell>
  )
}
