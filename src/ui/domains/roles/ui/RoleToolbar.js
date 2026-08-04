// src/ui/domains/roles/ui/RoleToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { rolesSx } from './roles.sx.js'

export default function RoleToolbar({
  title,
  subtitle,
  count = 0,
  disabled = false,
  pending = false,
  onAdd,
  compact = false,
  pageMode = false,
  sx,
}) {
  return (
    <Box sx={[rolesSx.toolbar(compact, pageMode), sx]}>
      <Box sx={rolesSx.toolbarInfo(compact)}>
        <Box sx={rolesSx.toolbarIconBox(compact, pageMode)}>
          {iconUi({ id: 'role' })}
        </Box>

        <Box sx={rolesSx.toolbarText}>
          <Typography level={compact ? 'body-sm' : 'title-md'} sx={rolesSx.title(compact, pageMode)}>
            {title}
          </Typography>

          <Typography level={compact ? 'body-xs' : 'body-sm'} sx={rolesSx.subtitle(compact)}>
            {subtitle}
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" sx={rolesSx.countChip(compact)}>
          {count}
        </Chip>
      </Box>

      <Button
        size="sm"
        startDecorator={iconUi({ id: 'role' })}
        sx={rolesSx.addBtn(compact)}
        disabled={disabled || pending}
        onClick={onAdd}
      >
        {compact ? 'הוספה' : 'הוספת איש צוות'}
      </Button>
    </Box>
  )
}
