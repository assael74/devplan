// src/ui/patterns/scoring/ScoringInfo.js

import React from 'react'

import {
  getScoringMetricInfo,
  getScoringProfileInfo,
} from './ui/index.js'

import {
  MetricFullContent,
  MetricShortContent,
  ProfileFullContent,
  ProfileShortContent,
} from './ScoringInfoContent.js'

import ScoringInfoTrigger from './ScoringInfoTrigger.js'

export default function ScoringInfo({
  type = 'metric',
  metric,
  profileId,
  children,
  mode = 'short',
  concept = false,
  placement = 'top',
  showDiff = false,
  triggerSx,
}) {
  const isMetric = type === 'metric'
  const isProfile = type === 'profile'
  const isShort = mode === 'short'

  if (isMetric) {
    const info = getScoringMetricInfo(metric)

    if (!info) return children || null

    const content = isShort ? (
      <MetricShortContent info={info} />
    ) : (
      <MetricFullContent info={info} showDiff={showDiff} />
    )

    return (
      <ScoringInfoTrigger
        content={content}
        title={info.title}
        subtitle={info.subtitle}
        placement={placement}
        triggerSx={triggerSx}
      >
        {children}
      </ScoringInfoTrigger>
    )
  }

  if (isProfile) {
    const info = getScoringProfileInfo(profileId)
    const content = isShort ? (
      <ProfileShortContent info={info} showConcept={concept} />
    ) : (
      <ProfileFullContent info={info} showConcept={concept} />
    )

    return (
      <ScoringInfoTrigger
        content={content}
        title={concept ? info.profileTitle : info.label}
        subtitle={concept ? info.profileSubtitle : 'אבחנת תפקוד בפועל'}
        placement={placement}
        triggerSx={triggerSx}
      >
        {children}
      </ScoringInfoTrigger>
    )
  }

  return children || null
}
