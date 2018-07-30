@echo off 
:HELP
echo ������
echo �������ģ�飬ִ�����main
echo ���ģ�飬ִ�����ģ����
echo.
echo �������������Ӷ�����������磺main -p����ѹ��
echo ����ļ���./dist
echo.

:EXE
set /p var="���������"

set "extraArgs=%var:* =%"
if not %extraArgs% == -p set "extraArgs="

set "moduleName=%var: ="^&REM #%

if %moduleName%==main goto MAIN
goto MODULE

:MAIN
echo ���ڴ��modules.dll.js...
webpack --config=webpack.dll.modules.js %extraArgs%
goto EXE

:MODULE
if not exist "dist\%moduleName%" (
    md dist\%moduleName%
)
if exist "src\%moduleName%\index.html" (
    copy "src\%moduleName%\index.html" "dist\%moduleName%\index.html"
)
echo ���ڴ��%moduleName%...
webpack --module %moduleName% %extraArgs%

goto EXE

:END
pause