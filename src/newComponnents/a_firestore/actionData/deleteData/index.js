// deleteData/index.js

import { deletePlayer } from './deletePlayer';
import { deletePayment } from './deletePayment';
import { deleteMeeting } from './deleteMeeting';
import { deleteTeam } from './deleteTeam';
import { deleteClub } from './deleteClub';

/**
 * Delete object from Firestore (with dependencies).
 * @param {string} type - 'player', 'payment', 'meeting', 'team', 'club'
 * @param {string|object} data - id (string) או אובייקט (payment/meeting)
 * @param {function} showSnackbar - פונקציה להצגת סנאקבר (useSnackbar)
 */
export async function deleteObject(type, data, showSnackbar) {
  switch (type) {
    case 'player':
      return await deletePlayer(data, showSnackbar);
    case 'payment':
      return await deletePayment(data, showSnackbar);
    case 'meeting':
      return await deleteMeeting(data, showSnackbar);
    case 'team':
      return await deleteTeam(data, showSnackbar);
    case 'club':
      return await deleteClub(data, showSnackbar);
    default:
      console.warn('[deleteObject] סוג לא נתמך:', type);
  }
}
