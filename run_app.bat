@echo off
cd /d "%~dp0"
call mvn clean package -DskipTests > build.log 2>&1
echo Build exit code: %ERRORLEVEL% >> build.log
if exist target\*.jar (
    for %%f in (target\*.jar) do (
        echo Starting %%f >> build.log
        java -jar %%f >> run.log 2>&1
    )
) else (
    echo No jar found >> build.log
)
