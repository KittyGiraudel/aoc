const $ = require('../../helpers')
const levenshtein = require('js-levenshtein')

const findSimilarIds = ids => {
  const candidates = []

  for (let i = 0; i < ids.length; i++) {
    for (let j = 0; j < i; j++) {
      if (levenshtein(ids[i], ids[j]) === 1) candidates.push(ids[i], ids[j])
    }
  }

  return candidates
}

const findCommonalities = (a, b) =>
  Array.from(a)
    .filter((char, i) => b[i] === char)
    .join('')

const checksum = input => {
  const lines = input.map(line => $.count(Array.from(line)))
  const twos = lines.filter(counts => Object.values(counts).includes(2))
  const threes = lines.filter(counts => Object.values(counts).includes(3))

  return twos.length * threes.length
}

const findId = input => findCommonalities(...findSimilarIds(input))

module.exports = { checksum, findId }
