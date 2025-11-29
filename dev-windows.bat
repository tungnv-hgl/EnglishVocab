@echo off
REM VocabMaster Development Server for Windows
REM Run this file from Command Prompt or PowerShell (with .\dev-windows.bat)

setlocal enabledelayedexpansion

echo.
echo Starting VocabMaster Development Server...
echo.

REM Set environment variables
set NODE_ENV=development

REM Check if .env.local exists, if not check for .env
if exist .env.local (
    echo [INFO] Loading environment from .env.local
    for /f "delims== tokens=1,2" %%A in (.env.local) do (
        if not "%%A"=="" if not "%%A:~0,1%"=="#" (
            set "%%A=%%B"
        )
    )
) else if exist .env (
    echo [INFO] Loading environment from .env
    for /f "delims== tokens=1,2" %%A in (.env) do (
        if not "%%A"=="" if not "%%A:~0,1%"=="#" (
            set "%%A=%%B"
        )
    )
) else (
    echo [ERROR] No .env or .env.local file found!
    echo Please create a .env file with:
    echo   DATABASE_URL=postgresql://...
    echo   OPENAI_API_KEY=sk-...
    echo   SESSION_SECRET=your-secret
    echo.
    pause
    exit /b 1
)

REM Verify DATABASE_URL is set
if "!DATABASE_URL!"=="" (
    echo [ERROR] DATABASE_URL is not set in .env file
    echo.
    pause
    exit /b 1
)

echo [INFO] DATABASE_URL is configured
echo [INFO] Starting Node.js development server...
echo.

REM Start the dev server
call node dev-windows.js

REM If we get here, the server exited
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Development server exited with error code %errorlevel%
    pause
)
