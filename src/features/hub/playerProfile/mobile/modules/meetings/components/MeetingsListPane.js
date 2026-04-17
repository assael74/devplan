// playerProfile/mobile/modules/meetings/components\MeetingsListPane.js

import React from 'react'
import { Box, Button, Divider, Input, List, Sheet, Typography } from '@mui/joy'
import SearchIcon from '@mui/icons-material/Search'
import AddIcon from '@mui/icons-material/Add'
import MeetingRow from './MeetingRow'

const BUCKET_LABEL = {
  next: 'המפגש הבא',
  upcoming: 'בהמשך',
  done: 'הושלמו',
  canceled: 'בוטלו',
}

const BUCKET_ORDER = ['next', 'upcoming', 'done', 'canceled']

function BucketHeader({ label }) {
  return (
    <Box sx={{ px: 0.75, pt: 1, pb: 0.5 }}>
      <Typography level="body-xs" sx={{ opacity: 0.7, fontWeight: 700 }}>
        {label}
      </Typography>
      <Divider sx={{ my: 1 }} />
    </Box>
  )
}

function BucketEmptyRow() {
  return (
    <Box sx={{ px: 1, py: 0.75 }}>
      <Typography level="body-xs" sx={{ opacity: 0.55 }}>
        אין פריטים
      </Typography>
    </Box>
  )
}

export default function MeetingsListPane({
  sx,
  filters,
  filteredCount,
  flatRightList,
  selectedId,
  onSelectId,
  onChangeQuery,
  onAdd,
}) {
  const bucketMap = React.useMemo(() => {
    const map = { next: [], upcoming: [], done: [], canceled: [] }
    for (const m of flatRightList || []) {
      const b = m?.__bucket || 'upcoming'
      if (!map[b]) map[b] = []
      map[b].push(m)
    }
    return map
  }, [flatRightList])

  return (
    <Sheet sx={{ ...sx.rightPane, width: '100%' }} variant="outlined">
      <Box sx={sx.rightTop}>
        <Input
          size="sm"
          placeholder="חיפוש (תאריך / סוג / סטטוס / הערות)"
          value={filters?.query || ''}
          onChange={(e) => onChangeQuery(e.target.value)}
          startDecorator={<SearchIcon />}
          sx={{ flex: 1, minWidth: 0 }}
        />
        <Button size="sm" variant="soft" startDecorator={<AddIcon />} onClick={onAdd}>
          חדש
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', justifyContent: 'flex-start', pl: 1 }}>
        <Typography level="body-xs" sx={{ opacity: 0.8 }}>
          {filteredCount} מפגשים
        </Typography>
      </Box>

      <Divider sx={{ my: 1 }} />

      <Box sx={sx.listWrap} className="dpScrollThin">
        <List sx={{ py: 0.5, px: 0, '--ListItem-paddingX': '0px' }}>
          {BUCKET_ORDER.map((bucketKey) => {
            const items = bucketMap[bucketKey] || []
            return (
              <React.Fragment key={`b:${bucketKey}`}>
                <BucketHeader label={BUCKET_LABEL[bucketKey]} />

                {items.length === 0 ? (
                  <BucketEmptyRow />
                ) : (
                  items.map((m) => (
                    <MeetingRow
                      key={`r:${String(m.id)}`}
                      m={m}
                      sx={sx}
                      active={String(m.id) === String(selectedId)}
                      onSelect={(x) => onSelectId?.(x.id)}
                    />
                  ))
                )}
              </React.Fragment>
            )
          })}
        </List>
      </Box>
    </Sheet>
  )
}
