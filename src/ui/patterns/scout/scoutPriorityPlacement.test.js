// src/ui/patterns/scout/scoutPriorityPlacement.test.js

import { readScoutPriorityPlacement, resolveScoutPriorityPlacement } from './scoutPriorityPlacement.js'

const anchor = { left: 680, right: 740, top: 390, bottom: 410 }
const viewport = { width: 1200, height: 800 }

test('places the panel entirely outside both priority columns', () => {
  const area = { left: 560, right: 780 }
  const placement = resolveScoutPriorityPlacement({ anchor, protectedArea: area, viewport })

  expect(placement.side).toBe('right')
  expect(placement.left).toBeGreaterThan(area.right)
})

test('uses the right side when it has more room, without depending on text direction', () => {
  const area = { left: 50, right: 250 }
  const placement = resolveScoutPriorityPlacement({ anchor: { ...anchor, left: 150, right: 200 }, protectedArea: area, viewport })

  expect(placement.side).toBe('right')
  expect(placement.left).toBeGreaterThan(area.right)
  expect(placement.left + placement.width).toBeLessThanOrEqual(viewport.width - 16)
})

test('stays close to the clicked badge even when the opposite side has more space', () => {
  const placement = resolveScoutPriorityPlacement({ anchor, protectedArea: { left: 500, right: 760 }, viewport })

  expect(placement.side).toBe('right')
  expect(placement.left).toBe(764)
})

test('keeps the panel inside the viewport near the bottom and points to the same row', () => {
  const placement = resolveScoutPriorityPlacement({ anchor: { ...anchor, top: 740, bottom: 760 }, viewport, panelHeight: 350 })

  expect(placement.top + 350).toBeLessThanOrEqual(784)
  expect(placement.top + placement.arrowTop).toBe(750)
})

test('uses a drawer when neither side can fit a readable panel', () => {
  expect(resolveScoutPriorityPlacement({ anchor, protectedArea: { left: 220, right: 700 }, viewport: { width: 920, height: 800 } }))
    .toEqual({ drawer: true })
})

test('reads both cells from the clicked row instead of protecting only the clicked badge', () => {
  const table = document.createElement('table')
  table.innerHTML = '<tbody><tr><td><button data-scout-priority>attack</button></td><td><button data-scout-priority>defense</button></td></tr></tbody>'
  document.body.appendChild(table)
  const [first, second] = table.querySelectorAll('td')
  const button = first.querySelector('button')
  first.getBoundingClientRect = () => ({ left: 600, right: 750 })
  second.getBoundingClientRect = () => ({ left: 480, right: 600 })
  button.getBoundingClientRect = () => anchor

  try {
    const placement = readScoutPriorityPlacement(button, 300)
    expect(placement.left + placement.width).toBeLessThan(480)
  } finally {
    table.remove()
  }
})

test.each(['goalsFor', 'goalsAgainst'])('keeps the highlighted %s number outside the panel', sourceColumn => {
  const table = document.createElement('table')
  table.innerHTML = `<tbody><tr><td><button data-scout-priority>attack</button></td><td><button data-scout-priority>defense</button></td><td data-column="${sourceColumn}"><span data-cell-value>27</span></td></tr></tbody>`
  document.body.appendChild(table)
  const [first, second, source] = table.querySelectorAll('td')
  const button = first.querySelector('button')
  first.getBoundingClientRect = () => ({ left: 500, right: 600 })
  second.getBoundingClientRect = () => ({ left: 400, right: 500 })
  source.getBoundingClientRect = () => ({ left: 800, right: 880 })
  button.getBoundingClientRect = () => ({ left: 520, right: 560, top: 390, bottom: 410 })

  try {
    expect(readScoutPriorityPlacement(button, 300).side).toBe('right')
    const placement = readScoutPriorityPlacement(button, 300, sourceColumn)
    expect(placement.side).toBe('left')
    expect(placement.left + placement.width).toBeLessThan(400)
  } finally {
    table.remove()
  }
})
