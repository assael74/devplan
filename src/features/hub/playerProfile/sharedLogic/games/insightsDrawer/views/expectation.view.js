// playerProfile/sharedLogic/games/insightsDrawer/cards/expectation.view.js

import {
  buildPositionCards,
} from '../cards/position.cards.js'

import {
  buildScoreCards,
} from '../cards/score.cards.js'

import {
  buildTakeawayModel,
} from './view.shared.js'

const getLayerKey = ({ brief = {} } = {}) => {
  return brief?.metrics?.position?.layerKey || ''
}

const isDefensiveRole = ({ brief = {} } = {}) => {
  const layerKey = getLayerKey({
    brief,
  })

  return (
    layerKey === 'dmMid' ||
    layerKey === 'defense' ||
    layerKey === 'goalkeeper'
  )
}

const resolveLayout = ({ briefs = {} } = {}) => {
  if (isDefensiveRole({ brief: briefs.positionFit })) {
    return 'defensive'
  }

  return 'attacking'
}

const getPositionLabel = ({ brief = {} } = {}) => {
  return (
    brief?.metrics?.position?.layerLabel ||
    brief?.targetLabel ||
    'עמדה לא הוגדרה'
  )
}

const buildBlock = ({
  id,
  title,
  brief,
  icon,
  metrics,
  emptyTitle,
  emptyText,
  chip = null,
  cols = null,
  takeawayLabel = 'פוקוס',
} = {}) => {
  return {
    id,
    title,
    brief,
    icon,
    metrics,
    emptyTitle,
    emptyText,
    chip,
    cols,
    takeaway: buildTakeawayModel({
      brief,
      metrics,
      mainId: `main_${id}_takeaway`,
      icon,
      label: takeawayLabel,
      emptyText: 'כאן תופיע תובנה מקצועית על השחקן.',
    }),
  }
}

const buildAttackBlock = ({
  briefs = {},
  targets = {},
  gamesData = null,
  id = 'attackFocus',
  title = 'מדדי התקפה',
  takeawayLabel = 'פוקוס התקפי',
} = {}) => {
  const metrics = buildScoreCards({
    brief: briefs.scoring,
    positionBrief: briefs.positionFit,
    targets,
    gamesData,
  })

  return buildBlock({
    id,
    title,
    brief: briefs.scoring,
    icon: 'goal',
    metrics,
    cols: 3,
    takeawayLabel,
    emptyTitle: 'אין מדדי התקפה להצגה',
    emptyText: 'כדי לבדוק תפוקה התקפית צריך נתוני שערים, בישולים ומעורבות.',
  })
}

const buildDefenseBlock = ({
  briefs = {},
  targets = {},
  id = 'defenseFocus',
  title = 'מדדי הגנה',
  takeawayLabel = 'פוקוס הגנתי',
} = {}) => {
  const metrics = buildPositionCards({
    brief: briefs.positionFit,
    targets,
    mode: 'defense',
    compact: true,
  })

  return buildBlock({
    id,
    title,
    brief: briefs.positionFit,
    icon: 'defense',
    metrics,
    cols: 2,
    takeawayLabel,
    emptyTitle: 'אין מדדי הגנה להצגה',
    emptyText: 'כדי לבדוק תרומה הגנתית צריך נתוני ספיגה, רשת נקייה ודקות.',
    chip: {
      label: getPositionLabel({
        brief: briefs.positionFit,
      }),
    },
  })
}

export const buildExpectationView = ({ briefs = {}, targets = {}, gamesData = null } = {}) => {
  const hasAnyData =
    briefs?.scoring ||
    briefs?.positionFit

  const defensive = isDefensiveRole({
    brief: briefs.positionFit,
  })

  const primaryBlock = defensive
    ? buildDefenseBlock({
        briefs,
        targets,
        id: 'primaryDefense',
        title: 'מדדי הגנה',
        takeawayLabel: 'פוקוס הגנתי',
      })
    : buildAttackBlock({
        briefs,
        targets,
        gamesData,
        id: 'primaryAttack',
        title: 'מדדי התקפה',
        takeawayLabel: 'פוקוס התקפי',
      })

  const secondaryBlock = defensive
    ? buildAttackBlock({
        briefs,
        targets,
        gamesData,
        id: 'secondaryAttack',
        title: 'תרומה התקפית משנית',
        takeawayLabel: 'בונוס התקפי',
      })
    : buildDefenseBlock({
        briefs,
        targets,
        id: 'secondaryDefense',
        title: 'תרומה הגנתית משנית',
        takeawayLabel: 'בקרה הגנתית',
      })

  return {
    hasAnyData,
    layout: resolveLayout({
      briefs,
    }),

    blocks: [
      primaryBlock,
      secondaryBlock,
    ].filter((block) => block.brief),
  }
}
