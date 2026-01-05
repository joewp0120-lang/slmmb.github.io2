@echo off
echo Starting website update...

:: Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH.
    echo Please install Git from https://git-scm.com/downloads
    pause
    exit /b
)

:: Add all changes
echo Adding changes...
git add .

:: Commit changes with a timestamp
echo Committing changes...
set "timestamp=%date% %time%"
git commit -m "Update website content: %timestamp%"

:: Push to GitHub
echo Pushing to GitHub...
git push

if %errorlevel% equ 0 (
    echo ===========================================
    echo Success! Website update has been pushed.
    echo Changes should be live on slmmb.com in 1-2 minutes.
    echo ===========================================
) else (
    echo ===========================================
    echo Error: Failed to push to GitHub.
    echo Please check your internet connection or git configuration.
    echo ===========================================
)

pause
