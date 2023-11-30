import $ from '../../helpers'
import { Coords } from '../../types'

const DIRECTIONAL_VECTORS: Coords[] = [
  [-1, 0],
  [-1, +1],
  [0, +1],
  [+1, +1],
  [+1, 0],
  [+1, -1],
  [0, -1],
  [-1, -1],
]

// Read the position at the given X,Y coords in the layout.
// @param layout - Seating layout
// @param coords - Set of X,Y coords
const read = (layout: string[], coords: Coords) =>
  layout?.[coords[1]]?.[coords[0]]

// Get the first seat in layout in the direction given by vector from the given
// set of X,Y coords.
// @param layout - Seating layout
// @param coords - Set of X,Y coords
// @param vector - Vector to walk
const getFirstSeat = (layout: string[], coords: Coords, vector: Coords) => {
  let position = $.applyVector(coords, vector)
  while (read(layout, position) === '.')
    position = $.applyVector(position, vector)
  return read(layout, position)
}

// Get the 8 seats around the one at given position.
// @param layout - Seating layout
// @param coords - Set of X,Y coords
const getSurroundingSeats = (layout: string[], coords: Coords) =>
  $.surrounding(coords, 'COORDS').map(neighbor => read(layout, neighbor))

// Get the 8 visible seats around the one at given position.
// @param layout - Seating layout
// @param coords - Set of X,Y coords
export const getVisibleSeats = (layout: string[], coords: Coords) =>
  DIRECTIONAL_VECTORS.map(vector => getFirstSeat(layout, coords, vector))

// Process the given seat to know whether it will become occupied, empty, or
// stay the same.
// @param mapper - Mapper function to process every individual seat
// @param threshold - Threshold for when a seat gets empty
// @param layout - Seating layout
// @param y - Y coord
// @param x - X coord
const processSeat =
  (mapper: Function, threshold: number) =>
  (layout: string[], y: number) =>
  (seat: string, x: number) => {
    const count = countOccupiedSeats(mapper(layout, [x, y]))
    if (seat === 'L' && count === 0) return '#'
    if (seat === '#' && count >= threshold) return 'L'
    return seat
  }

export const processSeatLoose = processSeat(getSurroundingSeats, 4)
export const processSeatStrict = processSeat(getVisibleSeats, 5)

// Process the entire seating layout.
// @param layout - Seating layout
// @param mapper - Mapper function to process every individual seat
export const processLayout = (layout: string[], mapper: Function) =>
  layout.map((row, y) => row.split('').map(mapper(layout, y)).join(''))

// Count the amount of occupied seats in the given set.
// @param seats - Set of seats
const countOccupiedSeats = (seats: string[]) =>
  seats.join('').match(/#/g)?.length ?? 0

// Wait until the layout no longer changes, and count occupied seats.
// @param layout - Seating layout
// @param mapper - Mapper function to process every individual seat
export const waitAndCountOccupiedSeats = (
  layout: string[],
  mapper: Function
) => {
  let curr = layout
  let next = processLayout(layout, mapper)

  while (curr.join('\n') !== next.join('\n')) {
    curr = next
    next = processLayout(curr, mapper)
  }

  return countOccupiedSeats(next)
}
