// features/insightsHub/performance/data/steps/intro.steps.js

export const introSteps = [
  {
    id: 'problem',
    stepLabel: 'פתיחה',
    numStep: 1,
    iconId: 'insights',
    title: 'הבעיה',
    textParts: [
      { text: 'במחלקות נוער, הרבה החלטות מקצועיות נשענות על ' },
      { text: 'תחושות בטן', tone: 'danger' },
      { text: ', כי הדאטה הקיים בסיסי מדי ולא מציג תמונה רחבה ואובייקטיבית.' },
    ],
    buttonLabel: 'המשך למטרת המודל',
  },

  {
    id: 'model-goal',
    stepLabel: 'מטרת המודל',
    numStep: 2,
    iconId: 'performance',
    title: 'מה מודל הביצוע מנסה לפתור?',
    textParts: [
      { text: 'המטרה היא לבנות מערכת שיודעת לקחת ' },
      { text: 'דאטה בסיסי בלבד', tone: 'warning' },
      { text: ' ולהפוך אותו לתמונה מקצועית רחבה על הקבוצה, השחקנים והסגל.' },
    ],
    hiddenTitle: 'המשמעות',
    hiddenText:
      'מודל הביצוע לא מחליף את האנליסט או המאמן. הוא מסדר את הדאטה הקיים, מציף דפוסים, ומאפשר לפתוח בדיקה מקצועית מתוך בסיס אובייקטיבי יותר.',
    buttonLabel: 'המשך לנקודת הפתיחה',
  },
]
