@echo off
chcp 65001 >nul
cd /d "C:\Users\user\Desktop\family-app"
echo.
echo  ==== 正在啟動 family app 本地預覽 ====
echo  瀏覽器稍後會自動開啟 http://localhost:5173
echo  若沒自動開啟，請手動在瀏覽器輸入這個網址
echo.
echo  看完想停止：直接關掉這個黑色視窗即可
echo.
npm run dev -- --open
