# FitLog - 飲食運動追蹤 PWA

記錄每天的飲食與運動，搭配 Google Gemini AI 自動估算營養素（蛋白質、脂肪、碳水），追蹤每日熱量攝取與消耗。

## 功能

- AI 分析食物營養素（文字描述或拍照）
- AI 解析 Apple Watch 運動截圖
- 手動輸入飲食 / 運動紀錄
- 常用食物快速新增（支援拖曳排序）
- 每日目標追蹤（環形進度 + 三大營養素進度條；超過目標時原色條不變，右側疊加紅色標示超標比例）
- 歷史紀錄瀏覽
- CSV 匯出 / 匯入備份
- 自訂 AI 估算規則
- PWA 支援（加入主畫面後如原生 App）

## 檔案結構

```
fitlog/
  index.html      # 主程式（單一 HTML，含所有邏輯與樣式）
  manifest.json   # PWA 清單
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

安裝為 PWA 後可消除瀏覽器外框，且 localStorage 資料不會被自動清除。

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

1. 點擊主畫面右上角 **⚙** 進入設定
2. 在「每日目標」區塊輸入蛋白質、脂肪、碳水的目標克數
3. 熱量會自動計算（蛋白質×4 + 脂肪×9 + 碳水×4）
4. 點擊 **儲存目標**

### 5. 設定估算規則（選填）

在設定頁的「預設估算規則」輸入常用規則，AI 分析時會自動套用。

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

點擊頂部的 **‹** / **›** 箭頭可切換查看 / 記錄不同日期。

### 刪除紀錄

在紀錄頁籤中，點擊項目右邊的 **×**，再點 **刪除** 確認。

## 資料備份

### 匯出

1. 進入 **設定** > **資料管理**
2. 點 **📤 匯出 CSV**
3. 檔案會下載到手機的「檔案」App

### 匯入

1. 進入 **設定** > **資料管理**
2. 點 **📥 匯入 CSV**
3. 選擇之前匯出的 `.csv` 檔
4. 資料會合併到現有紀錄中（不會覆蓋）

> 建議每週匯出一次 CSV 備份到 iCloud / Google Drive。換手機時匯入即可。

## 資料儲存

- 所有資料存在瀏覽器的 **localStorage**（前綴 `fl_`）
- API Keys 存在 **`fl_gemini_keys`**（JSON 陣列，固定 3 個槽位），不會上傳到任何伺服器；舊版若只有單一把 Key（`fl_gemini_key`），首次讀取時會自動遷移到陣列第一格
- 安裝為 PWA 後資料不受 Safari 7 天清除機制影響
- 容量約 5-10MB，足夠記錄數年的飲食運動資料

## API Key 安全性

- Keys 只存在你的裝置上，不會隨程式碼一起上傳
- 其他人使用同一個網址時，需要自行輸入自己的 Key
- 建議在 [Google AI Studio](https://aistudio.google.com/apikey) 為 Key 設定：
  - **API 限制**：只允許 Generative Language API
  - **網域限制**：只允許你的 GitHub Pages 網址

## 技術

- React 18（CDN，無建置步驟）
- Google Gemini API：**Gemini 3 Flash** 為主，額度不足時依序換 Key，必要時降級 **Gemini 2.5 Flash**
- localStorage 持久化（含最多 3 組 API Key 槽位）
- PWA（manifest + Service Worker）
- 純前端，無後端伺服器
