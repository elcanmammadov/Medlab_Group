@echo off
setlocal

REM Starts the Medlab backend server in this window.
REM Usage: double-click or run from terminal.

cd /d "%~dp0.."

if not exist "node_modules" (
  echo Installing dependencies...
  npm install
  if errorlevel 1 (
    echo npm install failed.
    exit /b 1
  )
)

echo Starting server...
npm start

