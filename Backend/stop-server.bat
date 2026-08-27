@echo off
echo ========================================
echo Stopping Spring Boot Server
echo ========================================
echo.

echo Finding process on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo Stopping process %%a...
    taskkill /F /PID %%a
    if errorlevel 1 (
        echo Failed to stop process %%a
    ) else (
        echo Successfully stopped process %%a
    )
)

echo.
echo Done!
pause

