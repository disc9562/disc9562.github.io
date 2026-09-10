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

const el = document.getElementById('app')
let data = { races: {}, classes: {}, spells: {}, feats: {} }
let state = { characters: [], currentId: null }
let view = 'combat'
let banner = ''
let menuOpen = false
let checkedIds = []
let pickSubclass = ''
let pickSpells = []
let pickFeat = ''
let pickAsi = ['str', 'str']
let openSpell = ''
let hpRoll = ''

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
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

function raceName(id) {
  return (data.races[id] && data.races[id].name) || id
}
function className(id) {
  return (data.classes[id] && data.classes[id].name) || id
}

function render() {
  const opened = [...el.querySelectorAll('details')].map(d => d.open)
  const c = current()
  if (view === 'create' || !c) el.innerHTML = createHtml()
  else if (view === 'levelup' || view === 'pending') el.innerHTML = levelHtml(c)
  else el.innerHTML = combatHtml(c)
  ;[...el.querySelectorAll('details')].forEach((d, i) => { if (opened[i]) d.open = true })
}

function createHtml() {
  const races = Object.keys(data.races).map(id =>
    `<option value="${esc(id)}">${esc(data.races[id].name)}</option>`).join('')
  const classes = Object.keys(data.classes).map(id =>
    `<option value="${esc(id)}">${esc(data.classes[id].name)}</option>`).join('')
  const abis = Object.keys(ABI_NAME).map(k =>
    `<label class="field">${esc(ABI_NAME[k])}
      <input data-act="abi" data-k="${k}" type="number" min="1" max="20" value="10">
    </label>`).join('')
  return `
    <p class="mast">冒險者紀錄</p>
    <h2>建角</h2>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    <label class="field">名字 <input id="f-name" placeholder="角色名"></label>
    <label class="field">種族 <select id="f-race">${races}</select></label>
    <label class="field">職業 <select id="f-class">${classes}</select></label>
    <label class="field">等級 <input id="f-level" type="number" min="1" max="20" value="1"></label>
    <p class="muted">六項是加種族前的數字</p>
    <div class="abi">${abis}</div>
    <label class="field">最大生命（1 級留空＝骰面最大＋體質） <input id="f-hpmax" type="number" min="1" placeholder="1 級可留空"></label>
    <button class="big primary" data-act="create">建立</button>
    ${state.characters.length ? `<button class="big" data-act="back">取消</button>` : ''}
  `
}

function fieldVal(obj, k) {
  return obj && obj[k] != null && obj[k] !== '' ? obj[k] : ''
}

