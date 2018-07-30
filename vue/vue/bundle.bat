@echo off 
:HELP
echo 帮助：
echo 打包公共模块，执行命令：main
echo 打包模块，执行命令：模块名
echo.
echo 可在命令后面添加额外参数，例如：main -p启用压缩
echo 输出文件在./dist
echo.

:EXE
set /p var="请输入命令："

set "extraArgs=%var:* =%"
if not %extraArgs% == -p set "extraArgs="

set "moduleName=%var: ="^&REM #%

if %moduleName%==main goto MAIN
goto MODULE

:MAIN
echo 正在打包modules.dll.js...
webpack --config=webpack.dll.modules.js %extraArgs%
goto EXE

:MODULE
if not exist "dist\%moduleName%" (
    md dist\%moduleName%
)
if exist "src\%moduleName%\index.html" (
    copy "src\%moduleName%\index.html" "dist\%moduleName%\index.html"
)
echo 正在打包%moduleName%...
webpack --module %moduleName% %extraArgs%

goto EXE

:END
pause