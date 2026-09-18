import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  Dropdown,
  Menu,
  MenuButton,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/joy'

import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'
import JsonViewerModal from '../../../components/modals/JsonViewerModal.js'
import { readClubPageDocument } from '../../../../services/read/index.js'
import { buildClubCollapseSignalCardsModel } from '../../../../model/pages/clubPresentation.model.js'
import { getClubCollapseView } from '../../../../domain/clubIntelligence/index.js'
import { downloadJson } from '../logic/clubsMasterDownload.logic.js'
import ClubAgeGroupSignalCards from './ClubAgeGroupSignalCards.js'
import { clubsPageSx as sx } from '../sx/clubsPage.sx.js'

export default function ClubExpandedRow({ club, model, onOpenClub }) {
  const [clubDocumentJson, setClubDocumentJson] = useState(null)
  const [clubMasterEntryJson, setClubMasterEntryJson] = useState(null)
  const collapseView = useMemo(() => (
    getClubCollapseView(model.intelligence)
  ), [model.intelligence])
  const cards = useMemo(() => buildClubCollapseSignalCardsModel({
    teams: collapseView.currentTeams,
    spotlights: collapseView.spotlights,
    signalCoverage: collapseView.signalCoverage,
    seasonKey: model.seasonOptions?.find(option => option.value === 'current')?.seasonKey,
  }), [collapseView, model.seasonOptions])

  const handleOpenClubDocumentJson = async () => {
    setClubDocumentJson({ data: { status: 'loading' } })

    try {
      const document = await readClubPageDocument({ clubId: club?.clubId })
      setClubDocumentJson({
        data: document || { error: 'מסמך המועדון הקנוני לא נמצא' },
      })
    } catch (error) {
      setClubDocumentJson({
        data: { error: error?.message || 'טעינת מסמך המועדון הקנוני נכשלה' },
      })
    }
  }

  return (
    <Box className='dpScrollThin' sx={sx.expanded}>
      <Box sx={sx.expandedSeasonHeader}>
        <Typography level='title-sm' sx={sx.expandedSeasonTitle}>
          איתותים לפי קבוצת גיל · עונה נוכחית
        </Typography>
        <Box sx={sx.expandedSeasonActions}>
          <Button
            size='sm'
            variant='plain'
            sx={sx.expandedSeasonClubButton}
            onClick={() => onOpenClub(club)}
          >
            {`לעמוד ${club?.name || 'המועדון'}`}
          </Button>
          <Dropdown>
            <Tooltip title='מסמכי מועדון'>
              <MenuButton
                size='sm'
                variant='outlined'
                aria-label='מסמכי מועדון'
                sx={sx.clubDocumentMenuButton}
              >
                {iconUi({ id: 'dataShow', style: { fontSize: 13 } })}
              </MenuButton>
            </Tooltip>
            <Menu placement='bottom-start'>
              <MenuItem onClick={handleOpenClubDocumentJson}>
                מסמך מועדון קנוני
              </MenuItem>
              <MenuItem onClick={() => setClubMasterEntryJson({ data: club || {} })}>
                אובייקט מועדון ב־Clubs Master
              </MenuItem>
            </Menu>
          </Dropdown>
        </Box>
      </Box>

      <ClubAgeGroupSignalCards cards={cards} />

      <JsonViewerModal
        open={Boolean(clubDocumentJson)}
        title={`Club Document · ${club?.name || 'מועדון'}`}
        description='תצוגת מסמך המועדון הקנוני'
        data={clubDocumentJson?.data || {}}
        onClose={() => setClubDocumentJson(null)}
        onDownload={() => downloadJson(
          clubDocumentJson?.data || {},
          `club-document-${club?.clubId || 'club'}.json`
        )}
      />

      <JsonViewerModal
        open={Boolean(clubMasterEntryJson)}
        title={`Clubs Master · ${club?.name || 'מועדון'}`}
        description='אובייקט מועדון מתוך מסמך Clubs Master'
        data={clubMasterEntryJson?.data || {}}
        onClose={() => setClubMasterEntryJson(null)}
        onDownload={() => downloadJson(
          clubMasterEntryJson?.data || {},
          `clubs-master-${club?.clubId || 'club'}.json`
        )}
      />
    </Box>
  )
}
