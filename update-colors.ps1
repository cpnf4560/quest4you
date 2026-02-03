# Script para atualizar cores em ficheiros CSS
$files = @('css\profile.css', 'css\explorar.css', 'css\quiz.css', 'admin\admin.css')

foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw -Encoding UTF8
        $content = $content -replace '#e53935', '#8B4A5E'
        $content = $content -replace '#c2185b', '#5C4B6B'
        $content = $content -replace '#d32f2f', '#6B3A4E'
        $content = $content -replace '#ff9800', '#C4A962'
        $content = $content -replace '#fdd835', '#C4A962'
        $content = $content -replace '#4caf50', '#5D8A66'
        $content = $content -replace '#f44336', '#A65D73'
        $content = $content -replace '#e91e63', '#A65D73'
        $content = $content -replace '#b71c1c', '#6B3A4E'
        $content = $content -replace '#00bcd4', '#4A8B8B'
        Set-Content $file -Value $content -NoNewline -Encoding UTF8
        Write-Host "Atualizado: $file"
    }
}
Write-Host "Concluido!"
