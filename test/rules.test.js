const assert = require('assert')
const R = require('../js/rules')

assert.equal(R.abilityMod(1), -5)
assert.equal(R.abilityMod(10), 0)
assert.equal(R.abilityMod(13), 1)
assert.equal(R.abilityMod(16), 3)
assert.equal(R.abilityMod(20), 5)

assert.equal(R.proficiencyBonus(1), 2)
assert.equal(R.proficiencyBonus(4), 2)
assert.equal(R.proficiencyBonus(5), 3)
assert.equal(R.proficiencyBonus(20), 6)

assert.equal(R.hitDieAverage(6), 4)
assert.equal(R.hitDieAverage(8), 5)
assert.equal(R.hitDieAverage(10), 6)
assert.equal(R.hitDieAverage(12), 7)

assert.equal(R.maxHp({ hitDie: 6, conMod: 1, level: 1, extraPerLevel: 0 }), 7)
assert.equal(R.maxHp({ hitDie: 6, conMod: 1, level: 3, extraPerLevel: 0 }), 17)

const w3 = R.slotsFor('full', 3)
assert.deepEqual(w3, { 1: { max: 4, used: 0 }, 2: { max: 2, used: 0 } })
const w4 = R.slotsFor('full', 4)
assert.deepEqual(w4, { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 } })
assert.deepEqual(R.slotsFor('none', 5), {})
const wl1 = R.slotsFor('warlock', 1)
assert.deepEqual(wl1, { 1: { max: 1, used: 0 } })
console.log('task1 ok')

const data = require('./data/minimal')
const c = R.createCharacter({
  name: '艾琳',
  race: 'human',
  class: 'wizard',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 10, cha: 12 }
}, data)
assert.equal(c.name, '艾琳')
assert.equal(c.level, 1)
assert.equal(c.abilities.int, 16)
assert.equal(c.abilities.con, 14)
assert.equal(c.hp.max, 8)
assert.equal(c.hp.current, 8)
assert.equal(c.ac, 12)
assert.equal(c.spellSlots['1'].max, 2)
assert.equal(c.proficiency, 2)
assert.equal(c.speed, 30)
assert.equal(c.initiative, 2)
assert.equal(c.attacks[0].name, '法杖')
assert.equal(c.attacks[0].bonus, 1)
assert.equal(c.attacks[0].damage, '1d6-1')
assert.ok(Array.isArray(c.pendingChoices) && c.pendingChoices.length > 0)
assert.ok(c.saves.int === true && c.saves.wis === true && c.saves.str === false)
assert.deepEqual(c.skillProf, [])
console.log('task2 ok')
