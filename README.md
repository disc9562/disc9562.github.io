# 新手 5e 角色卡

靜態 PWA。資料只存在這台裝置，可匯出 JSON。

## 本機開啟

```bash
python3 -m http.server
```

瀏覽器開 `http://localhost:8000`。手機要跟電腦同一網路，用電腦的區網 IP。

Safari／Chrome：分享 → 加入主畫面。

## GitHub Pages

把這個 repo 推上 GitHub，Settings → Pages → Deploy from branch → `main`（或 `master`）／根目錄。

## 測試

```bash
node test/rules.test.js
node test/store.test.js
```
