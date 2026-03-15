/// C:\projects\devplan\src\features\hub\sharedProfile\SectionPanel.js
import React from 'react'
import { Sheet, Box, Typography } from '@mui/joy'

export default function SectionPanel({ title, subtitle, right, children }) {
  return (
    <Sheet
      variant="soft"
      sx={{
        p: 1,
        borderRadius: 'md',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {title ? <Typography level="title-sm">{title}</Typography> : null}
          {subtitle ? (
            <Typography level="body-xs" sx={{ opacity: 0.75, mt: 0.25 }} noWrap>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        {right ? <Box sx={{ flexShrink: 0 }}>{right}</Box> : null}
      </Box>

      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', minWidth: 0, pt: 0.75, pr: 0.5, pb: 6 }} className="dpScrollThin">
        {children}
      </Box>
    </Sheet>
  )
}
