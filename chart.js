/**
 * 初始化字數趨勢圖表
 * 將其定義為全局函數，以便 main.js 調用
 */
function initWordCountChart() {
    const ctx = document.getElementById('wordCountChart');
    if (!ctx) return;

    // 如果之前已經有圖表實例，可以考慮在此先銷毀以防內存洩漏
    // 這裡示範基本的初始化
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['20180101', '20180102', '20180103', '20180104', '20180105'],
            datasets: [{
                label: '平均報導字數',
                data: [850, 1200, 950, 1400, 1100],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: { font: { family: 'inherit' } }
                }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

// 未來可以在這裡增加更多圖表初始化函數
function initLDAChart() {
    // 這裡可以寫主題分類圖表的邏輯
}