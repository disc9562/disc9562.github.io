const STORAGE_KEY = 'dnd5e-pwa-v1'
const ABILITIES = ['str', 'dex', 'con', 'int', 'wis', 'cha']

function emptyState() {
  return { characters: [], currentId: null }
}

function loadState(storage) {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    if (!parsed || !Array.isArray(parsed.characters)) return emptyState()
    return { characters: parsed.characters, currentId: parsed.currentId || null }
  } catch (e) {
    return emptyState()
  }
}

function saveState(storage, state) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return { ok: true }
  } catch (e) {
    return { ok: false }
  }
}

function validateCharacter(obj) {
  const missing = []
  if (!obj || typeof obj !== 'object') return { ok: false, error: '缺名字、職業、屬性' }
  if (!obj.name) missing.push('名字')
  if (!obj.race) missing.push('種族')
  if (!obj.class) missing.push('職業')
  if (typeof obj.level !== 'number') missing.push('等級')
  if (!obj.abilities) missing.push('屬性')
  else {
    for (const k of ABILITIES) {
      if (typeof obj.abilities[k] !== 'number') missing.push('屬性')
    }
  }
  if (missing.length) {
    const uniq = missing.filter((x, i) => missing.indexOf(x) === i)
    return { ok: false, error: '缺' + uniq.join('、') }
  }
  return { ok: true }
}

function importJson(storage, text, currentState) {
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch (e) {
    return { ok: false, error: '檔案打不開' }
  }
  const list = Array.isArray(parsed.characters)
    ? parsed.characters
    : [parsed]
  const next = {
    characters: (currentState.characters || []).slice(),
    currentId: currentState.currentId
  }
  for (const ch of list) {
    const v = validateCharacter(ch)
    if (!v.ok) return { ok: false, error: v.error }
    const i = next.characters.findIndex(c => c.id === ch.id)
    if (i >= 0) next.characters[i] = ch
    else next.characters.push(ch)
  }
  if (!next.currentId && next.characters[0]) next.currentId = next.characters[0].id
  const saved = saveState(storage, next)
  if (!saved.ok) return { ok: false, error: '存不了，先匯出備份', state: next }
  return { ok: true, state: next }
}

const Store = { STORAGE_KEY, loadState, saveState, validateCharacter, importJson }

if (typeof module !== 'undefined') module.exports = Store
if (typeof globalThis !== 'undefined') globalThis.Store = Store
