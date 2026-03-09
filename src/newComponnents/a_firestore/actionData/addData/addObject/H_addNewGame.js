import moment from 'moment';
import { addShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';

/**
 * Add a new team to Firestore shorts collections
 * @param {Object} props - The team data (must include id, teamName, clubId)
 * @param {Object} actions - UI actions (like setAlert, onClose)
 */
export const addNewGame = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    {
      ...shortsRefs.games.info,
      item: {
        id: props.id,
        clubId: props.clubId,
        teamId: props.teamId,
        rivel: props.rivel,
        home: props.home,
        type: props.type,
        difficulty: props.difficulty
      },
    },
    {
      ...shortsRefs.games.time,
      item: {
        id: props.id,
        gameDate: props.gameDate,
        gameHour: props.gameHour,
        gameDuration: props.gameDuration
      },
    },
    {
      ...shortsRefs.games.result,
      item: {
        id: props.id,
        goalsFor: props.goalsFor,
        goalsAgainst: props.goalsAgainst,
        result: props.result,
      },
    },
    {
      ...shortsRefs.games.players,
      item: {
        id: props.id,
        players: []
      },
    },
    {
      ...shortsRefs.games.scoutPlayers,
      item: {
        id: props.id,
        scoutPlayers: []
      },
    },
  ];

  const onSuccess = () => actions?.setAlert?.('newGame');
  const onError = (err) =>
    console.error('[addNewGame] Error:', err.message);

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
