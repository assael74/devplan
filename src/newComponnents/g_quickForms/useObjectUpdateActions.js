import { useEffect, useState } from 'react';
import { updateEventInGoogleCalendar } from '../a_google/calendarUtils';

const normalizeMap = {
  meeting: ['status'],
  // תוכל להוסיף בעתיד: player: ['type'], team: ['coach'], וכו'
};

export default function useObjectUpdateActions({
  value,
  type = 'default',
  onSubmit,
  showSnackbar,
  onClose,
}) {
  const [update, setUpdate] = useState(value);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);

  useEffect(() => {
    setUpdate(value);
  }, [value]);

  useEffect(() => {
    const normalize = (obj) => {
      const keys = normalizeMap[type] || [];
      const result = { ...obj };
      keys.forEach((key) => {
        if (result[key] && typeof result[key] === 'object') {
          result[key] = result[key].id || null;
        }
      });
      return result;
    };
    const same = JSON.stringify(normalize(update)) === JSON.stringify(normalize(value));
    setIsDirty(!same);
  }, [update, value, type]);

  const handleReset = () => {
    setUpdate(value);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const updatedCopy = { ...update };

    if (type === 'meetings' && value?.eventId) {
      setPendingUpdate(updatedCopy);
      setDialogOpen(true);
    } else {
      await submitFinal(updatedCopy);
    }
  };

  const submitFinal = async (finalUpdate, updateInCalendar = false) => {
    try {
      if (updateInCalendar && value?.eventId) {
        await updateEventInGoogleCalendar(value.eventId, finalUpdate);
      }
      await onSubmit({ oldItem: value, newItem: finalUpdate });
      onClose?.({ stopPropagation: () => {} });
    } catch (err) {
      showSnackbar?.('אירעה שגיאה בעדכון', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    update,
    setUpdate,
    isDirty,
    isSubmitting,
    handleReset,
    handleSubmit,
    submitFinal,
    dialogOpen,
    setDialogOpen,
    pendingUpdate,
    setPendingUpdate,
  };
}
