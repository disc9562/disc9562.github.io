# Beginner 5e Character PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline; user said 直接開始). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 手機 PWA：戰鬥頁改 HP／法術位，一頁清單升級，PHB 2014 建角，資料只存在本機。

**Architecture:** 無打包器。`js/rules.js` 純函式（node 可測）；`js/store.js` 吃 storage 介面；`js/app.js` 畫畫面。種族／職業／法術／專長是靜態 JSON。法術位表由 `caster` 類型計算，不複製 12 份 20 級表。

**Tech Stack:** HTML／CSS／JS、JSON、PWA（manifest + sw）、`node` + `assert`（無測試框架）。

**Files:**
- Create: `js/rules.js` — HP、熟練、法術位、建角、升級清單、休息
- Create: `js/store.js` — localStorage、匯出／匯入驗證
- Create: `js/app.js` — 戰鬥／建角／升級／抽屜
- Create: `css/app.css`
- Create: `index.html`
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Create: `data/races.json` `data/classes.json` `data/spells.json` `data/feats.json`
- Create: `test/rules.test.js` `test/store.test.js`
- Create: `test/data/minimal.js` — 測試用最小規則資料

---

### Task 1: 規則核心（mod／HP／熟練／法術位）

**Files:**
- Create: `js/rules.js`
- Create: `test/rules.test.js`

- [ ] **Step 1: Write the failing test**

```js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node test/rules.test.js`  
Expected: FAIL `Cannot find module '../js/rules'`

- [ ] **Step 3: Write minimal implementation**

`js/rules.js` 用 CJS：`abilityMod`、`proficiencyBonus`（`2 + Math.floor((level-1)/4)`）、`hitDieAverage`（`Math.floor(die/2)+1`）、`maxHp`（1 級 `hitDie+conMod+extra`，之後每級 `avg+conMod+extra`）、`slotsFor(caster, level)`。

Full caster 表（1–20 的 1–9 環，0 不輸出）：

```
1: 2
2: 3
3: 4,2
4: 4,3
5: 4,3,2
6: 4,3,3
7: 4,3,3,1
8: 4,3,3,2
9: 4,3,3,3,1
10: 4,3,3,3,2
11: 4,3,3,3,2,1
12: 同 11
13: 4,3,3,3,2,1,1
14: 同 13
15: 4,3,3,3,2,1,1,1
16: 同 15
17: 4,3,3,3,2,1,1,1,1
18: 4,3,3,3,3,1,1,1,1
19: 4,3,3,3,3,2,1,1,1
20: 4,3,3,3,3,2,2,1,1
```

Half（從 2 級）：2:2 / 3:3 / 5:4,2 / 7:4,3 / 9:4,3,2 / 11:4,3,3 / 13:4,3,3,1 / 15:4,3,3,2 / 17:4,3,3,3,1 / 19:4,3,3,3,2  
Third（EK/AT，從 3 級）：3:2 / 4:3 / 7:4,2 / 10:4,3 / 13:4,3,2 / 16:4,3,3 / 19:4,3,3,1  
Warlock（環數＝槽的環）：1–2: 1×1環 / 3–4: 2×2環 / 5–6: 2×3環 / 7–8: 2×4環 / 9–10: 2×5環 / 11–16: 3×5環 / 17–20: 4×5環

`slotsFor` 回傳 `{ [circle]: { max, used: 0 } }`，max 為 0 的環省略。

檔尾：`if (typeof module !== 'undefined') module.exports = { ... }`

- [ ] **Step 4: Run test to verify it passes**

Run: `node test/rules.test.js`  
Expected: `task1 ok`

- [ ] **Step 5: Commit**

```bash
git add js/rules.js test/rules.test.js
git commit -m "feat: 5e HP, proficiency, and spell slot tables"
```

---

### Task 2: 建角、種族加值、預設 AC／攻擊

**Files:**
- Modify: `js/rules.js`
- Modify: `test/rules.test.js`
- Create: `test/data/minimal.js`

- [ ] **Step 1: Write the failing test**

`test/data/minimal.js`：

