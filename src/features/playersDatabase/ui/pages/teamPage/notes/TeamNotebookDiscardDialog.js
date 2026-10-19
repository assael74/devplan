// src/features/playersDatabase/ui/pages/teamPage/notes/TeamNotebookDiscardDialog.js

import { Button, Typography } from '@mui/joy'
import AnimatedModal from '../../../../../../ui/patterns/modals/AnimatedModal.js'

export default function TeamNotebookDiscardDialog({ open, onContinue, onDiscard }) {
  return (
    <AnimatedModal
      open={open}
      size='sm'
      title='לסגור בלי לשמור את הטיוטות?'
      iconId='notes'
      confirmLabel='המשך עריכה'
      hideCancel
      onConfirm={onContinue}
      onClose={onContinue}
      footerSx={{ flexWrap: 'wrap' }}
      footerActions={<Button variant='outlined' color='danger' onClick={onDiscard}>סגירה ללא שמירה</Button>}
    >
      <Typography level='body-sm'>
        זו תצוגת ממשק בלבד. הטקסטים שערכת במסלולים יימחקו בסגירה, ואין עדיין אפשרות שמירה.
      </Typography>
    </AnimatedModal>
  )
}
