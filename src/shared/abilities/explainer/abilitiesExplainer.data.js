// shared/abilities/explainer/abilitiesExplainer.data.js

import { abilitiesList } from '../abilities.list.js'
import {
  ABILITY_DOMAIN_WEIGHTS,
  POTENTIAL_DOMAIN_WEIGHTS,
  PHYSICAL_GROWTH_ADJUSTMENTS,
  FINAL_POTENTIAL_GROWTH_ADJUSTMENTS,
  ABILITY_SCORE_MIN,
  ABILITY_SCORE_MAX,
  WINDOW_DAYS,
} from '../engine/abilitiesHistory.constants.js'

export const ABILITIES_EXPLAINER_INTRO = {
  id: 'intro',
  title: 'איך עובד דירוג השחקן',
  iconId: 'insights',
  paragraphs: [
    'מטרת הדירוג היא לתרגם הערכה מקצועית רחבה לשני ציונים ברורים: יכולת ופוטנציאל.',
    'יכולת משקפת את הרמה הנוכחית של השחקן, ופוטנציאל משקף את הרמה שאליה הוא יכול להגיע בהמשך.',
    'המערכת מחשבת את הציונים בצורה מסודרת, כך שגם אם יש כמה דיווחים, בזמנים שונים, ועל חלק מהיכולות בלבד, עדיין אפשר לקבל תמונה ברורה, יציבה והוגנת.',
  ],
}

export const ABILITIES_EXPLAINER_DOMAINS_ORDER = [
  'physical',
  'technical',
  'gameUnderstanding',
  'mental',
  'cognitive',
]

export const ABILITIES_EXPLAINER_DOMAIN_DESCRIPTIONS = {
  physical: 'התחום הפיזי בודק את היכולת הגופנית של השחקן.',
  technical: 'התחום הטכני בודק את איכות הפעולה של השחקן עם הכדור.',
  gameUnderstanding: 'התחום הזה בודק עד כמה השחקן מבין את המשחק, את המרחב ואת התנועה סביבו.',
  mental: 'התחום המנטלי בודק את צורת ההתנהלות של השחקן, את הגישה שלו ואת היכולת שלו להתמודד עם מצבים שונים.',
  cognitive: 'התחום הקוגניטיבי בודק איך השחקן חושב, לומד ומקבל החלטות.',
}

export const ABILITIES_EXPLAINER_SCORE_SCALE = {
  id: 'scoreScale',
  title: 'סולם הציונים',
  iconId: 'elite',
  min: ABILITY_SCORE_MIN,
  max: ABILITY_SCORE_MAX,
  items: [
    { value: 1, label: 'נמוך מאוד' },
    { value: 2, label: 'נמוך' },
    { value: 3, label: 'בינוני' },
    { value: 4, label: 'טוב' },
    { value: 5, label: 'גבוה מאוד' },
  ],
}

export const ABILITIES_EXPLAINER_LEVEL_SECTION = {
  id: 'level',
  title: 'איך מחושב ציון היכולת',
  iconId: 'level',
  paragraphs: [
    'חישוב היכולת נעשה בשלושה שלבים.',
    'בשלב הראשון כל איש מקצוע נותן ציונים ליכולות שהוא ראה ויכול להעריך.',
    'בשלב השני המערכת מחשבת ציון לכל תחום לפי היכולות שמולאו בפועל באותו תחום.',
    'בשלב השלישי המערכת מחשבת ציון יכולת כללי לפי משקל התחומים.',
    'המערכת מתחשבת רק במה שמולא בפועל, ולא מחשיבה יכולת חסרה כאפס.',
  ],
  example: {
    title: 'דוגמה פשוטה',
    text: 'אם לשחקן יש ציון גבוה בתחום הטכני ובהבנת משחק, וציון נמוך יותר בתחום הפיזי, הציון הכללי יושפע יותר מהתחומים החזקים לפי המשקלים שנקבעו להם.',
  },
}

export const ABILITIES_EXPLAINER_POTENTIAL_SECTION = {
  id: 'potential',
  title: 'איך מחושב ציון הפוטנציאל',
  iconId: 'potential',
  paragraphs: [
    'ציון הפוטנציאל מחושב בצורה דומה לציון היכולת, אך עם משקלי תחומים שונים.',
    'המטרה היא לא לבדוק רק מה השחקן מציג היום, אלא גם עד כמה יש לו מקום לצמוח בהמשך.',
    'לכן, בפוטנציאל יש גם התחשבות בשלב ההתפתחות הביולוגית של השחקן.',
  ],
  example: {
    title: 'דוגמה פשוטה',
    text: 'שחקן שעדיין נמצא בשלב התפתחות מוקדם, אבל כבר מציג בסיס מקצועי טוב, עשוי לקבל ציון פוטנציאל גבוה יותר.',
  },
}

export const ABILITIES_EXPLAINER_DEVELOPMENT_SECTION = {
  id: 'developmentHelp',
  title: 'מרכיב עזר: התפתחות ביולוגית',
  iconId: 'development',
  paragraphs: [
    'התפתחות ביולוגית אינה אחד מתחומי הדירוג הראשיים.',
    'היא לא נכנסת ישירות לציון היכולת, אלא משמשת כמרכיב עזר לפירוש המצב הפיזי ולחישוב הפוטנציאל.',
    'המשמעות היא שהמערכת לא בודקת רק מה השחקן מציג כרגע, אלא גם באיזה שלב גופני הוא נמצא.',
  ],
}

