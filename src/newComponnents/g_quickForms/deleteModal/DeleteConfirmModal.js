// 📁 g_quickForms/deleteModal/DeleteConfirmModal.js
import React, { useState } from 'react';
import { getDeleteDialogMessages } from './helpers/getDeleteDialogMessage.js';
import { sheetProps } from './X_Style'
import { useSnackbar } from '../../h_componnetsUtils/SnackBar/SnackbarProvider';
import { deleteEventFromGoogleCalendar } from '../../a_google/calendarUtils.js'
import { Box, Typography, Button, Sheet, Divider } from '@mui/joy';
import { iconUi } from '../../b_styleObjects/icons/IconIndex';

const snackbarConfig = {
  clubs: { text: 'מועדון נמחק בהצלחה', iconId: 'delete' },
  teams: { text: 'קבוצה נמחקה בהצלחה', iconId: 'delete' },
  players: { text: 'שחקן נמחק בהצלחה', iconId: 'delete' },
  payments: { text: 'תשלום נמחק בהצלחה', iconId: 'delete' },
  meetings: { text: 'פגישה נמחקה בהצלחה', iconId: 'delete' },
  games: { text: 'משחק נמחק בהצלחה', iconId: 'delete' },
  tags: { text: 'תג נמחק בהצלחה', iconId: 'delete' },
  roles: { text: 'איש צוות נמחק בהצלחה', iconId: 'delete' },
};

export default function DeleteConfirmModal({
  type,
  isMobile,
  formProps,
  allShorts,
  item = null,
  disableConfirm = false,
  iconId = 'delete',
  onClose = () => {},
  onDelete = () => {},
  title = 'אישור מחיקה',
}) {
  const { allowed, message, reason } = getDeleteDialogMessages(type, item, formProps, allShorts);
  const { showSnackbar } = useSnackbar();

  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      if (type === 'meetings' && item?.eventId) {
        await deleteEventFromGoogleCalendar(item.eventId);
      }
      await onDelete(item);
      showSnackbar (snackbarConfig[type].text, 'danger', snackbarConfig[type].iconId);
    } catch (err) {
      console.error('❌ שגיאה במחיקה:', err);
      showSnackbar('שגיאה במחיקה', 'danger');
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  const fontSize = isMobile ? '13px' : '15px'
  const color = reason ? 'danger' : 'neutral'

  return (
    <>
      <Sheet onClick={(e) => e.stopPropagation()} {...sheetProps}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {iconUi({ id: iconId, size: 'xl' })}
          <Typography level="h4" fontWeight="lg">
            {title}
          </Typography>
        </Box>
        <Divider />
        <Typography color={color} fontSize={fontSize} level="body-lg" sx={{ whiteSpace: 'pre-wrap' }}>
        {message}
        </Typography>
        {reason && (
          <Typography fontSize={isMobile ? '12px' : '14px'} level="body-md" sx={{ whiteSpace: 'pre-wrap' }}>
            <Typography component="span" fontWeight="lg">
              סיבה:
            </Typography>{' '}
            {reason}
          </Typography>
        )}
      </Sheet>
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        <Button variant="plain" color="neutral" onClick={() => onClose()} disabled={isDeleting}>
          ביטול
        </Button>
        <Button variant="solid" color="danger" onClick={handleConfirm} disabled={!allowed} loading={isDeleting}>
          מחק
        </Button>
      </Box>
    </>
  );
}
