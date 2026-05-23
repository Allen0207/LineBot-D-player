# 玩樂高手 LINE Bot 罐頭訊息外掛 App

這是一個可以直接用 VSCode 開啟的 Node.js 專案，用來管理 LINE Bot 的罐頭訊息、指定群組發送、指定個人發送與固定排程。

## 功能

- LINE Webhook：自動紀錄 `groupId`、`roomId`、`userId`
- 後台頁面：管理收件對象、罐頭訊息、排程、發送紀錄
- 立即發送：可發到指定群組、指定個人、多個個人
- 固定排程：用 cron 設定每週/每日固定時間發送
- 群組綁定指令：在 LINE 群輸入 `綁定群組 7cd-1-IQ-B`
- 個人綁定指令：私訊 Bot 輸入 `我是 Ryan媽媽`
- 測試指令：輸入 `嗨嗨` 或 `ID`

## 重要限制

- 發到 LINE 群組時，群組內所有人都會看到。
- 如果要「只發給某幾位家長/學生」，請使用個人 `userId` 私訊，不要發到群組。
- LINE Push / Multicast / Broadcast 會計入官方帳號訊息用量。

## 安裝

```bash
npm install
```

## 設定 `.env`

複製 `.env.example` 成 `.env`：

```bash
copy .env.example .env
```

macOS / Linux：

```bash
cp .env.example .env
```

修改 `.env`：

```env
LINE_CHANNEL_SECRET=你的ChannelSecret
LINE_CHANNEL_ACCESS_TOKEN=你的ChannelAccessToken
ADMIN_TOKEN=請改成一組安全密碼
PORT=3000
TZ=Asia/Taipei
```

## 啟動

```bash
npm run dev
```

開啟：

```text
http://localhost:3000
```

## Webhook 設定

本機開發時，LINE 無法直接連到你的 `localhost`，建議用 ngrok：

```bash
ngrok http 3000
```

假設 ngrok 給你的網址是：

```text
https://abcd-1234.ngrok-free.app
```

到 LINE Developers Console → Messaging API → Webhook URL 填入：

```text
https://abcd-1234.ngrok-free.app/webhook
```

並開啟：

```text
Use webhook = Enabled
```

## 取得 groupId / userId 的方式

### 群組

1. 把 LINE 官方帳號 Bot 加進群組
2. 在群組輸入：

```text
綁定群組 7cd-1-IQ-B
```

3. 後台會自動出現這個群組

### 個人

1. 家長或學生先加入 LINE 官方帳號好友
2. 私訊 Bot：

```text
我是 Ryan媽媽
```

3. 後台會自動出現這個個人 userId

## 罐頭訊息可用變數

```text
{收件人名稱}
{LINE_ID}
{日期}
{時間}
```

例如：

```text
【玩樂高手上課提醒】
{收件人名稱} 您好，今天 {時間} 有課程，請記得攜帶作品與零件。
```

## cron 範例

| 需求 | cron |
|---|---|
| 每週六 13:00 | `0 13 * * 6` |
| 每週五 18:30 | `30 18 * * 5` |
| 每週五、六 10:00 | `0 10 * * 5,6` |
| 每天 20:00 | `0 20 * * *` |

## 正式部署建議

不要只放在自己的電腦，否則電腦關機就不會排程發送。正式使用可部署到：

- Render
- Railway
- Fly.io
- VPS
- Google Cloud Run + Scheduler

## 專案結構

```text
line-bot-canned-app/
├─ server.js
├─ package.json
├─ .env.example
├─ .env.example
├─ data/
│  ├─ db.json (本機測試用，含真實綁定資料，請勿上傳到公開 repo)
│  └─ db.example.json (供上傳到 GitHub 的範本)
└─ public/
   ├─ index.html
   ├─ app.js
   └─ styles.css
```

## 上傳到 GitHub 前的注意

- 請勿直接把 `data/db.json`（含使用者的 LINE userId）上傳到公開倉庫。建議先把本機的 `data/db.json` 改名或移出版本控制：

```bash
git rm --cached data/db.json
mv data/db.json data/db.local.json
git add data/db.example.json .env.example .gitignore README.md
git commit -m "Prepare project for GitHub: add examples and ignore real data"
```

- 之後可在 GitHub 建立一個新的 repo，然後把本地倉庫推上去：

```bash
git remote add origin https://github.com/<你的帳號>/<repo>.git
git branch -M main
git push -u origin main
```

如果你想我幫你自動建立 GitHub 倉庫並推送，請提供授權方式（例如使用 `gh` CLI 並在你本機登入）或告訴我要哪個遠端 URL，我會提供確切指令。

## Git 自動 / 手動同步說明

專案已新增 `git-sync.ps1`，可以切換自動或手動推送：

- 自動模式（預設）：

```bash
npm run git-sync
```

- 手動模式：

```bash
npm run git-sync:manual
```

手動模式會完成 `pull`、`add`、`commit`，但不會 `push`；你可以再執行：

```bash
git push origin main
```

如果你要改成其他分支，請把 `main` 換成你的分支名稱。 
