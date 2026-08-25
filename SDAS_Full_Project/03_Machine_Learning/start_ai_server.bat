@echo off
TITLE SDAS AI Hybrid Inference Server Watchdog
COLOR 0A

echo ======================================================================
echo   SDAS AI INFERENCE SERVER - CONTINUOUS AUTO-RESTART WATCHDOG
echo ======================================================================
echo   Target: Tabbowa Prototype Dam AI Model Pipeline (Port 8000)
echo   Models: 2-Layer LSTM + Random Forest + Deep Autoencoder
echo ======================================================================
echo.

cd /d "%~dp0"

:loop
echo [%date% %time%] Starting SDAS AI Inference Server...
python inference_server.py

echo.
echo [WARNING] Server stopped or crashed with exit code %ERRORLEVEL%!
echo [%date% %time%] Auto-restarting in 3 seconds... (Press Ctrl+C to stop)
timeout /t 3 /nobreak >nul
echo.
goto loop