```js
module.exports = {
  races: {
    human: { name: '人類', nameEn: 'Human', speed: 30, bonuses: { str:1,dex:1,con:1,int:1,wis:1,cha:1 }, extraHpPerLevel: 0 },
    dwarf: { name: '矮人', nameEn: 'Dwarf', speed: 25, bonuses: { con:2, wis:1 }, extraHpPerLevel: 1 }
  },
  classes: {
    wizard: {
      name: '法師', nameEn: 'Wizard', hitDie: 6, saves: ['int','wis'],
      primary: 'int', subclassLevel: 2, caster: 'full',
      asiLevels: [4,8,12,16,19],
      subclasses: [{ id: 'evocation', name: '塑能學派' }],
      spellPicks: { 1: 6, later: 2 },
      defaultAttack: { name: '法杖', damageDie: 6 }
    }
  }
}
```

測試（接在 task1 後面）：

```js
const data = require('./data/minimal')
const c = R.createCharacter({
  name: '艾琳', race: 'human', class: 'wizard', level: 1,
  abilities: { str:8, dex:14, con:13, int:15, wis:10, cha:12 }
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
assert.ok(c.attacks[0].name === '法杖')
assert.equal(c.attacks[0].bonus, 1)
assert.equal(c.attacks[0].damage, '1d6-1')
assert.ok(Array.isArray(c.pendingChoices) && c.pendingChoices.length > 0)
assert.ok(c.saves.int === true && c.saves.wis === true && c.saves.str === false)
assert.deepEqual(c.skillProf, [])
```

`createCharacter` 簽名：`(input, data) → character`。屬性為加種族前。人類 +1 全；矮人 CON+2 WIS+1 且 extraHpPerLevel 1。AC＝10+DEX。攻擊加值＝prof+STR（法杖）。`id` 用 `Date.now()`+random 字串即可。

- [ ] **Step 2: Run test to verify it fails**

Run: `node test/rules.test.js`  
Expected: FAIL `createCharacter is not a function`

- [ ] **Step 3: Write minimal implementation**

`createCharacter` 複製 abilities、加 `data.races[race].bonuses`、算 conMod、`maxHp`、`slotsFor(class.caster, level)`、pendingChoices（見 Task 3 的 `pendingFor`，可先做 stub：1 級法師要選 spellPicks.1 個法術；2 級要子職）。本 task 至少讓 1 級人類法師測試過。`pendingFor` 若還沒獨立匯出，可內聯。

Character 欄位對齊規格，外加：`proficiency`、`speed`、`initiative`、`saves`（六項 bool）、`skillProf`、`resources`（`[]`）、`conditions`（`[]`）、`deathSaves`（`{success:0,fail:0}`）。

- [ ] **Step 4: Run test to verify it passes**

Run: `node test/rules.test.js`  
Expected: `task1 ok` 且新建角 assert 過（可把最後一行改 `console.log('task2 ok')`）

- [ ] **Step 5: Commit**

```bash
git add js/rules.js test/rules.test.js test/data/minimal.js
git commit -m "feat: create character with racial bonuses"
```

---

### Task 3: 升級清單、套用、HP／法術位夾擊、休息

**Files:**
- Modify: `js/rules.js`
- Modify: `test/rules.test.js`

- [ ] **Step 1: Write the failing test**

