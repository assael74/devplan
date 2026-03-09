import React from 'react'
import { Box, Card, Divider, List, ListItem, Typography } from '@mui/joy'

export default function EntitySection({
  title,
  icon,
  items = [],
  emptyText = 'אין פריטים להצגה כרגע',
  onOpenAll,
}) {
  return (
    <Card variant="outlined" sx={{ p: 1.2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography level="title-md">
          <span style={{ marginInlineEnd: 8 }}>{icon}</span>
          {title}
        </Typography>

        {typeof onOpenAll === 'function' && (
          <Typography
            level="body-sm"
            sx={{ cursor: 'pointer', opacity: 0.8, '&:hover': { opacity: 1 } }}
            onClick={onOpenAll}
          >
            הצג הכל
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 1 }} />

      {items.length === 0 ? (
        <Typography level="body-sm" sx={{ opacity: 0.75 }}>
          {emptyText}
        </Typography>
      ) : (
        <List sx={{ '--List-gap': '6px', p: 0 }}>
          {items.map((row) => (
            <ListItem
              key={row.id}
              sx={{
                p: 0.6,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography level="body-md" sx={{ fontWeight: 600 }}>
                  {row.title}
                </Typography>
                {!!row.subtitle && (
                  <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                    {row.subtitle}
                  </Typography>
                )}
              </Box>

              {!!row.rightMeta && (
                <Typography level="body-xs" sx={{ opacity: 0.75, whiteSpace: 'nowrap' }}>
                  {row.rightMeta}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}
    </Card>
  )
}
