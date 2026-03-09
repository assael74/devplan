// addNewTeam.js
import moment from 'moment';
import { addShortItem } from '../addShortItem';
import { shortsRefs } from '../../shortsRefs';
import { addToLinkedList } from '../addToLinkedList';

/**
 * Add a new team to Firestore shorts collections
 * @param {Object} props - The team data (must include teamId, teamName, clubId)
 * @param {Object} actions - UI actions (like setAlert)
 */
 export const addNewTag = async (props, actions) => {
   const date = moment().format('DD/MM/YYYY');

   const itemsToAdd = [
     {
       ...shortsRefs.tags.tagInfo,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         tagName: props.tagName,
         tagType: props.tagType,
       },
     },
   ];

   const onSuccess = () => actions?.setAlert?.('newTag');
   const onError = (err) =>
     console.error('[newTag] Error:', err.message);

   // ⬇️ יצירה בפועל של חלקי הקבוצה
   for (const cfg of itemsToAdd) {
     await addShortItem({
       ...cfg,
       onSuccess,
       onError,
     });
   }
  // ⬇️ הוספת ID של השחקן לאובביקט מועדון

   // ⬇️ סגירת הטופס או מגירה
   actions?.onClose?.();
 };
