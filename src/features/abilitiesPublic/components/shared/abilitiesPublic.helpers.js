//  features/abilitiesPublic/components/shared/abilitiesPublic.helpers.js


export function getDomainTone(state) {
  if (state === 'full') {
    return {
      summaryBg: '#dff3e2',
      summaryBorder: '#9ed3a5',
      summaryChipBg: '#bfe8c5',
      selectedChipColor: 'success',
      progressColor: 'success',
      detailBg: '#eef9f0',
      stateLabel: 'מלא',
    }
  }

  if (state === 'partial') {
    return {
      summaryBg: '#fff3d8',
      summaryBorder: '#e9cb87',
      summaryChipBg: '#ffe7b0',
      selectedChipColor: 'warning',
      progressColor: 'warning',
      detailBg: '#fffaf0',
      stateLabel: 'חלקי',
    }
  }

  return {
    summaryBg: '#eef1f4',
    summaryBorder: '#d3d8de',
    summaryChipBg: '#e1e6eb',
    selectedChipColor: 'neutral',
    progressColor: 'neutral',
    detailBg: '#f8f9fb',
    stateLabel: 'ריק',
  }
}

export function getItemScoreTone(value) {
  const score = Number(value)

  if (!Number.isFinite(score)) {
    return {
      bg: '#ffffff',
      borderColor: '#d8dadd',
    }
  }

  if (score >= 5) {
    return {
      bg: '#cfead2',
      borderColor: '#7fbe87',
    }
  }

  if (score >= 4) {
    return {
      bg: '#e8f5e9',
      borderColor: '#b8dcbc',
    }
  }

  if (score === 3) {
    return {
      bg: '#e8eefc',
      borderColor: '#b8c8f5',
    }
  }

  if (score >= 2) {
    return {
      bg: '#f9e3e3',
      borderColor: '#e7b5b5',
    }
  }

  return {
    bg: '#bcbcbc',
    borderColor: '#bcbcbc',
  }
}
