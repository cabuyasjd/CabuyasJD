@echo off
setlocal
set DIRNAME=%~dp0
set GRADLE_HOME=%DIRNAME%\.gradle\wrapper\dists\gradle-8.1.1-bin\
set GRADLE_WRAPPER_JAR=%DIRNAME%\gradle\wrapper\gradle-wrapper.jar
set GRADLE_USER_HOME=%DIRNAME%\.gradle

if not exist "%GRADLE_WRAPPER_JAR%" (
  echo Gradle wrapper jar not found. Run `gradle wrapper` or download gradle-wrapper.jar.
  exit /b 1
)

java -jar "%GRADLE_WRAPPER_JAR%" %*
