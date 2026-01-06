@echo off
echo Starting GitHub update...
git add .
git commit -m "Auto update from script"
git push
echo Update complete!
pause
