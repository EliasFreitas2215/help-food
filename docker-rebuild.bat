@echo off
title Rebuild Docker - Portal Validador v32

<<<<<<< HEAD
set "PROJECT_PATH=/mnt/e/Dev/Script-Python/help-food/help-food-v17"

e/Dev/Script-Python/help-food/help-food-v17
=======
set "PROJECT_PATH=/mnt/e/Dev/Script-Python/help-food/help-food-v12"

e/Dev/Script-Python/help-food/help-food-v12
>>>>>>> a9de1a8ad291c92d45129893cd25a285393948d6

echo ==============================
echo REBUILD DOCKER (SEM CACHE)
echo ==============================
echo.

echo Iniciando Docker no Ubuntu...
wsl -d Ubuntu -u root sh -lc "service docker start"

if errorlevel 1 (
    echo ERRO ao iniciar o Docker.
    pause
    exit /b 1
)

echo.
echo Verificando Docker...
wsl -d Ubuntu sh -lc "docker info > /dev/null 2>&1"

if errorlevel 1 (
    echo ERRO: Docker nao respondeu apos a inicializacao.
    pause
    exit /b 1
)

echo.
echo Derrubando containers...
wsl -d Ubuntu sh -lc "cd '%PROJECT_PATH%' && docker compose down"

if errorlevel 1 (
    echo ERRO ao derrubar os containers.
    pause
    exit /b 1
)

echo.
echo Buildando sem cache...
wsl -d Ubuntu sh -lc "cd '%PROJECT_PATH%' && docker compose build --no-cache"

if errorlevel 1 (
    echo ERRO no build.
    pause
    exit /b 1
)

echo.
echo Subindo containers...
wsl -d Ubuntu sh -lc "cd '%PROJECT_PATH%' && docker compose up -d"

if errorlevel 1 (
    echo ERRO ao subir os containers.
    pause
    exit /b 1
)

echo.
echo ==============================
echo PROJETO SUBIU COM SUCESSO
echo ==============================
pause