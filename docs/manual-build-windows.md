# Build Manual no Windows (Sem Docker/Linux)

Este guia mostra como empacotar o CS HUD manualmente no Windows, sem usar Docker ou Linux.

## Pré-requisitos

```powershell
# Instalar dependências globais
npm install -g @yao-pkg/pkg esbuild
npm install -g @electron-forge/cli

# Verificar instalações
pkg --version
esbuild --version
electron-forge --version
```

## Passo a Passo

### 1. Preparar o Ambiente

```powershell
# Criar diretório de build
New-Item -ItemType Directory -Force -Path "build-manual"
Set-Location "build-manual"

# Copiar arquivo GSI
Copy-Item "../gamestate_integration_drweissbrot_hud.cfg" -Destination "."
```

### 2. Instalar Dependências

```powershell
# Voltar para root e instalar dependências
Set-Location ".."
npm install

# Gerar licenças
npm run postinstall
```

### 3. Build do Servidor Principal

```powershell
# Bundle do código do servidor
npx esbuild src/server/index.js --bundle --platform=node --outfile=build-manual/cs-hud.js

# Criar executáveis com PKG
npx pkg --compress Brotli --no-bytecode --public --public-packages "*" --targets node22-win-x64,node22-linux-x64 --output build-manual/cs-hud build-manual/cs-hud.js
```

### 4. Build das Apps Electron

```powershell
# Entrar no diretório do Electron
Set-Location "src/electron"
npm install

# Build Overlay
node write-package-json.mjs cs-hud-overlay hud.js
npx electron-forge package --platform=win32
npx electron-forge package --platform=linux

# Build Config
node write-package-json.mjs cs-hud-config config.js  
npx electron-forge package --platform=win32
npx electron-forge package --platform=linux

# Build Radar
node write-package-json.mjs cs-hud-radar radar.js
npx electron-forge package --platform=win32
npx electron-forge package --platform=linux

# Mover arquivos para build-manual
Move-Item "out/*" "../../build-manual/"

# Voltar para root
Set-Location "../.."
```

### 5. Renomear e Organizar Arquivos

```powershell
Set-Location "build-manual"

# Renomear executáveis principais
Rename-Item "cs-hud-win.exe" "cs-hud-server-win.exe"
Rename-Item "cs-hud-linux" "cs-hud-server-linux"

# Criar arquivos ZIP para Windows
Compress-Archive -Path "cs-hud-overlay-win32-x64" -DestinationPath "cs-hud-overlay-win32-x64.zip"
Compress-Archive -Path "cs-hud-config-win32-x64" -DestinationPath "cs-hud-config-win32-x64.zip"
Compress-Archive -Path "cs-hud-radar-win32-x64" -DestinationPath "cs-hud-radar-win32-x64.zip"

# Para Linux (se tiver WSL ou ferramentas Unix)
# tar -czf cs-hud-overlay-linux-x64.tar.gz cs-hud-overlay-linux-x64
# tar -czf cs-hud-config-linux-x64.tar.gz cs-hud-config-linux-x64
# tar -czf cs-hud-radar-linux-x64.tar.gz cs-hud-radar-linux-x64
```

### 6. Limpeza

```powershell
# Remover diretórios temporários
Remove-Item -Recurse -Force "cs-hud-overlay-win32-x64", "cs-hud-config-win32-x64", "cs-hud-radar-win32-x64"
Remove-Item -Recurse -Force "cs-hud-overlay-linux-x64", "cs-hud-config-linux-x64", "cs-hud-radar-linux-x64"
Remove-Item "cs-hud.js"
```

## Script Automatizado

Você pode criar um arquivo `build-windows.ps1` com todo o processo:

