const test = require('ava')
const $ = require('../../helpers')
const { run } = require('./')

const sortByScore = (a, b) => b.score - a.score
const sortByLength = (a, b) => b.length - a.length || sortByScore(a, b)
const getBest = bridges => bridges[0].score

test('Day 24 — Sample', t => {
  const sampleA = $.sample(`
  0/2
  2/2
  2/3
  3/4
  3/5
  0/1
  10/1
  9/10
  `)

  const outputA = run(sampleA)

  t.is(getBest(outputA.sort(sortByScore)), 31)
  t.is(getBest(outputA.sort(sortByLength)), 19)
})

test('Day 24 — Solutions', t => {
  const input = $.readInput(__dirname)
  const bridges = run(input)

  t.is(getBest(bridges.sort(sortByScore)), 2006)
  t.is(getBest(bridges.sort(sortByLength)), 1994)
})
