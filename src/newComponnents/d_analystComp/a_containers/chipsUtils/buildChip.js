// 📁 /utils/buildChip.js
import { iconUi, getIconList } from '../../../b_styleObjects/icons/IconIndex';
import { typeBackground } from '../../../b_styleObjects/Colors.js'
import { Avatar } from '@mui/joy';
import clubImage from '../../../b_styleObjects/images/clubImage.png';
import { optionTypePayment, getStatusPaymentsList } from '../../../x_utils/paymentsUtiles.js'
import { optionTypePlayer, optionTypeMeeting, statusMeetingList } from '../../../x_utils/optionLists.js';

export function interpretChip(chipData, formProps = {}) {
  if (chipData.render) return chipData.render; // תמיכה בצ'יפ מותאם מראש (JSX)
  //console.log(getIconList())
  const { idItem, value, objectType, isMobile } = chipData;

  switch (idItem) {
    case 'type': {
      if (objectType === 'players') {
        const typeItem = (type) => optionTypePlayer.find(p => p.id === type) || {};
        return {
          label: typeItem(value).labelH,
          icon: iconUi({ id: typeItem(value).idIcon, size: 'sm', sx: { py: isMobile ? 0.2 : 0 } }),
          showLabel: {
            sm: false,
            md: true
          },
          link: null,
          color: typeItem(value).id === 'project' ? typeBackground.success.main : typeBackground.warning.main,
          //width: 20,
        };
      }
      if (objectType === 'teams') {
        return {
          label: value ? 'פרוייקט' : 'כללית',
          icon: iconUi({ id: value ? 'project' : 'isNotProject', size: 'sm', sx: {py: isMobile ? 0.2 : 0} }),
          showLabel: {
            sm: false,
            md: true
          },
          link: null,
          color: typeBackground.success.main
          //width: { sm: 40, md: 100 },
        };
      }
      if (objectType === 'payments') {
        const typeItem = (type) => optionTypePayment.find(p => p.id === type) || {};
        return {
          label: typeItem(value).labelH,
          icon: iconUi({ id: typeItem(value).idIcon, size:'sm' }),
          showLabel: {
            sm: false,
            md: true
          },
          link: null,
          color: typeBackground.success.main
          //width: { sm: 40, md: 100 },
        };
      }
      if (objectType === 'meetings') {
        const typeItem = (type) => optionTypeMeeting.find(p => p.id === type) || {};
        return {
          label: typeItem(value).labelH,
          icon: iconUi({ id: typeItem(value).idIcon, fontSize:'xs' }),
          showLabel: {
            sm: true,
            md: true
          },
          link: null,
          color: typeBackground.success.main
        };
      }
      break;
    }

    case 'link': {
      return {
        label: 'התאחדות',
        icon: iconUi({ id: 'link', size: 'sm' }),
        showLabel: {
          sm: false,
          md: true
        },
        link: null,
        color: typeBackground.warning.main,
        //width: 20,
      };
      break;
    }

    case 'club': {
      const club = formProps.clubs?.find(c => c.id === value);
      if (!club) return { label: 'מועדון לא נמצא', icon: null, showLabel: true };
      const image = club.photo ? club.photo : clubImage;
      const clubName = club.clubName;
      return {
        label: clubName || 'מועדון',
        icon: <Avatar src={image} sx={{ width: isMobile ? 20 : 18, height: isMobile ? 20 : 18 }} />,
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        //width: { sm: 90, md: 120 },
        //color: typeBackground.clubs
      };
    }

    case 'positions': {
      const positions = value || [];

      // אין שימוש באווטאר גרופ – ניתן להחזיר label בלבד או JSX מותאם
      if (positions.length === 0) {
        return {
          label: 'לא נבחר',
          icon: iconUi({ id: 'position', size: 'sm' }),
          showLabel: {
            sm: true,
            md: true
          },
          link: null,
          width: { sm: 60, md: 100 },
          color: typeBackground.project
        };
      }

      if (positions.length === 1) {
        return {
          label: positions[0],
          icon: iconUi({ id: positions[0], size: 'sm' }),
          showLabel: true,
          link: null,
          width: { sm: 40, md: 100 },
          color: typeBackground.project
        };
      }

      // יותר מעמדה אחת – נחזיר label מקוצר + אפשרות להחלפה בעתיד
      return {
        label: `${positions[0]}+`,
        icon: iconUi({ id: positions[0], size: 'sm' }),
        showLabel: true,
        link: null,
        width: { sm: 40, md: 100 },
        color: typeBackground.project
      };
    }

    case 'paymentStatus': {
      const statusItem = (id) => getStatusPaymentsList(isMobile).find((p) => p.id === id) || {};
      const status = statusItem(value)?.id;
      const statusColorMap = {
        new: typeBackground.danger,
        invoice: typeBackground.warning,
      };
      const idColor = statusColorMap[status] || typeBackground.success;

      return {
        label: statusItem(value).labelH,
        icon: iconUi({ id: statusItem(value).idIcon, size: 'sm' }),
        showLabel: {
          sm: false,
          md: true
        },
        link: null,
        width: { sm: 30, md: 140 },
        color: idColor.main
      };
    }

    case 'meetings': {
      return {
        label: value,
        icon: iconUi({ id: 'meetings', size: 'sm', fontSize: isMobile ? 'xs' : 'md' }),
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        //width: { sm: 40, md: 50 },
        //color: typeBackground.meetings
      };
    }

    case 'level': {
      return {
        label: value,
        icon: iconUi({ id: 'star', size: 'sm' }),
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        //width: { sm: 40, md: 50 },
        //color: typeBackground.meetings
      };
    }

    case 'levelPotential': {
      return {
        label: value,
        icon: iconUi({ id: 'star', size: 'sm' }),
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        //width: { sm: 40, md: 50 },
        //color: typeBackground.meetings
      };
    }

    case 'playersCount': {
      if (objectType === 'players') {
        return {
          label: `${value} פרו`,
          icon: iconUi({ id: 'project', size: 'sm' }),
          showLabel: {
            sm: true,
            md: true
          },
          link: null,
          //color: typeBackground.players
          //width: { sm: 40, md: 100 },
        };
      }

      break;
    }

    case 'active': {
      return {
        label: value ? 'פעילה' : 'לא פעילה',
        icon: iconUi({ id: value ? 'active' : 'notActive', size:'sm' }),
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        color: value ? typeBackground.success.main : typeBackground.danger.main
        //width: { sm: 40, md: 100 },
      };
    }

    case 'status': {
      const statusItem = (id) => statusMeetingList.find((p) => p.id === id) || {};
      const status = statusItem(value)?.id;
      const statusColorMap = {
        new: typeBackground.success.main,
        canceled: typeBackground.danger.main,
      };
      const idColor = statusColorMap[status] || typeBackground.success.light;
      return {
        label: statusItem(value).labelH,
        icon: iconUi({ id: statusItem(value).idIcon, size: 'sm' }),
        showLabel: {
          sm: true,
          md: true
        },
        link: null,
        width: { sm: 80, md: 100 },
        color: idColor
      };
    }

    case 'isInCalendar': {
      return {
        label: '',
        icon: iconUi({ id: value ? 'meetingReminder' : 'meetingOffReminder', size: 'sm' }),
        showLabel: {
          sm: false,
          md: false
        },
        link: null,
        color: value ? typeBackground.success.main : typeBackground.danger.light
        //width: { sm: 40, md: 100 },
      };
    }

    default:
      return {
        label: String(value),
        icon: null,
        showLabel: {
          sm: false,
          md: true
        },
        link: null,
        width: { sm: 40, md: 100 },
        color: typeBackground.project
      };
  }
}

function typeItem(type) {
  const map = {
    project: { labelH: 'פרויקט', idIcon: 'project' },
    noneType: { labelH: 'קבוצה', idIcon: 'noneType' },
    // הוסף עוד אם יש צורך
  };
  return map[type] || { labelH: 'לא מוגדר', idIcon: 'noneType' };
}

function meetingTypeLabel(value) {
  const map = {
    personal: 'אישי',
    group: 'קבוצתי',
    // הוסף לפי הצורך
  };
  return map[value] || value;
}
