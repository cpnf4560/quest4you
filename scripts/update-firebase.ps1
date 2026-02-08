# Script para atualizar Firebase Client SDK para a versão mais recente
# Quest4You - Firebase Update Script

$oldVersion = "9.22.0"
$newVersion = "10.14.1"  # Última versão estável de Firebase 10.x (compatível com compat)

Write-Host "🔥 Atualizando Firebase de $oldVersion para $newVersion..." -ForegroundColor Cyan

# Lista de ficheiros a atualizar
$files = @(
    "index.html",
    "pages\auth.html",
    "pages\quiz.html",
    "pages\profile.html",
    "pages\smart-match.html",
    "admin\index.html"
)

$totalFiles = 0
$updatedFiles = 0

foreach ($file in $files) {
    $filePath = Join-Path $PSScriptRoot $file
    
    if (Test-Path $filePath) {
        $totalFiles++
        Write-Host "📝 Processando: $file" -ForegroundColor Yellow
        
        # Ler conteúdo do ficheiro
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Contar ocorrências antes
        $countBefore = ([regex]::Matches($content, $oldVersion)).Count
        
        # Substituir versão antiga pela nova
        $newContent = $content -replace $oldVersion, $newVersion
        
        # Contar ocorrências depois
        $countAfter = ([regex]::Matches($newContent, $oldVersion)).Count
        $replaced = $countBefore - $countAfter
        
        if ($replaced -gt 0) {
            # Guardar ficheiro com encoding UTF-8
            [System.IO.File]::WriteAllText($filePath, $newContent, [System.Text.UTF8Encoding]::new($false))
            Write-Host "   ✅ Atualizado: $replaced referências" -ForegroundColor Green
            $updatedFiles++
        } else {
            Write-Host "   ⚠️  Nenhuma atualização necessária" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ❌ Ficheiro não encontrado: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Concluído!" -ForegroundColor Green
Write-Host "   Total de ficheiros processados: $totalFiles" -ForegroundColor Cyan
Write-Host "   Ficheiros atualizados: $updatedFiles" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Testa o site localmente (Live Server)" -ForegroundColor White
Write-Host "   2. Verifica se o login e autenticação funcionam" -ForegroundColor White
Write-Host "   3. Faz commit: git add . && git commit -m 'Update: Firebase SDK para v$newVersion' && git push" -ForegroundColor White
Write-Host ""
