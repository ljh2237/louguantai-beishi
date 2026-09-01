@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo   楼观台碑刻数字平台 - 安装依赖
echo ============================================
echo.

where npm >nul 2>nul
if errorlevel 1 (
    echo [错误] 未找到 npm，请先安装 Node.js（https://nodejs.org）
    pause
    exit /b 1
)

echo 正在安装依赖（可能需要几分钟，请耐心等待）...
call npm install --no-audit --no-fund
if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败。如网络受限，请检查代理设置。
    pause
    exit /b 1
)

echo.
echo 依赖安装完成！现在可以双击 启动项目.bat 启动。
pause
