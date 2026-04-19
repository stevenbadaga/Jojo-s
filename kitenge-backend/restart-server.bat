@echo off
echo ========================================
echo Restarting Spring Boot Server
echo ========================================
echo.

echo Stopping any existing server on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /F /PID %%a >nul 2>&1
)

timeout /t 2 /nobreak >nul

echo.
echo Starting Spring Boot server...
echo Wait for "Esoko backend is running" before using the API.
echo.
call mvnw.cmd spring-boot:run

pause

