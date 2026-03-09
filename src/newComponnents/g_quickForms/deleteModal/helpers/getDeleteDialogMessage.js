import { getMeetingDate } from '../../../x_utils/dateUtiles.js';
import { getDeletePermission } from './deletePermissionHandlers.js';

export function getDeleteDialogMessages(type, item, formProps, allShorts) {
  const permission = getDeletePermission({type, item, formProps, allShorts})
  const relatedMap = {
    payments: { list: formProps.players, key: 'playerId', nameField: 'playerFullName' },
    meetings: { list: formProps.players, key: 'playerId', nameField: 'playerFullName' },
    players:  { list: formProps.teams,   key: 'teamId', nameField: 'teamName' },
    teams:  { list: formProps.clubs,   key: 'clubId', nameField: 'clubName' },
  };
  const relatedName = () => {
    const config = relatedMap[type];
    if (!config) return null;

    const related = config.list.find(i => i.id === item[config.key]);
    return related?.[config.nameField] || null;
  };

  const label = getObjectLabel(type, item, relatedName());

  if (!permission.allowed) {
    return {
      allowed: false,
      message: `❌ לא ניתן למחוק את ${label}`,
      reason: `${permission.reason}${permission.tip ? `\nהצעה: ${permission.tip}` : ''}`,
      related: `${relatedName()}`
    };
  }

  return {
    allowed: true,
    message: `האם אתה בטוח שברצונך למחוק את ${label}?`,
    reason: ``,
    related: `${relatedName()}`
  };
}

function getObjectLabel(type, item, related) {
  switch (type) {
    case 'players':
      return `השחקן ${item.playerFullName} המשחק בקבוצת ${related}`
    case 'meetings':
      return `התשלום של ${related} עבור ${getMeetingDate(item)}`
    case 'teams':
      return `הקבוצה "${item.teamName}" מהמועדון ${related}`;
    case 'clubs':
      return `המועדון "${item.clubName}"`;
    case 'payments':
      return `התשלום של ${related} עבור ${item.paymentFor}`
    default:
      return 'הפריט הנבחר';
  }
}
