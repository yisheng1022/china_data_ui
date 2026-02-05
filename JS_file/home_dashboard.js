// js/home_dashboard.js
// 首頁：只負責向後端抓「統計結果」，不碰原始資料。
// 後端請提供：GET /stats/overview?date=YYYY-MM-DD
(() => {
  const API_BASE = ""; // 例如：https://your-api.onrender.com（同網域可留空）
  const ENDPOINT = `${API_BASE}/stats/overview`;

  const ovDate = document.getElementById("ovDate");
  const reloadBtn = document.getElementById("reloadBtn");
  const grid = document.getElementById("overviewGrid");
  const statusEl = document.getElementById("ovStatus");
  const errEl = document.getElementById("ovError");

  ovDate.valueAsDate = new Date();

  reloadBtn.addEventListener("click", () => loadOverview(ovDate.value));
  ovDate.addEventListener("change", () => loadOverview(ovDate.value));

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

  function renderCard(source, dateStr) {
    const sourceId = source.id ?? source.source ?? "";
    const name = source.name ?? source.source_name ?? sourceId;
    const count = Number(source.today_count ?? source.doc_count ?? source.count ?? 0);

    const terms = Array.isArray(source.top_terms) ? source.top_terms : [];
    const chipsHtml = terms.length
      ? terms.slice(0, 10).map((item) => {
          const t = Array.isArray(item) ? item[0] : (item.term ?? item[0]);
          const n = Array.isArray(item) ? item[1] : (item.n ?? item[1] ?? 0);
          const href = `source.html?source=${encodeURIComponent(sourceId)}&start=${encodeURIComponent(dateStr)}&end=${encodeURIComponent(dateStr)}&term=${encodeURIComponent(t)}`;
          return `<a class="chip" href="${href}" title="查看「${escapeHtml(t)}」的出現量">${escapeHtml(t)}<span class="chip-count">${Number(n ?? 0)}</span></a>`;
        }).join("")
      : `<span class="muted">（尚無熱門詞）</span>`;

    const trendHref = `source.html?source=${encodeURIComponent(sourceId)}`;

    return `
      <article class="card">
        <div class="card-body">
          <h3 class="card-title">${escapeHtml(name)}</h3>
          <p class="card-text">
            <strong>文章數：</strong> ${Number.isFinite(count) ? count : 0}<br/>
            <strong>熱門詞：</strong>
          </p>
          <div class="chip-row">${chipsHtml}</div>
          <div style="margin-top:.75rem;">
            <a class="btn btn-link" href="${trendHref}">查看趨勢 →</a>
          </div>
        </div>
      </article>
    `;
  }

  async function loadOverview(dateStr) {
    hideError();
    setStatus("載入中…");
    grid.innerHTML = `
      <article class="card muted">
        <div class="card-body">
          <h3 class="card-title">載入中…</h3>
          <p class="card-text">正在取得統計結果。</p>
        </div>
      </article>
    `;

    try {
      if (!dateStr) throw new Error("缺少日期");
      const url = `${ENDPOINT}?date=${encodeURIComponent(dateStr)}`;
      const res = await fetch(url, { method: "GET" });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API 回應失敗 (${res.status}) ${text}`);
      }

      const data = await res.json();
      const sources = Array.isArray(data.sources) ? data.sources : (Array.isArray(data) ? data : []);

      if (!sources.length) {
        grid.innerHTML = `
          <article class="card muted">
            <div class="card-body">
              <h3 class="card-title">沒有資料</h3>
              <p class="card-text">此日期沒有任何來源的統計結果。</p>
            </div>
          </article>
        `;
        setStatus("");
        return;
      }

      grid.innerHTML = sources.map(s => renderCard(s, data.date || dateStr)).join("");
      setStatus(`已更新：${escapeHtml(data.date || dateStr)}`);
    } catch (err) {
      showError(`載入失敗：${err?.message || err}`);
      setStatus("");
    }
  }

  loadOverview(ovDate.value);
})();
