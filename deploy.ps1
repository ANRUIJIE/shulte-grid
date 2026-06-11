# Deploy to GitHub Pages
# Prerequisite: create empty repo at https://github.com/new named shulte-grid
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$token = Read-Host "Enter GitHub Token (github_pat_...)"
if (-not $token) {
  Write-Host "No token provided. Exit."
  exit 1
}

$headers = @{
  Authorization = "Bearer $token"
  "User-Agent"  = "shulte-grid-deploy"
  Accept        = "application/vnd.github+json"
}

Write-Host ""
Write-Host "Checking repository..."
try {
  Invoke-RestMethod -Uri "https://api.github.com/repos/ANRUIJIE/shulte-grid" -Headers $headers | Out-Null
  Write-Host "Repository found."
} catch {
  Write-Host "Error: repo ANRUIJIE/shulte-grid not found."
  Write-Host "Create it at https://github.com/new (do not add README)."
  exit 1
}

Write-Host "Pushing code..."
$env:GIT_TERMINAL_PROMPT = "0"
git push "https://x-access-token:${token}@github.com/ANRUIJIE/shulte-grid.git" main
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Enabling GitHub Pages..."
try {
  $body = '{"build_type":"workflow"}'
  Invoke-RestMethod -Uri "https://api.github.com/repos/ANRUIJIE/shulte-grid/pages" -Headers $headers -Method Post -Body $body -ContentType "application/json" | Out-Null
  Write-Host "Pages enabled."
} catch {
  $msg = $_.ErrorDetails.Message
  if ($msg -match "already exists") {
    Write-Host "Pages already configured."
  } else {
    Write-Host "Pages config note: $msg"
  }
}

Write-Host ""
Write-Host "Done! Site will be live in 1-2 minutes:"
Write-Host "https://ANRUIJIE.github.io/shulte-grid/"
