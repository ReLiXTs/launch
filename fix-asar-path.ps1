$file = Join-Path $PSScriptRoot 'launcher\src\main.js'
if (-not (Test-Path $file)) { $file = Join-Path $PSScriptRoot 'launcher\main.js' }
$c = [IO.File]::ReadAllText($file)
$new = "path.join(os.tmpdir(), 'kamysh-temp-update.zip')"
$c = [regex]::Replace($c, "path\.join\((?:__dirname|app\.getAppPath\(\)|process\.cwd\(\))\s*,\s*'temp-update\.zip'\)", $new)
$c = [regex]::Replace($c, "(=\s*)'temp-update\.zip'", ('$1' + $new))
if ($c -notmatch "require\('os'\)") { $c = "const os = require('os');`r`n" + $c }
[IO.File]::WriteAllText($file, $c)
Write-Host "PATCHED OK: $file" -ForegroundColor Green