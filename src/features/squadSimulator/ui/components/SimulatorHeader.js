// features/squadSimulator/ui/components/SimulatorHeader.js

import { Box, Button, Chip, Stack, Typography } from '@mui/joy'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'

import { iconUi } from '../../../../ui/core/icons/iconUi.js'
import { ReportPrintButton } from '../../../../ui/patterns/reportPrint/index.js'
import { squadSimulatorSx as sx } from './sx/squadSimulator.sx.js'

function decorator() {
  return (
    <Chip
      size='md'
      variant='soft'
      startDecorator={iconUi({id: 'squadSimulator'})}
      sx={{ border: '1px solid', borderColor: 'divider'}}
    />
  )
}

export default function SimulatorHeader({ onAddPlayer, onReset, renderPrintContent }) {
  return (
    <Box sx={sx.header}>
      <Box sx={{ display: 'grid' }}>
        <Typography level="h2" startDecorator={decorator()}>סימולטור בניית סגל</Typography>
        <Typography level="body-sm" sx={{ color: 'text.secondary', pl: 2 }}>
          מנוע יעדי שחקנים לפי יעד קבוצה, מעמד ועמדה ראשית
        </Typography>
      </Box>

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
