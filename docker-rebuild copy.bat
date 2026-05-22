@echo off
echo ===============================
echo REBUILD + LOGS
echo ===============================

<<<<<<< HEAD
set PROJECT_PATH=/mnt/e/Dev/Script-Python/help-food/help-food-v17
=======
set PROJECT_PATH=/mnt/e/Dev/Script-Python/help-food/help-food-v12
>>>>>>> a9de1a8ad291c92d45129893cd25a285393948d6

wsl -d Ubuntu sh -lc "cd %PROJECT_PATH% && docker compose down && docker compose build --no-cache && docker compose up"

pause