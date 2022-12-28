const test = require('ava')
const $ = require('../../helpers')
const { getSeatCoords, getSeatId, findOwnSeat } = require('./')

test('Day 05 — Sample', t => {
  t.deepEqual(getSeatCoords('FBFBBFFRLR'), [44, 5])
  t.is(getSeatId('FBFBBFFRLR'), 357)
  t.deepEqual(getSeatCoords('BFFFBBFRRR'), [70, 7])
  t.is(getSeatId('BFFFBBFRRR'), 567)
  t.deepEqual(getSeatCoords('FFFBBBFRRR'), [14, 7])
  t.is(getSeatId('FFFBBBFRRR'), 119)
  t.deepEqual(getSeatCoords('BBFFBBFRLL'), [102, 4])
  t.is(getSeatId('BBFFBBFRLL'), 820)
})

test('Day 05 — Solutions', t => {
  const input = $.readInput(__dirname)

  t.is(Math.max(...input.map(getSeatId)), 855)
  t.is(findOwnSeat(input), 552)
})
