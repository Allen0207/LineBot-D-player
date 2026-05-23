param(
  [Parameter(Mandatory=$false)]
  [ValidateSet("auto", "manual")]
  [string]$Mode = "auto",

  [Parameter(Mandatory=$false)]
  [string]$Message = ""
)

$repoPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $repoPath

Write-Host "[git-sync] mode: $Mode"
Write-Host "[git-sync] repo: $(Get-Location)"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found in PATH. Please install Git or add it to PATH."
  exit 1
}

Write-Host "[git-sync] pulling origin/main..."
& git pull origin main
if ($LASTEXITCODE -ne 0) {
  Write-Error "git pull failed. Resolve the issue and try again."
  exit 1
}

Write-Host "[git-sync] staging changes..."
& git add .
if ($LASTEXITCODE -ne 0) {
  Write-Error "git add failed."
  exit 1
}

Write-Host "[git-sync] checking for staged changes..."
& git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  if ([string]::IsNullOrWhiteSpace($Message)) {
    $Message = "Auto commit $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }

  Write-Host "[git-sync] committing changes..."
  & git commit -m "$Message"
  if ($LASTEXITCODE -ne 0) {
    Write-Error "git commit failed."
    exit 1
  }
} else {
  Write-Host "[git-sync] no changes to commit."
}

if ($Mode -eq "auto") {
  Write-Host "[git-sync] pushing to origin/main..."
  & git push origin main
  if ($LASTEXITCODE -ne 0) {
    Write-Error "git push failed."
    exit 1
  }
  Write-Host "[git-sync] auto push complete."
} else {
  Write-Host "[git-sync] manual mode active. Run 'git push origin main' when ready."
}
