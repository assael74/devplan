import moment from 'moment';
import { generateEvalutionParmId } from '../../../../f_forms/helpers/generateId.js'
import { addShortItem, setShortItem } from '../addShortItem';
import { addToLinkedList } from '../addToLinkedList';
import { shortsRefs } from '../../shortsRefs';
import { abilitiesList } from '../../../../x_utils/abilitiesList';

export const addNewPlayer = async (props, actions) => {
  const date = moment().format('DD/MM/YYYY');
  const docAbilitiesId = generateEvalutionParmId(`${props.id}-abilities`)

  const emptyAbilities = abilitiesList.reduce((acc, ability) => {
    acc[ability.id] = 0;
    return acc;
  }, {});

  const itemsToAdd = [
    {
      ...shortsRefs.players.name,
      item: {
        id: props.id,
        created: date,
        playerLastName: props.playerLastName,
        playerFirstName: props.playerFirstName,
        playerShortName: props.playerShortName,
      },
    },
    {
      ...shortsRefs.players.info,
      item: {
        id: props.id,
        phone: '000-0000000',
        photo: '',
        birth: props.birth,
        birthDay: '',
        active: true,
        type: props.type,
        positions: [],
        projectStatus: '',
        ifaLink: props.ifaLink
      },
    },
    {
      ...shortsRefs.players.parents,
      item: {
        id: props.id,
        parents: [],
      },
    },
    {
      ...shortsRefs.players.playerPayments,
      item: {
        id: props.id,
        playerPayments: [],
        isOpenPayment: false,
      },
    },
    {
      ...shortsRefs.players.team,
      item: {
        id: props.id,
        clubId: props.clubId,
        teamId: props.teamId,
      },
    },
    {
      ...shortsRefs.players.analysis,
      item: {
        id: props.id,
        playerAnalysis: [],
      },
    },
    {
      ...shortsRefs.players.proInfo,
      item: {
        id: props.id,
        proToWatch: [],
        favoriteClub: [],
        height: [],
        weight: [],
        bodyFat: [],
      },
    },
    {
      ...shortsRefs.players.playerMeetings,
      item: {
        id: props.id,
        playerMeetings: [],
      },
    },
    {
      ...shortsRefs.players.abilities,
      item: {
        id: props.id,
        level: 0,
        levelPotential: 0,
        abilities: emptyAbilities,
        docAbilitiesId: docAbilitiesId,
      },
    },
  ];

  const abilitiesShortDoc = {
    playerId: props.id,
    formsAbilities: [],
  };

  const onSuccess = () => actions?.setAlert?.('newPlayer');
  const onError = (err) =>
    console.error('[newPlayer] Error:', err.message);

    // ⬇️ יצירה בפועל של חלקי הקבוצה
  for (const cfg of itemsToAdd) {
    await addShortItem({
      ...cfg,
      onSuccess,
      onError,
    });
  }

  // ⬇️ הוספת מסמך ל abilitiesShorts לשחקן
  await setShortItem({
    collection: 'abilitiesShorts',
    docId: docAbilitiesId,
    item: abilitiesShortDoc,
    onSuccess,
    onError,
  });

  // ⬇️ סגירת הטופס או מגירה
  actions?.onClose?.();
};
