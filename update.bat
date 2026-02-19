@echo off
setlocal
echo [Caelo] Starting GitHub Update...

:: Check if git is initialized
if not exist .git (
    echo Initializing Git...
    git init
    git remote add origin https://github.com/yodakuyy/caelo.git
    git branch -M main
)

:: Ensure remote is correct just in case
git remote set-url origin https://github.com/yodakuyy/caelo.git

:: Adding changes
echo Adding all changes...
git add .

:: Preparing Commit Message with Timestamp
for /f "tokens=2-4 delims=/ " %%a in ('date /t') do (set mydate=%%c-%%a-%%b)
for /f "tokens=1-2 delims=/:" %%a in ("%TIME%") do (set mytime=%%a%%b)
set commit_msg="Caelo Update: %date% %time%"

echo Committing changes...
git commit -m %commit_msg%

:: Push to main
echo Pushing to GitHub (main branch)...
git push -u origin main

echo.
echo [Caelo] GitHub Update Complete!
echo.
pause
