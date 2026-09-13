import JsonViewerModal from '../../../components/modals/JsonViewerModal.js'
import { downloadClubMasterEntryJson } from '../logic/clubsMasterDownload.logic.js'

export default function ClubMasterJsonViewerModal({
  club,
  open,
  onClose,
}) {
  return (
    <JsonViewerModal
      open={open}
      title={`Clubs Master · ${club?.name || 'מועדון'}`}
      description='תצוגה לקריאה בלבד של רשומת המועדון'
      data={club}
      onClose={onClose}
      onDownload={() => downloadClubMasterEntryJson(club)}
    />
  )
}
