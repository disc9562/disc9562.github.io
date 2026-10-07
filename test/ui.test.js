const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const Rules = require('../js/rules')
const Store = require('../js/store')

// Only the browser boundary is stubbed; rendering, rules, storage and data are real.
const handlers = {}
const hpNodes = { '.hp-meter': {}, '[data-act="hpcur"]': {}, '[data-act="hpmax"]': {}, '#death-saves': { innerHTML: '' } }
const app = {
  innerHTML: '',
  addEventListener: (type, fn) => { handlers[type] = fn },
  querySelectorAll: () => [],
  querySelector: selector => hpNodes[selector] || null,
  contains: () => false,
  classList: { toggle() {} }
}
const memory = {}
const localStorage = {
  getItem: k => memory[k] ?? null,
  setItem: (k, value) => { memory[k] = String(value) }
}
let confirmed = false
let confirmation = ''
const context = vm.createContext({
  Rules, Store, localStorage, navigator: {}, console,
  document: { getElementById: () => app, activeElement: null },
  window: { confirm: message => { confirmation = message; return confirmed } },
  fetch: async file => ({ json: async () => JSON.parse(fs.readFileSync(path.join(__dirname, '..', file), 'utf8')) })
})
vm.runInContext(fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8'), context)
const run = code => vm.runInContext(code, context)
function click(act, extra = {}) {
  const button = { tagName: 'BUTTON', dataset: { act, ...extra }, closest: () => button }
  handlers.click({ target: button })
}
function change(act, value) {
  handlers.change({ target: { dataset: { act }, value } })
}

setImmediate(() => {
  run(`
    const demo = Rules.createCharacter({name: '艾琳', race: 'human', class: 'cleric', level: 5,
      hpMax: 38, abilities: {str: 10, dex: 14, con: 14, int: 10, wis: 16, cha: 10}}, packFor('2014'))
    demo.hp.current = 28
    demo.spellSlots[1].used = 1
    demo.locked = true
    state = {characters: [demo], currentId: demo.id}
    view = 'combat'
    render()
  `)
  assert.match(app.innerHTML, /<progress[^>]+value="28"[^>]+max="38"/, 'HP meter uses real HP')
  assert.match(app.innerHTML, /剩餘 3 \/ 4/, 'spell slots show remaining count')
  assert.match(app.innerHTML, /aria-pressed="true"[^>]*aria-label="1 環第 1 格：已使用/, 'spent slot has explicit state')
  assert.match(run('ribbonsHtml()'), /aria-current="page"/, 'current navigation is announced')
  assert.match(app.innerHTML, /遊玩中/, 'locked mode is explicit')
  assert.match(app.innerHTML, /data-act="short"/, 'rest available outside menu')
  assert.doesNotMatch(app.innerHTML, /id="character-menu"/, 'menu initially closed')

  click('hp', { d: '-1' })
  assert.equal(run('current().hp.current'), 27)
  assert.match(app.innerHTML, /value="27" max="38"/)
  change('hpcur', '0')
  assert.match(hpNodes['#death-saves'].innerHTML, /死亡豁免/, 'direct HP editing updates death saves')
  assert.equal(hpNodes['.hp-meter'].value, 0)
  change('hpcur', '999')
  assert.equal(run('current().hp.current'), 38)
  change('hpmax', '20')
  assert.equal(run('current().hp.current'), 20)
  assert.equal(hpNodes['.hp-meter'].value, 20)
  assert.equal(hpNodes['.hp-meter'].max, 20)
  assert.equal(hpNodes['#death-saves'].innerHTML, '')
  click('pip', { k: '1', i: '1' })
  assert.equal(run('current().spellSlots[1].used'), 2)
  assert.match(app.innerHTML, /剩餘 2 \/ 4/)
  change('hpcur', '8')
  click('long')
  assert.match(confirmation, /長休/)
  assert.equal(run('current().hp.current'), 8, 'cancel rest preserves HP')
  assert.equal(run('current().spellSlots[1].used'), 2, 'cancel rest preserves slots')
  confirmed = true
  click('long')
  assert.equal(run('current().hp.current'), 20)
  assert.equal(run('current().spellSlots[1].used'), 0)
  assert.match(app.innerHTML, /長休完成/)
  change('hpcur', '8')
  click('short')
  assert.equal(run('current().hp.current'), 8, 'short rest still does not auto-heal')
  assert.match(app.innerHTML, /短休完成/)
  click('lock')
  assert.equal(run('current().locked'), false)
  assert.match(app.innerHTML, /完成編輯/)
  click('conc')
  assert.match(app.innerHTML, /data-act="conc" aria-pressed="true"/)
  const loaded = Store.loadState(localStorage)
  assert.equal(loaded.characters[0].hp.current, 8)
  assert.equal(loaded.characters[0].concentrating, true)
  // Rune bands spell each heading's English term, letter by letter.
  assert.equal(run("runify('SAVING THROWS')"), 'ᛊᚨᚹᛁᛜ᛫ᚦᚱᛟᚹᛊ', 'TH and NG use their own runes')
  assert.equal(run("runify('Attacks')"), 'ᚨᛏᛏᚨᚲᚲᛊ')
  assert.equal(run("runify('X')"), 'ᚲᛊ')
  const src = fs.readFileSync(path.join(__dirname, '../js/app.js'), 'utf8')
  const titles = [...src.matchAll(/<h3>([^<$]+)<\/h3>/g)].map(m => m[1]).concat(['今日準備', '法術'])
  for (const t of titles) assert.ok(run('RUNE_BANDS')[t], 'rune band for ' + t)
  const used = Object.values(run('TITLE_EN')).concat('CHARACTER JOURNAL').join(' ')
  for (const r of run(`runify(${JSON.stringify(used)})`)) assert.ok(r === '᛫' || run('RUNE_PATH')[r], 'stroke for ' + r)
  console.log('ui ok: rendering, HP, slots, rest, mode, concentration, persistence, runes')
})
