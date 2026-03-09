import moment from 'moment';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { updateShortItemList } from '../../updateData/updateShortItemList.js'
import { addShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';

/**
 * Add a new team to Firestore shorts collections
 * @param {Object} props - The team data (must include id, teamName, clubId)
 * @param {Object} actions - UI actions (like setAlert, onClose)
 */
export const addNewPayment = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    {
      ...shortsRefs.payments.opretive,
      item: {
        id: props.id,
        playerId: props.playerId,
        status: {id: 'new', time: moment().format('DD/MM/YYYY')},
      },
    },
    {
      ...shortsRefs.payments.profit,
      item: {
        id: props.id,
        paymentFor: props.paymentFor,
        price: Number(props.price) || 0,
        type: props.type,
      },
    },
  ];

  const onSuccess = () => actions?.setAlert?.('newPayment');
  const onError = (err) =>
    console.error('[newPayment] Error:', err.message);

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
    parentType: 'players/playerPayments',
    parentId: props.playerId,
    field: 'playerPayments',
    itemId: props.id,
    customUpdater: (list, parentId, field, itemId) =>
    list.map((entry) =>
      entry.id === parentId
        ? {
            ...entry,
            [field]: [...(entry[field] || []), itemId],
            isOpenPayment: true, // ✅ תוספת מותאמת
          }
        : entry
    ),
    onSuccess: () => actions?.setAlert?.('linked_player_payment'),
  });

  // ⬇️ סגירת הטופס או מגירה
  actions?.onClose?.();
};