```powershell
# build-windows.ps1
param(
    [switch]$SkipInstall
)

Write-Host "=== CS HUD Build Manual Windows ===" -ForegroundColor Green

# Verificar dependências
$tools = @("pkg", "esbuild", "electron-forge")
foreach ($tool in $tools) {
    try {
        & $tool --version | Out-Null
        Write-Host "✓ $tool instalado" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ $tool não encontrado. Execute: npm install -g @yao-pkg/pkg esbuild @electron-forge/cli" -ForegroundColor Red
        exit 1
    }
}

# Preparar ambiente
Write-Host "Preparando ambiente..." -ForegroundColor Yellow
if (Test-Path "build-manual") { Remove-Item -Recurse -Force "build-manual" }
New-Item -ItemType Directory -Force -Path "build-manual" | Out-Null
Copy-Item "gamestate_integration_drweissbrot_hud.cfg" -Destination "build-manual/"

# Instalar dependências
if (-not $SkipInstall) {
    Write-Host "Instalando dependências..." -ForegroundColor Yellow
    npm install
    npm run postinstall
}

# Build servidor
Write-Host "Building servidor..." -ForegroundColor Yellow
npx esbuild src/server/index.js --bundle --platform=node --outfile=build-manual/cs-hud.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx pkg --compress Brotli --no-bytecode --public --public-packages "*" --targets node22-win-x64,node22-linux-x64 --output build-manual/cs-hud build-manual/cs-hud.js
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

# Build Electron apps
Write-Host "Building Electron apps..." -ForegroundColor Yellow
Set-Location "src/electron"
npm install

$apps = @(
    @("cs-hud-overlay", "hud.js"),
    @("cs-hud-config", "config.js"),
    @("cs-hud-radar", "radar.js")
)

foreach ($app in $apps) {
    Write-Host "Building $($app[0])..." -ForegroundColor Cyan
    node write-package-json.mjs $app[0] $app[1]
    npx electron-forge package --platform=win32
    npx electron-forge package --platform=linux
}

Move-Item "out/*" "../../build-manual/" -Force
Set-Location "../.."

# Finalizar
Write-Host "Finalizando build..." -ForegroundColor Yellow
Set-Location "build-manual"

Rename-Item "cs-hud-win.exe" "cs-hud-server-win.exe" -ErrorAction SilentlyContinue
Rename-Item "cs-hud-linux" "cs-hud-server-linux" -ErrorAction SilentlyContinue

# Criar ZIPs
$zipApps = @("cs-hud-overlay-win32-x64", "cs-hud-config-win32-x64", "cs-hud-radar-win32-x64")
foreach ($zipApp in $zipApps) {
    if (Test-Path $zipApp) {
        Write-Host "Criando $zipApp.zip..." -ForegroundColor Cyan
        Compress-Archive -Path $zipApp -DestinationPath "$zipApp.zip" -Force
        Remove-Item -Recurse -Force $zipApp
    }
}

# Limpeza
Remove-Item "cs-hud.js" -ErrorAction SilentlyContinue
$linuxDirs = @("cs-hud-overlay-linux-x64", "cs-hud-config-linux-x64", "cs-hud-radar-linux-x64")
foreach ($dir in $linuxDirs) {
    if (Test-Path $dir) { Remove-Item -Recurse -Force $dir }
}

Set-Location ".."

Write-Host "=== Build Concluído ===" -ForegroundColor Green
Write-Host "Arquivos gerados em: build-manual/" -ForegroundColor Green
Get-ChildItem "build-manual/" | Format-Table Name, Length
```

## Como Usar o Script

```powershell
# Dar permissão de execução (uma vez)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Executar build
./build-windows.ps1

# Ou pular instalação de deps se já estiver instalado
./build-windows.ps1 -SkipInstall
```

## Arquivos Gerados

Após o build, você terá na pasta `build-manual/`:

- `cs-hud-server-win.exe` - Servidor principal (Windows)
- `cs-hud-server-linux` - Servidor principal (Linux)
- `cs-hud-overlay-win32-x64.zip` - Overlay para Windows
- `cs-hud-config-win32-x64.zip` - Interface de config para Windows
- `cs-hud-radar-win32-x64.zip` - Radar standalone para Windows
- `gamestate_integration_drweissbrot_hud.cfg` - Arquivo de configuração GSI

## Solução de Problemas

### PKG não encontra arquivos
Se o PKG não conseguir incluir alguns assets, verifique o arquivo `build/pkg.json` e ajuste os caminhos.

### Electron Forge falha
```powershell
# Limpar cache do Electron
Remove-Item -Recurse -Force "$env:USERPROFILE/.electron"
Remove-Item -Recurse -Force "src/electron/node_modules"
```

### Permissões do PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## Resultado Final

Com este processo, você terá os mesmos arquivos que seriam gerados pelo build Docker, mas criados diretamente no Windows sem necessidade de containers ou Linux. 