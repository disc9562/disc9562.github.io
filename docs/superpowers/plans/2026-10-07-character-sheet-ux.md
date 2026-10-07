# Combat-first Character Sheet Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan inline, task-by-task. No delegation required.

**Goal:** Implement the approved B layout without changing character schemas or game rules.

**Architecture:** Keep the current render functions and delegated event handlers. Replace the combat header and navigation markup, edit existing CSS sections rather than introducing a UI framework, and use native progress/details controls. Reuse locked, Rules.shortRest, Rules.longRest and Store.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node assert/vm; installed agent-browser for isolated browser checks.

**Execution:** Completed inline on `ui/combat-first`; implementation remains uncommitted. The steps below retain the original checklist as the execution recipe.

**Verification:** Rules, store and UI Node checks passed. The UI test failed first on the absent HP meter, then passed after implementation. Isolated Chromium smoke checks passed for 320/375/768/1280px layout, 44px primary controls, keyboard focus, edit/play mode, HP/death saves, spell slots, concentration, rest confirmation, notes, glossary, reload persistence, JSON export/import, creation error preservation, ruleset switching and Enter submission. No browser page errors were reported. Screenshots and the smoke script are under ignored `.superpowers/`.

**Review adjustments:** Direct HP edits update the existing meter and death-save region instead of replacing the page, because a full render during blur swallowed the following +/- click. Removed the old icon-only width rule after reproducing mode-label overflow. No Rules or Store changes. Text palette contrast checks were 6.43:1 or greater for tested text/background pairs; this is not a full accessibility certification. Safari and physical-device testing remain manual.

---

### Task 1: Add a runnable UI regression check — complete
Files: create `test/ui.test.js`; read `js/app.js`, `js/rules.js`, `js/store.js`.
- [ ] Load app.js in Node vm with a minimal DOM boundary and local JSON fetches; await boot through the event loop. Use real Rules, Store and data files.
- [ ] Assert navigation selection, native life meter, accessible spell-slot state/count, and quick-rest controls outside the menu.
- [ ] Dispatch existing delegated handlers to check HP edits, lock, spell-slot toggle and rest cancellation/confirmation. Example assertions:
```js
assert.match(combatHtml(c), /<progress[^>]+value="28"[^>]+max="38"/)
assert.match(combatHtml(c), /剩餘 3 \/ 4/)
assert.match(ribbonsHtml(), /aria-current="page"/)
```
- [ ] Run `node test/ui.test.js`; confirm it fails for the missing combat-first UI.

### Task 2: Implement combat-first markup and feedback — complete
File: `js/app.js`.
- [ ] Replace animated SVG ribbon markup with three horizontal navigation buttons. Active button uses `aria-current="page"`.
- [ ] Add explicit mode label and lock button text, keep existing locked state, hide configuration controls through existing lockable class.
- [ ] Put HP first, with named number inputs, -/+ buttons, native progress, and AC/initiative/speed underneath. Keep proficiency and spell statistics.
- [ ] Move short/long rest beside concentration. Confirm before applying a rest because the button is now prominent; state the existing recovery behavior, then show completion feedback. Do not change Rules functions.
```js
if (!window.confirm('長休會恢復全部生命、法術環與資源。確定長休？')) return
banner = '長休完成：生命、法術環與資源已恢復。'
replace(Rules.longRest(c))
```
- [ ] Add slot counts, named slot controls and aria-pressed, concentration/condition state, expanded spell descriptions and accessible input names.
- [ ] Keep focus across full render by matching the previous focused element's id or dataset; never move focus to disabled/hidden controls. Refresh life meter and death saves on direct HP changes.
- [ ] Preserve entered creation fields across validation and ruleset rerenders; add required-name hint and native form submit semantics.
- [ ] Run `node test/ui.test.js` and syntax check `node --check js/app.js`.

### Task 3: Apply restrained parchment styling — complete
File: `css/app.css`.
- [ ] Replace obsolete HP/ribbon styling, retaining shared styles used by notes, glossary and leveling.
- [ ] Use quieter parchment, strong burgundy headings, clear horizontal navigation, large life meter, three-column key stats, wrapped quick actions and generous touch targets.
- [ ] Desktop sheet has primary combat column and secondary fold column; mobile is single column. Avoid fixed widths that overflow at 375px.
- [ ] Restore visible outlines for all focusable controls including summary/textarea, distinguish disabled read-only values, improve form grouping, preserve reduced motion and safe-area padding.
- [ ] Inspect browser at 375px and 1280px; save screenshots under the ignored `.superpowers/` directory. Check horizontal overflow and visible target sizes.

### Task 4: Verify and ship assets — complete
Files: `index.html`, `sw.js`, `README.md`.
- [ ] Increment asset/cache versions from 62 to 63 and add the UI test command to README.
- [ ] Run `node test/rules.test.js`, `node test/store.test.js`, `node test/ui.test.js`, `node --check js/app.js`, `git diff --check`.
- [ ] Browser smoke: create, edit/lock, HP to zero/death saves, slots, cancel/apply rest, keyboard focus, notes/glossary, save/reload, export/import. Use an isolated browser session with demo data only.
- [ ] Self-review diff for lost controls, accidental rules changes, and user-data edits. Record actual test results and remaining limitations. Leave implementation changes uncommitted for user inspection.

### Task 5: Ornate grimoire pass (user follow-up: tighter spacing, more D&D) — complete
Files: `css/app.css`, `index.html`, `sw.js` (assets v64). No markup, Rules or Store changes.
- Tighter vertical rhythm: headings, mode bar, overview, folds, nav.
- Concave-corner gold frame (official 5e sheet style, chosen over rounded corners after the square bracket frame read as too boxy): `--gilt` draws the double line via `border-image`, `--notch` masks the corners. Applied to boxes, folds, form cards, ability cards, menu, HP card and rest buttons (assets v65). The mask clips anything outside the border box, so focus rings on masked buttons/summaries use a negative offset and the menu lost its drop shadow. The frame SVG needs explicit `width`/`height`, or `border-image` stretches it to the element and the lines turn thick.
- Rune bands under the masthead and after section headings spell each heading's English 5e term in Elder Futhark (assets v66). `js/app.js` transliterates letter by letter (TH→ᚦ, NG→ᛜ, C/K/Q→ᚲ, X→ᚲᛊ, V/W→ᚹ, Y→ᛃ; ᛫ between words, ᛬ between repeats), draws each rune as SVG strokes and sets `--title-runes` on each `h3`/`.mast` after render. `test/ui.test.js` checks the digraph rules and that every heading and rune has a mapping. Ribbon bookmark marks the current tab (shape, not only colour).
- AC shield, hexagon ability badges with score ovals, dragon wax seals for spell slots (spent = dashed impression). Rest/concentration buttons styled as plaques.
- Removed unused image variables (`--parchment`, `--sigil`, `--ic-*`).
- Verification: rules/store/ui Node tests pass; browser smoke (26 checks, 320–1280px, 44px targets, no overflow) passes after a fresh v64 load; screenshots checked for combat (play/edit), menu and creation.

