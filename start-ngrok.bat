@echo off
echo ========================================
echo   NextCommerse - Paystack Setup
echo ========================================
echo.

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] ngrok is not installed or not in PATH
    echo.
    echo Please install ngrok:
    echo   npm install -g ngrok
    echo.
    echo Or download from: https://ngrok.com/download
    pause
    exit /b 1
)

echo [OK] ngrok is installed
echo.

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found
    echo.
    echo Please create .env file with:
    echo   DATABASE_URL
    echo   BETTER_AUTH_SECRET
    echo   PAYSTACK_SECRET_KEY
    echo   PAYSTACK_PUBLIC_KEY
    echo.
    pause
    exit /b 1
)

echo [OK] .env file found
echo.

REM Check if Paystack keys are set
findstr /C:"PAYSTACK_SECRET_KEY" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PAYSTACK_SECRET_KEY not found in .env
    echo Please add your Paystack secret key
    echo.
)

findstr /C:"PAYSTACK_PUBLIC_KEY" .env >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] PAYSTACK_PUBLIC_KEY not found in .env
    echo Please add your Paystack public key
    echo.
)

echo ========================================
echo   Starting ngrok tunnel...
echo ========================================
echo.
echo This will create a public URL for http://localhost:3000
echo.
echo IMPORTANT:
echo 1. Copy the HTTPS forwarding URL
echo 2. Go to Paystack Dashboard - Settings - Webhooks
echo 3. Add webhook URL: https://YOUR-NGROK-URL.ngrok-free.app/api/paystack/webhook
echo.
echo Press Ctrl+C to stop ngrok
echo ========================================
echo.

REM Start ngrok
ngrok http 3000
