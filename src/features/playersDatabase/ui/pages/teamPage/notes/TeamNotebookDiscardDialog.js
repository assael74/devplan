// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookDiscardDialog.js

import React from 'react'
import { Button, DialogActions, DialogContent, DialogTitle, Modal, ModalDialog } from '@mui/joy'

export default function TeamNotebookDiscardDialog({ open, onContinue, onDiscard }) {
  return (
    <Modal open={open} onClose={onContinue}>
      <ModalDialog
        role='alertdialog'
        aria-labelledby='notebook-discard-title'
        aria-describedby='notebook-discard-description'
        sx={{ direction: 'rtl', maxWidth: 420, width: 'calc(100vw - 32px)' }}
      >
        <DialogTitle id='notebook-discard-title'>לסגור בלי לשמור את הטיוטות?</DialogTitle>
        <DialogContent id='notebook-discard-description'>
          זו תצוגת ממשק בלבד. השינויים בטקסט ובקישורים יימחקו בסגירה, ואין עדיין אפשרות שמירה.
        </DialogContent>
        <DialogActions sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button autoFocus variant='solid' onClick={onContinue}>המשך עריכה</Button>
          <Button variant='outlined' color='danger' onClick={onDiscard}>סגירה ללא שמירה</Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  )
}
