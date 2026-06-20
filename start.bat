@echo off
title Kiber-DNT Platform Setup
echo ====================================
echo  Kiber-DNT - Avtonom Kiber Mudafie
echo  Platform Setup
echo ====================================
echo.

:: Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker is not installed.
    echo.
    echo The easiest way to run this platform is with Docker Desktop.
    echo.
    echo Steps:
    echo   1. Download Docker Desktop from: https://docs.docker.com/desktop/install/windows-install/
    echo   2. Install and start Docker Desktop
    echo   3. Restart this script
    echo.
    pause
    exit /b 1
)

:: Check Docker Compose
docker compose version >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [!] Docker Compose is not available.
    pause
    exit /b 1
)

echo [*] Docker found! Starting the platform...
echo.

:: Build and start
docker compose up --build

pause
