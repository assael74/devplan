// src/features/playersDatabase/components/leagues/board/FirestoreLoadMapPrintReport.js

import React from 'react'
import { Box, Sheet, Typography } from '@mui/joy'

import { SCOUT_PROFILES } from '../../../../../../shared/players/scouting/profiles.js'
import {
  SCOUT_INTEREST,
  SCOUT_LEVEL,
  TEAM_FILTER,
} from '../../../../../../shared/players/scouting/ids.js'
import { iconUi } from '../../../../../../ui/core/icons/iconUi.js'

const sx = {
  root: {
    p: 3,
    display: 'grid',
    gap: 2,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  section: {
    border: '1px solid #d8e0e7',
    borderRadius: '8px',
    p: 1.5,
    display: 'grid',
    gap: 1,
  },
  pageBreak: {
    breakBefore: 'page',
    pageBreakBefore: 'always',
  },
  header: {
    display: 'grid',
    gap: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    lineHeight: 1.2,
  },
  subtitle: {
    color: '#64717f',
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
  },
  sectionText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.5,
  },
  profileList: {
    display: 'grid',
    gap: 0.75,
  },
  profileRow: {
    display: 'grid',
    gridTemplateColumns: '34px 1fr',
    gap: 1,
    alignItems: 'flex-start',
    padding: '10px 12px',
    border: '1px solid #d8e0e7',
    borderRadius: '8px',
    backgroundColor: '#fbfcfd',
  },
  profileIcon: {
    width: 28,
    height: 28,
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1d4ed8',
    backgroundColor: '#eaf2ff',
    border: '1px solid #c7dafe',
    '& svg': {
      fontSize: 18,
    },
  },
  profileContent: {
    display: 'grid',
    gap: 0.45,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 700,
  },
  profileMeta: {
    display: 'grid',
    gap: 0.2,
    fontSize: 13.5,
    color: '#4b5563',
    lineHeight: 1.55,
  },
  profileMetaLabel: {
    color: '#111827',
    fontWeight: 800,
  },
  collectionList: {
    display: 'grid',
    gap: 0.75,
  },
  collectionRow: {
    display: 'grid',
    gap: 0.25,
    padding: '10px 12px',
    border: '1px solid #d8e0e7',
    borderRadius: '8px',
    backgroundColor: '#fbfcfd',
  },
  collectionName: {
    fontSize: 13,
    fontWeight: 800,
  },
  collectionDescription: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 1.45,
  },
  row: {
    display: 'grid',
    gap: 0.5,
    fontSize: 13,
    lineHeight: 1.5,
  },
}

const metricLabels = {
  isYoungerAgeGroup: 'שנתון צעיר יותר',
  games: 'משחקים',
  startsPct: 'אחוז פתיחות',
  subOut: 'הוחלף החוצה',
  minutesPct: 'אחוז דקות',
  yellowCards: 'צהובים',
  goals: 'שערים',
  goalsPer90: 'שערים ל־90',
  goalsShareOfTeam: 'חלק מהשערים של הקבוצה',
}

const levelLabels = {
  [SCOUT_LEVEL.SAME]: 'אותה ליגה',
  [SCOUT_LEVEL.BELOW]: 'ליגה נמוכה יותר',
  [SCOUT_LEVEL.ABOVE]: 'ליגה גבוהה יותר',
}

const interestLabels = {
  [SCOUT_INTEREST.REASONABLE]: 'סביר',
  [SCOUT_INTEREST.INTERESTING]: 'מעניין',
  [SCOUT_INTEREST.SUPER]: 'מעניין מאוד',
}

const teamFilterLabels = {
  [TEAM_FILTER.ANY]: 'אין סינון הקשר קבוצתי',
  [TEAM_FILTER.ATTACK_POSITIVE]: 'רק קבוצות עם ביצוע התקפי חיובי',
  [TEAM_FILTER.ATTACK_POSITIVE_OR_GOALS_GTE_10]: 'רק קבוצות עם ביצוע התקפי חיובי',
  [TEAM_FILTER.ANY_POSITIVE]: 'רק קבוצות עם ביצוע הגנתי או התקפי חיובי',
  [TEAM_FILTER.CLEAR_POSITIVE]: 'רק קבוצות עם ביצוע הגנתי או התקפי חיובי',
  [TEAM_FILTER.DEFENSE_POSITIVE]: 'רק קבוצות עם ביצוע הגנתי חיובי',
}

const positionContextLabels = {
  defense_midfield: 'חוליית הגנה או קישור הגנתי',
  not_attack: 'רק לא שחקן התקפה',
}

