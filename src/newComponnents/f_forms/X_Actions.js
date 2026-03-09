import moment from 'moment';

// פונקציות יצירת אובייקטים
import { addNewClub } from '../a_firestore/actionData/addData/addObject/A_addNewClub.js';
import { addNewTeam } from '../a_firestore/actionData/addData/addObject/B_addNewTeam.js';
import { addNewPlayer } from '../a_firestore/actionData/addData/addObject/C_addNewPlayer.js';
import { addNewScouting } from '../a_firestore/actionData/addData/addObject/K_addNewScoutIng.js';
import { addNewRole } from '../a_firestore/actionData/addData/addObject/J_addNewRole.js';
import { addNewPayment } from '../a_firestore/actionData/addData/addObject/D_addNewPayment.js';
import { addNewMeeting } from '../a_firestore/actionData/addData/addObject/E_addNewMeeting.js';
import { addNewVideo, addNewVideoAnalysis } from '../a_firestore/actionData/addData/addObject/F_addNewVideo.js'
import { addNewTag } from '../a_firestore/actionData/addData/addObject/G_addNewTag.js';
import { addNewGame } from '../a_firestore/actionData/addData/addObject/H_addNewGame.js';
import { addNewGameStats } from '../a_firestore/actionData/addData/addObject/HA_addNewGameStats.js';
import { addNewAbilities } from '../a_firestore/actionData/addData/addObject/I_addNewAbilities.js';
import { updatePlayerAbilities } from '../a_firestore/actionData/updateData/updateObject/updatePlayerAbilities.js';

export function validateBeforeSave(data, context = {}, type) {
  if (type === 'club') {
    if (!data.clubName?.trim()) return 'יש להזין שם מועדון';

    const exists = context.clubs?.some(
      (c) => c.clubName.trim() === data.clubName.trim()
    );
    if (exists) return 'מועדון בשם הזה כבר קיים';
  }

  if (type === 'team') {
    if (!data.teamName?.trim()) return 'יש להזין שם קבוצה';
    if (!data.clubId?.trim()) return 'יש לבחור מועדון לקבוצה';

    const exists = context.teams?.some(
      (t) =>
        t.teamName.trim() === data.teamName.trim() &&
        t.clubId === data.clubId
    );
    if (exists) return 'כבר קיימת קבוצה בשם הזה במועדון הנבחר';
  }

  if (type === 'player') {
    if (!data.playerFirstName?.trim() || !data.playerLastName?.trim()) {
      return 'יש להזין שם פרטי ומשפחה';
    }

    const exists = context.players?.some((p) =>
      p.playerFirstName.trim() === data.playerFirstName.trim() &&
      p.playerLastName.trim() === data.playerLastName.trim() &&
      p.birth === data.birth &&
      (p.clubId === data.clubId || p.teamId === data.teamId)
    );

    if (exists) {
      return 'שחקן עם אותו שם ושנת לידה כבר משויך לקבוצה או מועדון זה';
    }
  }

  if (type === 'role') {
    if (!data.fullName?.trim()) {
      return 'יש להזין שם פרטי ומשפחה';
    }

    const exists = context.roles?.some((p) =>
      p.fullName.trim() === data.fullName.trim()
    );

    if (exists) {
      return 'יש כבר איש מקצוע בשם הזה';
    }
  }
  return true;
}

export const getDefaultActions = ({ type }) => {
  return {
    onAdd: async (data, actions) => {
      const usedType = type || data?.videoType;
      const withMeta = {
        ...data,
        created: moment().format('DD/MM/YYYY'),
      };

      console.log(`[onAdd] ➕ ${usedType}`, withMeta);

      switch (usedType) {
        case 'clubs':
          await addNewClub(withMeta, actions);
          break;
        case 'teams':
          await addNewTeam(withMeta, actions);
          break;
        case 'players':
          await addNewPlayer(withMeta, actions);
          break;
        case 'scouting':
          await addNewScouting(withMeta, actions);
          break;
        case 'roles':
          await addNewRole(withMeta, actions);
          break;
        case 'payments':
          await addNewPayment(withMeta, actions);
          break;
        case 'meetings':
          await addNewMeeting(withMeta, actions);
          break;
        case 'videos':
          await addNewVideo(withMeta, actions);
          break;
        case 'videoAnalysis':
          await addNewVideoAnalysis(withMeta, actions);
          break;
        case 'games':
          await addNewGame(withMeta, actions);
          break;
        case 'gameStats':
          await addNewGameStats(withMeta, actions);
          break;
        case 'abilities':
          await updatePlayerAbilities(withMeta, actions);
          break;
        case 'tags':
          await addNewTag(withMeta, actions);
          break;
        default:
          console.warn(`❌ לא קיימת פעולה עבור type: ${usedType}`);
      }

      actions?.onClose?.(); // סגור טופס/מגירה
    },
  };
};
