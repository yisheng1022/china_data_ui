document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("searchForm");
    const startInput = document.getElementById("start_date");
    const endInput = document.getElementById("end_date");
    const paperInput = document.getElementById("paper");
    const keywordInput = document.getElementById("keyword");
    const errorMsg = document.getElementById("errorMsg");
    const resultsDiv = document.getElementById("results");
  
    form.addEventListener("submit", async function (e) {
      e.preventDefault(); // 阻止表單預設行為

      const paper = paperInput.value;
      const startDate = startInput.value;
      const endDate = endInput.value;
      const keyword = (keywordInput.value || "").trim();

      // 若日期無效，停止請求（驗證訊息由 error_handle.js 負責顯示）
      if (!startDate || !endDate || startDate > endDate) {
        return;
      }

      // 顯示載入中
      resultsDiv.innerHTML = `<p class="placeholder">查詢中...</p>`;

      try {
        // ✅ 呼叫你的 API
        const url = new URL("https://chinapress-api.onrender.com/search");
        url.searchParams.set("paper", paper);
        url.searchParams.set("start_date", startDate);
        url.searchParams.set("end_date", endDate);
        url.searchParams.set("limit", 50);
        if (keyword) url.searchParams.set("keyword", keyword);
  
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("API 錯誤");
  
        const data = await response.json();
        const items = Array.isArray(data) ? data : (data.results || data.data || []);
  
        if (!Array.isArray(items) || items.length === 0) {
          resultsDiv.innerHTML = `<p class="placeholder">沒有找到符合的結果。</p>`;
          return;
        }
  
        // ✅ 把結果渲染成列表
        let html = "<ul class='result-list'>";
        items.forEach((item) => {
          html += `
            <li class="result-item">
              <h3>${item.Title || item.title || "（無標題）"}</h3>
              <p><strong>日期：</strong>${item.Date || item.date}</p>
              <p>${item.Content?.slice(0, 100) || item.content?.slice(0,100)}...</p>
            </li>
          `;
        });
        html += "</ul>";
        resultsDiv.innerHTML = html;
  
      } catch (err) {
        console.error(err);
        resultsDiv.innerHTML = `<p class="error-message">❌ 查詢失敗，請稍後再試。</p>`;
      }
    });
  });
  