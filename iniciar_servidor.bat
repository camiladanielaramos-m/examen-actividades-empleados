@echo off
title Servidor Gestor de Actividades - Programacion Web
cd /d "%~dp0"
cls
echo ===============================================================
echo   INICIANDO SERVIDOR - GESTOR DE ACTIVIDADES (PROGRAMACION WEB)
echo ===============================================================
echo.
echo  Alumna: Camila Daniela Ramos
echo  Estructura: Lista Enlazada con persistencia en data/actividades.txt
echo.
echo  Abriendo el navegador en: http://localhost:3000 ...
start http://localhost:3000
echo.
echo  [Presiona Ctrl + C para detener el servidor]
echo ===============================================================
echo.
node server.js
pause
