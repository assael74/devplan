// features/squadSimulator/ui/components/SimulatorHeader.js

import { Box, Button, Chip, Stack, Typography } from '@mui/joy'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { ReportPrintButton } from '../../../../ui/patterns/reportPrint/index.js'
import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'

export default function SimulatorHeader({ onAddPlayer, onReset, renderPrintContent }) {
  return (
    <Box sx={sx.header}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Chip size="lg" variant="soft" color="primary">
          <GroupsRoundedIcon />
        </Chip>
        <Box>
          <Typography level="h2">סימולטור בניית סגל</Typography>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            מנוע יעדי שחקנים לפי יעד קבוצה, מעמד ועמדה ראשית
          </Typography>
        </Box>
      </Stack>

      <Stack sx={sx.actions}>
        <ReportPrintButton
          label="הדפסה"
          tooltip="הדפס / שמור PDF"
          documentTitle="דוח סימולציית סגל"
          startIcon="download"
          renderContent={renderPrintContent}
        />
        <Button
          size="sm"
          variant="outlined"
          color="neutral"
          startDecorator={iconUi({ id: 'reset', size: 'sm' }) || <RestartAltRoundedIcon />}
          onClick={onReset}
        >
          איפוס
        </Button>
        <Button
          size="sm"
          startDecorator={iconUi({ id: 'add', size: 'sm' }) || <AddRoundedIcon />}
          onClick={onAddPlayer}
        >
          הוסף שחקן
        </Button>
      </Stack>
    </Box>
  )
}
