---
name: fitlog-keyboard-bottomsheet
description: Documents FitLog PWA virtual keyboard and BottomSheet layout in index.html (visualViewport, CSS vars, kbOpen guard). Use when debugging keyboard overshoot, sheet jump, focus/re-render issues, or changing BottomSheet overlay behavior in this repo.
---

# FitLog 鍵盤與 BottomSheet

單檔 [`index.html`](index.html)。重點：**不要**在 sheet 開著時用 `setKbOpen(true)` 造成無用 App re-render；**不要**用 inline `animation` 做 slide（React re-render 會重寫 style、重播動畫）。

## 架構

| 區塊 | 說明 |
|------|------|
| `BottomSheet` | `overlayRef` + `sheetRef`；`useEffect` 綁 `visualViewport` `resize`/`scroll` |
| `--fl-kb` | 寫在 **overlay** DOM：`ov.style.setProperty("--fl-kb", kb+"px")`；`kb = (keyboardHeight > 80) ? kh : 0` |
| `kh` | `Math.max(0, window.innerHeight - vv.height - (vv.offsetTop \|\| 0))` |
| Sheet 樣式 | `marginBottom: "var(--fl-kb, 0px)"`；`S.sheet` 含 `maxHeight: min(92%, calc(100% - var(--fl-kb, 0px)))` |
| 圓角 | `kb>0` 時 `sheetRef` 設 `borderRadius: "0"`，否則清空 |
| 進場動畫 | **CSS class**：overlay `fade-in`、sheet `slide-up`（見 `<style>` 內 `.fade-in` / `.slide-up` + `@keyframes`） |
| 保留 | sheet 上 `transition: "border-radius .15s ease-out"` 只給 ref 改圓角用 |

## `kbOpen` 與 `sheetOpenRef`

- `kbOpen` 只控制底部按鈕列：`!kbOpen && !sheet && h("div", ...)`。
- Sheet 開啟時 `!sheet` 為 false，**畫面不隨 `kbOpen` 變**，但 `setKbOpen(true)` 仍會觸發 **整棵 App re-render**（含 BottomSheet），在鍵盤動畫期間容易 layout 抖動／過衝。
- **修正**：`sheetOpenRef` 與 `openSheet(next)` 同步 `sheetOpenRef.current = next`；在 `focusin` / `focusout` 延遲裡的 `setKbOpen(true)` 包成 `if (!sheetOpenRef.current) setKbOpen(true)`。
- 主畫面輸入框 focus 時仍正常 `setKbOpen(true)`（sheet 關閉）。

## 曾踩過的坑（別回頭）

1. **inline `transition` / `animation`（含 transform）**：App re-render 時 React 重寫 `element.style`，部分瀏覽器會重啟進行中的動畫 → 視覺過衝。解法：**動畫用固定 class**（`.slide-up` / `.fade-in`），不要寫在會每輪 reconcile 的 inline style 上。
2. **只把 animation 改成 keyframes 仍不夠**：若仍 re-render，inline `animation` 一樣可能被重設。
3. **真正讓「第一次跟第二次不一樣」的**：第一次 focus 時 `kbOpen: false → true` 會 re-render；之後 `true → true` 不 re-render。用 **sheet 開著時跳過 `setKbOpen(true)`** 對齊行為。

## 除錯時快速檢查

- [ ] Sheet 是否仍用 `className="fade-in"` / `"slide-up"`，且沒有在 inline style 寫 `animation` / `transform` transition？
- [ ] `focusin` 裡 `setKbOpen(true)` 是否仍有 `!sheetOpenRef.current`？
- [ ] `openSheet` 是否同步更新 `sheetOpenRef`？
- [ ] `visualViewport` 是否存在、listener 是否註冊、`--fl-kb` 是否在 overlay 上？

## 相關檔案

- [`index.html`](index.html)：`S.overlay` / `S.sheet`、`BottomSheet`、`App` 內 `kbOpen` / `sheetOpenRef` / `openSheet`
- [`manifest.json`](manifest.json)、[`sw.js`](sw.js)：與鍵盤邏輯無關，改版快取用
