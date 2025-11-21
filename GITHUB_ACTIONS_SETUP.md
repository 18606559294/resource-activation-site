# GitHub Actions 自动部署配置指南

本指南将帮助您配置 GitHub 仓库，实现：
1. **自动部署到腾讯云服务器**：每次推送到 `main` 分支时，自动更新 `ndtool.cn`。
2. **GitHub Pages 托管**：通过 GitHub 免费托管静态网站。

## 1. 配置腾讯云自动部署

为了让 GitHub Actions 能登录您的服务器，您需要设置仓库密钥 (Secrets)。

### 步骤：
1. 打开您的 GitHub 仓库页面：[https://github.com/18606559294/resource-activation-site](https://github.com/18606559294/resource-activation-site)
2. 点击顶部的 **Settings** (设置) 选项卡。
3. 在左侧菜单栏中，找到 **Secrets and variables** -> **Actions**。
4. 点击 **New repository secret** (新建仓库密钥) 按钮，依次添加以下三个密钥：

| Name (名称) | Secret (值) | 说明 |
| :--- | :--- | :--- |
| `TENCENT_HOST` | `82.157.181.51` | 您的服务器 IP 地址 |
| `TENCENT_USERNAME` | `root` | 登录用户名 |
| `TENCENT_PASSWORD` | *(您的服务器 root 密码)* | 登录密码 |

> **注意**：为了安全起见，GitHub 不会显示您输入的密码，只会保存。

配置完成后，下次您推送代码到 `main` 分支时，GitHub Actions 会自动运行 `Deploy to Tencent Cloud` 工作流。

---

## 2. 配置 GitHub Pages

为了直接在 GitHub 上托管网站（作为备用或测试）：

### 步骤：
1. 在仓库页面，点击 **Settings** (设置)。
2. 在左侧菜单栏中，点击 **Pages**。
3. 在 **Build and deployment** (构建与部署) 部分：
    - **Source**: 选择 `GitHub Actions` (因为我们已经创建了 `static.yml` 工作流)。
    - *或者*，如果您想手动配置，选择 `Deploy from a branch`，然后选择 `main` 分支和 `/ (root)` 文件夹，点击 Save。
    - **推荐使用 GitHub Actions 模式**，因为我们已经为您写好了配置文件。

配置完成后，您可以在 Actions 页面查看部署状态。部署成功后，GitHub 会给您一个类似 `https://18606559294.github.io/resource-activation-site/` 的网址。

## 3. 验证部署

### 查看部署日志
1. 点击仓库顶部的 **Actions** 选项卡。
2. 您应该能看到正在运行或已完成的工作流（Workflows）。
    - `Deploy to Tencent Cloud`: 部署到腾讯云。
    - `Deploy to GitHub Pages`: 部署到 GitHub Pages。
3. 如果显示绿色对勾 ✅，说明部署成功。

### 访问网站
- **腾讯云**: [http://ndtool.cn](http://ndtool.cn)
- **GitHub Pages**: (在 Pages 设置页面查看具体链接)
