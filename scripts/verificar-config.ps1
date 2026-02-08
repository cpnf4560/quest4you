# Script de Verificação - Quest4You
# Verifica configuração e status do projeto

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Quest4You - Verificação de Deploy" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Verificar se estamos no diretório correto
Write-Host "[1/6] Verificando diretório..." -ForegroundColor Yellow
$currentDir = Get-Location
if (Test-Path ".\index.html") {
    Write-Host "✅ Diretório correto!" -ForegroundColor Green
} else {
    Write-Host "❌ ERRO: index.html não encontrado!" -ForegroundColor Red
    Write-Host "   Execute este script na pasta do projeto." -ForegroundColor Red
    exit
}

# 2. Verificar estrutura de arquivos
Write-Host "`n[2/6] Verificando arquivos essenciais..." -ForegroundColor Yellow
$requiredFiles = @(
    "index.html",
    "vercel.json",
    "firebase.json",
    "js\firebase-config.js",
    "js\app.js",
    "css\main.css"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path ".\$file") {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (FALTA!)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if ($allFilesExist) {
    Write-Host "✅ Todos os arquivos essenciais presentes!" -ForegroundColor Green
}

# 3. Verificar configuração do Firebase
Write-Host "`n[3/6] Verificando configuração Firebase..." -ForegroundColor Yellow
$firebaseConfig = Get-Content ".\js\firebase-config.js" -Raw
if ($firebaseConfig -match "quest4couple") {
    Write-Host "✅ Firebase configurado (quest4couple)" -ForegroundColor Green
} else {
    Write-Host "⚠️  Configuração Firebase não encontrada" -ForegroundColor Yellow
}

# 4. Verificar se Git está instalado
Write-Host "`n[4/6] Verificando Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✅ $gitVersion" -ForegroundColor Green
    
    # Verificar status do repositório
    $gitStatus = git status 2>&1
    if ($gitStatus -match "On branch") {
        Write-Host "✅ Repositório Git inicializado" -ForegroundColor Green
        
        # Verificar remote
        $gitRemote = git remote -v 2>&1
        if ($gitRemote -match "github.com") {
            Write-Host "✅ Remote GitHub configurado" -ForegroundColor Green
            Write-Host "   $($gitRemote -split "`n" | Select-Object -First 1)" -ForegroundColor Gray
        } else {
            Write-Host "⚠️  Remote GitHub não configurado" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Git não instalado ou não no PATH" -ForegroundColor Yellow
}

# 5. Verificar se Node.js está instalado
Write-Host "`n[5/6] Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Node.js não instalado" -ForegroundColor Yellow
    Write-Host "   Não é obrigatório, mas útil para CLI do Vercel" -ForegroundColor Gray
}

# 6. Testar conectividade
Write-Host "`n[6/6] Testando conectividade..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://vercel.com" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Conexão com Vercel OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Não foi possível conectar ao Vercel" -ForegroundColor Yellow
}

try {
    $response = Invoke-WebRequest -Uri "https://firebase.google.com" -TimeoutSec 5 -UseBasicParsing
    Write-Host "✅ Conexão com Firebase OK" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Não foi possível conectar ao Firebase" -ForegroundColor Yellow
}

# Verificar domínio quest4you.pt
Write-Host "`n[EXTRA] Testando domínio quest4you.pt..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://quest4you.pt" -TimeoutSec 10 -UseBasicParsing
    Write-Host "✅ Site quest4you.pt está ONLINE!" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Site quest4you.pt NÃO está acessível" -ForegroundColor Red
    Write-Host "   Erro: $($_.Exception.Message)" -ForegroundColor Gray
}

# Resumo e próximos passos
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  PRÓXIMOS PASSOS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1️⃣  Importar projeto no Vercel:" -ForegroundColor White
Write-Host "   → https://vercel.com/new" -ForegroundColor Gray
Write-Host "   → Conectar com GitHub" -ForegroundColor Gray
Write-Host "   → Importar repositório Quest4You_v1`n" -ForegroundColor Gray

Write-Host "2️⃣  Adicionar domínio no Vercel:" -ForegroundColor White
Write-Host "   → Settings → Domains" -ForegroundColor Gray
Write-Host "   → Adicionar: quest4you.pt`n" -ForegroundColor Gray

Write-Host "3️⃣  Configurar DNS na Amen:" -ForegroundColor White
Write-Host "   → A Record: @ → 76.76.21.21" -ForegroundColor Gray
Write-Host "   → CNAME: www → cname.vercel-dns.com`n" -ForegroundColor Gray

Write-Host "4️⃣  Autorizar domínio no Firebase:" -ForegroundColor White
Write-Host "   → https://console.firebase.google.com" -ForegroundColor Gray
Write-Host "   → Authentication → Settings → Authorized domains" -ForegroundColor Gray
Write-Host "   → Adicionar: quest4you.pt`n" -ForegroundColor Gray

Write-Host "📄 Guia completo: CONFIGURAR_VERCEL_GITHUB.md`n" -ForegroundColor Cyan

Write-Host "========================================`n" -ForegroundColor Cyan

# Perguntar se quer abrir o guia
$openGuide = Read-Host "Deseja abrir o guia completo? (S/N)"
if ($openGuide -eq "S" -or $openGuide -eq "s") {
    Start-Process "CONFIGURAR_VERCEL_GITHUB.md"
}

# Perguntar se quer abrir o Vercel
$openVercel = Read-Host "Deseja abrir o Vercel Dashboard? (S/N)"
if ($openVercel -eq "S" -or $openVercel -eq "s") {
    Start-Process "https://vercel.com/dashboard"
}
