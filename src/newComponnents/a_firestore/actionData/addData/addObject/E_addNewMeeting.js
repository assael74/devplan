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
 export const addNewMeeting = async (props, actions) => {
   const date = moment().format('DD/MM/YYYY');

   const itemsToAdd = [
     {
       ...shortsRefs.meetings.date,
       item: {
         id: props.id,
         meetingDate: props.meetingDate,
         meetingHour: props.meetingHour,
         meetingFor: props.meetingFor,
         isInGoogleCalendar: props.isInGoogleCalendar,
         eventId: props.eventId || null
       },
     },
     {
       ...shortsRefs.meetings.video,
       item: {
         id: props.id,
         videoLink: props.videoLink,
       },
     },
     {
       ...shortsRefs.meetings.player,
       item: {
         id: props.id,
         playersId: [],
         playerId: props.playerId,
         type: props.type,
         status: {id: 'new', time: moment().format('DD/MM/YYYY')},
       },
     },
     {
       ...shortsRefs.meetings.notes,
       item: {
         id: props.id,
         notes: '',
         tags: [],
       },
     },
   ];

   const onSuccess = () => actions?.setAlert?.('newMeeting');
   const onError = (err) =>
     console.error('[newMeeting] Error:', err.message);

   // ⬇️ יצירה בפועל של חלקי הקבוצה
   for (const cfg of itemsToAdd) {
     await addShortItem({
       ...cfg,
       onSuccess,
       onError,
     });
   }
  // ⬇️ הוספת ID של השחקן לאובביקט מועדון
   await addToLinkedList({
     parentType: 'players/playerMeetings',
     parentId: props.playerId,
     field: 'playerMeetings',
     itemId: props.id,
     customUpdater: (list, parentId, field, itemId) =>
     list.map((entry) =>
       entry.id === parentId
         ? {
             ...entry,
             [field]: [...(entry[field] || []), itemId],
           }
         : entry
     ),
     onSuccess: () => actions?.setAlert?.('linked_player_meeting'),
   });

   // ⬇️ סגירת הטופס או מגירה
   actions?.onClose?.();
 };