export const ABILITIES_EXPLAINER_WINDOWS_SECTION = {
  id: 'windows',
  title: 'חלונות דיווח',
  iconId: 'calendar',
  paragraphs: [
    `חלון דיווח הוא תקופת זמן שבה כמה דיווחים נחשבים לאותו סבב הערכה. אצלנו חלון כזה הוא עד ${WINDOW_DAYS} ימים.`,
    'אם כמה טפסים מולאו בתוך פרק הזמן הזה, המערכת מחברת אותם לתמונה אחת.',
    'כאשר נפתח חלון חדש, המערכת בודקת מה המרחק מהחלון הקודם ומשלבת בין הישן לחדש לפי הזמן שעבר.',
  ],
  insideWindowTitle: 'מה קורה בתוך אותו חלון',
  insideWindowItems: [
    'אם כמה אנשי מקצוע מילאו את אותו תחום בתוך אותו חלון, המערכת מחשבת ממוצע ביניהם.',
    'אם אותה יכולת קיבלה כמה ציונים בתוך אותו חלון, המערכת מחשבת ממוצע של הציונים.',
    'גם שלב ההתפתחות מחושב כממוצע בתוך אותו חלון.',
  ],
  mergeRulesTitle: 'מה קורה בין חלונות שונים',
  mergeRules: [
    { id: 'within16Weeks', label: 'עד 16 שבועות', value: '70% מהחלון החדש + 30% מהחלון הקודם' },
    { id: 'within6Months', label: 'עד כ-6 חודשים', value: '80% מהחלון החדש + 20% מהחלון הקודם' },
    { id: 'after6Months', label: 'מעל כ-6 חודשים', value: 'החלון החדש מחליף את הישן' },
  ],
  developmentNoteTitle: 'חריג חשוב: שלב התפתחות',
  developmentNote:
    'שלב ההתפתחות אינו נמשך בין חלונות כמו שאר היכולות. בתוך אותו חלון נעשה ממוצע, אבל בחלון חדש הערך החדש גובר.',
  example: {
    title: 'דוגמה פשוטה',
    text: 'אם מאמן אחד נתן למהירות ציון 4 ואיש צוות נוסף נתן למהירות ציון 5, ושני הדיווחים שייכים לאותו חלון, התוצאה המאוחדת תהיה 4.5.',
  },
}

export const ABILITIES_EXPLAINER_RELIABILITY_SECTION = {
  id: 'reliability',
  title: 'מהימנות הציון',
  iconId: 'readiness',
  paragraphs: [
    'מעבר לציון היכולת ולציון הפוטנציאל, חשוב להבין גם עד כמה אפשר לסמוך עליהם.',
    'ככל שיש יותר מידע, יותר תחומים שמולאו, ויותר אנשי מקצוע שדיווחו, כך הציון יציב ואמין יותר.',
    'ככל שיש פחות מידע, צריך לפרש את המספר בזהירות גדולה יותר.',
  ],
  levels: [
    { id: 'low', label: 'נמוכה' },
    { id: 'medium', label: 'בינונית' },
    { id: 'high', label: 'גבוהה' },
  ],
}

export const ABILITIES_EXPLAINER_EXAMPLE_SECTION = {
  id: 'example',
  title: 'דוגמה מסכמת',
  iconId: 'insights',
  paragraphs: [
    'נניח שלשחקן יש ציון טוב בתחום הטכני ובהבנת משחק, ציון פיזי בינוני, והוא נמצא בשלב התפתחות מוקדם.',
    'במצב כזה, ייתכן שהיכולת הנוכחית תהיה טובה, אבל הפוטנציאל יהיה גבוה יותר, משום שיש בסיס מקצועי טוב לצד מקום טבעי להמשך התפתחות.',
  ],
}

export const ABILITIES_EXPLAINER_SUMMARY = {
  id: 'summary',
  title: 'סיכום',
  iconId: 'summary',
  paragraphs: [
    'המערכת בודקת יכולות בתוך תחומים קבועים, מחשבת ציון לכל תחום, וממנו מחשבת יכולת ופוטנציאל.',
    'בנוסף, היא מתחשבת בזמן שעבר בין דיווחים, נעזרת בהתפתחות ביולוגית כמרכיב עזר, ובודקת גם עד כמה התוצאה מבוססת על מידע מספק.',
    'בסוף התהליך מתקבלים שני ציונים מרכזיים: יכולת, שמראה איפה השחקן נמצא היום, ופוטנציאל, שמראה לאן הוא יכול להגיע בהמשך.',
  ],
}

export {
  abilitiesList,
  ABILITY_DOMAIN_WEIGHTS,
  POTENTIAL_DOMAIN_WEIGHTS,
  PHYSICAL_GROWTH_ADJUSTMENTS,
  FINAL_POTENTIAL_GROWTH_ADJUSTMENTS,
}
