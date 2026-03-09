import moment from 'moment';
import { addShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';

export const addNewTeam = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    {
      ...shortsRefs.teams.info,
      item: {
        id: props.id,
        teamName: props.teamName,
        clubId: props.clubId,
        created: date,
        photo: '',
        color: {
          bg: '',
          tex: ''
        },
        active: true,
        project: props.project,
        teamYear: props.teamYear,
        ifaLink: props.ifaLink,
        league: '',
        position: 0,
        points: 0,
        goals: { for: 0, against: 0, diff: 0 }
      },
    },
  ];

  const onSuccess = () => actions?.setAlert?.('newTeam');
  const onError = (err) =>
    console.error('[addNewTeam] Error:', err.message);

  // ⬇️ יצירה בפועל של חלקי הקבוצה
  for (const cfg of itemsToAdd) {
    await addShortItem({
      ...cfg,
      onSuccess,
      onError,
    });
  }

  // ⬇️ עדכון מועדון – הוספת הקבוצה לרשימת הקבוצות
  await addToLinkedList({
    parentType: 'clubs/teams',
    parentId: props.clubId,
    field: 'teams',
    itemId: props.id,
    onSuccess: () => actions?.setAlert?.('linked_club_team'),
  });

  // ⬇️ סגירת הטופס או מגירה
  actions?.onClose?.();
};
