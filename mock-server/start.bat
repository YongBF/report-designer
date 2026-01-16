@echo off
chcp 65001 >nul
echo ==================================
echo   Mock Server 启动脚本
echo ==================================
echo.

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到Node.js，请先安装Node.js
    echo    下载地址：https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js版本:
node -v
echo.

REM 进入当前目录
cd /d "%~dp0"

REM 检查node_modules是否存在
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    echo.
)

REM 启动服务器
echo 🚀 正在启动Mock Server...
echo.
call npm start

pause
