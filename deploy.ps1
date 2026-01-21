# Script de Deploy Quest4You
# quest4you.pt

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "  🚀 DEPLOY QUEST4YOU - quest4you.pt" -ForegroundColor Green
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

$projectPath = "G:\O meu disco\Formação JAVA - Projetos\Quest4You_v1"
cd $projectPath

Write-Host "📂 Diretório: $projectPath" -ForegroundColor Yellow

# Verificar se Vercel está instalado
Write-Host "`n🔍 Verificando Vercel CLI..." -ForegroundColor Cyan
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI não encontrado. A instalar..." -ForegroundColor Yellow
    npm install -g vercel
}

# Fazer deploy
Write-Host "`n🚀 Fazendo deploy para Vercel..." -ForegroundColor Green
Write-Host "    (Isto pode demorar alguns minutos)" -ForegroundColor Gray

npx vercel --prod --yes

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host ("=" * 60) + "`n" -ForegroundColor Cyan

Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "  1. Copiar o URL do Vercel que apareceu acima"
Write-Host "  2. Ir para: https://vercel.com/dashboard"
Write-Host "  3. Adicionar domínio: quest4you.pt"
Write-Host "  4. Configurar DNS na Amen (ver CONFIGURACAO_DNS_AMEN.md)"
Write-Host ""
Write-Host "📖 Guia completo: .\CONFIGURACAO_DNS_AMEN.md" -ForegroundColor Cyan
Write-Host ""
