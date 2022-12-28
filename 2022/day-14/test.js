const test = require('ava')
const $ = require('../../helpers')
const { countSandUnits } = require('./')

test('Day 14 — Sample', t => {
  const sample = $.sample(`
  498,4 -> 498,6 -> 496,6
  503,4 -> 502,4 -> 502,9 -> 494,9
  `)

  t.is(countSandUnits(sample), 24)
  t.is(countSandUnits(sample, true), 93)
})

test('Day 14 — Solutions', t => {
  const input = $.readInput(__dirname)

  t.is(countSandUnits(input), 655)
  t.is(countSandUnits(input, true), 26484)
})
