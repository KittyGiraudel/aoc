const $ = require('../../helpers')

const IMMUNE_SYSTEM = 'Immune System'
const INFECTION = 'Infection'
const ARMY_NAMES = [IMMUNE_SYSTEM, INFECTION]

class Game {
  constructor(armies = []) {
    this.armies = armies
  }

  get stale() {
    return this.armies.some(army => army.stale)
  }

  get done() {
    return this.armies.some(army => !army.alive)
  }

  get winner() {
    return this.done ? this.armies.find(army => army.alive) : null
  }

  get score() {
    return this.winner?.score ?? Infinity
  }

  get groups() {
    if (this._allGroups) return this._allGroups

    // Cache the result since this never changes (as initiative never changes).
    this._allGroups = this.armies
      .reduce((groups, army) => groups.concat(army.groups), [])
      .sort((a, b) => b.initiative - a.initiative)

    return this._allGroups
  }

  fight() {
    this.armies.forEach(army => {
      const opponent = this.armies.find(a => a.name !== army.name)
      army.pickTargets(opponent)
    })
    this.groups.forEach(group => group.attack())
    this.armies.forEach(army => army.endTurn())
  }
}

class Army {
  constructor(name) {
    this.name = name
    this.groups = []
    this.stale = false
  }

  get alive() {
    return this.groups.some(group => group.alive)
  }

  get score() {
    return $.sum(this.groups.map(group => group.units))
  }

  boost(damage) {
    this.groups.forEach(group => (group.damage += damage))
  }

  pickTargets(army) {
    this.groups
      .sort((a, b) => b.power - a.power || b.initiative - a.initiative)
      .forEach(group => group.pickTarget(army.groups))

    this.stale = this.stale || this.groups.every(group => !group.target)
  }

  endTurn() {
    this.groups.forEach(group => group.endTurn())
  }
}

class Group {
  constructor(data, army) {
    this.id = data.id
    this.army = army
    // I originally used an array of units which I popped when dealing damage,
    // but it turns out that using a math operation is obviously significantly
    // faster.
    this.units = data.units
    this.health = data.health
    this.damage = data.damage
    this.type = data.type
    this.initiative = data.initiative
    this.immunity = data.immunity
    this.weakness = data.weakness
    this.target = null
    this.attacker = null
  }

  get name() {
    return this.army + ' Group ' + this.id
  }

  get power() {
    return this.units * this.damage
  }

  get alive() {
    return this.units > 0
  }

  sortTargets(a, b) {
    const aDamage = a.expect(this.power, this.type)
    const bDamage = b.expect(this.power, this.type)

    return aDamage - bDamage || a.power - b.power || a.initiative - b.initiative
  }

  pickTarget(groups) {
    if (!this.alive) return

    const target = groups
      .filter(group => !group.attacker)
      .sort((a, b) => this.sortTargets(a, b))
      .pop()

    if (target.expect(this.power, this.type) > 0) {
      this.target = target.targeted(this)
    }
  }

  targeted(attacker) {
    this.attacker = attacker
    return this
  }

  attack() {
    if (this.alive) this.target?.defend(this.power, this.type)
  }

  expect(damage, type) {
    if (!this.alive) return 0
    if (this.immunity.includes(type)) return 0
    if (this.weakness.includes(type)) return damage * 2
    return damage
  }

  defend(damage, type) {
    damage = this.expect(damage, type)
    this.units -= Math.floor(damage / this.health)
    this.units = Math.max(this.units, 0)
  }

  endTurn() {
    this.target = null
    this.attacker = null
  }
}

const parseGroup = (raw, index) => {
  const [units, health, damage, initiative] = raw.match(/(\d+)/g).map(Number)
  const weakness = raw.match(/weak to ([^;)]+)/)?.[1].split(/, ?/g) ?? []
  const immunity = raw.match(/immune to ([^;)]+)/)?.[1].split(/, ?/g) ?? []
  const type = raw.match(/(\w+) damage/)[1]
  const id = index + 1

  return { id, units, health, damage, type, initiative, immunity, weakness }
}

const parseArmyGroups = army => army.split('\n').slice(1).map(parseGroup)
const parseArmies = $.memo(data => data.map(parseArmyGroups))

const getArmies = data =>
  parseArmies(data).map((groups, index) => {
    const name = ARMY_NAMES[index]
    const army = new Army(name)

    groups.map(data => army.groups.push(new Group(data, name)))

    return army
  })

const battle = data => {
  const armies = getArmies(data)
  const game = new Game(armies)

  while (!game.done && !game.stale) game.fight()

  return game.score
}

const cheat = data => {
  let boost = 0

  while (true) {
    const armies = getArmies(data)

    armies.find(army => army.name === IMMUNE_SYSTEM).boost(++boost)

    const game = new Game(armies)

    while (!game.done && !game.stale) game.fight()

    if (game.winner?.name === IMMUNE_SYSTEM) return game.score
  }
}

module.exports = { battle, cheat }
