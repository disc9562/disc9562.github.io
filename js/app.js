const SKILLS = [
  { id: 'acrobatics', name: '特技', abi: 'dex' },
  { id: 'animal', name: '馴養動物', abi: 'wis' },
  { id: 'arcana', name: '奧秘', abi: 'int' },
  { id: 'athletics', name: '運動', abi: 'str' },
  { id: 'deception', name: '欺瞞', abi: 'cha' },
  { id: 'history', name: '歷史', abi: 'int' },
  { id: 'insight', name: '洞察', abi: 'wis' },
  { id: 'intimidation', name: '威嚇', abi: 'cha' },
  { id: 'investigation', name: '調查', abi: 'int' },
  { id: 'medicine', name: '醫藥', abi: 'wis' },
  { id: 'nature', name: '自然', abi: 'int' },
  { id: 'perception', name: '察覺', abi: 'wis' },
  { id: 'performance', name: '表演', abi: 'cha' },
  { id: 'persuasion', name: '說服', abi: 'cha' },
  { id: 'religion', name: '宗教', abi: 'int' },
  { id: 'sleight', name: '巧手', abi: 'dex' },
  { id: 'stealth', name: '潛行', abi: 'dex' },
  { id: 'survival', name: '生存', abi: 'wis' }
]
const ABI_NAME = { str: '力量', dex: '敏捷', con: '體質', int: '智力', wis: '感知', cha: '魅力' }
const CONDITIONS = ['中毒', '倒地', '受擒', '麻痺', '昏迷', '受魅惑', '恐懼', '隱形', '石化']

// 標題後的符文帶：把標題的英文術語逐字母轉寫成古弗薩克符文（Elder Futhark）。
// TH→ᚦ、NG→ᛜ；C/K/Q→ᚲ、X→ᚲᛊ、V/W→ᚹ、Y→ᛃ。單字之間 ᛫，每次重複之後 ᛬。
const TITLE_EN = {
  '身分': 'IDENTITY', '屬性': 'ABILITY SCORES', '生命': 'HIT POINTS',
  '法術資源': 'SPELL SLOTS', '攻擊': 'ATTACKS', '職業技能': 'CLASS OPTIONS', '資源': 'RESOURCES',
  '今日準備': 'PREPARED SPELLS', '法術': 'SPELLS', '狀態': 'CONDITIONS', '豁免': 'SAVING THROWS', '技能': 'SKILLS'
}
const RUNE_OF = {
  A: 'ᚨ', B: 'ᛒ', C: 'ᚲ', D: 'ᛞ', E: 'ᛖ', F: 'ᚠ', G: 'ᚷ', H: 'ᚺ', I: 'ᛁ', J: 'ᛃ', K: 'ᚲ', L: 'ᛚ', M: 'ᛗ',
  N: 'ᚾ', O: 'ᛟ', P: 'ᛈ', Q: 'ᚲ', R: 'ᚱ', S: 'ᛊ', T: 'ᛏ', U: 'ᚢ', V: 'ᚹ', W: 'ᚹ', X: 'ᚲᛊ', Y: 'ᛃ', Z: 'ᛉ', ' ': '᛫'
}
// 每個符文畫在 12×12 格內
const RUNE_PATH = {
  'ᚠ': 'M4 11V1M4 4L9 1M4 7.5L9 4.5', 'ᚢ': 'M3 11V1L9 4V11', 'ᚦ': 'M4 1V11M4 3.5L8.5 6L4 8.5',
  'ᚨ': 'M4 11V1L9 4M4 4.5L9 7.5', 'ᚱ': 'M4 11V1L8.5 3.5L4 6L9 11', 'ᚲ': 'M8.5 2.5L4 6L8.5 9.5',
  'ᚷ': 'M3 1L9 11M9 1L3 11', 'ᚹ': 'M4 11V1L8.5 3.5L4 6', 'ᚺ': 'M3 1V11M9 1V11M3 4L9 8',
  'ᚾ': 'M6 1V11M3.5 4.5L8.5 7.5', 'ᛁ': 'M6 1V11', 'ᛃ': 'M5.5 1.5L2.5 4.5L5.5 7.5M6.5 4.5L9.5 7.5L6.5 10.5',
  'ᛈ': 'M4 1V11M4 1L8 4L9.5 2M4 11L8 8L9.5 10', 'ᛉ': 'M6 11V1M2.5 2L6 5.5L9.5 2', 'ᛊ': 'M8.5 1L4 4.5L8 7.5L3.5 11',
  'ᛏ': 'M6 11V1M2.5 4.5L6 1L9.5 4.5', 'ᛒ': 'M4 1V11L8.5 8.5L4 6L8.5 3.5L4 1', 'ᛖ': 'M3 11V1L6 4.5L9 1V11',
  'ᛗ': 'M3 11V1L9 5M9 11V1L3 5', 'ᛚ': 'M4 11V1L9 4.5', 'ᛜ': 'M6 2L9.5 6L6 10L2.5 6Z',
  'ᛞ': 'M3 1V11L9 1V11L3 1', 'ᛟ': 'M6 1L9 4.5L3.5 11M6 1L3 4.5L8.5 11'
}

function runify(en) {
  return en.toUpperCase().replace(/TH|NG|[A-Z ]/g, m => m === 'TH' ? 'ᚦ' : m === 'NG' ? 'ᛜ' : RUNE_OF[m])
}

