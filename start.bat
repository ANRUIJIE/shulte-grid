@echo off
chcp 65001 >nul
title 舒尔特方格
cd /d "%~dp0"

echo.
echo  正在启动舒尔特方格服务...
echo.

if not exist "node_modules\" (
    echo  首次运行，正在安装依赖...
    call npm install
    echo.
)

start http://localhost:3456
node server.js

pause
