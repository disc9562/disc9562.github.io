function abilityMod(score) {
  return Math.floor((score - 10) / 2)
}

function proficiencyBonus(level) {
  return 2 + Math.floor((level - 1) / 4)
}

function hitDieAverage(die) {
  return Math.floor(die / 2) + 1
}

function maxHp({ hitDie, conMod, level, extraPerLevel }) {
  const extra = extraPerLevel || 0
  let hp = hitDie + conMod + extra
  const later = hitDieAverage(hitDie) + conMod + extra
  for (let i = 2; i <= level; i++) hp += later
  return hp
}

const FULL = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
  9: [4, 3, 3, 3, 1],
  10: [4, 3, 3, 3, 2],
  11: [4, 3, 3, 3, 2, 1],
  12: [4, 3, 3, 3, 2, 1],
  13: [4, 3, 3, 3, 2, 1, 1],
  14: [4, 3, 3, 3, 2, 1, 1],
  15: [4, 3, 3, 3, 2, 1, 1, 1],
  16: [4, 3, 3, 3, 2, 1, 1, 1],
  17: [4, 3, 3, 3, 2, 1, 1, 1, 1],
  18: [4, 3, 3, 3, 3, 1, 1, 1, 1],
  19: [4, 3, 3, 3, 3, 2, 1, 1, 1],
  20: [4, 3, 3, 3, 3, 2, 2, 1, 1]
}

const HALF = {
  2: [2],
  3: [3],
  4: [3],
  5: [4, 2],
  6: [4, 2],
  7: [4, 3],
  8: [4, 3],
  9: [4, 3, 2],
  10: [4, 3, 2],
  11: [4, 3, 3],
  12: [4, 3, 3],
  13: [4, 3, 3, 1],
  14: [4, 3, 3, 1],
  15: [4, 3, 3, 2],
  16: [4, 3, 3, 2],
  17: [4, 3, 3, 3, 1],
  18: [4, 3, 3, 3, 1],
  19: [4, 3, 3, 3, 2],
  20: [4, 3, 3, 3, 2]
}

const THIRD = {
  3: [2],
  4: [3],
  5: [3],
  6: [3],
  7: [4, 2],
  8: [4, 2],
  9: [4, 2],
  10: [4, 3],
  11: [4, 3],
  12: [4, 3],
  13: [4, 3, 2],
  14: [4, 3, 2],
  15: [4, 3, 2],
  16: [4, 3, 3],
  17: [4, 3, 3],
  18: [4, 3, 3],
  19: [4, 3, 3, 1],
  20: [4, 3, 3, 1]
}

function warlockSlots(level) {
  if (level <= 2) return { circle: 1, max: 1 }
  if (level <= 4) return { circle: 2, max: 2 }
  if (level <= 6) return { circle: 3, max: 2 }
  if (level <= 8) return { circle: 4, max: 2 }
  if (level <= 10) return { circle: 5, max: 2 }
  if (level <= 16) return { circle: 5, max: 3 }
  return { circle: 5, max: 4 }
}

function toSlots(arr) {
  const out = {}
  if (!arr) return out
  arr.forEach((max, i) => {
    if (max > 0) out[i + 1] = { max, used: 0 }
  })
  return out
}

function slotsFor(caster, level) {
  if (caster === 'full') return toSlots(FULL[level])
  if (caster === 'half') return toSlots(HALF[level])
  if (caster === 'third') return toSlots(THIRD[level])
  if (caster === 'warlock') {
    const w = warlockSlots(level)
    return { [w.circle]: { max: w.max, used: 0 } }
  }
  return {}
}

const Rules = {
  abilityMod,
  proficiencyBonus,
  hitDieAverage,
  maxHp,
  slotsFor
}

if (typeof module !== 'undefined') module.exports = Rules
if (typeof globalThis !== 'undefined') globalThis.Rules = Rules
