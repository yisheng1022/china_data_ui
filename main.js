const { createApp } = Vue;

createApp({
    data() {
        return {
            currentView: 'home',
            // 請替換成你的 Google Apps Script 佈署網址
            apiUrl: 'https://script.google.com/macros/s/你的網址/exec',
            loading: false,
            query: {
                paper: 'JFJB',
                start: '20180101',
                end: '20180102',
                keyword: ''
            },
            results: [],
            totalFound: 0,
            currentPage: 1,
            pageSize: 20
        }
    },
    computed: {
        totalPages() {
            return Math.ceil(this.results.length / this.pageSize);
        },
        pagedResults() {
            const startIdx = (this.currentPage - 1) * this.pageSize;
            const endIdx = startIdx + this.pageSize;
            return this.results.slice(startIdx, endIdx);
        }
    },
    mounted() {
        // 調用 charts.js 裡的全局函數
        if (typeof initWordCountChart === "function") {
            initWordCountChart();
        }
    },
    watch: {
        currentView(newVal) {
            if (newVal === 'home') {
                this.$nextTick(() => {
                    if (typeof initWordCountChart === "function") {
                        initWordCountChart();
                    }
                });
            }
        }
    },
    methods: {
        async searchData() {
            if (!this.query.start || !this.query.end) {
                alert("請輸入日期範圍");
                return;
            }
            this.loading = true;
            this.results = [];

            try {
                const params = new URLSearchParams(this.query);
                const response = await fetch(`${this.apiUrl}?${params.toString()}`);
                const res = await response.json();

                if (res.success && res.data) {
                    // 根據日期由小到大排序
                    this.results = res.data.sort((a, b) => a.Date.localeCompare(b.Date));
                    this.totalFound = this.results.length;
                    this.currentPage = 1;
                } else {
                    alert("搜尋失敗：" + (res.error || "未知錯誤"));
                }
            } catch (err) {
                alert("連線發生錯誤，請檢查 API 網址或網路狀態");
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        prevPage() { if (this.currentPage > 1) this.currentPage--; },
        nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; },
        downloadCSV() {
            if (this.results.length === 0) return;
            const headers = Object.keys(this.results[0]).join(",");
            const rows = this.results.map(obj =>
                Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
            );
            const csvContent = "\uFEFF" + headers + "\n" + rows.join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.setAttribute("download", `Search_Results_${this.query.start}.csv`);
            link.click();
        }
    }
}).mount('#app');