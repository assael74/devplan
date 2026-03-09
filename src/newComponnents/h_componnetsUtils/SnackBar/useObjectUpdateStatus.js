import { useEffect, useState } from 'react';
import { useSnackbar } from './SnackbarProvider';

// בודק אם אובייקט תקין לפי שדות הכרחיים
const objectValidators = {
  players: (p) => p?.id && p?.playerFirstName && p?.playerLastName,
  teams: (t) => t?.id && t?.teamName && t?.clubId,
  clubs: (c) => c?.id && c?.clubName,
  payments: (p) => p?.id && p?.playerId && p?.price,
  meetings: (m) => m?.id && m?.meetingDate && m?.playerId,
};

// מחזיר טקסט מותאם לפי סוג האובייקט
const getUpdateMessage = (type) => {
  switch (type) {
    case 'players':
      return '🎯 פרטי השחקן עודכנו בהצלחה';
    case 'teams':
      return '🎯 פרטי הקבוצה עודכנו בהצלחה';
    case 'clubs':
      return '🎯 פרטי המועדון עודכנו בהצלחה';
    case 'payments':
      return '🎯 פרטי התשלום עודכנו בהצלחה';
    case 'meetings':
      return '🎯 פרטי הפגישה עודכנו בהצלחה';
    default:
      return '🎯 הפריט עודכן בהצלחה';
  }
};

/**
 * הוק להצגת Snackbar בעת עדכון פריט
 * @param {object} params
 * @param {object} params.updatedItem - הפריט לאחר עדכון
 * @param {string} params.objectId - מזהה הפריט (id)
 * @param {boolean} params.isWaiting - האם במצב המתנה
 * @param {string} params.type - סוג האובייקט ('players', 'teams' וכו')
 * @param {function} [params.clear] - פונקציה לאיפוס סטייט
 */
export function useObjectUpdateStatus({
  updatedItem,
  objectId,
  isWaiting,
  type = 'players',
  clear,
}) {
  const { showSnackbar } = useSnackbar();
  const [hasFired, setHasFired] = useState(false);

  useEffect(() => {
    //console.log('updatedItem', updatedItem)
    //console.log('objectId', objectId)
    //console.log('isWaiting', isWaiting)
    //console.log('type', type)
    //console.log(!isWaiting , !objectId , hasFired)
    if (!isWaiting || !objectId || hasFired) return;

    const isValid =
      updatedItem?.id === objectId &&
      (objectValidators[type]?.(updatedItem) ?? true);

    if (isValid) {
      showSnackbar(getUpdateMessage(type));
      setHasFired(true);
      clear?.(); // איפוס סטייט אם יש
    }
  }, [updatedItem, objectId, isWaiting, hasFired, type]);
}
