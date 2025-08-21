let currentPage = 1;
const limit = 100;
let totalResults = 0;
let currentResults = [];

function init() {
  const form = document.getElementById("searchForm");
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const downloadBtn = document.getElementById("downloadCsvBtn");

  form.addEventListener("submit", handleSearchSubmit);
  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchResults();
    }
  });
  nextBtn.addEventListener("click", () => {
    const maxPage = Math.ceil(totalResults / limit);
    if (currentPage < maxPage) {
      currentPage++;
      fetchResults();
    }
  });
  downloadBtn.addEventListener("click", () => {
    if (currentResults.length > 0) {
      downloadCsv(currentResults);
    } else {
      alert("沒有資料可以下載");
    }
  });
}
// 查詢按鈕按下後負責呼叫fetchResults() function
function handleSearchSubmit(e) {
  e.preventDefault();
  currentPage = 1;
  fetchResults();
}

async function fetchResults() {
  const paper = document.getElementById("paper").value;
  const startDate = document.getElementById("start_date").value;
  const endDate = document.getElementById("end_date").value;
  const keyword = (document.getElementById("keyword").value || "").trim();

  if (!startDate || !endDate || startDate > endDate) return;

  resetUI();

  const url = new URL("https://chinapress-api.onrender.com/search");
  url.searchParams.set("paper", paper);
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("limit", limit);
  url.searchParams.set("skip", currentPage);
  if (keyword) url.searchParams.set("keyword", keyword);

  try {
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("API 錯誤");

    const data = await response.json();
    currentResults = data.data || [];
    totalResults = data.total_result || 0;

    renderResults(currentResults);
    renderTotalMessage();
    renderPagination();

  } catch (err) {
    console.error(err);
    document.getElementById("results").innerHTML = `<p class="error-message">❌ 查詢失敗，請稍後再試。</p>`;
  }
}

function renderResults(data) {
  const resultsDiv = document.getElementById("results");
  if (!data.length) {
    resultsDiv.innerHTML = `<p class="placeholder">沒有找到符合的結果。</p>`;
    return;
  }

  let html = "<ul class='result-list'>";
  data.forEach((item) => {
    html += `
      <li class="result-item">
        <h3>${item.Title || item.title || "（無標題）"}</h3>
        <p><strong>日期：</strong>${item.Date || item.date}</p>
        <p>${item.Content?.slice(0, 100) || item.content?.slice(0, 100)}...</p>
      </li>
    `;
  });
  html += "</ul>";
  resultsDiv.innerHTML = html;
}

function renderTotalMessage() {
  const totalMsg = document.getElementById("totalMsg");
  const startIdx = (currentPage - 1) * limit + 1;
  const endIdx = startIdx + currentResults.length - 1;
  totalMsg.textContent = `共找到 ${totalResults} 筆資料，顯示第 ${startIdx} - ${endIdx} 筆`;
}

function renderPagination() {
  const prevBtn = document.getElementById("prevPageBtn");
  const nextBtn = document.getElementById("nextPageBtn");
  const downloadBtn = document.getElementById("downloadCsvBtn");

  const maxPage = Math.ceil(totalResults / limit);

  prevBtn.style.display = totalResults > limit ? "inline-block" : "none";
  nextBtn.style.display = totalResults > limit ? "inline-block" : "none";
  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= maxPage;

  downloadBtn.style.display = "inline-block";
}

function resetUI() {
  document.getElementById("results").innerHTML = `<p class="placeholder">查詢中...</p>`;
  document.getElementById("totalMsg").textContent = "";
}

function downloadCsv(data) {
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => `"${(row[h] ?? "").toString().replace(/"/g, '""')}"`).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `chinapress_page_${currentPage}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// 啟動初始化（確保在腳本位於 body 底部時也能執行）
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

/*
// 初始化
init()

// 🔧 核心功能區
function init()                 // 掛載事件監聽器與初始狀態
function handleSearchSubmit(e) // 主控搜尋流程
function fetchResults(params)  // 發送 API 請求、接收資料
function renderResults(data)   // 渲染文章資料
function renderTotalMessage()  // 顯示目前筆數範圍
function renderPagination()    // 更新「上一頁 / 下一頁」按鈕
function downloadCsv(data)     // 將結果儲存為 CSV
function resetUI()             // 查詢前重設畫面與按鈕狀態
*/