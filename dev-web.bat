@echo off
setlocal EnableExtensions
cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
  echo Node.js was not found. Install LTS from https://nodejs.org and reopen this window.
  pause
  exit /b 1
)

if not exist "web\node_modules\" (
  echo Installing web dependencies ^(first run^)...
  call npm --prefix "web" install
  if errorlevel 1 (
    echo npm install failed. Check the messages above.
    pause
    exit /b 1
  )
)

echo.
echo Starting dev server — open http://localhost:3000
echo Press Ctrl+C to stop.
echo.
call npm --prefix "web" run dev
set "ERR=%ERRORLEVEL%"
if not "%ERR%"=="0" (
  echo.
  echo Dev server exited with error %ERR%.
  pause
)
exit /b %ERR%
