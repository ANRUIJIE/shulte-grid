# 部署到 GitHub Pages（需先在 GitHub 创建空仓库 shulte-grid）
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$token = Read-Host "请输入 GitHub Token（github_pat_...）"
if (-not $token) { Write-Host "未输入 Token，退出"; exit 1 }

$headers = @{
  Authorization = "Bearer $token"
  "User-Agent"  = "shulte-grid-deploy"
  Accept        = "application/vnd.github+json"
}

Write-Host "`n检查仓库..."
try {
  Invoke-RestMethod -Uri "https://api.github.com/repos/ANRUIJIE/shulte-grid" -Headers $headers | Out-Null
  Write-Host "仓库已存在"
} catch {
  Write-Host "错误：仓库 ANRUIJIE/shulte-grid 不存在"
  Write-Host "请先到 https://github.com/new 创建空仓库 shulte-grid（不要勾选 README）"
  exit 1
}

Write-Host "推送代码..."
$env:GIT_TERMINAL_PROMPT = "0"
git push "https://x-access-token:${token}@github.com/ANRUIJIE/shulte-grid.git" main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "启用 GitHub Pages..."
try {
  $body = '{"build_type":"workflow"}'
  Invoke-RestMethod -Uri "https://api.github.com/repos/ANRUIJIE/shulte-grid/pages" -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
  Write-Host "Pages 已启用"
} catch {
  $msg = $_.ErrorDetails.Message
  if ($msg -match "already exists") {
    Write-Host "Pages 已配置过"
  } else {
    Write-Host "Pages 配置: $msg"
  }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  部署完成！约 1-2 分钟后可访问："
Write-Host "  https://ANRUIJIE.github.io/shulte-grid/"
Write-Host "  电脑打开后扫码，微信即可进入练习"
Write-Host "=========================================="
