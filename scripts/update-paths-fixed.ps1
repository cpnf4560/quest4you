# Script para atualizar paths do Quest4You para domínio independente
# quest4you.pt

$projectPath = "G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1"

Write-Host "`n🔧 Atualizando Quest4You para domínio independente (quest4you.pt)..." -ForegroundColor Cyan
Write-Host "=" * 60

# Update index.html
Write-Host "`n📄 Atualizando index.html..." -ForegroundColor Yellow
$indexPath = Join-Path $projectPath "index.html"
if (Test-Path $indexPath) {
    $content = Get-Content $indexPath -Raw -Encoding UTF8
    $content = $content -replace '/quest4you/favicon\.ico', './favicon.ico'
    $content = $content -replace '/quest4you/css/', './css/'
    $content = $content -replace '/quest4you/assets/', './assets/'
    $content = $content -replace '/quest4you/pages/', './pages/'
    $content = $content -replace '/quest4you/js/', './js/'
    $content = $content -replace 'href="/quest4you/"', 'href="./"'
    $content | Set-Content $indexPath -Encoding UTF8 -NoNewline
    Write-Host "  ✅ index.html atualizado" -ForegroundColor Green
}

# Update pages/*.html
Write-Host "`n📄 Atualizando páginas..." -ForegroundColor Yellow
$pagesPath = Join-Path $projectPath "pages"
if (Test-Path $pagesPath) {
    Get-ChildItem -Path $pagesPath -Filter "*.html" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        $content = $content -replace '/quest4you/favicon\.ico', '../favicon.ico'
        $content = $content -replace '/quest4you/css/', '../css/'
        $content = $content -replace '/quest4you/assets/', '../assets/'
        $content = $content -replace '/quest4you/pages/([a-z\-]+)\.html', './$1.html'
        $content = $content -replace '/quest4you/js/', '../js/'
        $content = $content -replace 'href="/quest4you/"', 'href="../index.html"'
        $content | Set-Content $_.FullName -Encoding UTF8 -NoNewline
        Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
    }
}

# Update JS files
Write-Host "`n📄 Atualizando JavaScript..." -ForegroundColor Yellow
$jsPath = Join-Path $projectPath "js"
if (Test-Path $jsPath) {
    # app.js
    $appJsPath = Join-Path $jsPath "app.js"
    if (Test-Path $appJsPath) {
        $content = Get-Content $appJsPath -Raw -Encoding UTF8
        $content = $content -replace '/quest4you/pages/', './pages/'
        $content = $content -replace 'pages/([a-z\-]+)\.html', 'pages/$1.html'
        $content | Set-Content $appJsPath -Encoding UTF8 -NoNewline
        Write-Host "  ✅ app.js" -ForegroundColor Green
    }
    
    # quiz.js
    $quizJsPath = Join-Path $jsPath "quiz.js"
    if (Test-Path $quizJsPath) {
        $content = Get-Content $quizJsPath -Raw -Encoding UTF8
        $content = $content -replace '/quest4you/data/', '../data/'
        $content = $content -replace '/quest4you/', '../'
        $content | Set-Content $quizJsPath -Encoding UTF8 -NoNewline
        Write-Host "  ✅ quiz.js" -ForegroundColor Green
    }
}

Write-Host "`n" + ("=" * 60)
Write-Host "✅ Quest4You atualizado com sucesso!" -ForegroundColor Green
Write-Host "`n📍 Localização: $projectPath" -ForegroundColor Cyan
Write-Host "🌐 Domínio: quest4you.pt" -ForegroundColor Cyan
Write-Host "`nPróximos passos:"
Write-Host "  1. cd '$projectPath'"
Write-Host "  2. npx vercel --prod"
Write-Host "  3. Configurar domínio quest4you.pt no Vercel"
