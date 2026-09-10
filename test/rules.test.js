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

assert.equal(R.maxHp({ hitDie: 6, conMod: 1, extraPerLevel: 0, rolls: [] }), 7)
assert.equal(R.maxHp({ hitDie: 6, conMod: 2, extraPerLevel: 0, rolls: [1] }), 11)
assert.equal(R.maxHp({ hitDie: 6, conMod: 2, extraPerLevel: 0, rolls: [6, 1] }), 8 + 8 + 3)

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
assert.equal(R.spellSaveDC(c, data.classes.wizard), 13)
assert.equal(R.spellAttack(c, data.classes.wizard), 5)
const c24 = R.createCharacter({
  name: '新',
  race: 'human',
  class: 'wizard',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 10, cha: 12 },
  ruleset: '2024'
}, data)
assert.equal(c24.abilities.int, 15)
assert.equal(c24.ruleset, '2024')
console.log('task2 ok')

const c3 = R.createCharacter({
  name: '艾琳',
  race: 'human',
  class: 'wizard',
  level: 3,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 10, cha: 12 },
  hpRolls: [4, 4]
}, data)
assert.equal(c3.level, 3)
assert.equal(c3.hp.max, 20)
assert.equal(c3.spellSlots['1'].max, 4)
assert.equal(c3.spellSlots['2'].max, 2)
assert.ok(c3.pendingChoices.some(x => x.type === 'subclass'))
assert.ok(c3.pendingChoices.some(x => x.type === 'spells'))

const list = R.checklistFor(c3, data)
assert.ok(list.some(x => x.type === 'hp'))
assert.ok(list.some(x => x.type === 'asi'))
assert.ok(!list.find(x => x.type === 'missing'))

const blocked = R.applyLevelUp(c3, [], data, { hpRoll: 4 })
assert.equal(blocked.ok, false)

const ids = list.map(x => x.id)
assert.equal(R.applyLevelUp(c3, ids, data).ok, false)
const applied = R.applyLevelUp(c3, ids, data, { hpRoll: 4 })
assert.equal(applied.ok, true)
assert.equal(applied.character.level, 4)
assert.equal(applied.character.hp.max, 26)
assert.deepEqual(applied.character.hpRolls, [4, 4, 4])
assert.equal(applied.character.spellSlots['2'].max, 3)

let hp = R.changeHp(c3, -100)
assert.equal(hp.hp.current, 0)
hp = R.changeHp(c3, 100)
assert.equal(hp.hp.current, hp.hp.max)

const no = R.useSpellSlot({ ...c3, spellSlots: { 1: { max: 4, used: 4 } } }, 1)
assert.equal(no.ok, false)
const slotOk = R.useSpellSlot({ ...c3, spellSlots: { 1: { max: 4, used: 0 } } }, 1)
assert.equal(slotOk.ok, true)
assert.equal(slotOk.character.spellSlots['1'].used, 1)

const rested = R.longRest({
  ...c3,
  hp: { current: 1, max: c3.hp.max },
  spellSlots: { 1: { max: 4, used: 3 } }
})
assert.equal(rested.hp.current, rested.hp.max)
assert.equal(rested.spellSlots['1'].used, 0)

const warlockClass = {
  ...data,
  classes: {
    ...data.classes,
    warlock: {
      name: '術師',
      hitDie: 8,
      saves: ['wis', 'cha'],
      primary: 'cha',
      subclassLevel: 1,
      caster: 'warlock',
      asiLevels: [4, 8, 12, 16, 19],
      subclasses: [{ id: 'fiend', name: '邪魔' }],
      spellPicks: { 1: 2, later: 1 },
      defaultAttack: { name: '石首', damageDie: 4 },
      resources: [{ id: 'pact-slots', rest: 'shortRest' }]
    }
  }
}
const wl = R.createCharacter({
  name: 'W',
  race: 'human',
  class: 'warlock',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 10, wis: 12, cha: 15 }
}, warlockClass)
const spent = R.useSpellSlot(wl, 1).character
const sr = R.shortRest(spent)
assert.equal(sr.spellSlots['1'].used, 0)
console.log('task3 ok')

const picked = R.setSubclass(c3, 'evocation', data)
assert.equal(picked.subclass, 'evocation')
assert.ok(!picked.pendingChoices.some(x => x.type === 'subclass'))
const swapped = R.setSubclass(picked, 'abjuration', data)
assert.equal(swapped.subclass, 'abjuration')
const cleared = R.setSubclass(swapped, '', data)
assert.equal(cleared.subclass, null)
assert.ok(cleared.pendingChoices.some(x => x.type === 'subclass'))
const withSpell = R.addSpell(c3, 'fireball', data)
assert.ok(withSpell.spells.indexOf('fireball') >= 0)
const gone = R.removeSpell(withSpell, 'fireball', data)
assert.ok(gone.spells.indexOf('fireball') < 0)
const slotSet = R.setSlotUsed(c3, 1, 2)
assert.equal(slotSet.ok, true)
assert.equal(slotSet.character.spellSlots['1'].used, 2)
assert.equal(R.setSlotUsed(c3, 1, 99).character.spellSlots['1'].used, 4)
const maxed = R.setSlotMax(c3, 1, 6)
assert.equal(maxed.spellSlots['1'].max, 6)
console.log('edit ok')

const fs = require('fs')
const real = {
  races: JSON.parse(fs.readFileSync('data/races.json', 'utf8')),
  classes: JSON.parse(fs.readFileSync('data/classes.json', 'utf8')),
  spells: JSON.parse(fs.readFileSync('data/spells.json', 'utf8')),
  feats: JSON.parse(fs.readFileSync('data/feats.json', 'utf8'))
}
const w = R.createCharacter({
  name: '艾琳',
  race: 'human',
  class: 'wizard',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 10, cha: 12 }
}, real)
assert.equal(w.hp.max, 8)
assert.equal(real.classes.wizard.name, '法師')
assert.equal(Object.keys(real.races).length, 9)
assert.equal(Object.keys(real.classes).length, 12)
const w13 = R.createCharacter({
  name: '高階',
  race: 'human',
  class: 'wizard',
  level: 13,
  abilities: { str: 8, dex: 14, con: 13, int: 15, wis: 10, cha: 12 },
  hpMax: 80
}, real)
assert.equal(w13.spellSlots['5'].max, 2)
assert.equal(w13.spellSlots['6'].max, 1)
assert.equal(w13.spellSlots['7'].max, 1)
assert.ok(!w13.spellSlots['8'])
const stale = Object.assign({}, w13, { spellSlots: { 1: { max: 4, used: 0 } } })
const synced = R.syncSpellSlots(stale, real)
assert.equal(synced.spellSlots['7'].max, 1)
assert.ok(real.spells['finger-of-death'].level === 7)
console.log('task5 ok')
