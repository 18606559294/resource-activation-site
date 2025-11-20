$ServerIP = "82.157.181.51"
$User = "root"
$LocalFile = "deploy_package.zip"
$RemotePath = "/tmp/deploy_package.zip"
$WebRoot = "/var/www/trae-promo"

# 1. Check local file
if (-not (Test-Path $LocalFile)) {
    Write-Error "Error: $LocalFile not found. Please run package.ps1 first."
    exit 1
}

Write-Host "=== Starting Deployment to OpenCloudOS 8 ($ServerIP) ==="

# 2. Upload file
Write-Host "`n[1/3] Uploading deployment package..."
# Use -o StrictHostKeyChecking=no to avoid host key verification failure
scp -o StrictHostKeyChecking=no $LocalFile ${User}@${ServerIP}:${RemotePath}

if ($LASTEXITCODE -ne 0) {
    Write-Error "Upload failed! If password is required, please run this script manually in a terminal."
    exit 1
}

# 3. Execute commands on server
Write-Host "`n[2/3] Configuring server environment..."

# Build remote command string (single line to avoid syntax issues)
$cmd = "yum install -y nginx unzip; mkdir -p $WebRoot; unzip -o $RemotePath -d $WebRoot; mv -f $WebRoot/nginx-config.conf /etc/nginx/conf.d/ndtool.cn.conf; systemctl enable nginx; systemctl restart nginx; rm -f $RemotePath; echo '=== Deployment Success! ==='"

# Execute SSH command
ssh -o StrictHostKeyChecking=no ${User}@${ServerIP} $cmd

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[3/3] Deployment Complete! Please visit http://ndtool.cn to verify."
}
else {
    Write-Error "`n[3/3] Server execution failed. Please check server logs."
}