function combatHtml(c) {
  const cls = data.classes[c.class] || {}
  const pending = (c.pendingChoices || []).length
  const skills = c.skills || {}
  const saveBonus = c.saveBonus || {}
  const abiCards = Object.keys(ABI_NAME).map(k => {
    const m = Rules.abilityMod(c.abilities[k])
    return `<div class="seal">
      <svg class="seal-svg" viewBox="0 0 100 110" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><polygon points="50,4 96,28 96,82 50,106 4,82 4,28" fill="#fffaf1" stroke="#24160f" stroke-width="2.4"/></svg>
      <div class="seal-inner">
        <div class="lbl">${esc(ABI_NAME[k])}</div>
        <div class="mod" data-mod="${k}">${m >= 0 ? '+' : ''}${m}</div>
        <input class="val-sm" data-act="abival" data-k="${k}" type="number" value="${c.abilities[k]}">
      </div>
    </div>`
  }).join('')
  const saveRows = Object.keys(ABI_NAME).map(k =>
    `<div class="save-row"><span>${esc(ABI_NAME[k])}</span>
      <input class="val" data-act="saveval" data-k="${k}" type="number" value="${esc(fieldVal(saveBonus, k))}" placeholder="—"></div>`
  ).join('')
  const skillRows = SKILLS.map(s =>
    `<div class="skill-row"><span>${esc(s.name)} <span class="muted">${esc(ABI_NAME[s.abi])}</span></span>
      <input class="val" data-act="skillval" data-id="${s.id}" type="number" value="${esc(fieldVal(skills, s.id))}" placeholder="—"></div>`
  ).join('')
  const attacks = `<div class="atk muted"><span>名稱</span><span>命中</span><span>傷害</span></div>` +
    (c.attacks || []).map((a, i) =>
      `<div class="atk">
        <input data-act="atkname" data-i="${i}" value="${esc(a.name)}">
        <input class="val" data-act="atkbonus" data-i="${i}" type="number" value="${a.bonus}">
        <input data-act="atkdmg" data-i="${i}" value="${esc(a.damage)}">
      </div>`
    ).join('') +
    `<button class="big" data-act="addatk">＋攻擊</button>`
  const spells = (c.spells || []).map(id => {
    const s = data.spells[id]
    if (!s) return ''
    const open = openSpell === id
    return `<button class="big" data-act="togglespell" data-id="${esc(id)}">${esc(s.name)} <span class="muted">${s.level === 0 ? '戲法' : s.level + '環'}</span>
      ${open ? `<p class="spell-text">${esc(s.text)}</p>` : ''}</button>`
  }).join('')
  const slotBtns = Object.keys(c.spellSlots || {}).sort().map(k => {
    const sl = c.spellSlots[k]
    return `<button class="slot" data-act="slot" data-k="${esc(k)}">${k}環 ${sl.max - sl.used}/${sl.max}</button>`
  }).join('')
  const cond = (c.conditions || [])
  const death = c.hp.current === 0 ? `
    <div class="box" style="margin:8px 0">死亡豁免　成功 ${c.deathSaves.success}/3　失敗 ${c.deathSaves.fail}/3
      <div class="row">
        <button class="icon grow" data-act="ds" data-k="success">成功</button>
        <button class="icon grow" data-act="ds" data-k="fail">失敗</button>
        <button class="icon grow" data-act="ds-reset">重設</button>
      </div>
    </div>` : ''
  const res = (c.resources || []).map((r, i) =>
    `<button class="slot" data-act="res" data-i="${i}">${esc(r.name)} ${r.max - r.used}/${r.max}</button>`
  ).join('')
  const condPick = CONDITIONS.map(n => {
    const on = cond.indexOf(n) >= 0
    return `<button class="slot${on ? ' cond-on' : ''}" data-act="cond" data-n="${esc(n)}">${esc(n)}</button>`
  }).join('')
  const menu = menuOpen ? `
    <div class="menu">
      ${(state.characters).map(x =>
        `<button class="big" data-act="switch" data-id="${esc(x.id)}">${esc(x.name)}　${esc(className(x.class))} ${x.level}${x.id === c.id ? ' ←' : ''}</button>`
      ).join('')}
      <button class="big" data-act="new">新增角色</button>
      <button class="big" data-act="short">短休</button>
      <button class="big" data-act="long">長休</button>
      <button class="big" data-act="export">匯出</button>
      <label class="big" style="display:block">匯入<input id="import" type="file" accept="application/json" class="hidden"></label>
    </div>` : ''
  return `
    <p class="mast">冒險者紀錄</p>
    <div class="top">
      <div>
        <div class="name">${esc(c.name)}</div>
        <div class="kicker">${esc(raceName(c.race))}　${esc(className(c.class))} ${c.level}</div>
      </div>
      <div class="row">
        <button class="icon" data-act="levelup">升級</button>
        <button class="icon" data-act="menu">⋯</button>
      </div>
    </div>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    ${pending ? `<button class="big warn" data-act="pending">還有未選項目（${pending}）</button>` : ''}
    ${menu}
    <div class="stats">
      <div class="box"><div class="lbl">AC</div>
        <input class="val-sm" data-act="ac" type="number" value="${c.ac}"></div>
      <div class="box">
        <div class="lbl">生命　目前 / 上限</div>
        <div class="hp-ctrl">
          <button class="icon" data-act="hp" data-d="-1">−</button>
          <div class="hp-pair">
            <input data-act="hpcur" type="number" value="${c.hp.current}">
            <span>/</span>
            <input data-act="hpmax" type="number" value="${c.hp.max}">
          </div>
          <button class="icon" data-act="hp" data-d="1">＋</button>
        </div>
        <div class="hint">骰錯上限可直接改右邊數字</div>
      </div>
      <div class="box"><div class="lbl">速度</div>
        <input class="val-sm" data-act="speed" type="number" value="${c.speed}"></div>
    </div>
    <div class="mini">
      <div class="box"><div class="lbl">先攻</div>
        <input class="val-sm" data-act="init" type="number" value="${c.initiative}"></div>
      <div class="box"><div class="lbl">熟練</div><div class="num">+${c.proficiency}</div></div>
    </div>
    ${death}
    <div class="sheet-grid">
      <div>
        <h3>能力</h3>
        <div class="abi-grid">${abiCards}</div>
        <h3>豁免</h3>
        ${saveRows}
        <h3>技能</h3>
        ${skillRows}
      </div>
      <div>
        <h3>攻擊</h3>
        ${attacks}
        ${res ? `<h3>資源</h3><div class="slots">${res}</div>` : ''}
        ${slotBtns ? `<h3>法術位</h3><div class="slots">${slotBtns}</div>` : ''}
        ${spells ? `<h3>法術</h3>${spells}` : ''}
        <h3>狀態</h3>
        <div class="slots">${condPick}</div>
      </div>
    </div>
  `
}

