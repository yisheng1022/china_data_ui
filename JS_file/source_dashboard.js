// js/source_dashboard.js
// 來源分析頁：只向後端抓「統計結果」
// 後端請提供：GET /stats/source?source=...&start=...&end=...(&term=可選)
(() => {
  const API_BASE = ""; // 例如：https://your-api.onrender.com（同網域可留空）
  const ENDPOINT = `${API_BASE}/stats/source`;

  const sourceSel = document.getElementById("sourceSel");
  const startEl = document.getElementById("start");
  const endEl = document.getElementById("end");
  const termEl = document.getElementById("term");
  const goBtn = document.getElementById("goBtn");

  const statusEl = document.getElementById("status");
  const errEl = document.getElementById("err");
  const pageTitle = document.getElementById("pageTitle");

  const dailyTable = document.getElementById("dailyTable");
  const topTerms = document.getElementById("topTerms");
  const termSeries = document.getElementById("termSeries");

  const params = new URLSearchParams(location.search);
  const pSource = params.get("source");
  const pStart = params.get("start");
  const pEnd = params.get("end");
  const pTerm = params.get("term");

  if (pSource) sourceSel.value = pSource;

  const today = new Date();
  const endD = new Date(today);
  const startD = new Date(today);
  startD.setDate(startD.getDate() - 29);

  function fmtDate(d) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  startEl.value = pStart || fmtDate(startD);
  endEl.value = pEnd || fmtDate(endD);
  termEl.value = pTerm || "";

  goBtn.addEventListener("click", load);

  function setStatus(msg) { statusEl.textContent = msg || ""; }
  function showError(msg) { errEl.style.display = "block"; errEl.textContent = msg; }
  function hideError() { errEl.style.display = "none"; errEl.textContent = ""; }

  function escapeHtml(str = "") {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function renderDaily(daily) {
    if (!Array.isArray(daily) || !daily.length) return `<span class="muted">（無每日資料）</span>`;
    const rows = daily.map(([date, count]) => `
      <tr><td>${escapeHtml(date)}</td><td>${Number(count ?? 0)}</td></tr>
    `).join("");
    return `
      <table class="tbl">
        <thead><tr><th>日期</th><th>篇數</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function normalizeTerms(rawTerms) {
    if (!Array.isArray(rawTerms)) return [];
    return rawTerms.map((item) => {
      if (Array.isArray(item)) return { term: item[0], n: item[1] };
      return { term: item.term ?? item[0], n: item.n ?? item[1] ?? 0 };
    }).filter(x => x.term);
  }

  function renderTopTerms(terms, sourceId, start, end) {
    const list = normalizeTerms(terms);
    if (!list.length) return `<span class="muted">（無熱門詞）</span>`;
    return list.slice(0, 40).map(({term, n}) => {
      const href = `source.html?source=${encodeURIComponent(sourceId)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&term=${encodeURIComponent(term)}`;
      return `<a class="chip" href="${href}" title="查看「${escapeHtml(term)}」的出現量">${escapeHtml(term)}<span class="chip-count">${Number(n ?? 0)}</span></a>`;
    }).join("");
  }

  function renderTermSeries(series, term) {
    if (!term) return `<span class="muted">（未指定詞彙）</span>`;
    if (!Array.isArray(series) || !series.length) return `<span class="muted">（此詞在區間內無資料）</span>`;
    const rows = series.map(([date, n]) => `
      <tr><td>${escapeHtml(date)}</td><td>${Number(n ?? 0)}</td></tr>
    `).join("");
    return `
      <div style="margin-bottom:.5rem;"><strong>${escapeHtml(term)}</strong></div>
      <table class="tbl">
        <thead><tr><th>日期</th><th>出現量</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  async function load() {
    hideError();
    const source = sourceSel.value;
    const start = startEl.value;
    const end = endEl.value;
    const term = termEl.value.trim();

    pageTitle.textContent = `來源分析：${source}`;
    setStatus("載入中…");

    dailyTable.innerHTML = `<span class="muted">載入中…</span>`;
    topTerms.innerHTML = `<span class="muted">載入中…</span>`;
    termSeries.innerHTML = `<span class="muted">載入中…</span>`;

    try {
      if (!source) throw new Error("缺少來源");
      if (!start || !end) throw new Error("缺少日期區間");

      const url = `${ENDPOINT}?source=${encodeURIComponent(source)}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}${term ? `&term=${encodeURIComponent(term)}` : ""}`;
      const res = await fetch(url);

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API 回應失敗 (${res.status}) ${text}`);
      }

      const data = await res.json();

      dailyTable.innerHTML = renderDaily(data.daily);
      topTerms.innerHTML = renderTopTerms(data.top_terms, source, start, end);

      let series = [];
      if (term) {
        if (Array.isArray(data.term_series)) series = data.term_series;
        else if (data.term_series && Array.isArray(data.term_series[term])) series = data.term_series[term];
      }
      termSeries.innerHTML = renderTermSeries(series, term);

      setStatus(`區間：${start} → ${end}`);
    } catch (e) {
      showError(`載入失敗：${e?.message || e}`);
      setStatus("");
    }
  }

  load();
})();
