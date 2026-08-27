@echo off
echo Starting MarketMet Spring Boot Backend...
echo Wait for "MarketMet backend is running" before using the API.
echo.
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause

