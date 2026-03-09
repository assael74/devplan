//// a_firestore/actionData/addData/addObject/I_addNewAbilities.js
import { doc, setDoc } from 'firebase/firestore';
//import { db } from '../../../firebaseConfig'; // נתיב לדאטהבייס שלך
import { setShortItem } from '../addShortItem';

export const addNewAbilities = async (props, actions = {}) => {
  const {
    id,
    teamId,
    gameId,
  } = props;

  const onSuccess = () => actions?.setAlert?.('newAbilities');
  const onError = (err) => console.error('[addNewAbilities]', err.message);

  await setShortItem({
    collection: 'abilitiesShorts',
    docId: id,
    item: {
      id,
      //playerId,

    },
    onSuccess,
    onError,
  });

  actions?.onClose?.();
};
