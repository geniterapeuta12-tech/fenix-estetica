Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$apkPath = Join-Path $baseDir "fenix-apps\FENIX-Estetica.apk"
$zipPath = Join-Path $baseDir "fenix-apps\FENIX-Estetica-Windows.zip"
$newIndex = Join-Path $baseDir "index.html"

# 1. Update APK
$apk = [System.IO.Compression.ZipFile]::Open($apkPath, [System.IO.Compression.ZipArchiveMode]::Update)
$apkEntry = $apk.GetEntry("assets/www/index.html")
if ($null -ne $apkEntry) { $apkEntry.Delete() }
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($apk, $newIndex, "assets/www/index.html")
$apk.Dispose()
Write-Host "APK atualizado com sucesso!"

# 2. Update Windows ZIP
$winZip = [System.IO.Compression.ZipFile]::Open($zipPath, [System.IO.Compression.ZipArchiveMode]::Update)
$winEntry = $winZip.GetEntry("resources/app/index.html")
if ($null -ne $winEntry) { $winEntry.Delete() }
[System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($winZip, $newIndex, "resources/app/index.html")
$winZip.Dispose()
Write-Host "Windows ZIP atualizado com sucesso!"

# 3. Calculate Checksums
$apkHash = (Get-FileHash $apkPath -Algorithm SHA256).Hash.ToLower()
$zipHash = (Get-FileHash $zipPath -Algorithm SHA256).Hash.ToLower()
Write-Host "Novo Hash APK: $apkHash"
Write-Host "Novo Hash ZIP: $zipHash"

# 4. Update checksums-sha256.txt
$chkPath = Join-Path $baseDir "fenix-apps\checksums-sha256.txt"
$chkContent = @"
# Fênix Estética — checksums SHA-256 — R131 (v1.7.5) — 15/10/2026
# Confira depois de baixar:  certutil -hashfile ARQUIVO SHA256   (Windows)
$apkHash  FENIX-Estetica.apk           (Android · vc86 · v1.7.5 — Reconexão Nuvem & Restauração Login/Sync R131)
$zipHash  FENIX-Estetica-Windows.zip   (Windows · v1.7.5 — idem)
dd3eb4bbb62b2d25c584bf27aa74ec5c4b58c27513b6d1a165874e20c5109ccd  Fenix-Center.apk             (Center Android · vc16 · v2.4.0 — CONGELADO)
dde2189485204406684fecbbb21cdaab8940e06020eb65fbc29d38e641805745  Fenix-Center-Windows.zip     (Center Windows · v2.4.0 — CONGELADO)
# Histórico: Estética vc85/1.7.4 na v1.7.4 · vc84/1.7.3 na v1.7.3 · vc83/1.7.2 na v1.7.2 · vc82/1.7.1 na v1.7.1 · vc81/1.7.0 na v1.7.0 · vc80/1.6.99 na v1.6.99
"@
[System.IO.File]::WriteAllText($chkPath, $chkContent, [System.Text.Encoding]::UTF8)
Write-Host "checksums-sha256.txt atualizado com sucesso!"
