import {
  canDeleteMeeting,
  canDeletePayment,
  canDeletePlayer,
  canDeleteTeam,
} from '../../../a_firestore/actionData/deleteData/helpers/checkDeletePermissions.js';
import { getPlayersWithOpenPayments } from '../../../x_utils/paymentsUtiles.js'

export function getDeletePermission({ type, item, formProps, allShorts }) {
  switch (type) {
    case 'meetings':
      return canDeleteMeeting(item);

    case 'payments':
      return canDeletePayment(item);

    case 'players': {
      const payments = (formProps?.payments || []).filter(p => p.playerId === item.id);
      const meetings = (formProps?.meetings || []).filter(m => m.playerId === item.id);
      return canDeletePlayer(item, payments, meetings);
    }

    case 'teams': {
      const teamPlayers = (formProps?.players || []).filter(p => p.teamId === item.id);
      const teamGames = (formProps?.games || []).filter(p => p.teamId === item.id);
      const payments = formProps?.payments || [];
      const playerPaymentsSummary = getPlayersWithOpenPayments(teamPlayers, payments, 'partial');
      return canDeleteTeam(item, playerPaymentsSummary, teamGames);
    }

    case 'clubs': {
      const clubPlayers = (formProps?.players || []).filter(p => p.clubId === item.id);
      const payments = formProps?.payments || [];
      const playerPaymentsSummary = getPlayersWithOpenPayments(clubPlayers, payments, 'partial');
      return canDeleteTeam(item, playerPaymentsSummary);
    }

    default:
      return { allowed: true };
  }
}
