@echo off
echo ========================================
echo Setting up PocketBase for SPLLIT Chat
echo ========================================

cd /d "%~dp0"

echo.
echo 1. Starting PocketBase...
start /B pocketbase.exe serve --http=127.0.0.1:8090 --dir=pb_data

echo Waiting for PocketBase to start...
timeout /t 5 /nobreak > nul

echo.
echo 2. Running setup script...
node setup-pb.js

if %ERRORLEVEL% NEQ 0 (
  echo.
  echo Setup script failed. Review logs above.
  pause
  exit /b 1
)

echo.
echo ========================================
echo PocketBase Setup Complete!
echo ========================================
echo.
echo Admin UI: http://127.0.0.1:8090/_/
echo Check credentials in server\.env or server\setup-pb.js
echo.
echo Chat API: http://127.0.0.1:8090/api/collections/messages/records
echo.
pause
