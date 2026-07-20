// features/playersDatabase/components/summary/print/FirestoreLoadMapPrintReport.js

import React from 'react'
import {
  Box,
  Sheet,
  Typography,
} from '@mui/joy'

import { SCOUT_PROFILES } from '../../../../../shared/players/scouting/profiles.js'
import {
  SCOUT_INTEREST,
  SCOUT_LEVEL,
  TEAM_FILTER,
} from '../../../../../shared/players/scouting/ids.js'
import { iconUi } from '../../../../../ui/core/icons/iconUi.js'
import { summaryPrintSx as sx } from './print.sx.js'

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

const superProfiles = SCOUT_PROFILES.filter(
  profile => profile.interest === SCOUT_INTEREST.SUPER
)

const interestingProfiles = SCOUT_PROFILES.filter(
  profile => profile.interest === SCOUT_INTEREST.INTERESTING
)

function formatPositionContext(positionContext) {
  return positionContextLabels[positionContext] || 'אין סינון הקשר עמדה'
}

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

function ProfileMeta({ profile }) {
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

function ProfileRow({ profile }) {
  return (
    <Box sx={sx.profileRow}>
      <Box sx={sx.profileIcon}>
        {iconUi({ id: profile.idIcon, size: 'sm' }) ||
          iconUi({ id: 'scout', size: 'sm' })}
      </Box>

      <Box sx={sx.profileContent}>
        <Typography sx={sx.profileName}>
          {profile.label}
        </Typography>

        <Typography sx={sx.profileMeta}>
          <ProfileMeta profile={profile} />
        </Typography>
      </Box>
    </Box>
  )
}

function ProfileTable({ title, profiles, pageBreak = false }) {
  return (
    <Sheet
      variant="soft"
      sx={pageBreak ? { ...sx.section, ...sx.pageBreak } : sx.section}
    >
      <Typography sx={sx.title}>
        {title}
      </Typography>

      <Box sx={sx.profileList}>
        {profiles.map(profile => (
          <ProfileRow key={profile.id} profile={profile} />
        ))}
      </Box>
    </Sheet>
  )
}

function CollectionsSection() {
  return (
    <Sheet variant="soft" sx={{ ...sx.section, ...sx.pageBreak }}>
      <Typography sx={sx.title}>
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

      <Typography sx={sx.title}>
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
  )
}

function PlayerDocumentsSection() {
  return (
    <Sheet variant="soft" sx={{ ...sx.section, ...sx.pageBreak }}>
      <Typography sx={sx.title}>
        תהליך יצירת מסמכי השחקן ומעבר בין עונות
      </Typography>

      <Typography sx={sx.subtitle}>
        זהו רצף העבודה שמתקבל כאשר שחקן עובר מעונה אחת לעונה אחרת,
        ורק מסמכי השחקן עצמם נבנים מחדש.
      </Typography>

      <Box sx={{ display: 'grid', gap: 0.5 }}>
        {playerDocumentFlow.map(item => (
          <Typography key={item} sx={sx.row}>
            - {item}
          </Typography>
        ))}
      </Box>

      <Typography sx={sx.subtitle}>
        בכל עונה נשמרים מסמך סטטיסטיקה ומסמך חיפוש נפרדים,
        ולכן מעבר לעונה חדשה יוצר מסמכים חדשים בלי למחוק את הישנים.
      </Typography>
    </Sheet>
  )
}

export default function FirestoreLoadMapPrintReport() {
  return (
    <Box sx={sx.section}>
      <Sheet variant="soft" sx={sx.section}>
        <Box sx={sx.header}>
          <Typography sx={sx.title}>
            מפת טעינה של מאגר הנתונים
          </Typography>

          <Typography sx={sx.subtitle}>
            סיכום קצר של הקולקשנים, מסלולי הטעינה והפרופילים שמרכיבים את מסך החיפוש.
          </Typography>
        </Box>

        <Typography sx={sx.subtitle}>
          כל פרופיל בונה תנאי חיפוש קבועים: שנתון, סינון קבוצה, רמת עניין, תנאי בסיס ותנאי עומק.
        </Typography>
      </Sheet>

      <ProfileTable title="מעניין מאוד" profiles={superProfiles} />
      <ProfileTable title="מעניין" profiles={interestingProfiles} pageBreak />

      <CollectionsSection />
      <PlayerDocumentsSection />
    </Box>
  )
}
