@echo off
REM Windows batch file to run the development server
REM Usage: dev-windows.bat

setlocal enabledelayedexpansion

REM Set environment variables
set NODE_ENV=development

REM Check if .env.local exists, if not check for .env
if exist .env.local (
    echo Loading .env.local
) else if exist .env (
    echo Loading .env
) else (
    echo Warning: No .env or .env.local file found
    echo Please create .env file with DATABASE_URL and OPENAI_API_KEY
)

REM Start the dev server
node dev-windows.js
