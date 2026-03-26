# FitLog - 飲食運動追蹤 PWA

記錄每天的飲食與運動，搭配 Google Gemini AI 自動估算營養素（蛋白質、脂肪、碳水），追蹤每日熱量攝取與消耗。

## 功能

- AI 分析食物營養素（文字描述或拍照）
- AI 解析 Apple Watch 運動截圖
- 手動輸入飲食 / 運動紀錄
- 常用食物快速新增（支援拖曳排序）
- 每日目標追蹤（環形進度 + 三大營養素進度條；NET 超過目標熱量時，第一圈動畫跑完後才開始第二圈紅色段；營養素超過目標時原色條至多滿條，右側紅色寬度為「相對**目標克數**的超標百分比」，與括號內達成率同一基準）
- 歷史紀錄瀏覽
- CSV / JSON 匯出與匯入備份
- Google Drive 雲端備份／還原（OAuth，備份檔在應用程式專屬隱藏資料夾）
- 上次雲端備份時間顯示；超過 7 天未備份時首頁提醒（可略過本輪）
- 自訂 AI 估算規則
- PWA 支援（加入主畫面後如原生 App）

## 檔案結構

```
fitlog/
  index.html      # 主程式（單一 HTML，含所有邏輯與樣式）
  manifest.json   # PWA 清單
  icon-192.png    # PWA / 主畫面圖示（192）
  icon-512.png    # PWA 圖示（512）
  sw.js           # Service Worker（離線快取）
  README.md       # 本文件
```

## 部署

### GitHub Pages（推薦）

1. 將專案推上 GitHub repository
2. 進入 repo 的 **Settings** > **Pages**
3. Source 選 **Deploy from a branch**，選 `main` / `root`
4. 等 1-2 分鐘後即可透過 `https://<你的帳號>.github.io/fitlog/` 存取

### 其他靜態託管

Cloudflare Pages、Netlify、Vercel 等都可以直接拖曳上傳這三個檔案。

## 首次使用流程

### 1. 申請 Gemini API Key（免費）