// 回傳 CSS url()，給 mask 用；repeat 為真時尾端加 ᛬，讓重複的符文帶讀起來是「詞᛬詞᛬」
function runeBand(en, repeat) {
  let x = 0
  const parts = [...runify(en) + (repeat ? '᛬' : '')].map(r => {
    const at = x
    x += RUNE_PATH[r] ? 12 : 6
    if (r === '᛫') return `<circle cx='${at + 3}' cy='6' r='1.1'/>`
    if (r === '᛬') return `<circle cx='${at + 3}' cy='4' r='1.1'/><circle cx='${at + 3}' cy='8' r='1.1'/>`
    return `<path transform='translate(${at})' d='${RUNE_PATH[r]}' fill='none' stroke='black' stroke-width='1.3'/>`
  }).join('')
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${x}' height='12' viewBox='0 0 ${x} 12'>${parts}</svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

const RUNE_BANDS = Object.fromEntries(Object.entries(TITLE_EN).map(([zh, en]) => [zh, runeBand(en, true)]))
const MAST_RUNES = runeBand('CHARACTER JOURNAL')

const el = document.getElementById('app')
let data = { races: {}, classes: {}, spells: {}, feats: {} }
let state = { characters: [], currentId: null }
let view = 'combat'
let banner = ''
let menuOpen = false
let confirmDel = false
let script = null
let glQ = ''
let glCat = ''
let glOpen = {}
let notesEdit = false
let notesGl = false
let termOpen = ''
let glProg = Number(localStorage.getItem('dnd5e-script-progress')) || 1
let checkedIds = []
let pickSubclass = ''
let pickSpells = []
let pickChoice = {}
let pickFeat = ''
let pickAsi = ['str', 'str']
let openSpell = ''
let openFeat = ''
let openClassFeat = ''
let openPower = ''
let comboQ = {}
let comboOpen = ''
let comboTag = {}
let foldOpen = {}
let hpRoll = ''
let ruleset = '2014'

function packFor(year) {
  const y = year || '2014'
  if (y === '2024') {
    return {
      races: data.races2024 || data.races,
      classes: data.classes2024 || data.classes,
      spells: data.spells,
      feats: data.feats,
      features: data.features || {},
      choices: data.choices || {},
      equipment: data.equipment || {},
      prepared: data.prepared || {},
      subclassFeatures: data.subclassFeatures || {},
      magicItems: data.magicItems || {},
      backgrounds: data.backgrounds || {}
    }
  }
  return {
    races: data.races,
    classes: data.classes,
    spells: data.spells,
    feats: data.feats,
    features: data.features || {},
    choices: data.choices || {},
    equipment: data.equipment || {},
    prepared: data.prepared || {},
    subclassFeatures: data.subclassFeatures || {},
    magicItems: data.magicItems || {},
    backgrounds: data.backgrounds || {}
  }
}

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

function lockIcon(locked) {
  if (locked) {
    return '<svg class="lock-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
  }
  return '<svg class="lock-svg" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 11V7a4 4 0 0 1 7.5-2" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
}

function current() {
  return state.characters.find(c => c.id === state.currentId)
}

function persist(silent) {
  const r = Store.saveState(localStorage, state)
  if (!r.ok) { banner = '存不了，先匯出備份'; render(); return }
  if (!silent) render()
}

function replace(next) {
  const i = state.characters.findIndex(c => c.id === next.id)
  if (i >= 0) state.characters[i] = next
  persist()
}

function raceName(id, year) {
  const p = packFor(year)
  return (p.races[id] && p.races[id].name) || id
}
function className(id, year) {
  const p = packFor(year)
  return (p.classes[id] && p.classes[id].name) || id
}

function render() {
  const opened = [...el.querySelectorAll('details')].map(d => d.open)
  const active = document.activeElement
  const focus = active && el.contains(active) ? { id: active.id, data: { ...active.dataset } } : null
  const draft = [...el.querySelectorAll('.create-form input, .create-form select')].map(input => ({
    id: input.id, key: input.dataset.k, value: input.value
  }))
  const c = current()
  if (view === 'create' || !c) el.innerHTML = createHtml()
  else if (view === 'levelup' || view === 'pending') el.innerHTML = levelHtml(c)
  else if (view === 'script') el.innerHTML = scriptHtml()
  else if (view === 'notes') el.innerHTML = notesHtml(c)
  else el.innerHTML = combatHtml(c)
  if (c && (view === 'combat' || view === 'notes' || view === 'script')) {
    const m = el.querySelector('.mast')
    if (m) m.insertAdjacentHTML('afterend', ribbonsHtml())
  }
  ;[...el.querySelectorAll('details')].forEach((d, i) => { if (opened[i]) d.open = true })
  for (const h of el.querySelectorAll('h3')) if (RUNE_BANDS[h.textContent]) h.style.setProperty('--title-runes', RUNE_BANDS[h.textContent])
  for (const m of el.querySelectorAll('.mast')) m.style.setProperty('--title-runes', MAST_RUNES)
  el.classList.toggle('is-locked', !!(c && c.locked && view === 'combat'))
  for (const input of el.querySelectorAll('.create-form input, .create-form select')) {
    const previous = draft.find(d => input.id ? d.id === input.id : input.dataset.k && d.key === input.dataset.k)
    if (previous && (input.tagName !== 'SELECT' || [...input.options].some(o => o.value === previous.value))) input.value = previous.value
  }
  if (focus && (focus.id || focus.data.act)) {
    const next = [...el.querySelectorAll('input, select, textarea, button')].find(node =>
      focus.id ? node.id === focus.id : Object.entries(focus.data).every(([k, v]) => node.dataset[k] === v))
    if (next && !next.disabled && next.getClientRects().length) next.focus({ preventScroll: true })
  }
}

function ribbonsHtml() {
  const tabs = [['combat', '角色卡'], ['notes', '備忘錄'], ['script', '對照表']]
  return `<nav class="ribbons" aria-label="冒險紀錄分頁">${tabs.map(([v, label]) =>
    `<button class="ribbon${view === v ? ' on' : ''}" data-act="tab" data-v="${v}"${view === v ? ' aria-current="page"' : ''}>${label}</button>`
  ).join('')}</nav>`
}

function openNotes(c) {
  view = 'notes'; menuOpen = false; termOpen = ''
  notesEdit = !((c && c.notes) || '').trim()
  render()
  loadScript(() => view === 'notes')
}

function openScript() {
  view = 'script'; menuOpen = false; render()
  loadScript(() => view === 'script')
}

function createHtml() {
  const pack = packFor(ruleset)
  const races = Object.keys(pack.races).map(id =>
    `<option value="${esc(id)}">${esc(pack.races[id].name)}</option>`).join('')
  const classes = Object.keys(pack.classes).map(id =>
    `<option value="${esc(id)}">${esc(pack.classes[id].name)}</option>`).join('')
  const abis = Object.keys(ABI_NAME).map(k =>
    `<label class="abi-in"><span>${esc(ABI_NAME[k])}</span>
      <input data-act="abi" data-k="${k}" type="number" min="1" max="20" value="10" inputmode="numeric">
    </label>`).join('')
  const bad = banner ? ' aria-invalid="true"' : ''
  return `
    <p class="mast">冒險者紀錄</p>
    <h2>你的冒險，從這裡開始</h2>
    <p class="lede">建立角色卡，跑團時輕鬆記錄生命與法術。<br>資料儲存在這台裝置，記得定期匯出備份。</p>
    <form class="create-form">
    <section class="form-card">
    <h3>身分</h3>
    <label class="field">規則
      <select data-act="ruleset">
        <option value="2014" ${ruleset === '2014' ? 'selected' : ''}>2014 PHB</option>
        <option value="2024" ${ruleset === '2024' ? 'selected' : ''}>2024 PHB</option>
      </select>
    </label>
    <label class="field">角色名字 <span class="muted">（必填）</span><input id="f-name" placeholder="你的冒險者叫什麼名字？" autocomplete="off" aria-required="true"${banner === '缺名字' ? bad : ''}></label>
    <label class="field">${ruleset === '2024' ? '物種' : '種族'} <select id="f-race">${races}</select></label>
    <label class="field">職業 <select id="f-class">${classes}</select></label>
    ${ruleset === '2024' ? `<label class="field">背景 <select id="f-background">${Object.keys(pack.backgrounds || {}).map(id => `<option value="${esc(id)}">${esc(pack.backgrounds[id].name)}</option>`).join('')}</select></label>` : ''}
    <label class="field">等級 <input id="f-level" type="number" min="1" max="20" value="1" inputmode="numeric"></label>
    </section>
    <section class="form-card">
    <h3>屬性</h3>
    <p class="hint">${ruleset === '2024' ? '填最終分數（背景加值已算進去）。種族不加點；背景會給起源專長。' : '填加種族加值前的數字。' + Object.keys(pack.races).map(id => {
      const r = pack.races[id]
      const b = r.bonuses || {}
      const parts = Object.keys(b).map(k => ABI_NAME[k] + '+' + b[k])
      return r.name + (parts.length ? ' ' + parts.join(' ') : '')
    }).join(' · ')}</p>
    <div class="abi">${abis}</div>
    </section>
    <section class="form-card">
    <h3>生命</h3>
    <label class="field">最大生命 <input id="f-hpmax" type="number" min="1" placeholder="1 級可留空，自動算" inputmode="numeric"${banner && banner !== '缺名字' ? bad : ''}></label>
    <p class="hint">1 級留空會用骰面最大值加體質調整值。2 級以上請填骰出的總和。</p>
    </section>
    ${banner ? `<div class="warn" role="alert">${esc(banner)}</div>` : ''}
    <button type="submit" class="big primary" data-act="create">建立角色，開始冒險</button>
    ${state.characters.length ? `<button type="button" class="big" data-act="back">取消</button>` : ''}
    </form>
  `
}

function focusField(id) {
  const f = document.getElementById(id)
  if (!f) return
  f.scrollIntoView({ block: 'center' })
  f.focus()
}

function fieldVal(obj, k) {
  return obj && obj[k] != null && obj[k] !== '' ? obj[k] : ''
}

// 每格獨立記錄；spent 陣列與 used 數量不合（休息歸零、升級改格數）時，退回「前 used 格算已用」
function slotSpent(sl) {
  const n = sl.max || 0
  const a = Array.isArray(sl.spent) ? sl.spent.slice(0, n) : []
  while (a.length < n) a.push(false)
  if (a.filter(Boolean).length !== (sl.used || 0)) return Array.from({ length: n }, (_, i) => i < (sl.used || 0))
  return a
}

function deathSavesHtml(c) {
  return c.hp.current === 0 ? `<div class="box death-saves" role="status">
    <strong>死亡豁免</strong><p>成功 ${c.deathSaves.success}/3 · 失敗 ${c.deathSaves.fail}/3</p>
    <div class="row">
      <button class="icon grow" data-act="ds" data-k="success">成功</button>
      <button class="icon grow" data-act="ds" data-k="fail">失敗</button>
      <button class="icon grow" data-act="ds-reset">重設</button>
    </div>
  </div>` : ''
}

function refreshHp(c) {
  // Keep inputs mounted: replacing the page on blur would swallow the next +/- click.
  const meter = el.querySelector('.hp-meter')
  if (meter) { meter.max = c.hp.max; meter.value = c.hp.current; meter.textContent = `${c.hp.current} / ${c.hp.max}` }
  const cur = el.querySelector('[data-act="hpcur"]')
  if (cur) { cur.value = c.hp.current; cur.max = c.hp.max }
  const max = el.querySelector('[data-act="hpmax"]')
  if (max) max.value = c.hp.max
  const death = el.querySelector('#death-saves')
  if (death) death.innerHTML = deathSavesHtml(c)
}

function combatHtml(c) {
  const pack = packFor(c.ruleset || '2014')
  const cls = pack.classes[c.class] || {}
  const pending = (c.pendingChoices || []).length
  const synced = Rules.syncSpellSlots(c, pack)
  if (synced !== c) {
    c.spellSlots = synced.spellSlots
    persist(true)
  }
  const resSync = Rules.syncResources(c)
  if (JSON.stringify(resSync.resources) !== JSON.stringify(c.resources || [])) {
    c.resources = resSync.resources
    persist(true)
  }
  const skills = c.skills || {}
  const saveBonus = c.saveBonus || {}
  const lock = c.locked ? ' disabled' : ''
  const abiCards = Object.keys(ABI_NAME).map(k => {
    const m = Rules.abilityMod(c.abilities[k])
    return `<div class="abi-card">
      <div class="lbl">${esc(ABI_NAME[k])}</div>
      <div class="mod-ring" data-mod="${k}">${m >= 0 ? '+' : ''}${m}</div>
      <input class="val-sm" data-act="abival" data-k="${k}" aria-label="${esc(ABI_NAME[k])}分數" type="number" value="${c.abilities[k]}"${lock}>
    </div>`
  }).join('')
  const saveRows = Object.keys(ABI_NAME).map(k =>
    `<div class="save-row"><span>${esc(ABI_NAME[k])}</span>
      <input class="val" data-act="saveval" data-k="${k}" aria-label="${esc(ABI_NAME[k])}豁免" type="number" value="${esc(fieldVal(saveBonus, k))}" placeholder="—"${lock}></div>`
  ).join('')
  const skillRows = SKILLS.map(s =>
    `<div class="skill-row"><span>${esc(s.name)} <span class="muted">${esc(ABI_NAME[s.abi])}</span></span>
      <input class="val" data-act="skillval" data-id="${s.id}" aria-label="${esc(s.name)}加值" type="number" value="${esc(fieldVal(skills, s.id))}" placeholder="—"${lock}></div>`
  ).join('')
  const attacks = `<div class="atk muted"><span>名稱</span><span>命中</span><span>傷害</span><span></span></div>` +
    (c.attacks || []).map((a, i) =>
      `<div class="atk">
        <input data-act="atkname" data-i="${i}" aria-label="攻擊 ${i + 1} 名稱" value="${esc(a.name)}"${lock}>
        <input class="val" data-act="atkbonus" data-i="${i}" aria-label="${esc(a.name)}命中加值" type="number" value="${a.bonus}"${lock}>
        <input data-act="atkdmg" data-i="${i}" aria-label="${esc(a.name)}傷害" value="${esc(a.damage)}"${lock}>
        <button class="icon lockable" data-act="delatk" data-i="${i}" aria-label="刪除攻擊 ${esc(a.name)}"${lock}>×</button>
      </div>`
    ).join('') +
    `<button class="big lockable" data-act="addatk"${lock}>＋攻擊</button>`
  const powers = Rules.selectedPowers(c, pack.choices)
  const seenCat = {}
  const powerRows = powers.map(p => {
    const open = openPower === p.catalog + ':' + p.id
    const reset = !c.locked && !seenCat[p.catalog]
    seenCat[p.catalog] = true
    return `<div class="spell-line">
      <button class="big grow" data-act="togglepower" data-cat="${esc(p.catalog)}" data-id="${esc(p.id)}" aria-expanded="${open}">${esc(p.name)} <span class="muted">${esc(p.catalogName)}</span>
        ${open ? `<p class="spell-text">${esc(p.text)}</p>` : ''}</button>
      ${reset ? `<button class="icon lockable" data-act="resetchoice" data-cat="${esc(p.catalog)}">重選</button>` : ''}
    </div>`
  }).join('')
  const autoPrep = Rules.alwaysPreparedIds(c, pack)
  const spells = Rules.visibleSpells(c, pack).map(id => {
    const s = data.spells[id]
    if (!s) return ''
    const open = openSpell === id
    const domain = autoPrep.indexOf(id) >= 0
    return `<div class="spell-line">
      <button class="big grow" data-act="togglespell" data-id="${esc(id)}" aria-expanded="${open}">${esc(s.name)} <span class="muted">${s.level === 0 ? '戲法' : s.level + '環'}${domain ? ' · 領域' : ''}</span>
        ${open ? `<p class="spell-text">${esc(s.text)}</p>` : ''}</button>
      ${domain ? '' : `<button class="icon lockable" data-act="delspell" data-id="${esc(id)}" aria-label="移除法術 ${esc(s.name)}"${lock}>×</button>`}
    </div>`
  }).join('')
  const maxRing = Rules.maxSlotLevel(Rules.casterOf(cls, c.subclass), c.level, c.ruleset)
  const spellAdd = c.locked ? '' : comboHtml('spell', spellPickItems(c, { cantrips: true }), [], maxRing ? ('搜尋法術（現在最高 ' + maxRing + ' 環）…') : '搜尋法術…')
  const featChips = (c.feats || []).map(id => {
    const f = data.feats[id]
    const open = openFeat === id
    return `<div class="spell-line">
      <button class="big grow" data-act="togglefeat" data-id="${esc(id)}" aria-expanded="${open}">${esc(f ? f.name : id)}
        ${open && f && f.text ? `<p class="spell-text">${esc(f.text)}</p>` : ''}</button>
      <button class="icon lockable" data-act="delfeat" data-id="${esc(id)}" aria-label="移除專長 ${esc(f ? f.name : id)}"${lock}>×</button>
    </div>`
  }).join('')
  const featItems = Object.keys(data.feats || {}).filter(id => (c.feats || []).indexOf(id) < 0).map(id => {
    const f = data.feats[id]
    return { id, name: f.name, text: f.text }
  })
  const featAdd = c.locked ? '' : comboHtml('feat', featItems, [], '搜尋專長…')
  const subCombo = c.locked
    ? `<p>${esc(((cls.subclasses || []).filter(s => s.id === c.subclass)[0] || { name: '未選' }).name)}</p>`
    : comboHtml('subclass-live', (cls.subclasses || []).map(s => {
        const feats = ((pack.subclassFeatures || {})[s.id] || []).slice(0, 2)
        return { id: s.id, name: s.name, text: feats.map(f => f.name + '：' + f.text).join(' ') }
      }), c.subclass ? [c.subclass] : [], '搜尋副職業…')
  const slotRows = Object.keys(c.spellSlots || {}).sort((a, b) => Number(a) - Number(b)).map(k => {
    const sl = c.spellSlots[k]
    const sp = slotSpent(sl)
    const pips = Array.from({ length: sl.max }, (_, i) => {
      const spent = sp[i]
      return `<button class="pip${spent ? ' spent' : ''}" data-act="pip" data-k="${esc(k)}" data-i="${i}" aria-pressed="${spent}" aria-label="${k} 環第 ${i + 1} 格：${spent ? '已使用，點擊恢復' : '可用，點擊消耗'}"><span aria-hidden="true">${spent ? '−' : '✦'}</span></button>`
    }).join('')
    return `<div class="slot-row">
      <div class="slot-label"><span class="slot-lbl">${k} 環</span><span class="slot-count">剩餘 ${sp.filter(used => !used).length} / ${sl.max}</span></div>
      <div class="pips">${pips}</div>
      <input class="val lockable" data-act="slotmax" data-k="${esc(k)}" aria-label="${k} 環格數上限" type="number" min="0" value="${sl.max}"${lock}>
    </div>`
  }).join('')
  const gear = c.gear || []
  const gearRows = gear.map((g, i) =>
    `<div class="gear">
      <input data-act="gearname" data-i="${i}" aria-label="物品 ${i + 1} 名稱" value="${esc(g.name)}"${lock}>
      <input class="val" data-act="gearqty" data-i="${i}" aria-label="${esc(g.name)}數量" type="number" min="0" value="${g.qty == null ? 1 : g.qty}">
      <button class="icon lockable" data-act="delgear" data-i="${i}" aria-label="移除物品 ${esc(g.name)}"${lock}>×</button>
    </div>`
  ).join('')
  const cond = (c.conditions || [])
  const res = (c.resources || []).map((r, i) =>
    `<button class="slot" data-act="res" data-i="${i}">${esc(r.name)} ${r.max - r.used}/${r.max}</button>`
  ).join('')
  const condPick = CONDITIONS.map(n => {
    const on = cond.indexOf(n) >= 0
    return `<button class="slot${on ? ' cond-on' : ''}" data-act="cond" data-n="${esc(n)}" aria-pressed="${on}">${esc(n)}</button>`
  }).join('')
  const menu = menuOpen ? `
    <div class="menu" id="character-menu" aria-label="角色管理">
      ${(state.characters).map(x =>
        `<button class="big" data-act="switch" data-id="${esc(x.id)}">${esc(x.name)}　${esc(className(x.class, x.ruleset))} ${x.level}${x.id === c.id ? ' ←' : ''}</button>`
      ).join('')}
      <button class="big" data-act="new">新增角色</button>
      <button class="big" data-act="notes-open">備忘錄</button>
      <button class="big" data-act="script">劇本對照表</button>
      <button class="big" data-act="export">匯出</button>
      <label class="big import-label">匯入角色<input id="import" type="file" accept="application/json"></label>
      ${confirmDel ? `<div class="warn del-confirm">
        <p>確定要刪除「${esc(c.name)}」？刪掉就救不回來，建議先匯出備份。</p>
        <div class="row">
          <button class="big danger" data-act="del-yes">確定刪除</button>
          <button class="big" data-act="del-no">取消</button>
        </div>
      </div>` : `<button class="big del" data-act="del">刪除這個角色</button>`}
    </div>` : ''
  return `
    <div class="vitals">
    <p class="mast">冒險者紀錄 <span class="edition">CHARACTER JOURNAL</span></p>
    <div class="top">
      <div>
        <input class="name-edit" data-act="name" aria-label="角色名字" value="${esc(c.name)}"${lock}>
        <div class="kicker">${esc(raceName(c.race, c.ruleset))} · ${esc(className(c.class, c.ruleset))} ${c.level} 級 · ${c.ruleset === '2024' ? '2024' : '2014'}${c.background && pack.backgrounds && pack.backgrounds[c.background] ? ' · ' + esc(pack.backgrounds[c.background].name) : ''}${c.subclass ? ' · ' + esc(((cls.subclasses || []).find(s => s.id === c.subclass) || {}).name || c.subclass) : ''}</div>
      </div>
      <div class="row">
        <button class="icon" data-act="menu" aria-expanded="${menuOpen}"${menuOpen ? ' aria-controls="character-menu"' : ''}>角色選單</button>
      </div>
    </div>
    <div class="mode-bar">
      <span class="mode-label">${c.locked ? '遊玩中 · 資料已鎖定' : '編輯中 · 變更自動儲存'}</span>
      <div class="row"><button class="icon lockable" data-act="levelup">升級</button>
      <button class="icon mode-toggle${c.locked ? '' : ' is-lock'}" data-act="lock">${lockIcon(!!c.locked)}<span>${c.locked ? '編輯資料' : '完成編輯'}</span></button></div>
    </div>
    ${banner ? `<div class="warn" role="status">${esc(banner)}</div>` : ''}
    ${pending ? `<button class="big warn" data-act="pending">完成角色設定 · 尚有 ${pending} 個未選項目 →</button>` : ''}
    ${menu}
    <div class="ident lockable">
      <label class="field">副職業
        ${subCombo}
      </label>
    </div>
    <div class="combat-overview">
      <section class="hp-card" aria-label="生命值">
        <div class="hp-heading"><span>生命值 <small>HIT POINTS</small></span><span>目前 / 上限</span></div>
        <div class="hp-ctrl">
          <button class="icon" data-act="hp" data-d="-1" aria-label="生命減少 1">−</button>
          <div class="hp-pair">
            <input data-act="hpcur" aria-label="目前生命" type="number" inputmode="numeric" min="0" max="${c.hp.max}" value="${c.hp.current}">
            <span>/</span>
            <input data-act="hpmax" aria-label="生命上限" type="number" inputmode="numeric" min="1" value="${c.hp.max}"${lock}>
          </div>
          <button class="icon" data-act="hp" data-d="1" aria-label="生命增加 1">＋</button>
        </div>
        <progress class="hp-meter" aria-label="生命值" value="${c.hp.current}" max="${c.hp.max}">${c.hp.current} / ${c.hp.max}</progress>
        <p class="hint">點數字可直接修改生命${c.locked ? '' : ' · 右側可調整上限'}</p>
      </section>
      <div class="combat-numbers">
        <div class="stats">
          <div class="box"><label class="lbl" for="stat-ac">護甲 AC</label>
            <input id="stat-ac" class="val-sm" data-act="ac" type="number" value="${c.ac}"${lock}></div>
          <div class="box"><label class="lbl" for="stat-init">先攻</label>
            <input id="stat-init" class="val-sm" data-act="init" type="number" value="${c.initiative}"${lock}></div>
          <div class="box"><label class="lbl" for="stat-speed">速度 · 呎</label>
            <input id="stat-speed" class="val-sm" data-act="speed" type="number" value="${c.speed}"${lock}></div>
        </div>
        <div class="secondary-stats">
          <div><span>熟練加值</span><strong>+${c.proficiency}</strong></div>
          ${cls.caster && cls.caster !== 'none' ? `<div><span>法術 DC</span><strong>${Rules.spellSaveDC(c, cls)}</strong></div>
          <div><span>法術攻擊</span><strong>${Rules.spellAttack(c, cls) >= 0 ? '+' : ''}${Rules.spellAttack(c, cls)}</strong></div>` : ''}
        </div>
        <div class="quick-actions" aria-label="戰鬥常用操作">
          <button class="slot" data-act="short">短休</button>
          <button class="slot" data-act="long">長休</button>
          <button class="slot${c.concentrating ? ' cond-on' : ''}" data-act="conc" aria-pressed="${!!c.concentrating}">${c.concentrating ? '專注中' : '開始專注'}</button>
        </div>
      </div>
    </div>
    <div id="death-saves">${deathSavesHtml(c)}</div>
    </div>
    <div class="sheet-grid">
      <div>
        ${Object.keys(c.spellSlots || {}).length || (cls.caster && cls.caster !== 'none') ? `<h3>法術資源</h3><p class="hint">實心為可用，點一下消耗；再點一次恢復。</p>${slotRows || '<p class="muted">還沒有法術環</p>'}<button class="big lockable" data-act="addcircle"${lock}>＋法術環</button>` : ''}
        <h3>攻擊</h3>
        ${attacks}
        ${powerRows ? `<h3>職業技能</h3>${powerRows}` : ''}
        ${res ? `<h3>資源</h3><div class="slots">${res}</div>` : ''}
        ${Rules.isPreparedCaster(c.class, c.ruleset) || (c.spells || []).length || !c.locked ? `<h3>${Rules.isPreparedCaster(c.class, c.ruleset) ? '今日準備' : '法術'}</h3>${Rules.isPreparedCaster(c.class, c.ruleset) ? `<p class="muted">${(c.spells || []).length}／${Rules.preparedCap(c)}（領域不佔格）</p>` : ''}${spells}${spellAdd}` : ''}
        <h3>狀態</h3>
        <div class="slots">${condPick}</div>
      </div>
      <div>
        <details class="fold" data-fold="stats"${foldOpen.stats ? ' open' : ''}>
          <summary>能力／豁免／技能</summary>
          <div class="abi-grid">${abiCards}</div>
          <h3>豁免</h3>
          ${saveRows}
          <h3>技能</h3>
          <div class="skill-grid">${skillRows}</div>
        </details>
        <details class="fold" data-fold="features"${foldOpen.features ? ' open' : ''}>
          <summary>職業特性</summary>
          ${((pack.features[c.class] || []).concat(((pack.subclassFeatures || {})[c.subclass] || [])).filter(f => f.level <= c.level).map(f => {
            const id = (f.sub ? 's' : 'c') + f.level + '-' + f.name
            const open = openClassFeat === id
            return `<button class="big" data-act="toggleclassfeat" data-id="${esc(id)}" aria-expanded="${open}">${esc(f.name)} <span class="muted">${f.level}級${c.subclass && ((pack.subclassFeatures || {})[c.subclass] || []).indexOf(f) >= 0 ? ' · 子職' : ''}</span>
              ${open ? `<p class="spell-text">${esc(f.text)}</p>` : ''}</button>`
          }).join('') || '<p class="muted">沒有特性資料</p>')}
        </details>
        <details class="fold" data-fold="feats"${foldOpen.feats ? ' open' : ''}>
          <summary>專長</summary>
          ${featChips || '<p class="muted">點專長看效果</p>'}
          ${featAdd}
        </details>
        <details class="fold" data-fold="eq"${foldOpen.eq ? ' open' : ''}>
          <summary>裝備</summary>
          <label class="field">護甲
            ${c.locked ? `<p>${esc(((pack.equipment && pack.equipment.armor && pack.equipment.armor[c.armor]) || { name: '無' }).name)}</p>` : comboHtml('armor', Object.keys((pack.equipment && pack.equipment.armor) || {}).filter(id => Rules.canWearArmor(c, id, pack)).map(id => ({ id, name: pack.equipment.armor[id].name, hint: 'AC ' + pack.equipment.armor[id].ac })), c.armor ? [c.armor] : [], '搜尋護甲（僅熟練）…')}
          </label>
          ${Rules.canUseShield(c) ? `<label class="chk"><input type="checkbox" data-act="shield" ${c.shield ? 'checked' : ''}${lock}>盾牌（AC +2）</label>` : '<p class="muted">沒有盾牌熟練</p>'}
          ${c.locked ? '' : comboHtml('weapon', Object.keys((pack.equipment && pack.equipment.weapons) || {}).map(id => ({ id, name: pack.equipment.weapons[id].name, hint: pack.equipment.weapons[id].damage })), [], '加入武器到攻擊…')}
          ${c.locked ? '' : comboHtml('magic', Object.keys(pack.magicItems || {}).map(id => ({ id, name: pack.magicItems[id].name, text: pack.magicItems[id].text })), [], '加入魔法物品…')}
          ${((c.magicItems || []).map((id, i) => {
            const it = (pack.magicItems || {})[id]
            return `<div class="spell-line"><button class="big grow">${esc(it ? it.name : id)}${it && it.text ? `<p class="spell-text">${esc(it.text)}</p>` : ''}</button><button class="icon lockable" data-act="delmagic" data-i="${i}" aria-label="移除魔法物品 ${esc(it ? it.name : id)}"${lock}>×</button></div>`
          }).join(''))}
        </details>
        <details class="fold" data-fold="pack"${foldOpen.pack ? ' open' : ''}>
          <summary>錢幣／背包</summary>
          <div class="money">
            <label>GP <input class="val" data-act="gp" type="number" value="${(c.money && c.money.gp) || 0}"${lock}></label>
            <label>SP <input class="val" data-act="sp" type="number" value="${(c.money && c.money.sp) || 0}"${lock}></label>
            <label>CP <input class="val" data-act="cp" type="number" value="${(c.money && c.money.cp) || 0}"${lock}></label>
          </div>
          ${gearRows}
          <button class="big lockable" data-act="addgear"${lock}>＋物品</button>
        </details>
        <button class="big note-peek" data-act="notes-open">${(c.notes || '').trim() ? `<span class="note-snip">${esc((c.notes || '').trim().slice(0, 90))}${(c.notes || '').trim().length > 90 ? '…' : ''}</span>` : '<span class="muted">還沒寫東西，點開來記</span>'}<span class="muted">打開備忘錄 ›</span></button>
      </div>
    </div>
  `
}

function loadScript(after) {
  if (script) return
  fetch('data/scripts/avernus.json').then(r => r.json()).then(j => { script = j; if (after()) render() })
    .catch(() => { banner = '劇本資料載入失敗'; render() })
}

function termRegex() {
  if (!script) return null
  const pats = []
  const seen = script.entries.filter(e => e.ch <= glProg)
  const wordCount = {}
  seen.forEach(e => e.en.split(/\W+/).forEach(w => { if (w.length >= 5) wordCount[w] = (wordCount[w] || 0) + 1 }))
  seen.forEach(e => {
    const extra = (e.cat === 'NPC' || e.cat === '反派') ? e.en.split(/\W+/).filter(w => wordCount[w] === 1 && !/^(Captain|Cruel)$/.test(w)) : []
    ;[e.zh, e.en].concat(e.alias || [], extra).forEach(t => pats.push({ t, k: e.en }))
  })
  pats.sort((a, b) => b.t.length - a.t.length)
  const rx = new RegExp(pats.map(p => p.t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi')
  const lookup = {}
  pats.forEach(p => { lookup[p.t.toLowerCase()] = p.k })
  return { rx, lookup }
}

function markTerms(text) {
  const tr = termRegex()
  if (!tr) return esc(text)
  let out = '', last = 0, m
  tr.rx.lastIndex = 0
  while ((m = tr.rx.exec(text))) {
    const k = tr.lookup[m[0].toLowerCase()]
    out += esc(text.slice(last, m.index)) + `<button class="term${termOpen === k ? ' on' : ''}" data-act="term" data-k="${esc(k)}">${esc(m[0])}</button>`
    last = m.index + m[0].length
  }
  return out + esc(text.slice(last))
}

function termCard(k) {
  const e = script && script.entries.find(x => x.en === k)
  if (!e) return ''
  const open = !!glOpen[k]
  return `<div class="gl term-pop">
    <div class="gl-head"><span class="gl-zh">${esc(e.zh)}</span><span class="gl-en">${esc(e.en)}</span><span class="gl-cat">${esc(e.cat)}</span></div>
    <p class="gl-note">${esc(e.note || '')}</p>
    ${e.spoiler ? (open
      ? `<p class="gl-spoiler">${esc(e.spoiler)} <button class="gl-hide" data-act="gl-toggle" data-k="${esc(k)}">收起</button></p>`
      : `<button class="gl-reveal" data-act="gl-toggle" data-k="${esc(k)}">⚠ 顯示劇透</button>`) : ''}
  </div>`
}

function notesHtml(c) {
  const text = c.notes || ''
  const body = notesEdit
    ? `<textarea class="notes notes-big" data-act="notes" aria-label="冒險備忘錄" placeholder="NPC 名字、線索、欠誰錢……
寫完按「完成」，文中出現對照表裡的名字會自動加底線。">${esc(text)}</textarea>
       <button class="big primary" data-act="notes-done">完成</button>`
    : `<div class="note-read">${text.split(/\n/).map(line => {
        const html = markTerms(line) || '&nbsp;'
        return `<p>${html}</p>${html.indexOf('term on') >= 0 ? termCard(termOpen) : ''}`
      }).join('')}</div>
       <div class="row notes-actions">
         <button class="big" data-act="notes-edit">編輯</button>
         <button class="big${notesGl ? ' cond-on' : ''}" data-act="notes-gl">${notesGl ? '收起對照表 ▴' : '打開對照表 ▾'}</button>
       </div>
       ${notesGl && script ? `<section class="form-card notes-gl">
         <input class="gl-q" data-act="gl-q" type="search" placeholder="搜人名、地名、怪物（中英皆可）" value="${esc(glQ)}">
         <div class="slots gl-cats">
           <button class="slot${glCat === '' ? ' cond-on' : ''}" data-act="gl-cat" data-c="">全部</button>
           ${['NPC', '反派', '地點', '組織', '神祇', '怪物', '物品', '名詞'].map(k => `<button class="slot${glCat === k ? ' cond-on' : ''}" data-act="gl-cat" data-c="${k}">${k}</button>`).join('')}
         </div>
         <div id="gl-list">${glListHtml()}</div>
       </section>` : ''}`
  return `
    <p class="mast">冒險者紀錄</p>
    <div class="top">
      <button class="icon" data-act="back">返回</button>
      <div><div class="gl-title">${esc(c.name)} 的備忘錄</div><div class="kicker">${script ? '有底線的字點一下看說明' : '對照表載入中…'}</div></div>
    </div>
    ${body}
  `
}

function glListHtml() {
  const q = glQ.trim().toLowerCase()
  const all = script.entries
  const seen = all.filter(e => e.ch <= glProg)
  const hidden = all.length - seen.length
  const list = seen.filter(e => (!glCat || e.cat === glCat) &&
    (!q || e.zh.toLowerCase().includes(q) || e.en.toLowerCase().includes(q) || (e.note || '').toLowerCase().includes(q)))
  const rows = list.map((e, i) => {
    const key = e.en
    const open = !!glOpen[key]
    return `<div class="gl">
      <div class="gl-head">
        <span class="gl-zh">${esc(e.zh)}</span>
        <span class="gl-en">${esc(e.en)}</span>
        <span class="gl-cat">${esc(e.cat)}</span>
        <span class="gl-ch">第${e.ch}章</span>
      </div>
      <p class="gl-note">${esc(e.note || '')}</p>
      ${e.spoiler ? (open
        ? `<p class="gl-spoiler">${esc(e.spoiler)} <button class="gl-hide" data-act="gl-toggle" data-k="${esc(key)}">收起</button></p>`
        : `<button class="gl-reveal" data-act="gl-toggle" data-k="${esc(key)}">⚠ 顯示劇透</button>`) : ''}
    </div>`
  }).join('')
  return (rows || '<p class="muted">找不到符合的條目</p>') +
    (hidden ? `<p class="muted gl-hidden">還有 ${hidden} 筆屬於後面章節，等進度推進再解鎖。</p>` : '')
}

function scriptHtml() {
  if (!script) return `<p class="mast">冒險者紀錄</p><div class="top"><button class="icon" data-act="back">返回</button><div>劇本對照表</div></div><p class="muted">載入中…</p>`
  const cats = ['NPC', '反派', '地點', '組織', '神祇', '怪物', '物品', '名詞']
  return `
    <p class="mast">冒險者紀錄</p>
    <div class="top">
      <button class="icon" data-act="back">返回</button>
      <div><div class="gl-title">${esc(script.title)}</div><div class="kicker">${esc(script.en)}</div></div>
    </div>
    <section class="form-card">
      <label class="field">目前進度（打到哪就選到哪，之後的條目全部隱藏）
        <select data-act="gl-prog">${script.chapters.map((n, i) =>
          `<option value="${i + 1}" ${glProg === i + 1 ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>
      </label>
      <input class="gl-q" data-act="gl-q" type="search" placeholder="搜人名、地名、怪物（中英皆可）" value="${esc(glQ)}">
      <div class="slots gl-cats">
        <button class="slot${glCat === '' ? ' cond-on' : ''}" data-act="gl-cat" data-c="">全部</button>
        ${cats.map(k => `<button class="slot${glCat === k ? ' cond-on' : ''}" data-act="gl-cat" data-c="${k}">${k}</button>`).join('')}
      </div>
      <p class="hint">譯名為本表自譯，無官方繁中版。「顯示劇透」會露出關鍵反轉，DM 沒講到之前先別點。</p>
    </section>
    <div id="gl-list">${glListHtml()}</div>
  `
}

function comboSelected(key) {
  if (key === 'pickspell') return pickSpells
  if (key === 'pickfeat') return pickFeat ? [pickFeat] : []
  if (key === 'subclass') return pickSubclass ? [pickSubclass] : []
  if (key.slice(0, 7) === 'choice:') return pickChoice[key.slice(7)] || []
  return []
}

function comboTagsOf(key) {
  return comboTag[key] || { ring: '', school: '', dmg: '', meta: '' }
}

function inferDmg(s) {
  const t = (s.name || '') + (s.text || '')
  const keys = ['火焰', '寒冷', '閃電', '強酸', '毒素', '雷鳴', '力場', '光耀', '心靈']
  for (let i = 0; i < keys.length; i++) if (t.indexOf(keys[i]) >= 0) return keys[i]
  if (/死靈/.test(s.text || '')) return '死靈'
  return ''
}

function inferMeta(s) {
  const t = s.text || ''
  const m = []
  if (/專注/.test(t)) m.push('專注')
  if (/儀式/.test(t)) m.push('儀式')
  if (/附贈/.test(t)) m.push('附贈')
  else if (/反應/.test(t)) m.push('反應')
  else if (/1\s*動作/.test(t)) m.push('動作')
  return m
}

function tagTone(val) {
  const map = {
    '防護': 't-abj', '咒法': 't-con', '預言': 't-div', '惑控': 't-enc',
    '塑能': 't-evo', '幻術': 't-ill', '死靈': 't-nec', '變化': 't-tra',
    '火焰': 't-fire', '寒冷': 't-cold', '閃電': 't-lit', '強酸': 't-acid',
    '毒素': 't-poi', '雷鳴': 't-thu', '力場': 't-for', '光耀': 't-rad', '心靈': 't-psy',
    '戲法': 't-r0', '1環': 't-r1', '2環': 't-r2', '3環': 't-r3', '4環': 't-r4',
    '5環': 't-r5', '6環': 't-r6', '7環': 't-r7', '8環': 't-r8', '9環': 't-r9',
    '專注': 't-conc', '儀式': 't-rit', '動作': 't-act', '附贈': 't-bon', '反應': 't-rea'
  }
  return map[val] || ''
}

function comboFilter(items, q, exclude, key) {
  const s = (q || '').trim().toLowerCase()
  const tags = comboTagsOf(key)
  return items.filter(it => {
    if (exclude && exclude.indexOf(it.id) >= 0) return false
    if (tags.ring && it.hint !== tags.ring) return false
    if (tags.school && it.school !== tags.school) return false
    if (tags.dmg && it.dmg !== tags.dmg) return false
    if (tags.meta && (!it.metas || it.metas.indexOf(tags.meta) < 0)) return false
    if (!s) return true
    return (it.name + ' ' + (it.nameEn || '') + ' ' + it.id + ' ' + (it.hint || '') + ' ' + (it.school || '') + ' ' + (it.dmg || '') + ' ' + (it.text || '')).toLowerCase().indexOf(s) >= 0
  })
}

function comboChip(val) {
  if (!val) return ''
  const tone = tagTone(val)
  const ic = typeof tagIcon === 'function' ? tagIcon(val) : ''
  return `<span class="tag mini${tone ? ' ' + tone : ''}">${ic}${esc(val)}</span>`
}

function comboOptInner(it) {
  const bits = [comboChip(it.hint), comboChip(it.school), comboChip(it.dmg)]
  for (const m of it.metas || []) bits.push(comboChip(m))
  return `<span class="pick-name">${esc(it.name)}</span><span class="pick-flags">${bits.join('')}</span>${it.text ? `<span class="pick-body">${esc(it.text)}</span>` : ''}`
}

function comboTagHtml(key, items) {
  if (key !== 'spell' && key !== 'pickspell') return ''
  const tags = comboTagsOf(key)
  const rings = []
  const schools = []
  const dmgs = []
  const metas = []
  for (const it of items) {
    if (it.hint && rings.indexOf(it.hint) < 0) rings.push(it.hint)
    if (it.school && schools.indexOf(it.school) < 0) schools.push(it.school)
    if (it.dmg && dmgs.indexOf(it.dmg) < 0) dmgs.push(it.dmg)
    for (const m of it.metas || []) if (metas.indexOf(m) < 0) metas.push(m)
  }
  rings.sort((a, b) => {
    const na = a === '戲法' ? 0 : parseInt(a, 10) || 99
    const nb = b === '戲法' ? 0 : parseInt(b, 10) || 99
    return na - nb
  })
  const btn = (kind, val) => {
    const on = tags[kind] === val
    const tone = tagTone(val)
    const ic = typeof tagIcon === 'function' ? tagIcon(val) : ''
    return `<button type="button" class="tag${tone ? ' ' + tone : ''}${on ? ' on' : ''}" data-act="combotag" data-key="${esc(key)}" data-kind="${kind}" data-val="${esc(val)}">${ic}${esc(val)}</button>`
  }
  const row = arr => arr.length ? `<div class="combo-tags">${arr.map(v => btn(arr === rings ? 'ring' : arr === schools ? 'school' : arr === dmgs ? 'dmg' : 'meta', v)).join('')}</div>` : ''
  return row(rings) + row(schools) + row(dmgs) + row(metas)
}

function comboListHtml(key, items, q, exclude) {
  const filtered = comboFilter(items, q, exclude, key)
  const selected = comboSelected(key)
  if (!filtered.length) return '<ul class="combo-list"><li class="muted">沒有符合的（只顯示你現在能施的環數）</li></ul>'
  return '<ul class="combo-list">' + filtered.map(it => {
    const on = selected.indexOf(it.id) >= 0
    return `<li><button type="button" class="combo-opt${on ? ' is-on' : ''}" data-act="comboadd" data-key="${esc(key)}" data-id="${esc(it.id)}">${comboOptInner(it)}</button></li>`
  }).join('') + '</ul>'
}

function comboHtml(key, items, selected, placeholder) {
  const sel = selected || []
  const chips = sel.map(id => {
    const it = items.filter(x => x.id === id)[0] || { id, name: id }
    if (it.text || it.hint) {
      return `<div class="pick-card">
        <div class="pick-head">
          <span class="pick-name">${esc(it.name)}</span>
          ${comboChip(it.hint)}${comboChip(it.school)}${comboChip(it.dmg)}
          <button type="button" class="icon" data-act="combodel" data-key="${esc(key)}" data-id="${esc(id)}" aria-label="移除 ${esc(it.name)}">×</button>
        </div>
        ${it.text ? `<p class="pick-body">${esc(it.text)}</p>` : ''}
      </div>`
    }
    return `<button type="button" class="chip" data-act="combodel" data-key="${esc(key)}" data-id="${esc(id)}">${esc(it.name)} ×</button>`
  }).join('')
  const open = comboOpen === key
  return `<div class="combo" data-combo="${esc(key)}">
    <div class="chips">${chips}</div>
    ${comboTagHtml(key, items)}
    <input class="combo-q" data-act="comboq" data-key="${esc(key)}" aria-label="${esc(placeholder || '輸入名稱搜尋')}" placeholder="${esc(placeholder || '輸入名稱搜尋…')}" value="${esc(comboQ[key] || '')}" autocomplete="off">
    ${open ? comboListHtml(key, items, comboQ[key], comboExclude(key)) : ''}
  </div>`
}

function spellPickItems(c, opts) {
  const pack = packFor((c && c.ruleset) || ruleset)
  const cls = pack.classes[c.class] || {}
  const sub = c.subclass || ((view === 'levelup' || view === 'pending') ? pickSubclass : null)
  const lv = (opts && opts.level) || (view === 'levelup' ? c.level + 1 : c.level)
  const max = Rules.maxSlotLevel(Rules.casterOf(cls, sub), lv, c.ruleset)
  const listClass = Rules.spellListClass(c.class, sub)
  const cantrips = !!(opts && opts.cantrips)
  const auto = Rules.alwaysPreparedIds(c, pack)
  return Object.keys(data.spells || {}).filter(id => {
    if ((c.spells || []).indexOf(id) >= 0) return false
    if ((c.cantrips || []).indexOf(id) >= 0) return false
    if (auto.indexOf(id) >= 0) return false
    const schools = Rules.subclassSchools(sub)
    const allowOff = !!(schools && Rules.offSchoolCount(c, pack, schools) < Rules.anySchoolCap(lv))
    return Rules.canLearnSpell(data.spells[id], listClass, max, { cantrips, subclass: sub, allowOffSchool: allowOff })
  }).map(id => {
    const s = data.spells[id]
    return { id, name: s.name, nameEn: s.nameEn || '', hint: s.level === 0 ? '戲法' : s.level + '環', school: s.school || '', dmg: inferDmg(s), metas: inferMeta(s), text: s.text }
  })
}

function comboItemsFor(key) {
  const c = current()
  const pack = packFor((c && c.ruleset) || ruleset)
  if (key === 'pickspell') {
    if (!c) return []
    const at = view === 'levelup' ? c.level + 1 : c.level
    return spellPickItems(c, { level: at })
  }
  if (key === 'spell') return c ? spellPickItems(c, { cantrips: true }) : []
  if (key === 'armor') {
    const arm = (pack.equipment && pack.equipment.armor) || {}
    return Object.keys(arm).map(id => ({ id, name: arm[id].name, hint: 'AC ' + arm[id].ac }))
  }
  if (key === 'weapon') {
    const wpn = (pack.equipment && pack.equipment.weapons) || {}
    return Object.keys(wpn).map(id => ({ id, name: wpn[id].name, hint: wpn[id].damage }))
  }
  if (key === 'magic') {
    const mag = pack.magicItems || {}
    return Object.keys(mag).map(id => ({ id, name: mag[id].name, text: mag[id].text }))
  }
  if (key === 'feat' || key === 'pickfeat') {
    return Object.keys(data.feats || {}).map(id => {
      const f = data.feats[id]
      return { id, name: f.name, text: f.text }
    })
  }
  if (key === 'subclass' || key === 'subclass-live') {
    const cls = pack.classes[(c && c.class)] || {}
    return (cls.subclasses || []).map(s => {
      const feats = ((pack.subclassFeatures || {})[s.id] || []).slice(0, 2)
      return { id: s.id, name: s.name, text: feats.map(f => f.name + '：' + f.text).join(' ') }
    })
  }
  if (key.slice(0, 7) === 'choice:') {
    const cat = (pack.choices || {})[key.slice(7)]
    if (!cat || !c) return []
    const lv = view === 'levelup' ? c.level + 1 : c.level
    return (cat.options || []).filter(o => {
      if (o.classes && o.classes.indexOf(c.class) < 0) return false
      if (o.minLevel && lv < o.minLevel) return false
      return true
    }).map(o => ({ id: o.id, name: o.name, text: o.text }))
  }
  return []
}

function spellPickNeed(c) {
  if (!c) return 0
  const pack = packFor(c.ruleset || '2014')
  const items = view === 'pending' ? (c.pendingChoices || []) : Rules.checklistFor(c, pack)
  const it = items.filter(x => x.type === 'spells')[0]
  return it ? it.count : 0
}

function comboExclude(key) {
  const c = current()
  if (key === 'spell') return (c && c.spells) || []
  if (key === 'pickspell') return (c && c.spells) || []
  if (key === 'feat') return (c && c.feats) || []
  if (key === 'pickfeat') return pickFeat ? [pickFeat] : []
  if (key === 'subclass') return pickSubclass ? [pickSubclass] : []
  if (key === 'subclass-live') return (c && c.subclass) ? [c.subclass] : []
  if (key.slice(0, 7) === 'choice:') return []
  return []
}

function choicePickerHtml(cat, classId, pick, level) {
  if (!cat) return ''
  const selected = pickChoice[cat.id] || []
  const lv = level || 1
  const opts = (cat.options || []).filter(o => {
    if (o.classes && o.classes.indexOf(classId) < 0) return false
    if (o.minLevel && lv < o.minLevel) return false
    return true
  })
  if (opts.length > 5) {
    return `<p class="muted">選 ${pick} 項，輸入搜尋後點選</p>` +
      comboHtml('choice:' + cat.id, opts.map(o => ({ id: o.id, name: o.name, text: o.text })), selected, '搜尋' + cat.name + '…')
  }
  return `<p class="muted">選 ${pick} 項</p>` + opts.map(o => {
    const on = selected.indexOf(o.id) >= 0
    return `<label class="chk"><input type="checkbox" data-act="pickch" data-cat="${esc(cat.id)}" data-id="${esc(o.id)}" ${on ? 'checked' : ''}><span><strong>${esc(o.name)}</strong><span class="spell-text">${esc(o.text)}</span></span></label>`
  }).join('')
}

function levelHtml(c) {
  const pack = packFor(c.ruleset || '2014')
  const items = view === 'pending' ? (c.pendingChoices || []) : Rules.checklistFor(c, pack)
  const missing = items.some(x => x.type === 'missing')
  const cls = pack.classes[c.class] || { subclasses: [], spellPicks: {} }
  const boxes = items.map(it => {
    const on = checkedIds.indexOf(it.id) >= 0
    let extra = ''
    if (it.type === 'subclass') {
      extra = comboHtml('subclass', (cls.subclasses || []).map(s => ({ id: s.id, name: s.name })), pickSubclass ? [pickSubclass] : [], '搜尋副職業…')
    }
    if (it.type === 'spells') {
      const at = view === 'levelup' ? c.level + 1 : c.level
      const max = Rules.maxSlotLevel(Rules.casterOf(cls, c.subclass || pickSubclass), at, c.ruleset)
      extra = `<p class="muted">選 ${it.count} 個 · 升到 ${at} 級可選到 ${max} 環</p>` +
        comboHtml('pickspell', spellPickItems(c, { level: at }), pickSpells, '搜尋可學法術（' + at + '級最高' + max + '環）…')
    }
    if (it.type === 'hp') {
      extra = `<input type="number" min="1" max="${it.hitDie}" data-act="hproll" value="${esc(hpRoll)}" placeholder="骰到幾點（1–${it.hitDie}）">`
    }
    if (it.type === 'asi') {
      const opts = sel => Object.keys(ABI_NAME).map(k =>
        `<option value="${k}" ${sel === k ? 'selected' : ''}>${ABI_NAME[k]}</option>`).join('')
      extra = `
        <p class="muted">兩項 +1，或選一個專長</p>
        <select data-act="asi0">${opts(pickAsi[0])}</select>
        <select data-act="asi1">${opts(pickAsi[1])}</select>
        ${comboHtml('pickfeat', Object.keys(data.feats).map(id => ({ id, name: data.feats[id].name, text: data.feats[id].text })), pickFeat ? [pickFeat] : [], '搜尋專長（可不選）…')}`
    }
    if (it.type === 'choice') {
      const cat = (pack.choices || {})[it.catalog]
      extra = choicePickerHtml(cat, c.class, it.pick, view === 'levelup' ? c.level + 1 : c.level)
    }
    if (it.type === 'missing') extra = `<p>${esc(it.label)}</p>`
    const label = it.label || ({ hp: '生命值', subclass: '子職', asi: '能力值／專長', spells: '法術 ×' + (it.count || '') }[it.type] || it.type)
    return `<label class="chk"><input type="checkbox" data-act="check" data-id="${esc(it.id)}" ${on ? 'checked' : ''}>${esc(label)}</label>${extra}`
  }).join('')
  const probe = Object.assign({}, c, {
    level: view === 'levelup' ? c.level + 1 : c.level,
    subclass: pickSubclass || c.subclass
  })
  const extraChoices = Rules.pendingFor(probe, cls, pack.choices, pack.spells).filter(x => x.type === 'choice' && items.every(it => it.catalog !== x.catalog))
  const extraHtml = extraChoices.map(it => {
    const cat = (pack.choices || {})[it.catalog]
    return `<div class="choice-block"><p><strong>${esc(it.label)}</strong></p>${choicePickerHtml(cat, c.class, it.pick, probe.level)}</div>`
  }).join('')
  return `
    <p class="mast">冒險者紀錄</p>
    <div class="top">
      <button class="icon" data-act="back">返回</button>
      <div>${esc(c.name)} · ${view === 'pending' ? '未選項目' : className(c.class, c.ruleset) + ' ' + c.level + ' → ' + (c.level + 1)}</div>
    </div>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    ${boxes || '<p class="muted">沒有要選的</p>'}
    ${extraHtml}
    <button class="big primary" data-act="apply" ${missing ? 'disabled' : ''}>套用</button>
  `
}

el.addEventListener('submit', e => {
  if (!e.target.matches('.create-form')) return
  e.preventDefault()
  el.querySelector('[data-act="create"]').click()
})

el.addEventListener('click', e => {
  const t = e.target
  if (comboOpen && !t.closest('.combo')) {
    comboOpen = ''
    if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA' || !t.closest('[data-act]')) {
      render()
      return
    }
  }
  if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return
  const btn = t.closest('[data-act]')
  if (!btn) return
  const act = btn.dataset.act
  const c = current()
  banner = ''
  if (act === 'menu') { menuOpen = !menuOpen; confirmDel = false; render(); return }
  if (act === 'del') { confirmDel = true; render(); return }
  if (act === 'del-no') { confirmDel = false; render(); return }
  if (act === 'del-yes') {
    state.characters = state.characters.filter(x => x.id !== c.id)
    state.currentId = state.characters.length ? state.characters[0].id : null
    confirmDel = false
    menuOpen = false
    view = state.currentId ? 'combat' : 'create'
    persist()
    return
  }
  if (act === 'lock') {
    const next = JSON.parse(JSON.stringify(c))
    next.locked = !c.locked
    replace(next)
    return
  }
  if (act === 'script') { openScript(); return }
  if (act === 'notes-open') { openNotes(c); return }
  if (act === 'tab') {
    const v = btn.dataset.v
    if (v === view) return
    if (v === 'notes') openNotes(c)
    else if (v === 'script') openScript()
    else { view = 'combat'; menuOpen = false; render() }
    return
  }
  if (act === 'notes-gl') { notesGl = !notesGl; render(); return }
  if (act === 'notes-edit') { notesEdit = true; termOpen = ''; render(); const ta = el.querySelector('textarea.notes'); if (ta) ta.focus(); return }
  if (act === 'notes-done') {
    const ta = el.querySelector('textarea.notes')
    if (ta && c) { c.notes = ta.value; persist(true) }
    notesEdit = false; render(); return
  }
  if (act === 'term') { const k = t.dataset.k; termOpen = termOpen === k ? '' : k; render(); return }
  if (act === 'gl-cat') { glCat = t.dataset.c || ''; render(); return }
  if (act === 'gl-toggle') { const k = t.dataset.k; glOpen[k] = !glOpen[k]; render(); return }
  if (act === 'new') { view = 'create'; menuOpen = false; render(); return }
  if (act === 'back') { view = current() ? 'combat' : 'create'; render(); return }
  if (act === 'create') {
    e.preventDefault()
    const name = (document.getElementById('f-name') || {}).value || ''
    const race = (document.getElementById('f-race') || {}).value
    const classId = (document.getElementById('f-class') || {}).value
    const level = Number((document.getElementById('f-level') || {}).value || 1)
    const abilities = {}
    el.querySelectorAll('[data-act="abi"]').forEach(inp => { abilities[inp.dataset.k] = Number(inp.value) })
    if (!name.trim()) { banner = '缺名字'; render(); focusField('f-name'); return }
    const hpMaxRaw = (document.getElementById('f-hpmax') || {}).value
    const hpMax = hpMaxRaw === '' || hpMaxRaw == null ? null : Number(hpMaxRaw)
    if (level > 1 && hpMax == null) { banner = '等級大於 1 請填最大生命（骰＋體質加總）'; render(); focusField('f-hpmax'); return }
    const background = ruleset === '2024' ? ((document.getElementById('f-background') || {}).value || '') : ''
    const ch = Rules.createCharacter({
      name: name.trim(), race, class: classId, level, abilities,
      hpMax: hpMax == null ? undefined : hpMax,
      ruleset,
      background: background || undefined
    }, packFor(ruleset))
    state.characters.push(ch)
    state.currentId = ch.id
    pickSpells = []
    pickChoice = {}
    if ((ch.pendingChoices || []).length) {
      view = 'pending'
      checkedIds = ch.pendingChoices.map(x => x.id)
    } else view = 'combat'
    persist()
    return
  }
  if (act === 'switch') { state.currentId = btn.dataset.id; menuOpen = false; persist(); return }
  if (act === 'hp') { replace(Rules.changeHp(c, Number(btn.dataset.d))); return }
  if (act === 'slot') {
    const r = Rules.useSpellSlot(c, btn.dataset.k)
    if (r.ok) replace(r.character)
    else { banner = '法術位用完了'; render() }
    return
  }
  if (act === 'pip') {
    const k = btn.dataset.k
    const i = Number(btn.dataset.i)
    const sl = c.spellSlots && c.spellSlots[k]
    if (!sl) return
    const sp = slotSpent(sl)
    sp[i] = !sp[i]
    const next = JSON.parse(JSON.stringify(c))
    next.spellSlots[k].spent = sp
    next.spellSlots[k].used = sp.filter(Boolean).length
    replace(next)
    return
  }
  if (act === 'levelup') {
    view = 'levelup'; checkedIds = []; pickSpells = []; hpRoll = ''
    pickChoice = {}
    for (const [k, v] of Object.entries(c.choices || {})) pickChoice[k] = v.slice()
    pickSubclass = ((packFor(c.ruleset).classes[c.class] || {}).subclasses || [])[0] && packFor(c.ruleset).classes[c.class].subclasses[0].id || ''
    comboTag = {}
    menuOpen = false; render(); return
  }
  if (act === 'pending') {
    view = 'pending'; checkedIds = (c.pendingChoices || []).map(x => x.id); pickSpells = []
    pickChoice = {}
    for (const [k, v] of Object.entries(c.choices || {})) pickChoice[k] = v.slice()
    pickSubclass = ((packFor(c.ruleset).classes[c.class] || {}).subclasses || [])[0] && packFor(c.ruleset).classes[c.class].subclasses[0].id || ''
    comboTag = {}
    render(); return
  }
  if (act === 'check') {
    const id = btn.dataset.id
    const i = checkedIds.indexOf(id)
    const checked = t.type === 'checkbox' ? t.checked : i < 0
    if (checked && i < 0) checkedIds.push(id)
    if (!checked && i >= 0) checkedIds.splice(i, 1)
    return
  }
  if (act === 'togglespell') { openSpell = openSpell === btn.dataset.id ? '' : btn.dataset.id; render(); return }
  if (act === 'togglefeat') { openFeat = openFeat === btn.dataset.id ? '' : btn.dataset.id; render(); return }
  if (act === 'toggleclassfeat') { openClassFeat = openClassFeat === btn.dataset.id ? '' : btn.dataset.id; render(); return }
  if (act === 'togglepower') {
    const k = btn.dataset.cat + ':' + btn.dataset.id
    openPower = openPower === k ? '' : k
    render()
    return
  }
  if (act === 'combotag') {
    const key = btn.dataset.key
    const kind = btn.dataset.kind
    const val = btn.dataset.val
    comboTag[key] = comboTag[key] || { ring: '', school: '', dmg: '', meta: '' }
    comboTag[key][kind] = comboTag[key][kind] === val ? '' : val
    comboOpen = key
    const box = btn.closest('.combo')
    if (!box) { render(); return }
    box.querySelectorAll('[data-act="combotag"]').forEach(b => {
      b.classList.toggle('on', comboTag[key][b.dataset.kind] === b.dataset.val)
    })
    const html = comboListHtml(key, comboItemsFor(key), comboQ[key], comboExclude(key))
    const list = box.querySelector('.combo-list')
    if (list) list.outerHTML = html
    else box.insertAdjacentHTML('beforeend', html)
    return
  }
  if (act === 'comboadd' || act === 'combodel') {
    const key = btn.dataset.key
    const id = btn.dataset.id
    if (act === 'comboadd') {
      if (key === 'spell') {
        comboQ[key] = ''
        const pack = packFor(c.ruleset)
        const next = Rules.addSpell(c, id, pack)
        if (Rules.isPreparedCaster(c.class, c.ruleset) && (next.spells || []).length === (c.spells || []).length) {
          banner = '準備已滿（' + Rules.preparedCap(c) + '）'
        }
        replace(next)
        return
      }
      if (key === 'armor') { comboQ[key] = ''; comboOpen = ''; replace(Rules.setArmor(c, id, packFor(c.ruleset))); return }
      if (key === 'weapon') { comboQ[key] = ''; comboOpen = ''; replace(Rules.addWeapon(c, id, packFor(c.ruleset))); return }
      if (key === 'magic') { comboQ[key] = ''; comboOpen = ''; replace(Rules.addMagicItem(c, id, packFor(c.ruleset))); return }
      if (key === 'feat') {
        comboQ[key] = ''
        comboOpen = ''
        const next = JSON.parse(JSON.stringify(c))
        next.feats = (next.feats || []).concat([id])
        replace(next)
        return
      }
      if (key === 'subclass-live') { comboQ[key] = ''; comboOpen = ''; replace(Rules.setSubclass(c, id, packFor(c.ruleset))); return }
      if (key === 'subclass') { comboQ[key] = ''; pickSubclass = id; comboOpen = ''; render(); return }
      if (key === 'pickfeat') { comboQ[key] = ''; pickFeat = id; comboOpen = ''; render(); return }
      if (key === 'pickspell') {
        const r = Rules.togglePick(pickSpells, id, spellPickNeed(c))
        if (!r.ok) return
        pickSpells = r.arr
        comboQ[key] = ''
        comboOpen = key
        render()
        return
      }
      if (key.slice(0, 7) === 'choice:') {
        const cat = key.slice(7)
        const pack = packFor(c.ruleset)
        const need = Rules.catalogPick((pack.choices || {})[cat] || {}, view === 'levelup' ? c.level + 1 : c.level)
        const r = Rules.togglePick(pickChoice[cat] || [], id, need)
        if (!r.ok) return
        pickChoice[cat] = r.arr
        comboQ[key] = ''
        comboOpen = key
        render()
        return
      }
    }
    if (key === 'armor') { replace(Rules.setArmor(c, '', packFor(c.ruleset))); return }
    if (key === 'subclass') { pickSubclass = ''; render(); return }
    if (key === 'subclass-live') { replace(Rules.setSubclass(c, '', packFor(c.ruleset))); return }
    if (key === 'pickfeat') { pickFeat = ''; render(); return }
    if (key === 'pickspell') { pickSpells = pickSpells.filter(x => x !== id); render(); return }
    if (key.slice(0, 7) === 'choice:') {
      const cat = key.slice(7)
      pickChoice[cat] = (pickChoice[cat] || []).filter(x => x !== id)
      render()
      return
    }
    return
  }
  if (act === 'resetchoice') {
    view = 'pending'
    pickChoice = {}
    replace(Rules.clearChoices(c, btn.dataset.cat, packFor(c.ruleset)))
    return
  }
  if (act === 'conc') {
    const next = JSON.parse(JSON.stringify(c))
    next.concentrating = !c.concentrating
    replace(next)
    return
  }
  if (act === 'long') {
    if (!window.confirm('長休會恢復全部生命、法術環與資源，並重設死亡豁免。確定長休？')) return
    menuOpen = false
    banner = '長休完成：生命、法術環與資源已恢復。'
    replace(Rules.longRest(c))
    return
  }
  if (act === 'short') {
    if (!window.confirm('短休會恢復短休資源與契術師法術環；生命請依生命骰結果手動調整。確定短休？')) return
    menuOpen = false
    banner = '短休完成：短休資源已恢復，生命請依生命骰結果調整。'
    replace(Rules.shortRest(c))
    return
  }
  if (act === 'export') {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (c.name || 'character') + '.json'
    a.click()
    return
  }
  if (c && c.locked && ['addatk', 'delatk', 'delspell', 'delfeat', 'addgear', 'delgear', 'addcircle'].indexOf(act) >= 0) return
  if (act === 'addcircle') {
    const keys = Object.keys((c.spellSlots || {})).map(Number).filter(n => !Number.isNaN(n))
    const nextK = keys.length ? Math.max.apply(null, keys) + 1 : 1
    replace(Rules.setSlotMax(c, nextK, 1))
    return
  }
  if (act === 'delmagic') {
    replace(Rules.removeMagicItem(c, btn.dataset.i, packFor(c.ruleset)))
    return
  }
  if (act === 'addgear') {
    const next = JSON.parse(JSON.stringify(c))
    next.gear = (next.gear || []).concat([{ name: '新物品', qty: 1 }])
    replace(next)
    return
  }
  if (act === 'delgear') {
    const next = JSON.parse(JSON.stringify(c))
    next.gear = (next.gear || []).slice()
    next.gear.splice(Number(btn.dataset.i), 1)
    replace(next)
    return
  }
  if (act === 'addatk') {
    const next = JSON.parse(JSON.stringify(c))
    next.attacks = (next.attacks || []).concat([{ name: '新攻擊', bonus: 0, damage: '1d6' }])
    replace(next)
    return
  }
  if (act === 'delatk') {
    const next = JSON.parse(JSON.stringify(c))
    next.attacks.splice(Number(btn.dataset.i), 1)
    replace(next)
    return
  }
  if (act === 'delspell') {
    replace(Rules.removeSpell(c, btn.dataset.id, packFor(c.ruleset)))
    return
  }
  if (act === 'delfeat') {
    const next = JSON.parse(JSON.stringify(c))
    next.feats = (next.feats || []).filter(id => id !== btn.dataset.id)
    replace(next)
    return
  }
  if (act === 'cond') {
    const next = JSON.parse(JSON.stringify(c))
    next.conditions = next.conditions || []
    const i = next.conditions.indexOf(btn.dataset.n)
    if (i < 0) next.conditions.push(btn.dataset.n)
    else next.conditions.splice(i, 1)
    replace(next)
    return
  }
  if (act === 'ds') {
    const next = JSON.parse(JSON.stringify(c))
    next.deathSaves[btn.dataset.k] = Math.min(3, (next.deathSaves[btn.dataset.k] || 0) + 1)
    replace(next)
    return
  }
  if (act === 'ds-reset') {
    const next = JSON.parse(JSON.stringify(c))
    next.deathSaves = { success: 0, fail: 0 }
    replace(next)
    return
  }
  if (act === 'res') {
    const next = JSON.parse(JSON.stringify(c))
    const r = next.resources[Number(btn.dataset.i)]
    if (r && r.used < r.max) r.used += 1
    replace(next)
    return
  }
  if (act === 'apply') {
    let next = JSON.parse(JSON.stringify(c))
    const pack = packFor(c.ruleset || '2014')
    const items = view === 'pending' ? (next.pendingChoices || []) : Rules.checklistFor(c, pack)
    const on = id => checkedIds.indexOf(id) >= 0
    if (items.some(it => it.type === 'subclass' && on(it.id)) && pickSubclass) next.subclass = pickSubclass
    const spellItem = items.filter(it => it.type === 'spells')[0]
    if (spellItem && on(spellItem.id)) {
      const have = next.spells || []
      const fresh = []
      for (const id of pickSpells) {
        if (have.indexOf(id) < 0 && fresh.indexOf(id) < 0) fresh.push(id)
      }
      if (fresh.length !== spellItem.count) {
        banner = '請選滿 ' + spellItem.count + ' 個法術'
        render()
        return
      }
      next.spells = have.concat(fresh)
    }
    if (items.some(it => it.type === 'asi' && on(it.id))) {
      if (pickFeat) next.feats = (next.feats || []).concat([pickFeat])
      else {
        next.abilities[pickAsi[0]] += 1
        next.abilities[pickAsi[1]] += 1
      }
    }
    const cls = pack.classes[next.class]
    const caster = Rules.casterOf(cls, next.subclass)
    const fresh = Rules.slotsFor(caster, next.level, next.ruleset)
    if (Object.keys(fresh).length && (!next.spellSlots || !Object.keys(next.spellSlots).length)) next.spellSlots = fresh
    for (const catId of Object.keys(pickChoice)) {
      const r = Rules.setChoices(next, catId, pickChoice[catId], pack)
      if (!r.ok) {
        banner = '請選滿「' + (((pack.choices || {})[catId] || {}).name || catId) + '」'
        render()
        return
      }
      next = r.character
    }
    if (view === 'pending') {
      next.pendingChoices = Rules.pendingFor(next, cls, pack.choices, pack.spells)
      pickChoice = {}
      pickSpells = []
      if (next.pendingChoices.length) {
        banner = '還有沒選完的項目'
        view = 'pending'
      } else view = 'combat'
      replace(next)
      return
    }
    const applied = Rules.applyLevelUp(next, checkedIds, pack, { hpRoll: Number(hpRoll) })
    if (!applied.ok) { banner = applied.missing && applied.missing[0] === 'hpRoll' ? '請填這次生命骰點數' : '還沒勾完'; render(); return }
    let ch = applied.character
    for (const catId of Object.keys(pickChoice)) {
      const r = Rules.setChoices(ch, catId, pickChoice[catId], pack)
      if (r.ok) ch = r.character
    }
    pickChoice = {}
    pickSpells = []
    view = (ch.pendingChoices || []).length ? 'pending' : 'combat'
    replace(ch)
    return
  }
  if (act === 'noop') return
})

el.addEventListener('input', e => {
  if (e.target.dataset.act === 'gl-q' && script) {
    glQ = e.target.value
    const list = document.getElementById('gl-list')
    if (list) list.innerHTML = glListHtml()
    return
  }
  if (e.target.dataset.act !== 'comboq') return
  const key = e.target.dataset.key
  comboQ[key] = e.target.value
  comboOpen = key
  const box = e.target.closest('.combo')
  if (!box) return
  const html = comboListHtml(key, comboItemsFor(key), comboQ[key], comboExclude(key))
  const list = box.querySelector('.combo-list')
  if (list) list.outerHTML = html
  else box.insertAdjacentHTML('beforeend', html)
})

el.addEventListener('toggle', e => {
  const d = e.target
  if (!d.dataset || !d.dataset.fold) return
  foldOpen[d.dataset.fold] = d.open
}, true)

el.addEventListener('focusin', e => {
  if (e.target.dataset.act !== 'comboq') return
  const key = e.target.dataset.key
  comboOpen = key
  const box = e.target.closest('.combo')
  if (!box || box.querySelector('.combo-list')) return
  box.insertAdjacentHTML('beforeend', comboListHtml(key, comboItemsFor(key), comboQ[key], comboExclude(key)))
})

el.addEventListener('change', e => {
  const t = e.target
  if (t.id === 'import') {
    const file = t.files && t.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const r = Store.importJson(localStorage, String(reader.result), state)
      if (!r.ok) { banner = r.error || '檔案打不開'; render(); return }
      state = r.state
      view = current() ? 'combat' : 'create'
      menuOpen = false
      persist()
    }
    reader.readAsText(file)
    return
  }
  const act = t.dataset.act
  if (act === 'shield') {
    const c = current()
    if (!c) return
    replace(Rules.setShield(c, t.checked, packFor(c.ruleset)))
    return
  }
  if (act === 'picksb') { pickSubclass = t.value; render(); return }
  if (act === 'pickch') {
    const cat = t.dataset.cat
    const id = t.dataset.id
    const c = current()
    const pack = packFor((c || {}).ruleset)
    const need = Rules.catalogPick((pack.choices || {})[cat] || {}, view === 'levelup' ? c.level + 1 : c.level)
    const r = Rules.togglePick(pickChoice[cat] || [], id, need)
    if (!r.ok) { t.checked = false; return }
    pickChoice[cat] = r.arr
    render()
    return
  }
  if (act === 'picksp') {
    const id = t.dataset.id
    const i = pickSpells.indexOf(id)
    if (t.checked && i < 0) pickSpells.push(id)
    if (!t.checked && i >= 0) pickSpells.splice(i, 1)
  }
  if (act === 'asi0') pickAsi[0] = t.value
  if (act === 'asi1') pickAsi[1] = t.value
  if (act === 'feat') pickFeat = t.value
  if (act === 'hproll') hpRoll = t.value
  if (act === 'skillval') {
    const c = current(); if (!c) return
    c.skills = c.skills || {}
    if (t.value === '') delete c.skills[t.dataset.id]
    else c.skills[t.dataset.id] = Number(t.value)
    persist(true)
  }
  if (act === 'saveval') {
    const c = current(); if (!c) return
    c.saveBonus = c.saveBonus || {}
    if (t.value === '') delete c.saveBonus[t.dataset.k]
    else c.saveBonus[t.dataset.k] = Number(t.value)
    persist(true)
  }
  if (act === 'abival') {
    const c = current(); if (!c) return
    c.abilities[t.dataset.k] = Number(t.value)
    const m = Rules.abilityMod(Number(t.value))
    const label = t.parentElement && t.parentElement.querySelector('.mod-ring')
    if (label) label.textContent = (m >= 0 ? '+' : '') + m
    persist(true)
  }
  if (act === 'ac') { const c = current(); if (c) { c.ac = Number(t.value); persist(true) } }
  if (act === 'speed') { const c = current(); if (c) { c.speed = Number(t.value); persist(true) } }
  if (act === 'init') { const c = current(); if (c) { c.initiative = Number(t.value); persist(true) } }
  if (act === 'hpcur') {
    const c = current(); if (!c) return
    const n = Number(t.value)
    c.hp.current = Math.max(0, Math.min(c.hp.max, Number.isNaN(n) ? 0 : n))
    refreshHp(c)
    persist(true)
  }
  if (act === 'hpmax') {
    const c = current(); if (!c) return
    const n = Number(t.value)
    c.hp.max = Number.isNaN(n) || n < 1 ? c.hp.max : n
    if (c.hp.current > c.hp.max) c.hp.current = c.hp.max
    refreshHp(c)
    persist(true)
  }
  if (act === 'gp' || act === 'sp' || act === 'cp') {
    const c = current(); if (!c) return
    c.money = c.money || { gp: 0, sp: 0, cp: 0 }
    c.money[act] = Number(t.value) || 0
    persist(true)
  }
  if (act === 'name') { const c = current(); if (c) { c.name = t.value; persist(true) } }
  if (act === 'gl-prog') { glProg = Number(t.value) || 1; localStorage.setItem('dnd5e-script-progress', glProg); glOpen = {}; render(); return }
  if (act === 'notes') { const c = current(); if (c) { c.notes = t.value; persist(true) } }
  if (act === 'ruleset') { ruleset = t.value; render(); return }
  if (act === 'subclass') { const c = current(); if (c) replace(Rules.setSubclass(c, t.value, packFor(c.ruleset))) }
  if (act === 'addspell') { const c = current(); if (c && t.value) replace(Rules.addSpell(c, t.value, packFor(c.ruleset))) }
  if (act === 'addfeat') {
    const c = current(); if (!c || !t.value) return
    const next = JSON.parse(JSON.stringify(c))
    next.feats = next.feats || []
    if (next.feats.indexOf(t.value) < 0) next.feats.push(t.value)
    replace(next)
  }
  if (act === 'slotmax') {
    const c = current(); if (!c || c.locked) return
    replace(Rules.setSlotMax(c, t.dataset.k, t.value))
  }
  if (act === 'gearname') {
    const c = current(); if (!c || !c.gear || !c.gear[t.dataset.i]) return
    c.gear[t.dataset.i].name = t.value
    persist(true)
  }
  if (act === 'gearqty') {
    const c = current(); if (!c || !c.gear || !c.gear[t.dataset.i]) return
    c.gear[t.dataset.i].qty = Number(t.value)
    persist(true)
  }
  if (act === 'atkname') { const c = current(); if (c && c.attacks[t.dataset.i]) { c.attacks[t.dataset.i].name = t.value; persist(true) } }
  if (act === 'atkbonus') { const c = current(); if (c && c.attacks[t.dataset.i]) { c.attacks[t.dataset.i].bonus = Number(t.value); persist(true) } }
  if (act === 'atkdmg') { const c = current(); if (c && c.attacks[t.dataset.i]) { c.attacks[t.dataset.i].damage = t.value; persist(true) } }
  if (act === 'check') {
    const id = t.dataset.id
    const i = checkedIds.indexOf(id)
    if (t.checked && i < 0) checkedIds.push(id)
    if (!t.checked && i >= 0) checkedIds.splice(i, 1)
  }
})

async function boot() {
  try {
    const [races, classes, spells, feats, features, races2024, classes2024, choices, equipment, prepared, subclassFeatures, magicItems, backgrounds] = await Promise.all([
      fetch('data/races.json').then(r => r.json()),
      fetch('data/classes.json').then(r => r.json()),
      fetch('data/spells.json').then(r => r.json()),
      fetch('data/feats.json').then(r => r.json()),
      fetch('data/features.json').then(r => r.json()),
      fetch('data/races2024.json').then(r => r.json()),
      fetch('data/classes2024.json').then(r => r.json()),
      fetch('data/choices.json').then(r => r.json()),
      fetch('data/equipment.json').then(r => r.json()),
      fetch('data/prepared.json').then(r => r.json()),
      fetch('data/subclass-features.json').then(r => r.json()),
      fetch('data/magic-items.json').then(r => r.json()),
      fetch('data/backgrounds2024.json').then(r => r.json())
    ])
    data = { races, classes, spells, feats, features, races2024, classes2024, choices, equipment, prepared, subclassFeatures, magicItems, backgrounds }
    state = Store.loadState(localStorage)
    view = current() ? 'combat' : 'create'
    render()
    if (navigator.serviceWorker) navigator.serviceWorker.register('./sw.js')
  } catch (e) {
    el.innerHTML = '<p class="warn">先連一次網</p>'
  }
}

boot()
