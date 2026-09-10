const assert = require('assert')
const S = require('../js/store')

function mem() {
  const m = {}
  return {
    getItem: k => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v) },
    removeItem: k => { delete m[k] },
    throwOnSet() { this.setItem = () => { throw new Error('quota') } }
  }
}

const empty = S.loadState(mem())
assert.deepEqual(empty, { characters: [], currentId: null })

const st = mem()
const char = {
  id: 'a',
  name: '艾琳',
  race: 'human',
  class: 'wizard',
  level: 1,
  abilities: { str: 8, dex: 14, con: 13, int: 16, wis: 10, cha: 12 }
}
const saved = S.saveState(st, { characters: [char], currentId: 'a' })
assert.equal(saved.ok, true)
const loaded = S.loadState(st)
assert.equal(loaded.characters[0].name, '艾琳')

const failSt = mem()
failSt.throwOnSet()
const fail = S.saveState(failSt, { characters: [char], currentId: 'a' })
assert.equal(fail.ok, false)

assert.equal(S.validateCharacter({}).ok, false)
assert.ok(S.validateCharacter({}).error.length > 0)
assert.equal(S.validateCharacter(char).ok, true)

const bad = S.importJson(st, 'not-json', loaded)
assert.equal(bad.ok, false)
const missing = S.importJson(st, JSON.stringify({ name: 'x' }), loaded)
assert.equal(missing.ok, false)
const one = S.importJson(st, JSON.stringify(char), { characters: [], currentId: null })
assert.equal(one.ok, true)
assert.equal(one.state.characters.length, 1)
const many = S.importJson(st, JSON.stringify({ characters: [char], currentId: 'a' }), { characters: [], currentId: null })
assert.equal(many.ok, true)
console.log('store ok')