1. 前往 [Google AI Studio](https://aistudio.google.com/apikey)
2. 登入 Google 帳號
3. 點擊 **Create API Key**
4. 複製產生的 Key

> 預設使用 **Gemini 3 Flash**；免費額度依 [Google 官方](https://ai.google.dev/pricing) 與 AI Studio 的 Rate limit 為準。可申請多把 Key 填入設定，輪流撐過單 Key 限流。

### 2. 設定 API Keys（最多 3 組）

1. 開啟 FitLog 網頁
2. 首頁會顯示琥珀色橫幅「尚未設定 Gemini API Key」，點擊 **設定**
3. 在設定頁的「**Gemini API Keys**」區塊，可填 **Key 1～Key 3**（至少填一組即可使用 AI）
4. 點擊 **儲存 API Keys**

**模型與額度：** 每次請求會優先使用 **Gemini 3 Flash**（`gemini-3-flash-preview`）。若 Key 1 的 3 Flash 額度暫時用盡，會自動改用 Key 2、再 Key 3 呼叫 3 Flash；三把 Key 的 3 Flash 都無法使用時，才會依同順序改打 **Gemini 2.5 Flash**。當實際使用的不是 3 Flash 時，食物／運動 AI 表單底部會顯示小字提醒（降級說明）。

> 沒有任何有效 Key 也能使用 App，只是 AI 分析不可用，仍可手動輸入所有紀錄。

### 3. 安裝到主畫面（重要）

安裝為 PWA 後可消除瀏覽器外框，且本機資料（IndexedDB／localStorage）較不易被系統自動清除。

**iPhone Safari：**

1. 用 Safari 開啟 FitLog 網址
2. 點擊底部的 **分享按鈕**（方框加向上箭頭）
3. 向下滑找到 **加入主畫面**
4. 點擊 **新增**

**iPhone Chrome：**

1. 點右上角 **⋯** > **分享** > **加入主畫面**
2. （建議改用 Safari 操作，相容性較佳）

**Android Chrome：**

1. 點右上角 **⋮** > **安裝應用程式**（或「加到主畫面」）

### 4. 設定每日目標

1. 點擊頂部列**最左側** **⚙** 進入設定（與日期、**今天**按鈕同一列）
2. 在「每日目標」區塊輸入蛋白質、脂肪、碳水的目標克數
3. 熱量會自動計算（蛋白質×4 + 脂肪×9 + 碳水×4）
4. 點擊 **儲存目標**

### 5. 設定估算規則（選填）

在設定頁的「預設估算規則」輸入常用規則（輸入框預設較高，方便多行規則），AI 分析時會自動套用。

範例：

```
飲料預設手搖杯大杯 700ml
飯量預設一般碗 200g
```

## 日常使用

### 記錄飲食

**方法一：AI 分析**

1. 點底部 **+飲食**
2. 輸入食物描述（例：「麥當勞大麥克套餐」）或選取食物照片
3. 點 **🤖 AI 分析**
4. 確認結果後點 **✓ 確認新增**

**方法二：手動輸入**

1. 點底部 **+飲食**
2. 輸入描述
3. 點 **✏️ 手動**
4. 輸入蛋白質、脂肪、碳水克數
5. 點 **✓ 確認新增**

**方法三：從常用快速新增**

1. 點底部 **⚡常用**
2. 直接點擊食物項目即可新增到當天

### 記錄運動

1. 點底部 **+運動**
2. 輸入運動描述或上傳 Apple Watch 截圖
3. 點 **🤖 AI 解析** 或 **✏️ 手動** 輸入
4. 點 **✓ 確認新增**

### 管理常用食物

1. 切換到 **常用** 頁籤
2. 點 **+ 新增** 輸入食物名稱與營養素（可用 AI 估算）
3. 每筆常用食物可以：
  - **+今天**：直接加到當天紀錄
  - **✎**：編輯
  - **×**：刪除

### 查看歷史

1. 切換到 **歷史** 頁籤
2. 點擊任意日期可跳轉查看該日詳細紀錄

### 切換日期

頂部列由左至右為：**⚙ 設定**｜**‹ 日期 ›**（含「TODAY」徽章）｜**今天**。點 **‹** / **›** 可切換前後日；在**非今天**的日期時，點 **今天** 會直接回到當日（已在今天時該按鈕為停用狀態）。

### 刪除紀錄

在紀錄頁籤中，點擊項目右邊的 **×**，再點 **刪除** 確認。

## 資料備份

### 匯出

1. 進入 **設定** > **資料管理**
2. 點 **📤 匯出 CSV**
3. 檔案會下載到手機的「檔案」App

### 匯入（CSV / JSON）

**重要：** CSV 與 JSON 匯入都會**以檔案內容取代**目前儲存的紀錄。檔案裡**沒出現的日期**在匯入後會從裝置上消失。操作前會跳出瀏覽器確認框；**建議先匯出 JSON 備份**再匯入。

#### 匯入 CSV

1. 進入 **設定** > **資料管理**
2. 點 **📥 匯入 CSV**
3. 選擇之前匯出的 `.csv` 檔
4. 確認提示後，**所有日期紀錄**會以該 CSV 為準（未出現在 CSV 的日期會被清除）

#### 匯入 JSON（完整備份）

1. 同上進入 **資料管理**
2. 點 **📥 匯入 JSON**
3. 選擇先前 **📤 匯出 JSON** 的備份檔（須含 `allDays`）
4. 確認提示後，會依備份檔寫入：**日期紀錄**；若檔案內有欄位，也會一併覆寫 **每日目標**、**預設估算規則**、**常用清單**

> 建議每週匯出一次 **JSON**（或 CSV）備份到 iCloud / Google Drive。換手機時以 JSON 還原最完整。

### Google Drive 雲端備份（選用）

1. **部署者**須在 Google Cloud 建立 OAuth「網頁應用程式」用戶端、啟用 **Google Drive API**，並在「已授權的 JavaScript 來源」加入實際網址（例如 `https://你的帳號.github.io`，無結尾斜線）。詳細步驟見 App 內 **設定 → Google Drive 雲端備份 → 展開 OAuth 設定步驟**。
2. 將取得的 **用戶端 ID** 寫入專案根目錄 [`index.html`](index.html) 內常數 **`FL_GDRIVE_CLIENT_ID`**（可公開，非密鑰），重新部署後使用者即可在設定內「登入 Google」「立即備份」「從雲端還原」。
3. 每位使用者登入自己的 Google 帳號後，備份寫入其帳號下的 **應用程式資料夾**（Drive 一般列表看不到）；**Fork 自架**時必須改用你自己的 Client ID 並在 GCP 加入你的網域，否則 OAuth 會失敗。
4. **Google 登入／Token**：OAuth access token **不寫入**本機（僅存在記憶體）；殺掉 PWA 或關閉分頁後會清空。**不會**在 App 啟動或僅開啟設定時自動向 Google 取 token（避免一進 App 就跳出授權畫面）。需要雲端備份／還原時，請按「登入 Google」或「立即備份／從雲端還原」再授權；同一瀏覽工作階段內若 token 仍有效，再按備份／還原時多半可先靜默續用，不必重複完整登入。
5. Drive API／OAuth 建立專案**一般無需付費**；備份檔體積小，通常落在免費配額內（仍以 [Google 官方說明](https://developers.google.com/drive/api/guides/limits) 為準）。

## 資料儲存

- **紀錄與設定主資料**（每日紀錄、常用清單、目標、規則等）存在瀏覽器 **IndexedDB**（透過 [idb-keyval](https://github.com/jakearchibald/idb-keyval)），鍵名仍為 `fl_*` 風格；首次載入會將舊版 **localStorage** 的 `fl_*` 一次性遷入 IndexedDB（Gemini 相關鍵、`fl_last_gdrive_backup` 等偏好設定仍留在 localStorage）。
- **Gemini API Keys** 存在 **`fl_gemini_keys`**（JSON 陣列，固定 3 個槽位），不會經由 FitLog 後端上傳（本專案無後端）；舊版若只有單一把 Key（`fl_gemini_key`），首次讀取時會自動遷移到陣列第一格。
- **上次雲端備份時間**存在 **`fl_last_gdrive_backup`**（localStorage，ISO 時間字串）；他裝置備份後，本機顯示會在**已取得 Drive 授權**且**開啟設定**（此時會向 Drive 查詢）或執行**還原／本機備份成功**時，對齊備份檔的修改時間。
- 安裝為 PWA 後資料較不受 Safari 7 天清除機制影響。
- **儲存空間警示**顯示在**首頁橫幅**（約 80%／95% 用量）：估算優先使用 **`navigator.storage.estimate()`**（整站配額）；不支援時改以 **IndexedDB** 內 `fl_*` 鍵加總約略估算，再退回 **localStorage** 的 `fl_*` 與 5MB 配額。快滿時仍請匯出備份並刪除舊紀錄。

## API Key 安全性

- Keys 只存在你的裝置上，不會隨程式碼一起上傳
- 其他人使用同一個網址時，需要自行輸入自己的 Key
- 建議在 [Google AI Studio](https://aistudio.google.com/apikey) 為 Key 設定：
  - **API 限制**：只允許 Generative Language API
  - **網域限制**：只允許你的 GitHub Pages 網址

## 技術

- React 18（CDN，無建置步驟）
- Google Gemini API：**Gemini 3 Flash** 為主，額度不足時依序換 Key，必要時降級 **Gemini 2.5 Flash**
- IndexedDB（idb-keyval）持久化主資料；Gemini Key 等仍用 localStorage
- Google Identity Services + Drive API v3（`drive.appdata`）雲端備份
- PWA（manifest + Service Worker）
- 純前端，無後端伺服器

