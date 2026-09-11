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
let confirmDel = false
let checkedIds = []
let pickSubclass = ''
let pickSpells = []
let pickFeat = ''
let pickAsi = ['str', 'str']
let openSpell = ''
let openFeat = ''
let openClassFeat = ''
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
      features: data.features || {}
    }
  }
  return {
    races: data.races,
    classes: data.classes,
    spells: data.spells,
    feats: data.feats,
    features: data.features || {}
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
  const c = current()
  if (view === 'create' || !c) el.innerHTML = createHtml()
  else if (view === 'levelup' || view === 'pending') el.innerHTML = levelHtml(c)
  else el.innerHTML = combatHtml(c)
  ;[...el.querySelectorAll('details')].forEach((d, i) => { if (opened[i]) d.open = true })
  el.classList.toggle('is-locked', !!(c && c.locked && view === 'combat'))
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
    <h2>建立新角色</h2>
    <p class="lede">填好名字與出身，六項屬性可以之後再改。</p>
    <section class="form-card">
    <h3>身分</h3>
    <label class="field">規則
      <select data-act="ruleset">
        <option value="2014" ${ruleset === '2014' ? 'selected' : ''}>2014 PHB</option>
        <option value="2024" ${ruleset === '2024' ? 'selected' : ''}>2024 PHB</option>
      </select>
    </label>
    <label class="field">名字 <input id="f-name" placeholder="角色名" autocomplete="off"${banner === '缺名字' ? bad : ''}></label>
    <label class="field">${ruleset === '2024' ? '物種' : '種族'} <select id="f-race">${races}</select></label>
    <label class="field">職業 <select id="f-class">${classes}</select></label>
    <label class="field">等級 <input id="f-level" type="number" min="1" max="20" value="1" inputmode="numeric"></label>
    </section>
    <section class="form-card">
    <h3>屬性</h3>
    <p class="hint">${ruleset === '2024' ? '填最終分數，2024 版種族不加點。' : '填加種族加值前的數字，系統會自動加。'}</p>
    <div class="abi">${abis}</div>
    </section>
    <section class="form-card">
    <h3>生命</h3>
    <label class="field">最大生命 <input id="f-hpmax" type="number" min="1" placeholder="1 級可留空，自動算" inputmode="numeric"${banner && banner !== '缺名字' ? bad : ''}></label>
    <p class="hint">1 級留空會用骰面最大值加體質調整值。2 級以上請填骰出的總和。</p>
    </section>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    <button class="big primary" data-act="create">建立角色</button>
    ${state.characters.length ? `<button class="big" data-act="back">取消</button>` : ''}
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

function combatHtml(c) {
  const pack = packFor(c.ruleset || '2014')
  const cls = pack.classes[c.class] || {}
  const pending = (c.pendingChoices || []).length
  const synced = Rules.syncSpellSlots(c, pack)
  if (synced !== c) {
    c.spellSlots = synced.spellSlots
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
      <input class="val-sm" data-act="abival" data-k="${k}" type="number" value="${c.abilities[k]}"${lock}>
    </div>`
  }).join('')
  const saveRows = Object.keys(ABI_NAME).map(k =>
    `<div class="save-row"><span>${esc(ABI_NAME[k])}</span>
      <input class="val" data-act="saveval" data-k="${k}" type="number" value="${esc(fieldVal(saveBonus, k))}" placeholder="—"${lock}></div>`
  ).join('')
  const skillRows = SKILLS.map(s =>
    `<div class="skill-row"><span>${esc(s.name)} <span class="muted">${esc(ABI_NAME[s.abi])}</span></span>
      <input class="val" data-act="skillval" data-id="${s.id}" type="number" value="${esc(fieldVal(skills, s.id))}" placeholder="—"${lock}></div>`
  ).join('')
  const attacks = `<div class="atk muted"><span>名稱</span><span>命中</span><span>傷害</span><span></span></div>` +
    (c.attacks || []).map((a, i) =>
      `<div class="atk">
        <input data-act="atkname" data-i="${i}" value="${esc(a.name)}"${lock}>
        <input class="val" data-act="atkbonus" data-i="${i}" type="number" value="${a.bonus}"${lock}>
        <input data-act="atkdmg" data-i="${i}" value="${esc(a.damage)}"${lock}>
        <button class="icon lockable" data-act="delatk" data-i="${i}"${lock}>×</button>
      </div>`
    ).join('') +
    `<button class="big lockable" data-act="addatk"${lock}>＋攻擊</button>`
  const spells = (c.spells || []).map(id => {
    const s = data.spells[id]
    if (!s) return ''
    const open = openSpell === id
    return `<div class="spell-line">
      <button class="big grow" data-act="togglespell" data-id="${esc(id)}">${esc(s.name)} <span class="muted">${s.level === 0 ? '戲法' : s.level + '環'}</span>
        ${open ? `<p class="spell-text">${esc(s.text)}</p>` : ''}</button>
      <button class="icon lockable" data-act="delspell" data-id="${esc(id)}"${lock}>×</button>
    </div>`
  }).join('')
  const spellAdd = `<select class="lockable" data-act="addspell"${lock}><option value="">＋加入法術</option>${Object.keys(data.spells).filter(id => (c.spells || []).indexOf(id) < 0).map(id => {
    const s = data.spells[id]
    return `<option value="${esc(id)}">${esc(s.name)}（${s.level === 0 ? '戲法' : s.level + '環'}）</option>`
  }).join('')}</select>`
  const featChips = (c.feats || []).map(id => {
    const f = data.feats[id]
    const open = openFeat === id
    return `<div class="spell-line">
      <button class="big grow" data-act="togglefeat" data-id="${esc(id)}">${esc(f ? f.name : id)}
        ${open && f && f.text ? `<p class="spell-text">${esc(f.text)}</p>` : ''}</button>
      <button class="icon lockable" data-act="delfeat" data-id="${esc(id)}"${lock}>×</button>
    </div>`
  }).join('')
  const featAdd = `<select class="lockable" data-act="addfeat"${lock}><option value="">＋專長</option>${Object.keys(data.feats).filter(id => (c.feats || []).indexOf(id) < 0).map(id =>
    `<option value="${esc(id)}">${esc(data.feats[id].name)}</option>`).join('')}</select>`
  const subOpts = `<option value="">（未選／重選）</option>` + (cls.subclasses || []).map(s =>
    `<option value="${esc(s.id)}" ${c.subclass === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')
  const slotRows = Object.keys(c.spellSlots || {}).sort((a, b) => Number(a) - Number(b)).map(k => {
    const sl = c.spellSlots[k]
    const pips = Array.from({ length: sl.max }, (_, i) => {
      const spent = i < sl.used
      return `<button class="pip${spent ? ' spent' : ''}" data-act="pip" data-k="${esc(k)}" data-i="${i}" aria-label="${k}環"></button>`
    }).join('')
    return `<div class="slot-row">
      <span class="slot-lbl">${k}環</span>
      <div class="pips">${pips}</div>
      <input class="val lockable" data-act="slotmax" data-k="${esc(k)}" type="number" min="0" value="${sl.max}"${lock}>
    </div>`
  }).join('')
  const gear = c.gear || []
  const gearRows = gear.map((g, i) =>
    `<div class="gear">
      <input data-act="gearname" data-i="${i}" value="${esc(g.name)}"${lock}>
      <input class="val" data-act="gearqty" data-i="${i}" type="number" min="0" value="${g.qty == null ? 1 : g.qty}">
      <button class="icon lockable" data-act="delgear" data-i="${i}"${lock}>×</button>
    </div>`
  ).join('')
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
        `<button class="big" data-act="switch" data-id="${esc(x.id)}">${esc(x.name)}　${esc(className(x.class, x.ruleset))} ${x.level}${x.id === c.id ? ' ←' : ''}</button>`
      ).join('')}
      <button class="big" data-act="new">新增角色</button>
      <button class="big" data-act="short">短休</button>
      <button class="big" data-act="long">長休</button>
      <button class="big" data-act="export">匯出</button>
      <label class="big" style="display:block">匯入<input id="import" type="file" accept="application/json" class="hidden"></label>
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
    <p class="mast">冒險者紀錄 · v23</p>
    <div class="top">
      <div>
        <input class="name-edit" data-act="name" value="${esc(c.name)}"${lock}>
        <div class="kicker">${esc(raceName(c.race, c.ruleset))}　${esc(className(c.class, c.ruleset))} ${c.level}　${c.ruleset === '2024' ? '2024' : '2014'}${c.locked ? '　已鎖定' : ''}</div>
      </div>
      <div class="row">
        <button class="icon${c.locked ? ' is-lock' : ''}" data-act="lock" aria-label="${c.locked ? '解鎖' : '鎖定'}">${lockIcon(!!c.locked)}</button>
        <button class="icon" data-act="levelup" aria-label="升級">升級</button>
        <button class="icon" data-act="menu" aria-label="選單">選單</button>
      </div>
    </div>
    ${banner ? `<div class="warn">${esc(banner)}</div>` : ''}
    ${pending ? `<button class="big warn" data-act="pending">還有未選項目（${pending}）</button>` : ''}
    ${menu}
    <div class="ident">
      <label class="field">副職業
        <select data-act="subclass"${lock}>${subOpts}</select>
      </label>
    </div>
    <div class="stats">
      <div class="box"><div class="lbl">AC</div>
        <input class="val-sm" data-act="ac" type="number" value="${c.ac}"${lock}></div>
      <div class="box">
        <div class="lbl">生命　目前 / 上限</div>
        <div class="hp-ctrl">
          <button class="icon" data-act="hp" data-d="-1">−</button>
          <div class="hp-pair">
            <input data-act="hpcur" type="number" value="${c.hp.current}">
            <span>/</span>
            <input data-act="hpmax" type="number" value="${c.hp.max}"${lock}>
          </div>
          <button class="icon" data-act="hp" data-d="1">＋</button>
        </div>
        <div class="hint">骰錯上限可直接改右邊數字</div>
      </div>
      <div class="box"><div class="lbl">速度</div>
        <input class="val-sm" data-act="speed" type="number" value="${c.speed}"${lock}></div>
    </div>
    <div class="mini">
      <div class="box"><div class="lbl">先攻</div>
        <input class="val-sm" data-act="init" type="number" value="${c.initiative}"${lock}></div>
      <div class="box"><div class="lbl">熟練</div><div class="num">+${c.proficiency}</div></div>
    </div>
    ${cls.caster && cls.caster !== 'none' ? `<div class="mini">
      <div class="box"><div class="lbl">法術DC</div><div class="num">${Rules.spellSaveDC(c, cls)}</div></div>
      <div class="box"><div class="lbl">法術攻擊</div><div class="num">${Rules.spellAttack(c, cls) >= 0 ? '+' : ''}${Rules.spellAttack(c, cls)}</div></div>
    </div>` : ''}
    <button class="slot${c.concentrating ? ' cond-on' : ''}" data-act="conc">專注${c.concentrating ? '中' : ''}</button>
    ${death}
    </div>
    <h3>法術環</h3>
    ${slotRows || '<p class="muted">還沒有法術環</p>'}
    <button class="big lockable" data-act="addcircle"${lock}>＋法術環</button>
    <div class="sheet-grid">
      <div>
        <h3>能力</h3>
        <div class="abi-grid">${abiCards}</div>
        <h3>豁免</h3>
        ${saveRows}
        <h3>技能</h3>
        <div class="skill-grid">${skillRows}</div>
        <h3>職業特性</h3>
        ${(pack.features[c.class] || []).filter(f => f.level <= c.level).map(f => {
          const id = f.level + '-' + f.name
          const open = openClassFeat === id
          return `<button class="big" data-act="toggleclassfeat" data-id="${esc(id)}">${esc(f.name)} <span class="muted">${f.level}級</span>
            ${open ? `<p class="spell-text">${esc(f.text)}</p>` : ''}</button>`
        }).join('') || '<p class="muted">沒有特性資料</p>'}
      </div>
      <div>
        <h3>攻擊</h3>
        ${attacks}
        ${res ? `<h3>資源</h3><div class="slots">${res}</div>` : ''}
        <h3>法術</h3>
        ${spells}
        ${spellAdd}
        <h3>專長</h3>
        ${featChips || '<p class="muted">點專長看效果</p>'}
        ${featAdd}
        <h3>錢幣</h3>
        <div class="money">
          <label>GP <input class="val" data-act="gp" type="number" value="${(c.money && c.money.gp) || 0}"${lock}></label>
          <label>SP <input class="val" data-act="sp" type="number" value="${(c.money && c.money.sp) || 0}"${lock}></label>
          <label>CP <input class="val" data-act="cp" type="number" value="${(c.money && c.money.cp) || 0}"${lock}></label>
        </div>
        <h3>背包</h3>
        ${gearRows}
        <button class="big lockable" data-act="addgear"${lock}>＋物品</button>
        <h3>狀態</h3>
        <div class="slots">${condPick}</div>
      </div>
    </div>
  `
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
      <div>${esc(c.name)} · ${view === 'pending' ? '未選項目' : className(c.class, c.ruleset) + ' ' + c.level + ' → ' + (c.level + 1)}</div>
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
  if (act === 'new') { view = 'create'; menuOpen = false; render(); return }
  if (act === 'back') { view = current() ? 'combat' : 'create'; render(); return }
  if (act === 'create') {
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
    const ch = Rules.createCharacter({
      name: name.trim(), race, class: classId, level, abilities,
      hpMax: hpMax == null ? undefined : hpMax,
      ruleset
    }, packFor(ruleset))
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
  if (act === 'pip') {
    const k = btn.dataset.k
    const i = Number(btn.dataset.i)
    const sl = c.spellSlots && c.spellSlots[k]
    if (!sl) return
    const used = i < sl.used ? i : i + 1
    const r = Rules.setSlotUsed(c, k, used)
    if (r.ok) replace(r.character)
    return
  }
  if (act === 'levelup') { view = 'levelup'; checkedIds = []; pickSpells = []; hpRoll = ''; pickSubclass = ((packFor(c.ruleset).classes[c.class] || {}).subclasses || [])[0] && packFor(c.ruleset).classes[c.class].subclasses[0].id || ''; menuOpen = false; render(); return }
  if (act === 'pending') { view = 'pending'; checkedIds = (c.pendingChoices || []).map(x => x.id); pickSpells = []; pickSubclass = ((packFor(c.ruleset).classes[c.class] || {}).subclasses || [])[0] && packFor(c.ruleset).classes[c.class].subclasses[0].id || ''; render(); return }
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
  if (act === 'conc') {
    const next = JSON.parse(JSON.stringify(c))
    next.concentrating = !c.concentrating
    replace(next)
    return
  }
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
  if (c && c.locked && ['addatk', 'delatk', 'delspell', 'delfeat', 'addgear', 'delgear', 'addcircle'].indexOf(act) >= 0) return
  if (act === 'addcircle') {
    const keys = Object.keys((c.spellSlots || {})).map(Number).filter(n => !Number.isNaN(n))
    const nextK = keys.length ? Math.max.apply(null, keys) + 1 : 1
    replace(Rules.setSlotMax(c, nextK, 1))
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
    const next = JSON.parse(JSON.stringify(c))
    const pack = packFor(c.ruleset || '2014')
    const items = view === 'pending' ? (next.pendingChoices || []) : Rules.checklistFor(c, pack)
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
    const cls = pack.classes[next.class]
    const caster = Rules.casterOf(cls, next.subclass)
    const fresh = Rules.slotsFor(caster, next.level)
    if (Object.keys(fresh).length && (!next.spellSlots || !Object.keys(next.spellSlots).length)) next.spellSlots = fresh
    if (view === 'pending') {
      next.pendingChoices = Rules.pendingFor(next, cls)
      view = 'combat'
      replace(next)
      return
    }
    const applied = Rules.applyLevelUp(next, checkedIds, pack, { hpRoll: Number(hpRoll) })
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
  if (act === 'gp' || act === 'sp' || act === 'cp') {
    const c = current(); if (!c) return
    c.money = c.money || { gp: 0, sp: 0, cp: 0 }
    c.money[act] = Number(t.value) || 0
    persist(true)
  }
  if (act === 'name') { const c = current(); if (c) { c.name = t.value; persist(true) } }
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
    const [races, classes, spells, feats, features, races2024, classes2024] = await Promise.all([
      fetch('data/races.json').then(r => r.json()),
      fetch('data/classes.json').then(r => r.json()),
      fetch('data/spells.json').then(r => r.json()),
      fetch('data/feats.json').then(r => r.json()),
      fetch('data/features.json').then(r => r.json()),
      fetch('data/races2024.json').then(r => r.json()),
      fetch('data/classes2024.json').then(r => r.json())
    ])
    data = { races, classes, spells, feats, features, races2024, classes2024 }
    state = Store.loadState(localStorage)
    view = current() ? 'combat' : 'create'
    render()
    if (navigator.serviceWorker) navigator.serviceWorker.register('./sw.js')
  } catch (e) {
    el.innerHTML = '<p class="warn">先連一次網</p>'
  }
}

boot()
