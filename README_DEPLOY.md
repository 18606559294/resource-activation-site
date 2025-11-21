# 部署指南

本指南将帮助您将 Trae 推广网站（包含资源激活工具）部署到腾讯云服务器（82.157.181.51）。

## 1. 准备工作

在当前目录下，我们已经为您准备好了以下文件：
- `index.html`: 新的 Trae 推广主页（包含详细对比和资源入口）。
- `resources/`: 资源激活工具站的所有文件。
- `nginx-config.conf`: Nginx 配置文件。

## 2. 打包文件

请运行目录下的 `package.ps1` 脚本（如果我没为您自动运行的话），它会生成一个 `deploy_package.zip` 压缩包。

## 3. 上传到服务器

使用 SCP 或 SFTP 工具将 `deploy_package.zip` 上传到服务器。

**命令行示例 (请在本地终端运行):**
```bash
# 假设您的 SSH 用户名是 root
scp deploy_package.zip root@82.157.181.51:/tmp/
```

## 4. 服务器端操作

登录到服务器：
```bash
ssh root@82.157.181.51
```

在服务器上执行以下命令：

```bash
# 1. 安装 Nginx (如果尚未安装)
# Ubuntu/Debian
apt-get update
apt-get install -y nginx unzip

# CentOS
# yum install -y nginx unzip

# 2. 解压文件
mkdir -p /var/www/trae-promo
unzip -o /tmp/deploy_package.zip -d /var/www/trae-promo

# 3. 配置 Nginx
cp /var/www/trae-promo/nginx-config.conf /etc/nginx/sites-available/ndtool.cn.conf
ln -sf /etc/nginx/sites-available/ndtool.cn.conf /etc/nginx/sites-enabled/

# 4. 检查配置并重启
nginx -t
systemctl restart nginx
```

## 5. 域名解析

请确保您的域名 `ndtool.cn` 已经在阿里云后台解析到了 IP `82.157.181.51`。

## 6. 验证

访问 http://ndtool.cn 查看效果。
- 主页应该是 Trae 的推广页。
- 点击导航栏的“资源激活工具”或底部的链接，应跳转到资源激活站。

## 7. 自动部署 (推荐)

我们已经为您配置了 GitHub Actions。请查看 [GITHUB_ACTIONS_SETUP.md](GITHUB_ACTIONS_SETUP.md) 了解如何配置密钥以启用自动部署。
一旦配置完成，您只需将代码推送到 GitHub，服务器就会自动更新。

