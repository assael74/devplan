import moment from 'moment';
import 'moment/locale/he';

moment.locale('he');

export function getAgeFromBirth(birthStr) {
  const raw = birthStr?.trim?.();
  if (!raw) return '';

  const birth = moment(raw, ['MM-YYYY', 'YYYY-MM'], true);
  if (!birth.isValid()) return '';

  const now = moment();
  let age = now.diff(birth, 'years');

  // אם טרם הגיע חודש יום ההולדת → נוריד שנה
  const hasHadBirthdayThisYear = now.month() >= birth.month();
  if (!hasHadBirthdayThisYear) {
    age--;
  }

  return age;
}

export function getMeetingDate(meeting) {
  if (!meeting?.meetingDate) {
    return {
      date: {
        v1: '—',
        v2: '—',
        v3: '—',
        v4: '—',
      },
      hour: '',
    };
  }

  const formats = [
    'YYYY-MM-DD',
    'DD/MM/YY',
    'DD/MM/YYYY',
    'DD.MM.YY',
    'DD.MM.YYYY',
  ];

  let parsedDate = null;

  for (const format of formats) {
    const temp = moment(meeting.meetingDate, format, true);
    if (temp.isValid() && temp.format(format) === meeting.meetingDate) {
      parsedDate = temp;
      break;
    }
  }

  if (!parsedDate) {
    const fallback = moment(meeting.meetingDate);
    if (fallback.isValid()) {
      parsedDate = fallback;
    } else {
      return {
        date: {
          v1: '—',
          v2: '—',
          v3: '—',
          v4: '—',
        },
        hour: '',
      };
    }
  }

  const dateFormats = {
    v1: parsedDate.format('LL'),  // 1 בינואר 2025
    v2: parsedDate.format('L'),   // 01/01/2025
    v3: parsedDate.format('l'),   // 1/1/2025
    v4: parsedDate.format('DD-MM-YYYY'), // 01-01-2025
  };

  return {
    date: dateFormats,
    hour: meeting.meetingHour || '00:00',
  };
}

export function getMeetingForDate(meeting) {
  if (!meeting?.meetingFor) {
    return getEmptyMonthYear();
  }

  const formats = [
    'YYYY-MM',
    'MM/YY',
    'MM/YYYY',
    'MM.YY',
    'MM.YYYY',
  ];

  let parsedDate = null;

  for (const format of formats) {
    const temp = moment(meeting.meetingFor, format, true);
    if (temp.isValid() && temp.format(format) === meeting.meetingFor) {
      parsedDate = temp;
      break;
    }
  }

  if (!parsedDate) {
    const fallback = moment(meeting.meetingFor);
    if (fallback.isValid()) {
      parsedDate = fallback;
    } else {
      return getEmptyMonthYear();
    }
  }

  return {
    v1: parsedDate.format('MMMM YYYY'),     // ינואר 2025
    v2: parsedDate.format('MM/YYYY'),       // 01/2025
    v3: parsedDate.format('MM-YYYY'),       // 01-2025
    v4: parsedDate.format('YY/MM'),         // 25/01
  };
}

export function getPaymentForDate(payment) {
  if (!payment?.paymentFor) {
    return getEmptyMonthYear();
  }

  const formats = [
    'YYYY-MM',
    'MM/YY',
    'MM/YYYY',
    'MM.YY',
    'MM.YYYY',
  ];

  let parsedDate = null;

  for (const format of formats) {
    const temp = moment(payment.paymentFor, format, true);
    if (temp.isValid() && temp.format(format) === payment.paymentFor) {
      parsedDate = temp;
      break;
    }
  }

  if (!parsedDate) {
    const fallback = moment(payment.paymentFor);
    if (fallback.isValid()) {
      parsedDate = fallback;
    } else {
      return getEmptyMonthYear();
    }
  }

  return {
    v1: parsedDate.format('MMMM YYYY'),     // ינואר 2025
    v2: parsedDate.format('MM/YYYY'),       // 01/2025
    v3: parsedDate.format('MM-YYYY'),       // 01-2025
    v4: parsedDate.format('YY/MM'),         // 25/01
  };
}

function getEmptyMonthYear() {
  return {
    v1: '—',
    v2: '—',
    v3: '—',
    v4: '—',
  };
}

export function getTimeUntilMeeting(meeting) {
  const now = moment();
  const fullDateTime = `${meeting.meetingDate}T${meeting.meetingHour}`;
  const meetingDate = moment(fullDateTime);

  if (meetingDate.isBefore(now)) return null;

  const duration = moment.duration(meetingDate.diff(now));

  const days = Math.floor(duration.asDays());
  const hours = duration.hours();
  const minutes = duration.minutes();

  if (days > 0)
    return `בעוד ${days} יום${days === 1 ? '' : 'ים'}${hours > 0 ? ` ו-${hours} שעות` : ''}${minutes > 0 ? ` ו-${minutes} דקות` : ''}`;
  if (hours > 0)
    return `בעוד ${hours} שעות${minutes > 0 ? ` ו-${minutes} דקות` : ''}`;
  if (minutes > 0)
    return `בעוד ${minutes} דקות`;

  return 'עוד רגע';
}

export function getCurrentYear() {
  const today = new Date();
  const month = today.getMonth(); // 0-based: ינואר = 0, דצמבר = 11
  const year = today.getFullYear();
  return month < 6 ? year - 1 : year;
}

export function getMonthYearLabel(ymString = '') {
  if (!ymString || typeof ymString !== 'string') return '-';

  let [part1, part2] = ymString.split('-');

  // זיהוי אם הסדר הפוך
  let year, month;
  if (part1.length === 4) {
    year = part1;
    month = part2;
  } else {
    month = part1;
    year = part2;
  }

  if (!year || !month) return '-';

  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  const monthIndex = parseInt(month, 10) - 1;
  const monthName = monthNames[monthIndex] || '?';

  return `${monthName} ${year}`;
}

export function getFullDateIl(dateObject, isMobile) {
  if (!dateObject) return '—';
  const date = new Date(dateObject);
  if (isNaN(date.getTime())) return '—';

  const day = String(date.getDate()).padStart(2, '0');      // 01–31
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 01–12
  const year = date.getFullYear();
  const yy = String(year % 100).padStart(2, '0');

  return `${day}-${month}-${isMobile ? yy : year}`;
}

export function getDayName(dateStr, isMobile) {
  const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
  const daysLetter = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"]
  const date = new Date(dateStr);
  const dayIndex = date.getDay(); // 0 = ראשון, 6 = שבת
  return isMobile ? daysLetter[dayIndex] : days[dayIndex];
}

export function isGameInPast(gameDate, gameHour) {
  if (!gameDate || !gameHour) return false;

  const dateTimeStr = `${gameDate}T${gameHour}`;
  const gameDateTime = new Date(dateTimeStr);
  const now = new Date();

  return gameDateTime <= now;
};
