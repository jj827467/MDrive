# 拓域科技 TopVic

澳門拓域科技的靜態網站，包含服務介紹、AIGC 作品、服務條款及私隱政策。

## 本機預覽

在專案目錄執行：

```sh
python -m http.server 8000 --bind 127.0.0.1
```

瀏覽 `http://127.0.0.1:8000/`。導覽列和頁尾透過 `fetch` 載入，請使用 HTTP 伺服器預覽。

## 檔案結構

- `index.html`：首頁
- `portfolio.html`：作品展示
- `terms.html`、`privacy_policy.html`：服務條款與私隱政策
- `navbar.html`、`footer.html`：共用導覽列與頁尾
- `static/js/index.js`：共用載入、選單、輪播、錨點與返回頂部
- `static/js/ai-chat.js`：常見問題客服；依預設內容回答，未連接 AI API
- `static/css/main.css`：首頁與作品頁的基礎樣式
- `static/css/site.css`：所有頁面的共用版面與無障礙樣式
- `static/images/`：圖片素材
- `CNAME`：GitHub Pages 自訂網域

## 修改後檢查

```sh
python tools/check_site.py
node --check static/js/index.js
node --check static/js/ai-chat.js
```

另以桌面及手機尺寸確認導覽、輪播、客服問答及返回頂部。Tailwind CDN 與 YouTube 影片需要網路連線。

若環境已安裝 Node.js 的 `playwright` 套件及 Google Chrome，可執行 `node tools/browser-check.cjs`。此檢查會自行啟動本機伺服器，驗證四個頁面的桌面及手機版互動，完成後關閉伺服器與測試瀏覽器。
