import { doc, setDoc } from 'firebase/firestore';
//import { db } from '../../../firebaseConfig'; // נתיב לדאטהבייס שלך
import { setShortItem } from '../addShortItem';

export const addNewGameStats = async (props, actions = {}) => {
  const {
    id,
    teamId,
    gameId,
    playerStats = [],
    teamStats = [],
    rivelStats = []
  } = props;

  const onSuccess = () => actions?.setAlert?.('newGameStats');
  const onError = (err) => console.error('[addNewGameStats]', err.message);

  await setShortItem({
    collection: 'gameStatsShorts',
    docId: id,
    item: {
      id,
      teamId,
      gameId,
      playerStats,
      teamStats,
      rivelStats
    },
    onSuccess,
    onError,
  });

  actions?.onClose?.();
};
