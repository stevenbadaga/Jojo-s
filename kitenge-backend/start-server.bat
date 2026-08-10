@echo off
echo Starting JOJO Groceries Spring Boot Backend...
echo Wait for "JOJO Groceries backend is running" before using the API.
echo.
cd /d "%~dp0"
call mvnw.cmd spring-boot:run
pause