```js
const c3 = R.createCharacter({
  name: '艾琳', race: 'human', class: 'wizard', level: 3,
  abilities: { str:8, dex:14, con:13, int:15, wis:10, cha:12 }
}, data)
assert.equal(c3.level, 3)
assert.equal(c3.hp.max, 18)
assert.equal(c3.spellSlots['1'].max, 4)
assert.equal(c3.spellSlots['2'].max, 2)
assert.ok(c3.pendingChoices.some(x => x.type === 'subclass'))
assert.ok(c3.pendingChoices.some(x => x.type === 'spells'))

const list = R.checklistFor(c3, data)
assert.ok(list.some(x => x.type === 'hp'))
assert.ok(list.some(x => x.type === 'asi'))
assert.ok(!list.find(x => x.type === 'missing'))

const blocked = R.applyLevelUp(c3, [], data)
assert.equal(blocked.ok, false)

const ids = list.map(x => x.id)
const applied = R.applyLevelUp(c3, ids, data)
assert.equal(applied.ok, true)
assert.equal(applied.character.level, 4)
assert.equal(applied.character.hp.max, 23)
assert.equal(applied.character.spellSlots['2'].max, 3)

let hp = R.changeHp(c3, -100)
assert.equal(hp.hp.current, 0)
hp = R.changeHp(c3, 100)
assert.equal(hp.hp.current, hp.hp.max)

let slots = { ...c3, spellSlots: { 1: { max: 4, used: 4 } } }
const no = R.useSpellSlot(slots, 1)
assert.equal(no.ok, false)
slots = R.useSpellSlot({ ...c3, spellSlots: { 1: { max: 4, used: 0 } } }, 1)
assert.equal(slots.ok, true)
assert.equal(slots.character.spellSlots['1'].used, 1)

const rested = R.longRest({ ...c3, hp: { current: 1, max: c3.hp.max }, spellSlots: { 1: { max: 4, used: 3 } } })
assert.equal(rested.hp.current, rested.hp.max)
assert.equal(rested.spellSlots['1'].used, 0)

const warlockClass = {
  ...data,
  classes: {
    ...data.classes,
    warlock: { name:'術師', hitDie:8, saves:['wis','cha'], primary:'cha', subclassLevel:1, caster:'warlock', asiLevels:[4,8,12,16,19], subclasses:[{id:'fiend',name:'邪魔'}], spellPicks:{1:2, later:1}, defaultAttack:{name:'匕首', damageDie:4}, resources:[{id:'pact-slots', rest:'shortRest'}] }
  }
}
const wl = R.createCharacter({ name:'W', race:'human', class:'warlock', level:1, abilities:{str:8,dex:14,con:13,int:10,wis:12,cha:15} }, warlockClass)
const spent = R.useSpellSlot(wl, 1).character
const sr = R.shortRest(spent)
assert.equal(sr.spellSlots['1'].used, 0)
```

HP 數字（人類 CON 13→14，mod+2；法師 d6 平均 4）：  
1 級 6+2=8；3 級 8+2×(4+2)=20？等一下——abilities 加種族後 con=14，mod+2。  
`maxHp` 用 **加種族後** conMod。  
1：6+2=8  
2–3：每級 4+2=6 → 8+12=20  

上面測試寫 18 是錯的。**以實作為準：con 14 → 3 級 maxHp=20，4 級 =20+6=26。** 測試用 20／26，不要用規格舉例的 14/20。

修正後的數字：
- 3 級 `hp.max === 20`
- 4 級套用後 `hp.max === 26`

- [ ] **Step 2: Run test to verify it fails**

Run: `node test/rules.test.js`  
Expected: FAIL `checklistFor is not a function`（或 hp.max 不符——先修測試數字再確認是缺函式）

- [ ] **Step 3: Write minimal implementation**

`pendingFor(level, classDef, character)`：
- 每個 `L=class.subclassLevel` 且 `L<=level` 且沒 subclass → `{ id:'subclass-'+L, type:'subclass', level:L }`
- 每個 `asiLevels` 且 `<=level` 且該級還沒記入 `character.asiTaken` → `{ id:'asi-'+L, type:'asi', level:L }`
- 法術：1 級 `spellPicks.1`，之後每級 `later`，累加到 `level`，減去 `character.spells.length` → 若還缺 `{ id:'spells', type:'spells', count: missing }`
- 建角時 `asiTaken=[]`、`spells=[]`、`subclass=null`

`checklistFor(character, data)`：升級到 `level+1`。
- 若 `!data.classes[character.class]` 或該 caster 表沒這級 → `[{ id:'missing', type:'missing', label:'這筆資料還沒做' }]`
- 否則：`{ id:'hp', type:'hp', label:'HP +N（平均）' }` + 那一級新出現的 pending（子職／ASI／法術）

`applyLevelUp(character, checkedIds, data)`：
- checklist 每一項 id 都在 checkedIds，否則 `{ ok:false, missing:[...] }`
- 若有 missing 型 → `{ ok:false }`
- 否則 level+1、重算 maxHp（current 加 delta）、slotsFor 新表（used 保留但 cap 在新 max）、把該級 choice 從 pending 規則上視為已處理（ASI：`asiTaken.push(level+1)`；子職／法術實際選擇在 UI 寫入 character 後再套用）

第一版 ASI／子職／法術：**清單只要求勾確認**；真正的子職 id、法術 id、ASI 分配由 UI 在勾選時寫進 `choices` 物件：

