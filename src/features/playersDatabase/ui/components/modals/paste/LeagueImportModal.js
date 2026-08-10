// src/features/playersDatabase/ui/components/modals/paste/LeagueImportModal.js

import PasteModal from './PasteModal.js'

export default function LeagueImportModal({
  league = {},
  columns = [],
  leagueImport,
  placeholder = '',
}) {
  return (
    <PasteModal
      open={leagueImport.open}
      title='טעינת נתוני ליגה'
      description={`${league.name} - עונה ${league.seasonKey}`}
      columns={columns}
      rows={leagueImport.rows}
      value={leagueImport.pasteValue}
      placeholder={placeholder}
      busy={leagueImport.busy}
      disabled={!leagueImport.canConfirm}
      confirmLabel='אישור טעינה'
      onValueChange={leagueImport.setPasteValue}
      onPaste={leagueImport.handlePreview}
      onClear={leagueImport.handleClear}
      onCellChange={leagueImport.handleCellChange}
      onConfirm={leagueImport.handleConfirm}
      onClose={leagueImport.handleClose}
    />
  )
}
