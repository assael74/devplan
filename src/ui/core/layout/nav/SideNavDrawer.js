import React from 'react'
import { Drawer, Box, Typography, ModalClose } from '@mui/joy'
import SideNav from './SideNav'

export default function SideNavDrawer({ open, onClose, badges, anchor = 'right' }) {
  return (
    <Drawer open={open} onClose={onClose} anchor={anchor} size="sm" sx={{ '--Drawer-horizontalSize': '290px' }}>
      {/* --- כותרת --- */}
      <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        <ModalClose />
        <Typography level="title-md" sx={{ pr: 4 }}>
          ניווט
        </Typography>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
          מעבר בין מסכים
        </Typography>
      </Box>

      {/* --- תפריט --- */}
      <SideNav onNavigate={onClose} badges={badges} />
    </Drawer>
  )
}
