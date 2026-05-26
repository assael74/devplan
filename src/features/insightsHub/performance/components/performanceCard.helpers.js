// features/insightsHub/performance/components/performanceCard.helpers.js

import {
  buildPerformanceProfilesBlock,
} from '../logic/index.js'

const hasDetails = item => {
  return Boolean(item?.hiddenText)
}

const hasCases = item => {
  return Boolean(item?.casesBlock)
}

const hasProfiles = item => {
  return Boolean(item?.profilesBlock)
}

const hasNumbers = numbersBlock => {
  return Boolean(numbersBlock?.rows?.length && numbersBlock?.columns?.length)
}

export const buildModalPanels = ({ item, numbersBlock }) => {
  const panels = []

  if (hasDetails(item)) {
    panels.push({
      id: 'details',
      label: item.hiddenTitle || 'איך זה עובד?',
      title: item.hiddenTitle || 'איך זה עובד?',
      kicker: 'הרחבה',
      type: 'details',
      variant: 'text',
      placement: 'left',
      item,
    })
  }

  if (hasNumbers(numbersBlock)) {
    panels.push({
      id: 'numbers',
      label: numbersBlock.title || 'מספרים',
      title: numbersBlock.title || 'מספרים',
      kicker: 'דאטה',
      type: 'numbers',
      variant: 'table',
      placement: 'topWide',
      block: numbersBlock,
    })
  }

  if (hasCases(item)) {
    panels.push({
      id: 'cases',
      label: item.casesBlock.title || 'דוגמה',
      title: item.casesBlock.title || 'דוגמה',
      kicker: 'חישוב',
      type: 'cases',
      variant: 'content',
      placement: 'left',
      block: item.casesBlock,
    })
  }

  if (hasProfiles(item)) {
    panels.push({
      id: 'profiles',
      label: item.profilesBlock.label || 'פירוט פרופילי הביצוע',
      title: item.profilesBlock.title || 'פירוט פרופילי הביצוע',
      kicker: 'פרופילי ביצוע',
      type: 'profiles',
      variant: 'profiles',
      placement: 'topWide',
      block: buildPerformanceProfilesBlock(),
    })
  }

  return panels
}
