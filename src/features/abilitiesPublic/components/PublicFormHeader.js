import React from 'react'
import Box from '@mui/joy/Box'
import Chip from '@mui/joy/Chip'
import Sheet from '@mui/joy/Sheet'
import Stack from '@mui/joy/Stack'
import Typography from '@mui/joy/Typography'

import StarRating from '../../../ui/domains/ratings/JoyStarRating.js'

export default function PublicFormHeader({ form }) {
  const { bits, overallScore, overallStars, onSetRoleId } = form

  return (
    <Sheet
      variant="soft"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        px: 1.5,
        py: 1.25,
        mb: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: 'background.body',
      }}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography level="title-md">טופס הערכת יכולות</Typography>
          <Typography level="body-sm">
            מילוי קצר בנייד, ללא צורך בהתחברות
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="sm" variant="soft">
            שחקן: {bits.playerName || '-'}
          </Chip>

          {bits.teamName ? (
            <Chip size="sm" variant="soft">
              קבוצה: {bits.teamName}
            </Chip>
          ) : null}

          {bits.evaluatorName || bits.evaluatorType ? (
            <Chip size="sm" variant="soft">
              ממלא: {bits.evaluatorName || bits.evaluatorType}
            </Chip>
          ) : null}

          {bits.evalDate ? (
            <Chip size="sm" variant="soft">
              תאריך: {bits.evalDate}
            </Chip>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography level="body-xs">ציון כללי</Typography>
            <Typography level="title-sm">{overallScore == null ? '-' : overallScore}</Typography>
          </Box>

          <StarRating value={overallStars || 0} readOnly />
        </Stack>
      </Stack>
    </Sheet>
  )
}
