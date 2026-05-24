# 雲端部署指南

這個專案是一個 Node.js + Express 應用，已準備好部署到雲端平台。以下是最適合的部署方式與注意事項。

## 專案條件

- Node.js 版本：`>=18`
- 啟動指令：`npm start`
- 靜態頁面放在 `public/`
- 需要下列環境變數：
  - `LINE_CHANNEL_SECRET`
  - `LINE_CHANNEL_ACCESS_TOKEN`
  - `ADMIN_TOKEN`
  - `PORT`（雲端平台通常會自動提供）
  - `TZ`（可選，預設為 `Asia/Taipei`）

## 主要部署平台建議

### 1. Render

1. 到 Render 建立一個新的 Web Service。
2. 選擇 GitHub 倉庫 `Allen0207/LineBot-D-player`。
3. 設定 Build Command：`npm install`
4. 設定 Start Command：`npm start`
5. 設定環境變數：
   - `LINE_CHANNEL_SECRET`
   - `LINE_CHANNEL_ACCESS_TOKEN`
   - `ADMIN_TOKEN`
   - `TZ=Asia/Taipei`
6. 如果你要保留 `data/db.json` 的資料，請額外加上 Persistent Disk，並把 `data/` 指向該磁碟。

### 2. Railway

1. 建立 Railway 專案，連結 GitHub 倉庫。
2. 選擇 Node.js 專案。
3. 設定環境變數：同上。
4. 部署後，Railway 會使用 `npm start` 啟動。

> 注意：Railway 的本機檔案系統通常不是長期持久化。如果你需要長期保存 `data/db.json`，建議改用資料庫或外部儲存。

### 3. Google Cloud Run / Heroku / Fly.io

這些平台也適合部署，此專案的結構相對簡單。只要確保：

- `package.json` 的 `start` 指令存在
- 說明環境變數
- 如果需要 `data/db.json` 保存，選擇支援本機持久化或改為資料庫

## `data/db.json` 的儲存注意

目前專案使用本機檔案 `data/db.json` 做資料儲存：

- 在雲端平台中，這種儲存方式可能會因為重啟、重新部署或容器替換而遺失資料。
- 若要穩定保留資料，建議：
  - 使用有持久磁碟的雲端方案（例如 Render Persistent Disk、AWS EFS、Railway Volume）
  - 或改成使用資料庫（Firebase / Supabase / MongoDB / MySQL / PostgreSQL）

## 建議部署流程

1. 先在雲端建立應用或 Web Service
2. 將 GitHub 倉庫連到該平台
3. 設定環境變數
4. 部署並測試首頁是否能正常載入
5. 測試 `Webhook` 回傳與 LINE 傳送功能

## Render 部署專用配置

本專案已新增 `render.yaml`，可以直接匯入 Render 專案設定。

- `buildCommand`: `npm install`
- `startCommand`: `npm start`
- `branch`: `main`
- `env`: `NODE_ENV=production`

部署時請在 Render 上補上以下環境變數：

- `LINE_CHANNEL_SECRET`
- `LINE_CHANNEL_ACCESS_TOKEN`
- `ADMIN_TOKEN`
- `TZ=Asia/Taipei`

如果你希望資料能持久化，請在 Render 上新增 Persistent Disk，並將 `data/` 目錄改為掛載到該磁碟。

## 進階建議

- 如果你要讓 LINE Webhook 正常運作，部署後需要一個公開且 HTTPS 的 URL。
- 之後在 LINE Developers Console 的 Messaging API 設定 `Webhook URL`，指向：

  ```text
  https://你的應用域名/webhook
  ```

- 確保 `.env` 中的 `LINE_CHANNEL_SECRET` 跟 `.env` 中的 `LINE_CHANNEL_ACCESS_TOKEN` 已正確設定。

## 我可以幫你做什麼？

- 幫你選一個適合的雲端平台
- 幫你寫 `render.yaml` 或 `Dockerfile`
- 幫你把部署步驟整合到 `README.md`
- 幫你直接在 `package.json` 加上 `deploy` 指令
