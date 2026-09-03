// src/features/playersDatabase/ui/components/modals/paste/RosterImportModal.js

import * as React from 'react'
import {
  Button,
  Typography,
} from '@mui/joy'

import RosterIdentityModal from '../RosterIdentityModal.js'
import {
  PLAYER_ROSTER_COLUMNS,
  PLAYER_ROSTER_PLACEHOLDER,
} from '../../../pages/teamPageV4/logic/teamPage.constants.js'
import PasteModal from './PasteModal.js'
import { rosterImportModalSx as sx } from './sx/rosterImportModal.sx.js'

export default function RosterImportModal({
  team,
  seasonKey,
  hasTeamPlayers,
  controller,
}) {
  const columns = React.useMemo(() => [
    ...PLAYER_ROSTER_COLUMNS,
    {
      key: 'identityAction',
      label: 'בדיקת זהות',
      readOnly: true,
      sx: sx.identityColumn,
      render: ({ row, rowIndex }) => {
        if (row.identityValid !== false) {
          return (
            <Typography level='body-xs' color='success'>
              {row.identityResolution ? 'נפתר' : '-'}
            </Typography>
          )
        }

        return (
          <Button
            size='sm'
            variant='soft'
            color='danger'
            onClick={() => controller.openIdentityReview(rowIndex)}
          >
            בדוק התאמה
          </Button>
        )
      },
    },
  ], [controller.openIdentityReview])

  return (
    <>
      <PasteModal
        open={controller.open}
        title={hasTeamPlayers ? 'טעינת שחקן בודד' : 'טעינת סגל'}
        description={`${team.name} · עונה ${seasonKey || '-'}`}
        columns={columns}
        rows={controller.rows}
        value={controller.pasteValue}
        placeholder={PLAYER_ROSTER_PLACEHOLDER}
        busy={controller.busy}
        disabled={controller.hasIdentityErrors}
        confirmLabel='אישור טעינת סגל'
        onValueChange={controller.setPasteValue}
        onPaste={controller.parse}
        onClear={controller.clearPaste}
        onCellChange={controller.changeCell}
        getRowStatus={controller.getRowStatus}
        onConfirm={controller.confirm}
        onClose={controller.close}
      />

      <RosterIdentityModal
        open={controller.identityReview.open}
        loading={controller.identityReview.loading}
        error={controller.identityReview.error}
        row={controller.identityReview.row}
        candidates={controller.identityReview.candidates}
        onResolve={controller.resolveIdentityReview}
        onClose={controller.closeIdentityReview}
      />
    </>
  )
}
