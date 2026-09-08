@echo off
chcp 65001 >nul
echo.
echo ========================================
echo   GENERATE ICON
echo ========================================
echo.

echo Creating placeholder icon...

cd launcher\assets

REM Create a simple 256x256 PNG using PowerShell
powershell -Command "Add-Type -AssemblyName System.Drawing; $bmp = New-Object System.Drawing.Bitmap(256,256); $g = [System.Drawing.Graphics]::FromImage($bmp); $g.Clear([System.Drawing.Color]::FromArgb(76,175,80)); $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White); $font = New-Object System.Drawing.Font('Arial',120,[System.Drawing.FontStyle]::Bold); $g.DrawString('K',$font,$brush,50,50); $bmp.Save('icon.png'); $bmp.Dispose(); $g.Dispose(); Write-Host 'Icon created!'"

cd ..\..

echo.
echo Icon created at launcher\assets\icon.png
pause
