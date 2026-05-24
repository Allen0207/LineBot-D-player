# 自動建立收件對象更新說明

這版已改成：不需要先輸入 `ID` 或手動新增 LINE ID。

## 會自動建立的情況

1. 使用者加入官方帳號好友
   - LINE 會送出 `follow` webhook event
   - 系統會自動建立 `user` 收件對象
   - 名稱優先使用 LINE profile displayName

2. 使用者私訊 Bot 任意訊息
   - 系統會自動建立/更新 `user` 收件對象
   - 適合已經很早以前就加入好友、沒有觸發 follow event 的家長

3. Bot 被加入 LINE 群組
   - LINE 會送出 `join` webhook event
   - 系統會自動建立 `group` 收件對象
   - 名稱優先使用 LINE 群組名稱

4. 群組內有人傳訊息或發生群組事件
   - 系統會自動建立/更新該 `group` 收件對象

## 還保留的指令

### 重新命名群組

在群組輸入：

```text
綁定群組 7cd-1-IQ-B
```

這不是為了取得 ID，而是為了把後台名稱改成班級名稱。

### 重新命名個人

私訊 Bot：

```text
我是 Ryan媽媽
```

這不是必要步驟，只是用來把 LINE 顯示名稱改成你想看的家長名稱。

## 注意

- LINE Bot 必須開啟 Webhook。
- LINE Developers 的 Webhook URL 必須指向 Render 網址，例如：

```text
https://你的-render網址.onrender.com/webhook
```

- 如果家長很早以前就已經加入官方帳號好友，這次更新後不會自動補舊資料；請他私訊 Bot 任意一句，例如「嗨嗨」，系統就會自動建立。
- 群組也是一樣，如果 Bot 已經在群組裡很久了，請在群組傳任意一句話，系統就會自動建立群組收件對象。
