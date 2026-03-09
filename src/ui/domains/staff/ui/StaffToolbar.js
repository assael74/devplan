// C:\projects\devplan\src\ui\domains\staff\ui\StaffToolbar.js

import React from 'react'
import { Box, Button, Chip, Typography } from '@mui/joy'
import { iconUi } from '../../../core/icons/iconUi.js'
import { staffSx } from './staff.sx.js'

export default function StaffToolbar({
  title,
  subtitle,
  count = 0,
  disabled = false,
  pending = false,
  onAdd,
  compact = false,
  sx,
}) {
  return (
    <Box sx={[staffSx.toolbar(compact), sx]}>
      <Box sx={staffSx.toolbarInfo(compact)}>
        <Box sx={staffSx.toolbarIconBox(compact)}>
          {iconUi({ id: 'role' })}
        </Box>

        <Box sx={staffSx.toolbarText}>
          <Typography level={compact ? 'body-sm' : 'title-sm'} sx={staffSx.title(compact)}>
            {title}
          </Typography>

          <Typography level={compact ? 'body-xs' : 'body-sm'} level="body-xs" sx={staffSx.subtitle(compact)}>
            {subtitle}
          </Typography>
        </Box>

        <Chip size="sm" variant="soft" sx={staffSx.countChip(compact)}>
          {count}
        </Chip>
      </Box>

      <Button
        size="sm"
        startDecorator={iconUi({ id: 'role' })}
        sx={staffSx.addBtn(compact)}
        disabled={disabled || pending}
        onClick={onAdd}
      >
        {compact ? 'הוספה' : 'הוספת איש צוות'}
      </Button>
    </Box>
  )
}
