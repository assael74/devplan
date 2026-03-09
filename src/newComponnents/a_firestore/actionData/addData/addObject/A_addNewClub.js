import moment from 'moment';
import { addShortItem } from '../addShortItem';
import { shortsRefs } from '../../shortsRefs';

export const addNewClub = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    { ...shortsRefs.clubs.info,
      item: {
        photo: '',
        color: {
          bg: '',
          tex: ''
        },
        id: props.id,
        created: date,
        active: true,
        ifaLink: props.ifaLink,
        clubName: props.clubName,
      }
    },
  ];

  const onSuccess = () => actions?.setAlert?.('newClub');
  const onError = (err) =>
    console.error('[addNewClub] Error:', err.message);

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
