import React from 'react'
import Sheet from '@mui/joy/Sheet'
import Typography from '@mui/joy/Typography'

export default function PublicStateView({
  title,
  text,
  color = 'neutral',
}) {
  return (
    <Sheet
      variant="soft"
      color={color}
      sx={{
        p: 2,
        borderRadius: 'md',
      }}
    >
      <Typography level="title-md" sx={{ mb: 0.5 }}>
        {title}
      </Typography>

      <Typography level="body-sm">
        {text}
      </Typography>
    </Sheet>
  )
}
