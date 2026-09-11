@echo off
chcp 65001 >nul 2>&1
title BDE Dauphine - Mise a jour du site
color 0A

echo.
echo  ================================================
echo   BDE Dauphine -- Mise a jour du site depuis CSV
echo  ================================================
echo.
echo  Lecture des fichiers csv/ en cours...
echo.

where py >nul 2>&1
if %errorlevel% equ 0 ( py sync.py & goto :check )
where python >nul 2>&1
if %errorlevel% equ 0 ( python sync.py & goto :check )
where python3 >nul 2>&1
if %errorlevel% equ 0 ( python3 sync.py & goto :check )

echo.
echo  ERREUR : Python non trouve.
echo  Installer Python : https://www.python.org/downloads/
echo  Cocher "Add Python to PATH"
echo.
pause
exit /b 1

:check
if %errorlevel% neq 0 (
    echo.
    echo  Une erreur s'est produite.
    echo.
    pause
    exit /b 1
)
echo.
echo  Les fichiers data/*.js sont a jour.
echo  Tu peux deployer sur Cloudflare.
echo.
pause
