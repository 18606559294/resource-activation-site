$compress = @{
    Path = "index.html", "resources", "nginx-config.conf"
    DestinationPath = "deploy_package.zip"
    CompressionLevel = "Optimal"
    Force = $true
}
Compress-Archive @compress
Write-Host "打包完成: deploy_package.zip"
