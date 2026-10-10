$env:JAVA_TOOL_OPTIONS = ''
$projectRoot = $PSScriptRoot
Set-Location $projectRoot
$output = & mvn clean package -DskipTests 2>&1
$output | Out-File -FilePath (Join-Path $projectRoot 'build_result.txt') -Encoding utf8
Write-Host "Done. Lines captured: $($output.Count)"
