@echo off
echo ========================================
echo Starting MarketMet Frontend (Fresh Groceries to Your Door.)
echo ========================================
echo.
cd /d "%~dp0"
echo Installing dependencies...
call npm install
echo.
echo Starting development server...
echo Frontend will be available at: http://localhost:3000
echo.
echo Make sure the Spring Boot backend is running on port 8080
echo.
call npm run dev
pause

