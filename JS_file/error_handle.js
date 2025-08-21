document.getElementById("searchForm").addEventListener("submit", function (e) {
    const startDate = document.getElementById("start_date").value;
    const endDate = document.getElementById("end_date").value;
    const errorMsgEl = document.getElementById("errorMsg");

    function hideError() {
        if (errorMsgEl) {
            errorMsgEl.style.display = "none";
            errorMsgEl.textContent = "";
        }
    }

    function showError(msg) {
        if (errorMsgEl) {
            errorMsgEl.textContent = msg;
            errorMsgEl.style.display = "block";
        } else {
            alert(msg);
        }
    }

    // 清空舊訊息（若沒有容器則忽略）
    hideError();

    if (!startDate || !endDate) {
        e.preventDefault();
        showError("⚠️ 請輸入起始日期與結束日期");
    } else if (startDate > endDate) {
        e.preventDefault();
        showError("⚠️ 起始日期不可晚於結束日期");
    }
});
