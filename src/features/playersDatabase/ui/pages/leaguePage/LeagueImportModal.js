// features/playersDatabase/ui/pages/leaguePage/LeagueImportModal.js

import { Box } from '@mui/joy'

import PlayersDatabaseModal from '../../components/modals/PlayersDatabaseModal.js'
import DataImportPasteArea from '../../components/modals/dataImport/DataImportPasteArea.js'
import DataImportPreviewTable from '../../components/modals/dataImport/DataImportPreviewTable.js'
import { leagueImportModalSx as sx } from './sx/leagueImportModal.sx.js'

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  return (
    <PlayersDatabaseModal
      open={leagueImport.open}
      title='טעינת נתוני ליגה'
      description={`${league.name} - עונה ${league.seasonKey}`}
      iconId='upload'
      confirmLabel='אישור טעינה'
      confirmIconId='upload'
      size='xl'
      busy={leagueImport.busy}
      disabled={!leagueImport.canConfirm}
      contentSx={sx.modalContent}
      onConfirm={leagueImport.handleConfirm}
      onClose={leagueImport.handleClose}
    >
      <Box sx={sx.content}>
        <DataImportPasteArea
          pasteValue={leagueImport.pasteValue}
          pastePlaceholder={placeholder}
          onPasteChange={leagueImport.setPasteValue}
          onPaste={leagueImport.handlePreview}
          onClear={leagueImport.handleClear}
        />

        <DataImportPreviewTable
          columns={columns}
          rows={leagueImport.rows}
          onCellChange={leagueImport.handleCellChange}
        />
      </Box>
    </PlayersDatabaseModal>
  )
}