```js
applyLevelUp(character, { checkedIds, subclass, spellsToAdd, asi, feat }, data)
```

測試可只傳 `checkedIds` 陣列（相容：陣列＝全勾、不改選擇）。有選 subclass 就寫入。沒選法術就仍 pending（升級後 `pendingFor` 還會列出缺的法術——戰鬥頁提示）。

為讓「沒勾完不能套用」單純：`applyLevelUp(char, checkedIds, data)` checkedIds 必須涵蓋 checklist 全部 id。

`changeHp(char, delta)` 回新物件，current 夾在 0..max。  
`useSpellSlot(char, circle)` → `{ ok, character? }` used+1 不超過 max。  
`longRest`：hp=max，所有 slots used=0，deathSaves 歸零。  
`shortRest`：若 `class.caster==='warlock'` 則 slots used=0；另把 `resources` 裡 `rest==='shortRest'` 的 used=0。

- [ ] **Step 4: Run test to verify it passes**

Run: `node test/rules.test.js`  
Expected: 全過

- [ ] **Step 5: Commit**

```bash
git add js/rules.js test/rules.test.js
git commit -m "feat: level-up checklist, HP clamp, rest"
```

---

### Task 4: store 匯出／匯入

**Files:**
- Create: `js/store.js`
- Create: `test/store.test.js`

- [ ] **Step 1: Write the failing test**

```js
const assert = require('assert')
const S = require('../js/store')

function mem() {
  const m = {}
  return {
    getItem: k => (k in m ? m[k] : null),
    setItem: (k, v) => { m[k] = String(v) },
    removeItem: k => { delete m[k] },
    _fail: false,
    throwOnSet() { this.setItem = () => { throw new Error('quota') } }
  }
}

const empty = S.loadState(mem())
assert.deepEqual(empty, { characters: [], currentId: null })

const st = mem()
const char = { id:'a', name:'艾琳', race:'human', class:'wizard', level:1, abilities:{str:8,dex:14,con:13,int:16,wis:10,cha:12} }
const saved = S.saveState(st, { characters:[char], currentId:'a' })
assert.equal(saved.ok, true)
const loaded = S.loadState(st)
assert.equal(loaded.characters[0].name, '艾琳')

const failSt = mem(); failSt.throwOnSet()
const fail = S.saveState(failSt, { characters:[char], currentId:'a' })
assert.equal(fail.ok, false)

assert.equal(S.validateCharacter({}).ok, false)
assert.ok(S.validateCharacter({}).error.length > 0)
assert.equal(S.validateCharacter(char).ok, true)

const bad = S.importJson(st, 'not-json', loaded)
assert.equal(bad.ok, false)
const missing = S.importJson(st, JSON.stringify({ name:'x' }), loaded)
assert.equal(missing.ok, false)
const one = S.importJson(st, JSON.stringify(char), { characters:[], currentId:null })
assert.equal(one.ok, true)
assert.equal(one.state.characters.length, 1)
const many = S.importJson(st, JSON.stringify({ characters:[char], currentId:'a' }), { characters:[], currentId:null })
assert.equal(many.ok, true)
console.log('store ok')
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node test/store.test.js`  
Expected: FAIL missing module

- [ ] **Step 3: Write minimal implementation**

`STORAGE_KEY = 'dnd5e-pwa-v1'`  
`loadState(storage)`：沒資料或 JSON 壞掉 → `{ characters:[], currentId:null }`  
`saveState(storage, state)`：try setItem，成功 `{ok:true}` 失敗 `{ok:false}`  
`validateCharacter(obj)`：要有非空 `name`、`race`、`class`、數字 `level`、`abilities` 六項數字。否則 `{ok:false, error:'缺…'}`  
`importJson(storage, text, currentState)`：parse 失敗回 error；單一角色或 `{characters}`；驗證後 **加入**（同 id 則取代）；回 `{ok, state, error?}`。匯出是 `JSON.stringify` 由 UI 做。

- [ ] **Step 4: Run test to verify it passes**

Run: `node test/store.test.js`  
Expected: `store ok`

- [ ] **Step 5: Commit**

```bash
git add js/store.js test/store.test.js
git commit -m "feat: localStorage store and JSON import validation"
```

---

