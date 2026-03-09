import moment from 'moment';
import { addShortItem, setShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';

export const addNewScouting = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    {
      ...shortsRefs.scouting.info,
      item: {
        id: props.id,
        created: date,
        league: props.league,
        playerName: props.playerName,
        teamName: props.teamName,
        clubName: props.clubName,
        birth: props.birth,
        positions: [],
        ifaLink: props.ifaLink,
        photo: '',
        active: true,
        notes: '',
      },
    },
    {
      ...shortsRefs.scouting.games,
      item: {
        id: props.id,
        games: [],
        lastCheck: date,
      },
    },
  ];

  const onSuccess = () => actions?.setAlert?.('newScout');
  const onError = (err) =>
    console.error('[newScout] Error:', err.message);

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