function formatPositionContext(positionContext) {
  return positionContextLabels[positionContext] || 'אין סינון הקשר עמדה'
}

const collections = [
  {
    name: 'אוסף הליגות',
    description: 'שומר את פרטי הליגה, העונות והאינדקס של הקבוצות.',
  },
  {
    name: 'אוסף צילומי הליגה',
    description: 'מחזיק את צילומי הליגה בזמן נתון ואת נתוני הרקע שלהם.',
  },
  {
    name: 'אוסף השחקנים',
    description: 'מסמך הבסיס של השחקן, כולל נתוני זיהוי וקישור חיצוני.',
  },
  {
    name: 'אוסף שיוכי העונות',
    description: 'שומר את השחקן בתוך עונה וקבוצה, יחד עם קישורי העונה והסטטוס.',
  },
  {
    name: 'אוסף הסטטיסטיקה של השחקנים',
    description: 'שומר את הסטטיסטיקה וההיסטוריה של השחקן לעונה מסוימת.',
  },
  {
    name: 'אוסף החיפוש של השחקנים',
    description: 'מסמך חיפוש נגזר שמרכז נתוני שחקן, סטטיסטיקה ופרופילי סקאוט.',
  },
]

const loadSteps = [
  {
    title: 'מסך הליגות',
    collections: ['אוסף הליגות', 'אוסף צילומי הליגה'],
    detail: 'נטען סיכום הליגות ונתוני הרקע של הליגה דרך לוח הליגות.',
  },
  {
    title: 'מסך הסריקה',
    collections: ['אוסף הליגות', 'אוסף צילומי הליגה'],
    detail: 'נטענים רק נתוני הליגות; האינדיקציות נטענות רק בלחיצה על כפתור הטעינה.',
  },
  {
    title: 'טעינת מסמכי שחקן',
    collections: ['אוסף הסטטיסטיקה של השחקנים', 'אוסף החיפוש של השחקנים', 'אוסף שיוכי העונות'],
    detail: 'מסמך הסטטיסטיקה נבנה, אחריו מסמך החיפוש, ובמידת הצורך גם השיוך לעונה מעודכן.',
  },
]

const playerDocumentFlow = [
  'נוצר מסמך בסיסי של השחקן',
  'נוצר שיוך לעונה ולקבוצה',
  'נשמרת סטטיסטיקה לעונה',
  'נבנה מסמך חיפוש לעונה',
  'במעבר לעונה חדשה נוצרים מסמכים חדשים לעונה החדשה והמסמכים הישנים נשארים',
]

function formatValue(metric, value) {
  if (
    typeof value === 'number' &&
    ['minutesPct', 'startsPct', 'goalsShareOfTeam'].includes(metric) &&
    value <= 1
  ) {
    return `${Math.round(value * 100)}%`
  }

  return `${value}`
}

function formatRule(rule) {
  const label = metricLabels[rule.metric] || rule.metric

  if (rule.op === 'truthy') return label
  if (rule.op === 'eq') return `${label} = ${formatValue(rule.metric, rule.value)}`
  if (rule.op === 'gte') return `${label} לפחות ${formatValue(rule.metric, rule.value)}`
  if (rule.op === 'lte') return `${label} עד ${formatValue(rule.metric, rule.value)}`
  if (rule.op === 'gt') return `${label} מעל ${formatValue(rule.metric, rule.value)}`
  if (rule.op === 'lt') return `${label} מתחת ${formatValue(rule.metric, rule.value)}`
  if (rule.op === 'between') {
    return `${label} ${formatValue(rule.metric, rule.min)}-${formatValue(rule.metric, rule.max)}`
  }

  return `${label}`
}

function formatRuleList(rules = []) {
  return rules.map(formatRule).join(' · ')
}

function formatLevels(levels = []) {
  return levels.map(level => levelLabels[level] || level).join(' · ')
}

function buildProfileMeta(profile) {
  const lines = [
    `רמת עניין: ${interestLabels[profile.interest] || profile.interest}`,
    `רמת חיפוש: ${formatLevels(profile.searchLevels) || 'לא הוגדר'}`,
    `סינון הקשר קבוצתי: ${teamFilterLabels[profile.teamFilter] || profile.teamFilter}`,
    `סינון הקשר עמדה: ${formatPositionContext(profile.positionContext)}`,
    `תנאים רגילים: ${formatRuleList(profile.rules) || 'אין'}`,
  ]

  if (profile.deepRules?.length) {
    lines.push(`תנאי עומק: ${formatRuleList(profile.deepRules)}`)
  }

  return lines.join(' | ')
}