### Task 5: PHB 資料檔

**Files:**
- Create: `data/races.json`
- Create: `data/classes.json`
- Create: `data/spells.json`
- Create: `data/feats.json`

- [ ] **Step 1: Write races.json**

9 種族，鍵：`human dwarf elf halfling dragonborn gnome half-elf half-orc tiefling`。  
人類全+1 speed 30；矮人 hill：con+2 wis+1 speed 25 extraHpPerLevel 1；精靈 high：dex+2 int+1 30；半身人 lightfoot：dex+2 cha+1 25；龍裔：str+2 cha+1 30；侏儒 rock：int+2 con+1 25；半精靈：cha+2 30（不做兩個+1）；半獸人：str+2 con+1 30；提夫林：int+1 cha+2 30。每筆有 `name` `nameEn` `speed` `bonuses` `extraHpPerLevel` `traits`（短中文陣列）。

- [ ] **Step 2: Write classes.json**

12 職業，每筆：`name nameEn hitDie saves primary subclassLevel caster asiLevels subclasses[] spellPicks? defaultAttack resources?`。

| id | hitDie | saves | caster | subclassLevel | spellPicks |
| barbarian | 12 | str con | none | 3 | |
| bard | 8 | dex cha | full | 3 | 1:4 later:1 |
| cleric | 8 | wis cha | full | 1 | 1:0 later:0（準備型：升級不強制選法術，法術按鈕手動加） |
| druid | 8 | int wis | full | 2 | 同 cleric |
| fighter | 10 | str con | none | 3 | |
| monk | 8 | str dex | none | 3 | |
| paladin | 10 | wis cha | half | 3 | 同 cleric |
| ranger | 10 | str dex | half | 3 | 1:0 later:1（已知） |
| rogue | 8 | dex int | none | 3 | |
| sorcerer | 6 | con cha | full | 1 | 1:2 later:1 |
| warlock | 8 | wis cha | warlock | 1 | 1:2 later:1 |
| wizard | 6 | int wis | full | 2 | 1:6 later:2 |

子職每職業至少 2 個 PHB（中文名即可）。`resources`：barbarian rage、monk ki、warlock 不另建模（法術位 shortRest）、fighter second-wind shortRest、bard bardic-inspiration longRest。沒有的給 `[]`。

fighter/rogue 的 EK/AT：subclass id 為 `eldritch-knight` / `arcane-trickster` 時，`slotsFor` 改用 `third`（在 `createCharacter`／`applyLevelUp`：若 subclass 是這兩個，caster 覆寫為 third）。測試可在 task5 後加一條可選；沒加也不擋。

- [ ] **Step 3: Write spells.json 與 feats.json**

`spells.json`：物件，鍵為 id。欄位 `name nameEn level school classes[] text`（短中文）。先放 SRD 常用約 50–70 則（0–5 環），足夠戰鬥按鈕。不是 PHB 全書。

`feats.json`：PHB 專長短中文（Alert、Lucky、War Caster、Tough…），欄位 `name nameEn text`。

- [ ] **Step 4: Smoke 用真實資料建法師**

在 `test/rules.test.js` 加（node 讀 JSON）：

```js
const fs = require('fs')
const real = {
  races: JSON.parse(fs.readFileSync('data/races.json','utf8')),
  classes: JSON.parse(fs.readFileSync('data/classes.json','utf8')),
  spells: JSON.parse(fs.readFileSync('data/spells.json','utf8')),
  feats: JSON.parse(fs.readFileSync('data/feats.json','utf8'))
}
const w = R.createCharacter({ name:'艾琳', race:'human', class:'wizard', level:1, abilities:{str:8,dex:14,con:13,int:15,wis:10,cha:12} }, real)
assert.equal(w.hp.max, 8)
assert.equal(real.classes.wizard.name, '法師')
assert.ok(Object.keys(real.races).length === 9)
assert.ok(Object.keys(real.classes).length === 12)
```

Run: `node test/rules.test.js`  
Expected: 過

- [ ] **Step 5: Commit**

```bash
git add data test/rules.test.js js/rules.js
git commit -m "feat: PHB race/class data and SRD spell list"
```

---

### Task 6: 戰鬥／建角／升級 UI

**Files:**
- Create: `index.html`
- Create: `css/app.css`
- Create: `js/app.js`

