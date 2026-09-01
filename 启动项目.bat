@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   楼观台碑刻数字平台 - 启动开发服务器
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo [错误] 未找到 npm，请先安装 Node.js
    pause
    exit /b 1
)

if not exist node_modules (
    echo [提示] 尚未安装依赖，请先双击 安装依赖.bat
    pause
    exit /b 1
)

echo 正在启动开发服务器...
echo 本地访问地址：http://localhost:3000
echo 按 Ctrl+C 可停止服务器
echo.

call npm run dev
pause
