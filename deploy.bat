@echo off
REM MoveIt 247 Deployment Script for Windows
REM This script helps deploy the application on Windows

echo =========================================
echo   MoveIt 247 Deployment Script
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed
    pause
    exit /b 1
)

echo [OK] npm is installed
npm --version
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo [OK] Dependencies installed successfully
echo.

REM Create uploads directory if it doesn't exist
if not exist "uploads" (
    echo Creating uploads directory...
    mkdir uploads
    echo [OK] Uploads directory created
)

echo.
echo =========================================
echo   Installation Successful!
echo =========================================
echo.
echo To start the application:
echo   npm start
echo.
echo Or keep this window open and press any key to start now...
pause >nul

REM Start the application
echo.
echo Starting MoveIt 247...
echo.
echo Server will be accessible at:
echo   http://localhost:4000
echo.
echo Default login:
echo   Username: admin
echo   Password: admin123
echo.
echo Press Ctrl+C to stop the server
echo =========================================
echo.

npm start

