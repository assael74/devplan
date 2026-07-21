// features/playersDatabase/ui/pages/leaguePage/LeagueImportModal.js

import { DataImportModal } from '../../components/modals/index.js'

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  return (
    <DataImportModal
      open={leagueImport.open}
      title='טעינת נתוני ליגה'
      description={`${league.name} - עונה ${league.seasonKey}`}
      confirmLabel='אישור טעינה'
      columns={columns}
      rows={leagueImport.rows}
      pasteValue={leagueImport.pasteValue}
      pastePlaceholder={placeholder}
      onPasteChange={leagueImport.setPasteValue}
      onPaste={leagueImport.handlePreview}
      onCellChange={leagueImport.handleCellChange}
      busy={leagueImport.busy}
      onConfirm={leagueImport.handleConfirm}
      onClose={leagueImport.handleClose}
    />
  )
}
