// teamProfile/sharedLogic/players/viewModel/cards/project.cards.js

import {
  pct,
} from '../common/index.js'

import {
  buildTooltip,
} from '../tooltips/index.js'

export const buildProjectCards = ({
  structure = {},
} = {}) => {
  const project = structure?.project || {}
  const total = project.total || 0

  return [
    {
      id: 'project',
      label: 'פרויקט',
      value: project.totalProject || 0,
      sub: `${pct(project.totalProject || 0, total)}% מהסגל`,
      icon: 'project',
      color: 'succsses',
      tooltip: buildTooltip({
        title: 'שחקני פרויקט',
        actual: `${project.totalProject || 0} שחקנים`,
        status: `${pct(project.totalProject || 0, total)}% מהסגל הפעיל`,
        basis: 'type project או projectStatus approved',
        listTitle: 'שחקני פרויקט',
        players: project.projectPlayers,
      }),
    },

    {
      id: 'candidate',
      label: 'מועמדים',
      value: project.totalCandidate || 0,
      sub: `${pct(project.totalCandidate || 0, total)}% מהסגל`,
      icon: 'candidate',
      color: 'primary',
      tooltip: buildTooltip({
        title: 'מועמדים לפרויקט',
        actual: `${project.totalCandidate || 0} שחקנים`,
        status: `${pct(project.totalCandidate || 0, total)}% מהסגל הפעיל`,
        basis: 'כל סטטוס מועמדות שאינו אישור או סירוב',
        listTitle: 'מועמדים',
        players: project.candidatePlayers,
      }),
    },

    {
      id: 'declined',
      label: 'סירוב',
      value: project.totalDeclined || 0,
      sub: `${pct(project.totalDeclined || 0, total)}% מהסגל`,
      icon: 'declined',
      color: 'danger',
      tooltip: buildTooltip({
        title: 'סירוב לפרויקט',
        actual: `${project.totalDeclined || 0} שחקנים`,
        status: `${pct(project.totalDeclined || 0, total)}% מהסגל הפעיל`,
        basis: 'projectStatus declined / rejected',
        listTitle: 'שחקנים שסירבו',
        players: project.declinedPlayers,
      }),
    },

    {
      id: 'general',
      label: 'כללי',
      value: project.totalGeneral || 0,
      sub: `${pct(project.totalGeneral || 0, total)}% מהסגל`,
      icon: 'noneType',
      color: 'neutral',
      tooltip: buildTooltip({
        title: 'שחקנים כלליים',
        actual: `${project.totalGeneral || 0} שחקנים`,
        status: `${pct(project.totalGeneral || 0, total)}% מהסגל הפעיל`,
        basis: 'לא פרויקט, לא מועמד ולא סירוב',
        listTitle: 'שחקנים כלליים',
        players: project.generalPlayers,
      }),
    },
  ]
}