function renderProfileMeta(profile) {
  return buildProfileMeta(profile).split(' | ').map(line => {
    const [label, ...valueParts] = line.split(': ')
    const value = valueParts.join(': ')

    return (
      <Typography key={line} component="span">
        <Typography component="span" sx={sx.profileMetaLabel}>
          {label}
        </Typography>
        {value ? `: ${value}` : ''}
      </Typography>
    )
  })
}

const superProfiles = SCOUT_PROFILES.filter(profile => profile.interest === SCOUT_INTEREST.SUPER)
const interestingProfiles = SCOUT_PROFILES.filter(profile => profile.interest === SCOUT_INTEREST.INTERESTING)

function renderProfileTable(title, profiles, pageBreak = false) {
  return (
    <Sheet variant="soft" sx={pageBreak ? { ...sx.section, ...sx.pageBreak } : sx.section}>
      <Typography sx={sx.sectionTitle}>
        {title}
      </Typography>

      <Box sx={sx.profileList}>
        {profiles.map(profile => (
          <Box key={profile.id} sx={sx.profileRow}>
            <Box sx={sx.profileIcon}>
              {iconUi({ id: profile.idIcon, size: 'small' }) || iconUi({ id: 'scout', size: 'small' })}
            </Box>

            <Box sx={sx.profileContent}>
              <Typography sx={sx.profileName}>
                {profile.label}
              </Typography>

              <Typography sx={sx.profileMeta}>
                {renderProfileMeta(profile)}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Sheet>
  )
}

export default function FirestoreLoadMapPrintReport() {
  return (
    <Box sx={sx.root}>
      <Sheet variant="soft" sx={sx.section}>
        <Box sx={sx.header}>
          <Typography sx={sx.title}>
            מפת טעינה של מאגר הנתונים
          </Typography>

          <Typography sx={sx.subtitle}>
            סיכום קצר של הקולקשנים, מסלולי הטעינה והפרופילים שמרכיבים את מסך החיפוש.
          </Typography>
        </Box>

        <Typography sx={sx.sectionText}>
          כל פרופיל בונה תנאי חיפוש קבועים: שנתון, סינון קבוצה, רמת עניין, תנאי בסיס ותנאי עומק.
        </Typography>
      </Sheet>

      {renderProfileTable('מעניין מאוד', superProfiles)}

      {renderProfileTable('מעניין', interestingProfiles, true)}

      <Sheet variant="soft" sx={{ ...sx.section, ...sx.pageBreak }}>
        <Typography sx={sx.sectionTitle}>
          הקולקשנים המרכזיים
        </Typography>

        <Box sx={sx.collectionList}>
          {collections.map(item => (
            <Box key={item.name} sx={sx.collectionRow}>
              <Typography sx={sx.collectionName}>
                {item.name}
              </Typography>

              <Typography sx={sx.collectionDescription}>
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>

        <Typography sx={sx.sectionTitle}>
          מסלול טעינה
        </Typography>

        {loadSteps.map(step => (
          <Box key={step.title} sx={sx.row}>
            <Typography sx={{ fontWeight: 700 }}>
              {step.title}
            </Typography>

            <Typography>
              {step.detail}
            </Typography>

            <Typography sx={{ fontSize: 12, color: '#4b5563' }}>
              {step.collections.join(' · ')}
            </Typography>
          </Box>
        ))}
      </Sheet>

      <Sheet variant="soft" sx={{ ...sx.section, ...sx.pageBreak }}>
        <Typography sx={sx.sectionTitle}>
          תהליך יצירת מסמכי השחקן ומעבר בין עונות
        </Typography>

        <Typography sx={sx.sectionText}>
          זהו רצף העבודה שמתקבל כאשר שחקן עובר מעונה אחת לעונה אחרת, ורק מסמכי השחקן עצמם נבנים מחדש.
        </Typography>

        <Box sx={{ display: 'grid', gap: 0.5 }}>
          {playerDocumentFlow.map(item => (
            <Typography key={item} sx={sx.row}>
              - {item}
            </Typography>
          ))}
        </Box>

        <Typography sx={sx.sectionText}>
          בכל עונה נשמרים מסמך סטטיסטיקה ומסמך חיפוש נפרדים, ולכן מעבר לעונה חדשה יוצר מסמכים חדשים בלי למחוק את הישנים.
        </Typography>
      </Sheet>
    </Box>
  )
}
