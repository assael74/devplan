// features/playersDatabase/ui/pages/leagueCenterPage/LeagueCenterWorkQueue.js

import { Box, Button, Stack, Typography } from '@mui/joy'

import InfoPanel from '../../components/cards/InfoPanel.js'
import { leagueCenterContentSx as sx } from './sx/leagueCenterContent.sx.js'

export default function LeagueCenterWorkQueue({ items, onSelect }) {
  return (
    <InfoPanel title='תור עבודה' sx={sx.workQueuePanel}>
      <Stack className='dpScrollThin' spacing={0.75} sx={sx.workQueueList}>
        {items.map(item => (
          <Button
            key={item.id}
            variant='plain'
            sx={sx.workQueueItem}
            onClick={() => onSelect(item)}
          >
            <Box sx={sx.workQueueCount}>{item.value}</Box>
            <Box sx={sx.workQueueCopy}>
              <Typography sx={sx.workQueueTitle}>{item.label}</Typography>
              <Typography level='body-xs' sx={sx.workQueueCaption}>
                {item.caption}
              </Typography>
            </Box>
          </Button>
        ))}
      </Stack>
    </InfoPanel>
  )
}
