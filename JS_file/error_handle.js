document.getElementById("searchForm").addEventListener("submit", function (e) {
    const startDate = document.getElementById("start_date").value;
    const endDate = document.getElementById("end_date").value;
    const errorMsg = document.getElementById("errorMsg");

    // 清空舊訊息
    errorMsg.style.display = "none";
    errorMsg.textContent = "";

    if (!startDate || !endDate) {
    e.preventDefault();
    errorMsg.textContent = "⚠️ 請輸入起始日期與結束日期";
    errorMsg.style.display = "block";
    } else if (startDate > endDate) {
    e.preventDefault();
    errorMsg.textContent = "⚠️ 起始日期不可晚於結束日期";
    errorMsg.style.display = "block";
    }
});