function levelHtml(c) {
  const items = view === 'pending' ? (c.pendingChoices || []) : Rules.checklistFor(c, data)
  const missing = items.some(x => x.type === 'missing')
  const cls = data.classes[c.class] || { subclasses: [], spellPicks: {} }
  const boxes = items.map(it => {
    const on = checkedIds.indexOf(it.id) >= 0
    let extra = ''
    if (it.type === 'subclass') {
      extra = `<select data-act="picksb">${(cls.subclasses || []).map(s =>
        `<option value="${esc(s.id)}" ${pickSubclass === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select>`
    }
    if (it.type === 'spells') {
      extra = `<p class="muted">選 ${it.count} 個加入卡片</p>` + Object.keys(data.spells).filter(id => {
        const s = data.spells[id]
        return s.classes.indexOf(c.class) >= 0 && (c.spells || []).indexOf(id) < 0
      }).map(id => {
        const s = data.spells[id]
        const onS = pickSpells.indexOf(id) >= 0
        return `<label class="chk"><input type="checkbox" data-act="picksp" data-id="${esc(id)}" ${onS ? 'checked' : ''}>${esc(s.name)}（${s.level === 0 ? '戲法' : s.level + '環'}）</label>`
      }).join('')
    }
    if (it.type === 'hp') {
      extra = `<input type="number" min="1" max="${it.hitDie}" data-act="hproll" value="${esc(hpRoll)}" placeholder="這次骰到 1–${it.hitDie}">`
    }
    if (it.type === 'asi') {
      const opts = sel => Object.keys(ABI_NAME).map(k =>
        `<option value="${k}" ${sel === k ? 'selected' : ''}>${ABI_NAME[k]}</option>`).join('')
      extra = `
        <p class="muted">兩項 +1，或選一個專長</p>
        <select data-act="asi0">${opts(pickAsi[0])}</select>
        <select data-act="asi1">${opts(pickAsi[1])}</select>
        <select data-act="feat"><option value="">（不用專長）</option>${Object.keys(data.feats).map(id =>
          `<option value="${esc(id)}" ${pickFeat === id ? 'selected' : ''}>${esc(data.feats[id].name)}</option>`).join('')}</select>`
    }
    if (it.type === 'missing') extra = `<p>${esc(it.label)}</p>`
    const label = it.label || ({ hp: '生命值', subclass: '子職', asi: '能力值／專長', spells: '法術 ×' + (it.count || '') }[it.type] || it.type)
    return `<label class="chk"><input type="checkbox" data-act="check" data-id="${esc(it.id)}" ${on ? 'checked' : ''}>${esc(label)}</label>${extra}`
  }).join('')
  return `
    <p class="mast">冒險者紀錄</p>
    <div class="top">
      <button class="icon" data-act="back">返回</button>
      <div>${esc(c.name)} · ${view === 'pending' ? '未選項目' : className(c.class) + ' ' + c.level + ' → ' + (c.level + 1)}</div>
    </div>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    ${boxes || '<p class="muted">沒有要選的</p>'}
    <button class="big primary" data-act="apply" ${missing ? 'disabled' : ''}>套用</button>
  `
}

el.addEventListener('click', e => {
  const t = e.target
  if (t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.tagName === 'TEXTAREA') return
  const btn = t.closest('[data-act]')
  if (!btn) return
  const act = btn.dataset.act
  const c = current()
  banner = ''
  if (act === 'menu') { menuOpen = !menuOpen; render(); return }
  if (act === 'new') { view = 'create'; menuOpen = false; render(); return }
  if (act === 'back') { view = current() ? 'combat' : 'create'; render(); return }
  if (act === 'create') {
    const name = (document.getElementById('f-name') || {}).value || ''
    const race = (document.getElementById('f-race') || {}).value
    const classId = (document.getElementById('f-class') || {}).value
    const level = Number((document.getElementById('f-level') || {}).value || 1)
    const abilities = {}
    el.querySelectorAll('[data-act="abi"]').forEach(inp => { abilities[inp.dataset.k] = Number(inp.value) })
    if (!name.trim()) { banner = '缺名字'; render(); return }
    const hpMaxRaw = (document.getElementById('f-hpmax') || {}).value
    const hpMax = hpMaxRaw === '' || hpMaxRaw == null ? null : Number(hpMaxRaw)
    if (level > 1 && hpMax == null) { banner = '等級大於 1 請填最大生命（骰＋體質加總）'; render(); return }
    const ch = Rules.createCharacter({
      name: name.trim(), race, class: classId, level, abilities,
      hpMax: hpMax == null ? undefined : hpMax
    }, data)
    state.characters.push(ch)
    state.currentId = ch.id
    view = 'combat'
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
  if (act === 'levelup') { view = 'levelup'; checkedIds = []; pickSpells = []; hpRoll = ''; pickSubclass = ((data.classes[c.class] || {}).subclasses || [])[0] && data.classes[c.class].subclasses[0].id || ''; menuOpen = false; render(); return }
  if (act === 'pending') { view = 'pending'; checkedIds = (c.pendingChoices || []).map(x => x.id); pickSpells = []; pickSubclass = ((data.classes[c.class] || {}).subclasses || [])[0] && data.classes[c.class].subclasses[0].id || ''; render(); return }
  if (act === 'check') {
    const id = btn.dataset.id
    const i = checkedIds.indexOf(id)
    const checked = t.type === 'checkbox' ? t.checked : i < 0
    if (checked && i < 0) checkedIds.push(id)
    if (!checked && i >= 0) checkedIds.splice(i, 1)
    return
  }
  if (act === 'togglespell') { openSpell = openSpell === btn.dataset.id ? '' : btn.dataset.id; render(); return }
  if (act === 'long') { menuOpen = false; replace(Rules.longRest(c)); return }
  if (act === 'short') { menuOpen = false; replace(Rules.shortRest(c)); return }
  if (act === 'export') {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = (c.name || 'character') + '.json'
    a.click()
    return
  }
  if (act === 'addatk') {
    const next = JSON.parse(JSON.stringify(c))
    next.attacks = (next.attacks || []).concat([{ name: '新攻擊', bonus: 0, damage: '1d6' }])
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
    const next = JSON.parse(JSON.stringify(c))
    const items = view === 'pending' ? (next.pendingChoices || []) : Rules.checklistFor(c, data)
    const on = id => checkedIds.indexOf(id) >= 0
    if (items.some(it => it.type === 'subclass' && on(it.id)) && pickSubclass) next.subclass = pickSubclass
    if (items.some(it => it.type === 'spells' && on(it.id)) && pickSpells.length) {
      next.spells = (next.spells || []).concat(pickSpells)
    }
    if (items.some(it => it.type === 'asi' && on(it.id))) {
      if (pickFeat) next.feats = (next.feats || []).concat([pickFeat])
      else {
        next.abilities[pickAsi[0]] += 1
        next.abilities[pickAsi[1]] += 1
      }
    }
    const cls = data.classes[next.class]
    const caster = Rules.casterOf(cls, next.subclass)
    const fresh = Rules.slotsFor(caster, next.level)
    if (Object.keys(fresh).length && (!next.spellSlots || !Object.keys(next.spellSlots).length)) next.spellSlots = fresh
    if (view === 'pending') {
      next.pendingChoices = Rules.pendingFor(next, cls)
      view = 'combat'
      replace(next)
      return
    }
    const applied = Rules.applyLevelUp(next, checkedIds, data, { hpRoll: Number(hpRoll) })
    if (!applied.ok) { banner = applied.missing && applied.missing[0] === 'hpRoll' ? '請填這次生命骰點數' : '還沒勾完'; render(); return }
    view = 'combat'
    replace(applied.character)
    return
  }
  if (act === 'noop') return
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
  if (act === 'picksb') pickSubclass = t.value
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
    const label = t.parentElement && t.parentElement.querySelector('.mod')
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
    persist(true)
  }
  if (act === 'hpmax') {
    const c = current(); if (!c) return
    const n = Number(t.value)
    c.hp.max = Number.isNaN(n) || n < 1 ? c.hp.max : n
    if (c.hp.current > c.hp.max) c.hp.current = c.hp.max
    const cur = el.querySelector('[data-act="hpcur"]')
    if (cur) cur.value = c.hp.current
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
    const [races, classes, spells, feats] = await Promise.all([
      fetch('data/races.json').then(r => r.json()),
      fetch('data/classes.json').then(r => r.json()),
      fetch('data/spells.json').then(r => r.json()),
      fetch('data/feats.json').then(r => r.json())
    ])
    data = { races, classes, spells, feats }
    state = Store.loadState(localStorage)
    view = current() ? 'combat' : 'create'
    render()
    if (navigator.serviceWorker) navigator.serviceWorker.register('./sw.js')
  } catch (e) {
    el.innerHTML = '<p class="warn">先連一次網</p>'
  }
}

boot()