- [ ] **Step 1: index.html**

```html
<!doctype html>
<html lang="zh-Hant">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#1a1a1a">
<title>角色卡</title>
<link rel="manifest" href="manifest.webmanifest">
<link rel="stylesheet" href="css/app.css">
<body>
  <div id="app"></div>
  <script src="js/rules.js"></script>
  <script src="js/store.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

`rules.js`／`store.js` 瀏覽器要掛 `global`：CJS 的 `module.exports` 之外設 `globalThis.Rules` / `globalThis.Store`。

- [ ] **Step 2: app.js 畫面**

啟動：`fetch` 四個 JSON → `loadState(localStorage)`。無角色 → 建角畫面。有 → 戰鬥頁。

**建角：**名字、種族 select、職業 select、等級 1–20、六項 number。送出 `createCharacter` → save。失敗不跳頁。

**戰鬥：**頂列名字＋種族＋職業等級；右上「升級」；⋯選單（切換角色、新增、短休、長休、匯出、匯入 file input）。有 `pendingChoices.length` 顯示「還有未選項目」（點了開升級／補選清單）。大顆 HP（−／＋）、AC。攻擊與 `spells` 對應大按鈕（法術顯示 `name`＋`text` 前兩行，不代骰）。法術位列，點一下 `useSpellSlot`。狀態列：`conditions` 空則不渲染。摺疊：技能（勾選寫入 `skillProf`）、豁免、先攻／速度。死亡豁免在 HP=0 時出現。每次變更 `saveState`；`ok===false` 則 banner「存不了，先匯出備份」，數字留在畫面上。

**升級：**`checklistFor` 渲染 checkbox。全勾才能按套用。有 subclass／spells／asi 項時同頁給 select（子職、法術多選、ASI 兩項 +1 或專長 select）。`applyLevelUp` 後回戰鬥。`type==='missing'` 不能套用。

匯出：下載 `character-name.json`（目前角色或 `{characters, currentId}`）。匯入：讀檔 `importJson`。

- [ ] **Step 3: css/app.css**

深底、大按鈕（min-height 44px）、單欄、max-width 480px 置中。不要框架。

- [ ] **Step 4: 用 python 或 npx 起靜態伺服器手動點一次建角**（開發者自己開）。無自動化 UI 測。

- [ ] **Step 5: Commit**

```bash
git add index.html css/app.css js/app.js js/rules.js js/store.js
git commit -m "feat: combat, create, and level-up screens"
```

---

### Task 7: PWA

**Files:**
- Create: `manifest.webmanifest`
- Create: `sw.js`
- Modify: `js/app.js`（register SW；快取未建且 fetch 失敗時顯示「先連一次網」）

- [ ] **Step 1: manifest.webmanifest**

```json
{
  "name": "角色卡",
  "short_name": "角色卡",
  "start_url": "./",
  "display": "standalone",
  "background_color": "#1a1a1a",
  "theme_color": "#1a1a1a"
}
```

- [ ] **Step 2: sw.js** 快取 `./`、`index.html`、css/js、data/*.json。`install` 時 `addAll`；`fetch` 先 cache 再 network。

- [ ] **Step 3: app.js** `navigator.serviceWorker.register('./sw.js')`。資料 fetch 失敗且無角色可顯示時，畫面文字「先連一次網」。

- [ ] **Step 4: Commit**

```bash
git add manifest.webmanifest sw.js js/app.js
git commit -m "feat: PWA manifest and offline cache"
```

---

## 對規格的覆蓋

| 規格 | Task |
| 戰鬥頁 HP/AC/攻擊/法術位 | 6 |
| 升級一頁清單 | 3, 6 |
| 建角短表單 | 2, 6 |
| 2014 PHB 9 種族 12 職業 | 5 |
| 繁中 UI | 6 |
| PWA GH Pages | 7 |
| localStorage + JSON | 4 |
| 匯入錯誤／存檔失敗／未勾完／缺資料 | 3, 4, 6 |
| 長休／短休 | 3, 6 |
| `node test/rules.test.js` 規格五條 | 1–5 |
| 不做骰子／帳號／DM／兼職 | 不實作 |

法術第一版用 SRD 常用表，不是 PHB 全書（資料之後只加 JSON）。
