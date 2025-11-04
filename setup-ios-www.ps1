# Setup www directory for iOS app
Write-Host "Setting up www directory for iOS app..." -ForegroundColor Green

# Create www directory if it doesn't exist
if (-not (Test-Path "www")) {
    New-Item -ItemType Directory -Path "www" | Out-Null
    Write-Host "Created www directory" -ForegroundColor Yellow
}

# Copy index.html
if (Test-Path "index.html") {
    Copy-Item "index.html" "www\index.html" -Force
    Write-Host "Copied index.html" -ForegroundColor Yellow
}

# Copy manifest.json
if (Test-Path "manifest.json") {
    Copy-Item "manifest.json" "www\manifest.json" -Force
    Write-Host "Copied manifest.json" -ForegroundColor Yellow
}

# Copy icon files if they exist
$iconFiles = @("favicon.svg", "favicon-16x16.png", "favicon-32x32.png", "favicon-192x192.png", "favicon-512x512.png", "apple-touch-icon.png")
foreach ($file in $iconFiles) {
    if (Test-Path $file) {
        Copy-Item $file "www\$file" -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "Setup complete! Run 'npx cap sync ios' to sync to iOS project." -ForegroundColor Green

