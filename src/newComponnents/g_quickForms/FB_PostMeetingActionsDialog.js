// 📁 src/components/PostMeetingActionsDialog.jsx
import React from 'react';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  Stack
} from '@mui/joy';

export default function PostMeetingActionsDialog({ open, onClose, onConfirm }) {
  const [addToCalendar, setAddToCalendar] = React.useState(true);

  const handleConfirm = () => {
    onConfirm({ updateInCalendar: addToCalendar });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog variant="outlined" role="dialog">
        <DialogTitle>האם לבצע פעולות נוספות?</DialogTitle>
        <DialogContent>
          <FormControl>
            <FormLabel>סמן את הפעולות שתרצה לבצע:</FormLabel>
          </FormControl>

          <Stack spacing={1} mt={1}>
            <Checkbox
              label="הוסף ליומן Google עם תזכורות"
              checked={addToCalendar}
              onChange={(e) => setAddToCalendar(e.target.checked)}
            />
            <Checkbox
              label="שלח הודעה לשחקן (בעתיד)"
              disabled
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="solid" color="success" onClick={handleConfirm}>
            אשר ושמור
          </Button>
          <Button variant="plain" color="neutral" onClick={onClose}>
            ביטול
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
