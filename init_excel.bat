@echo off
chcp 65001 >nul 2>&1
title BDE Dauphine - Génération des CSV
color 0A

echo.
echo  ================================================
echo   BDE Dauphine -- Génération des fichiers CSV
echo  ================================================
echo.
echo  Lecture des fichiers data/*.js en cours...
echo.

where py >nul 2>&1
if %errorlevel% equ 0 ( py sync_init.py & goto :check )
where python >nul 2>&1
if %errorlevel% equ 0 ( python sync_init.py & goto :check )
where python3 >nul 2>&1
if %errorlevel% equ 0 ( python3 sync_init.py & goto :check )

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
echo  Les fichiers CSV sont dans le dossier csv/
echo  Ouvre-les dans Excel ou Google Sheets.
echo.
pause
