// features/hub/editLogic/videoAnalysis/videoAnalysisEdit.validation.js

const clean = (value) => String(value ?? '').trim()

export function getVideoAnalysisEditFieldErrors(draft = {}) {
  return {
    link: !clean(draft?.link),
  }
}

export function getIsVideoAnalysisEditValid(draft = {}) {
  return !Object.values(getVideoAnalysisEditFieldErrors(draft)).some(Boolean)
}
