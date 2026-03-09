export const statsParm = [
  // בסיס
  {
    id: 'timePlayed',
    statsParmName: 'דקות משחק',
    statsParmShortName: 'דקות משחק',
    statsParmFieldType: 'number',
    statsParmType: 'general',
    isDefault: true,
    order: 2,
    tripletGroup: '',
    displayFormat: 'valueOnly'
  },
  {
    id: 'timeVideoStats',
    statsParmName: 'זמן וידאו',
    statsParmShortName: 'וידאו מצולם',
    statsParmFieldType: 'number',
    statsParmType: 'general',
    isDefault: true,
    order: 1,
    tripletGroup: '',
    displayFormat: 'valueOnly'
  },
  {
    id: 'isStarting',
    statsParmName: 'בהרכב',
    statsParmShortName: 'בהרכב',
    statsParmFieldType: 'boolean',
    statsParmType: 'general',
    isDefault: true,
    order: 0,
    tripletGroup: '',
    displayFormat: 'valueOnly'
  },
  {
    id: 'position',
    statsParmName: 'עמדה',
    statsParmShortName: 'עמדה',
    statsParmFieldType: 'select',
    statsParmType: 'general',
    isDefault: true,
    order: 1,
    tripletGroup: '',
    displayFormat: ''
  },
  // מסירות (triplet)
  {
    id: 'passesTotal',
    statsParmName: 'סה"כ מסירות',
    statsParmShortName: 'סה"כ מסירות',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 2,
    tripletGroup: 'passes',
    displayFormat: 'triplet'
  },
  {
    id: 'passesSuccess',
    statsParmName: 'מסירות מוצלחות',
    statsParmShortName: 'מסירות +',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 2,
    tripletGroup: 'passes',
    displayFormat: 'triplet'
  },
  {
    id: 'passesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 2,
    tripletGroup: 'passes',
    displayFormat: 'triplet'
  },
  // מסירות מפתח
  {
    id: 'keyPassesTotal',
    statsParmName: 'סה"כ מסירות מפתח',
    statsParmShortName: 'מסירות מפתח',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 3,
    tripletGroup: 'keyPasses',
    displayFormat: ''
  },
  {
    id: 'keyPassesSuccess',
    statsParmName: 'מסירות מפתח מוצלחות',
    statsParmShortName: 'מוצלחות',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 3,
    tripletGroup: 'keyPasses',
    displayFormat: ''
  },
  {
    id: 'keyPassesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 3,
    tripletGroup: 'keyPasses',
    displayFormat: ''
  },
  // הגבהות
  {
    id: 'crossesTotal',
    statsParmName: 'סה"כ הגבהות',
    statsParmShortName: 'סה"כ הגבהות',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 4,
    tripletGroup: 'crosses',
    displayFormat: ''
  },
  {
    id: 'crossesSuccess',
    statsParmName: 'הגבהות מוצלחות',
    statsParmShortName: 'מוצלחות',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 4,
    tripletGroup: 'crosses',
    displayFormat: ''
  },
  {
    id: 'crossesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 4,
    tripletGroup: 'crosses',
    displayFormat: ''
  },
  // דריבלים
  {
    id: 'dribblesTotal',
    statsParmName: 'סה"כ דריבלים',
    statsParmShortName: 'סה"כ דריבלים',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 5,
    tripletGroup: 'dribbles',
    displayFormat: ''
  },
  {
    id: 'dribblesSuccess',
    statsParmName: 'דריבלים מוצלחים',
    statsParmShortName: 'מוצלחים',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 5,
    tripletGroup: 'dribbles',
    displayFormat: ''
  },
  {
    id: 'dribblesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 5,
    tripletGroup: 'dribbles',
    displayFormat: ''
  },
  // איומים לשער
  {
    id: 'shotsTotal',
    statsParmName: 'איומים לשער',
    statsParmShortName: 'איומים לשער',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 6,
    tripletGroup: 'shots',
    displayFormat: ''
  },
  {
    id: 'shotsOnTarget',
    statsParmName: 'איומים למסגרת',
    statsParmShortName: 'למסגרת',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 6,
    tripletGroup: 'shots',
    displayFormat: ''
  },
  {
    id: 'shotsOnTargetSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'offensive',
    isDefault: false,
    order: 6,
    tripletGroup: 'shots',
    displayFormat: ''
  },
  {
    id: 'xG',
    statsParmName: 'XG',
    statsParmShortName: 'XG',
    statsParmFieldType: 'number',
    statsParmType: 'offensive',
    isDefault: false,
    order: 10,
    tripletGroup: '',
    displayFormat: ''
  },
  // שערים ובישולים
  {
    id: 'goals',
    statsParmName: 'שערים',
    statsParmShortName: 'שערים',
    statsParmFieldType: 'number',
    statsParmType: 'offensive',
    isDefault: true,
    order: 8,
    tripletGroup: '',
    displayFormat: ''
  },
  {
    id: 'assists',
    statsParmName: 'בישולים',
    statsParmShortName: 'בישולים',
    statsParmFieldType: 'number',
    statsParmType: 'offensive',
    isDefault: true,
    order: 9,
    tripletGroup: '',
    displayFormat: ''
  },
  /// תיקולים
  {
    id: 'tacklesTotal',
    statsParmName: 'סה"כ תיקולים',
    statsParmShortName: 'סה"כ תיקולים',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 11,
    tripletGroup: 'tackles',
    displayFormat: ''
  },
  {
    id: 'tacklesSuccess',
    statsParmName: 'תיקולים מוצלחים',
    statsParmShortName: 'מוצלחים',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 11,
    tripletGroup: 'tackles',
    displayFormat: ''
  },
  {
    id: 'tacklesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 11,
    tripletGroup: 'tackles',
    displayFormat: ''
  },
  {
    id: 'keyTacklesTotal',
    statsParmName: 'סה"כ תיקולי מפתח',
    statsParmShortName: 'תיקולי מפתח',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 12,
    tripletGroup: 'keyTackles',
    displayFormat: ''
  },
  {
    id: 'keyTacklesSuccess',
    statsParmName: 'תיקולי מפתח מוצלחים',
    statsParmShortName: 'מוצלחים',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 12,
    tripletGroup: 'keyTackles',
    displayFormat: ''
  },
  {
    id: 'keyTacklesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 12,
    tripletGroup: 'keyTackles',
    displayFormat: ''
  },
  // איבודי כדור
  {
    id: 'ballLoss',
    statsParmName: 'איבודי כדור',
    statsParmShortName: 'איבודי כדור',
    statsParmFieldType: 'number',
    statsParmType: 'offensive',
    isDefault: false,
    order: 13,
    tripletGroup: '',
    displayFormat: ''
  },
  // חטיפות
  {
    id: 'interceptions',
    statsParmName: 'חטיפות',
    statsParmShortName: 'חטיפות',
    statsParmFieldType: 'number',
    statsParmType: 'defensive',
    isDefault: false,
    order: 13,
    tripletGroup: '',
    displayFormat: ''
  },
  // ביצוע עבירות
  {
    id: 'foulsCommitted',
    statsParmName: 'ביצוע עבירות',
    statsParmShortName: 'ביצוע עבירות',
    statsParmFieldType: 'number',
    statsParmType: 'defensive',
    isDefault: false,
    order: 14,
    tripletGroup: '',
    displayFormat: ''
  },
  // סחיטת עבירות
  {
    id: 'foulsDrawn',
    statsParmName: 'סחיטת עבירות',
    statsParmShortName: 'סחיטת עבירות',
    statsParmFieldType: 'number',
    statsParmType: 'offensive',
    isDefault: false,
    order: 14,
    tripletGroup: '',
    displayFormat: ''
  },
  // לחץ אישי
  {
    id: 'personalPressuresTotal',
    statsParmName: 'סה"כ לחץ אישי',
    statsParmShortName: 'לחץ אישי',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'personalPressures',
    displayFormat: ''
  },
  {
    id: 'personalPressuresSuccess',
    statsParmName: 'לחץ אישי מוצלח',
    statsParmShortName: 'מוצלח',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'personalPressures',
    displayFormat: ''
  },
  {
    id: 'personalPressuresSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'personalPressures',
    displayFormat: ''
  },
  // הרחקות כדור
  {
    id: 'ballClearancesTotal',
    statsParmName: 'סה"כ הרחקות כדור',
    statsParmShortName: 'הרחקות כדור',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'ballClearances',
    displayFormat: ''
  },
  {
    id: 'ballClearancesSuccess',
    statsParmName: 'הרחקות כדור מוצלחות',
    statsParmShortName: 'הרחקות מוצלחות',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'ballClearances',
    displayFormat: ''
  },
  {
    id: 'ballClearancesSuccessRate',
    statsParmName: 'אחוז הצלחה',
    statsParmShortName: 'אחוז הצלחה',
    statsParmFieldType: 'triplet',
    statsParmType: 'defensive',
    isDefault: false,
    order: 15,
    tripletGroup: 'ballClearances',
    displayFormat: ''
  },
];
