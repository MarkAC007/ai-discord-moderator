@echo off
setlocal enabledelayedexpansion

echo 🤖 Discord AI Bot Deployment Script
echo ==================================

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker is not installed. Please install Docker first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy env.example .env >nul
    echo ✅ .env file created. Please edit it with your credentials:
    echo    - DISCORD_BOT_TOKEN
    echo    - DISCORD_APP_ID
    echo    - OPENAI_API_KEY
    echo.
    echo After editing .env, run this script again.
    pause
    exit /b 0
)

echo 🔍 Checking environment variables...

REM Read .env file and check for required variables
set "DISCORD_BOT_TOKEN="
set "DISCORD_APP_ID="
set "OPENAI_API_KEY="

for /f "tokens=1,2 delims==" %%a in (.env) do (
    if "%%a"=="DISCORD_BOT_TOKEN" set "DISCORD_BOT_TOKEN=%%b"
    if "%%a"=="DISCORD_APP_ID" set "DISCORD_APP_ID=%%b"
    if "%%a"=="OPENAI_API_KEY" set "OPENAI_API_KEY=%%b"
)

if "%DISCORD_BOT_TOKEN%"=="" (
    echo ❌ DISCORD_BOT_TOKEN is not set in .env
    pause
    exit /b 1
)

if "%DISCORD_APP_ID%"=="" (
    echo ❌ DISCORD_APP_ID is not set in .env
    pause
    exit /b 1
)

if "%OPENAI_API_KEY%"=="" (
    echo ❌ OPENAI_API_KEY is not set in .env
    pause
    exit /b 1
)

echo ✅ Environment variables are set

REM Build and start the bot
echo 🐳 Building and starting the bot...
docker-compose up -d --build

echo ⏳ Waiting for bot to start...
timeout /t 10 /nobreak >nul

REM Check if bot is running
docker-compose ps | findstr "Up" >nul
if errorlevel 1 (
    echo ❌ Bot failed to start. Check logs:
    docker-compose logs bot
    pause
    exit /b 1
)

echo ✅ Bot is running successfully!
echo.
echo 📊 Bot Status:
docker-compose ps
echo.
echo 📝 Recent logs:
docker-compose logs --tail=10 bot
echo.
echo 🔗 Health check: http://localhost:3000/health
echo.
echo 🎉 Deployment complete! Your bot should now be online in Discord.
echo    Try using /ping in your server to test it!

pause
