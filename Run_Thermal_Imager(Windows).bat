@echo off
REM Start the Flask server in a new window
start cmd /k python Thermal_Imager.py

REM Wait for the server to start (adjust the delay if needed)
timeout /t 2 /nobreak >nul

REM Open the browser to the local server
start http://127.0.0.1:5000