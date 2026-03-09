// src/ui/sort/SortSheet.js
import React, { useMemo } from 'react'
import { Drawer, List, ListItem, ListItemDecorator } from '@mui/joy'
import Sheet from '@mui/joy/Sheet'
import Box from '@mui/joy/Box'
import Typography from '@mui/joy/Typography'
import DialogTitle from '@mui/joy/DialogTitle'
import DialogContent from '@mui/joy/DialogContent'
import ModalClose from '@mui/joy/ModalClose'
import Divider from '@mui/joy/Divider'

import { sortSx as sx } from './sort.sx'
import { safeStr } from './sort.utils'
import { iconUi } from '../../core/icons/iconUi.js'

export default function SortSheet({ open, onClose, title = 'מיון לפי', value, options, onChange }) {
  const current = safeStr(value)
  const opts = useMemo(() => (Array.isArray(options) ? options : []), [options])

  const select = (nextVal) => {
    onChange(nextVal)
    onClose()
  }

  return (
    <Drawer
      size="sm"
      variant="plain"
      anchor="bottom"
      open={!!open}
      onClose={onClose}
      slotProps={{ content: { sx: sx.drawerContent } }}
    >
      <Sheet variant="plain" sx={sx.sheet}>
        <DialogTitle sx={{ p:1 }}>{title}</DialogTitle>
        <ModalClose />

        <Divider />

        <DialogContent >
         <List size="sm" sx={{ '--List-gap': '8px', '--ListItem-radius': '10px' }}>
           {opts.map((o, index) => {
             const selected = safeStr(o?.value) === current
             return (
               <ListItem
                 key={safeStr(o?.value)}
                 onClick={() => select(safeStr(o?.value))}
                 sx={sx.itemBtn(selected)}
               >
               <Box sx={{ display: 'flex', width: '100%' }}>
                 <Typography noWrap>
                   {o?.label || ''}
                 </Typography>
                 {selected && (<ListItemDecorator sx={{ marginInlineStart: 'auto' }}>{iconUi({id: 'selected'})}</ListItemDecorator>)}
               </Box>
               </ListItem>
             );
           })}
         </List>
        </DialogContent>
      </Sheet>
    </Drawer>
  )
}
