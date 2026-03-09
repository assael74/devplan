import moment from 'moment';
import { addShortItem, setShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';

export const addNewRole = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');

  const itemsToAdd = [
    {
      ...shortsRefs.roles.info,
      item: {
        id: props.id,
        fullName: props.fullName,
        type: props.type,
        clubId: props.clubId,
        teamId: props.teamId,
        photo: ''
      },
    },
    {
      ...shortsRefs.roles.contact,
      item: {
        id: props.id,
        phone: '000-0000000',
        email: '',
      },
    },
  ];
  
  const onSuccess = () => actions?.setAlert?.('newRole');
  const onError = (err) =>
    console.error('[addNewRole] Error:', err.message);

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
