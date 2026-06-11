@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo  Push to GitHub (shulte-grid)
echo  =============================
echo.
set /p TOKEN="Paste your GitHub Token: "
if "%TOKEN%"=="" (
  echo No token entered.
  pause
  exit /b 1
)

set GIT_TERMINAL_PROMPT=0
git push "https://x-access-token:%TOKEN%@github.com/ANRUIJIE/shulte-grid.git" main

if %ERRORLEVEL% neq 0 (
  echo.
  echo Push failed. Your token needs Contents: Read and write permission.
  pause
  exit /b 1
)

echo.
echo Push OK! Site: https://ANRUIJIE.github.io/shulte-grid/
echo Enable Pages: repo Settings - Pages - Source: GitHub Actions
echo.
pause
