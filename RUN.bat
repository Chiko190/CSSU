@echo off
setlocal
cd /d "%~dp0"
title nc2

rem The ready-to-run zip ships its own Node.js in the "node" folder, so nothing needs installing.
if exist "%~dp0node\node.exe" set "PATH=%~dp0node;%PATH%"

rem Usage: RUN.bat         fast mode (builds once, pages load instantly)
rem        RUN.bat --dev   dev mode (auto-reloads when you edit code)

where node >nul 2>nul
if errorlevel 1 goto :installnode

for /f "tokens=1 delims=v." %%v in ('node -v') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 20 (
  echo Your Node.js is too old. This project needs version 20 or newer.
  echo Install the LTS version from https://nodejs.org then run this again.
  start "" https://nodejs.org
  pause
  exit /b 1
)

node scripts\run-local.mjs %*
pause
exit /b

:installnode
echo Node.js is not installed. Installing it now...
where winget >nul 2>nul
if errorlevel 1 goto :manualnode
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
if errorlevel 1 goto :manualnode
echo.
echo Node.js installed. Close this window and double-click RUN.bat again.
pause
exit /b 0

:manualnode
echo.
echo Could not install Node.js automatically.
echo Install the LTS version from https://nodejs.org then double-click RUN.bat again.
start "" https://nodejs.org
pause
exit /b 1
