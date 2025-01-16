@echo off
echo Deploying website to IIS...

rem Stop Default Web Site
%systemroot%\system32\inetsrv\appcmd stop site "Default Web Site"

rem Create backup of existing wwwroot (if needed)
if exist C:\inetpub\wwwroot\backup\ (
    echo Backup folder already exists
) else (
    mkdir C:\inetpub\wwwroot\backup
)

rem Move existing content to backup
move /Y C:\inetpub\wwwroot\* C:\inetpub\wwwroot\backup\ > nul 2>&1

rem Copy new website files
xcopy /E /I /Y "%~dp0*" "C:\inetpub\wwwroot\"

rem Set proper permissions
icacls "C:\inetpub\wwwroot" /grant "IIS_IUSRS:(OI)(CI)(RX)" /grant "IUSR:(OI)(CI)(RX)" /grant "Everyone:(OI)(CI)(RX)" /T

rem Start Default Web Site
%systemroot%\system32\inetsrv\appcmd start site "Default Web Site"

echo Deployment completed!
pause
