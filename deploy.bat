@echo off
setlocal

echo.
echo ========================================
echo NBHAS Build and Deploy
echo ========================================
echo.

cd /d C:\Users\jbosh\Projects\NBHAS

echo [1/3] Building modular controller...
node .\build\build-controller.js

if errorlevel 1 (
    echo.
    echo ERROR: Controller build failed.
    pause
    exit /b 1
)

echo.
echo [2/3] Copying controller to Canyon theme...
copy /Y ^
"C:\Users\jbosh\Projects\NBHAS\assets\nbhas-assessment.js" ^
"C:\Users\jbosh\Projects\Canyon\assets\nbhas-assessment.js"

if errorlevel 1 (
    echo.
    echo ERROR: Copy to Canyon failed.
    pause
    exit /b 1
)

echo.
echo [3/3] Pushing controller to Shopify...
cd /d C:\Users\jbosh\Projects\Canyon

call shopify theme push ^
  --store 5zp1zg-3a.myshopify.com ^
  --theme 150288597219 ^
  --only assets/nbhas-assessment.js

if errorlevel 1 (
    echo.
    echo ERROR: Shopify push failed.
    pause
    exit /b 1
)

echo.
echo ========================================
echo NBHAS deployment complete
echo ========================================
echo.
echo Hard-refresh the assessment page:
echo Ctrl + Shift + R
echo.

pause
endlocal