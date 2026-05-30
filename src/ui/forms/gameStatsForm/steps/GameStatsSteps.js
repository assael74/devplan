// src/ui/forms/gameStatsForm/steps/GameStatsSteps.js

import React from 'react'

import {
  PlayersStep,
  ParamsStep,
  EntryStep,
  SummaryStep,
} from './index.js'

export const renderGameStatsStep = ({ activeStep, draft, onDraft, onStep, savedDraft }) => {
  if (activeStep === 'players') {
    return (
      <PlayersStep
        draft={draft}
        onDraft={onDraft}
      />
    )
  }

  if (activeStep === 'params') {
    return (
      <ParamsStep
        draft={draft}
        onDraft={onDraft}
      />
    )
  }

  if (activeStep === 'entry') {
    return (
      <EntryStep
        draft={draft}
        savedDraft={savedDraft}
        onDraft={onDraft}
      />
    )
  }

  if (activeStep === 'summary') {
    return (
      <SummaryStep
        draft={draft}
        onDraft={onDraft}
        onStep={onStep}
      />
    )
  }

  return (
    <PlayersStep
      draft={draft}
      onDraft={onDraft}
    />
  )
}
