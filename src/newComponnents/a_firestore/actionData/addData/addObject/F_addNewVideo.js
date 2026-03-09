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
 export const addNewVideo = async (props, actions) => {
   const date = moment().format('DD/MM/YYYY');

   const itemsToAdd = [
     {
       ...shortsRefs.videos.videoNames,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         name: props.name,
       },
     },
     {
       ...shortsRefs.videos.videoLinks,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         link: props.link,
       },
     },
     {
       ...shortsRefs.videos.videoComments,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         comments: props.comments,
       },
     },
     {
       ...shortsRefs.videos.videoTags,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         tags: [],
       },
     },
   ];

   const onSuccess = () => actions?.setAlert?.('newVideo');
   const onError = (err) =>
     console.error('[newVideo] Error:', err.message);

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

 export const addNewVideoAnalysis = async (props, actions) => {
   const date = moment().format('DD/MM/YYYY');

   const itemsToAdd = [
     {
       ...shortsRefs.videoAnalyses.analysisInfo,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         name: props.name,
         link: props.link,
         analysDate: props.analysDate,
         meetingId: ''
       },
     },
     {
       ...shortsRefs.videoAnalyses.analysisPlayers,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         players: props.players
       },
     },
     {
       ...shortsRefs.videoAnalyses.analysisComments,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         comments: props.comments,
       },
     },
     {
       ...shortsRefs.videoAnalyses.analysisTags,
       item: {
         id: props.id,
         created: moment().format('DD/MM/YYYY'),
         tags: [],
       },
     },
   ];

   const onSuccess = () => actions?.setAlert?.('newVideo');
   const onError = (err) =>
     console.error('[newVideo] Error:', err.message);

   // ⬇️ יצירה בפועל של חלקי הקבוצה
   for (const cfg of itemsToAdd) {
     await addShortItem({
       ...cfg,
       onSuccess,
       onError,
     });
   }

   // ⬇️ סגירת הטופס או מגירה
   actions?.onClose?.();
 };
