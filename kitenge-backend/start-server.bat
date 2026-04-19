@echo off
echo Starting Esoko Spring Boot Backend...
echo Wait for "Esoko backend is running" before using the API.
echo.
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause

