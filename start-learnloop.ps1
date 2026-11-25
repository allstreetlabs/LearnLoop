param([int]$Port = 8830)
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$learnloopNode = if ($nodeCommand) { $nodeCommand.Source } else { $null }
if (-not $learnloopNode) {
    $runtimePackage = Get-AppxPackage -Name 'OpenAI.CodexPrimaryRuntime*' -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($runtimePackage) {
        $candidate = Join-Path $runtimePackage.InstallLocation 'dependencies\node\bin\node.exe'
        if (Test-Path -LiteralPath $candidate) { $learnloopNode = $candidate }
    }
}
if (-not $learnloopNode) { throw 'Node.js 24 is required. Install it from nodejs.org or run in the Codex terminal.' }
$major = & $learnloopNode -p 'process.versions.node.split(".")[0]'
if ($major -ne '24') { throw 'This prototype is tested with Node.js 24.x. Please use that version.' }
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules\ts-fsrs\package.json'))) {
    $bundledPnpm = Join-Path (Split-Path (Split-Path $learnloopNode)) 'node_modules\pnpm\bin\pnpm.cjs'
    $env:NODE_USE_SYSTEM_CA = '1'
    if (Test-Path -LiteralPath $bundledPnpm) {
        & $learnloopNode $bundledPnpm install --frozen-lockfile --registry=https://registry.npmjs.org
    } else {
        $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
        if (-not $npmCommand) { throw 'Install the pinned dependency with npm install or pnpm install --frozen-lockfile, then run this script again.' }
        & $npmCommand.Source install --ignore-scripts
    }
    if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed. No server was started.' }
}
$env:LEARNLOOP_PORT = [string]$Port
Remove-Item Env:\LEARNLOOP_DATA_DIR -ErrorAction SilentlyContinue
Write-Host "Open http://127.0.0.1:$Port and choose Open local library. Stop with Ctrl+C."
& $learnloopNode (Join-Path $PSScriptRoot 'server.mjs')
