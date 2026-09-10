module.exports = {
  races: {
    human: {
      name: '人類',
      nameEn: 'Human',
      speed: 30,
      bonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
      extraHpPerLevel: 0
    },
    dwarf: {
      name: '矮人',
      nameEn: 'Dwarf',
      speed: 25,
      bonuses: { con: 2, wis: 1 },
      extraHpPerLevel: 1
    }
  },
  classes: {
    wizard: {
      name: '法師',
      nameEn: 'Wizard',
      hitDie: 6,
      saves: ['int', 'wis'],
      primary: 'int',
      subclassLevel: 2,
      caster: 'full',
      asiLevels: [4, 8, 12, 16, 19],
      subclasses: [{ id: 'evocation', name: '塑能學派' }],
      spellPicks: { 1: 6, later: 2 },
      defaultAttack: { name: '法杖', damageDie: 6 }
    }
  }
}
