import os
import pandas as pd
from pathlib import Path
from dotenv import load_dotenv

def read_file(base_path, paper_list):
    for paper in paper_list:
        for year in range(2018, 2024):
            # 使用 / 運算子直接拼接路徑，完全不用理會系統斜線問題
            year_path = base_path / paper / str(year)
            
            # 加上防呆，避免某個年份資料夾不存在導致報錯
            if not year_path.exists():
                continue
            
            for csv_file in year_path.glob('*.csv'):
                tmp_df = pd.read_csv(csv_file)
                # yield 的時候多回傳一個檔案名稱，這樣主程式印 log 時比較清楚
                yield year_path, csv_file.name, tmp_df

if __name__ == '__main__':
    # 載入 .env 檔案中的環境變數
    load_dotenv()
    
    # 取得環境變數中的 PAPER_PATH，若沒有則預設為當前目錄 '.'
    paper_path_env = os.getenv('PAPER_PATH', '.')
    base_path = Path(paper_path_env)
    paper_list = ['RMRB'] #'JFJB', 'GMB', 
    word_count_info = []
    # 透過 for 迴圈來接 yield 出來的 DataFrame
    for year_path,file_name, daily_df in read_file(base_path, paper_list):
        print(f"正在處理: {file_name}... ", end="\r")
        paper_date = file_name.split('.')[0]
        if 'ch_word_counts' in daily_df.columns:
            word_count_info.append([paper_date,daily_df['ch_word_counts'].mean()])
        else:
            print(f"警告：找不到 Content 欄位！")

    word_count_info_df = pd.DataFrame(word_count_info,columns = ['paper_date','word_count'])
    word_count_info_df.to_csv(f'{year_path}/word_count_info.csv',index = False,encoding = 'utf-8-sig',mode = 'w')
        # daily_df.to_csv(year_path/file_name, index = False, encoding = 'utf-8-sig',mode = 'w')