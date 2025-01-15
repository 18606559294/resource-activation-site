const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const config = {
  branch: 'main',  // 部署分支
  buildCommand: 'npm run build',  // 构建命令
  distDir: 'dist',  // 构建输出目录
  deployBranch: 'gh-pages'  // 部署分支
};

// 执行命令并打印输出
function exec(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

// 主函数
async function deploy() {
  console.log('🚀 Starting deployment process...');

  // 确保我们在正确的分支上
  console.log(`📋 Checking current branch...`);
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  if (currentBranch !== config.branch) {
    console.error(`❌ Must be on ${config.branch} branch. Current branch: ${currentBranch}`);
    process.exit(1);
  }

  // 检查工作目录是否干净
  console.log(`📋 Checking working directory...`);
  const status = execSync('git status --porcelain').toString().trim();
  if (status) {
    console.error('❌ Working directory is not clean. Please commit or stash changes.');
    process.exit(1);
  }

  try {
    // 拉取最新代码
    console.log(`📥 Pulling latest changes...`);
    exec('git pull origin ' + config.branch);

    // 安装依赖
    console.log(`📦 Installing dependencies...`);
    exec('npm ci');

    // 运行测试
    console.log(`🧪 Running tests...`);
    exec('npm test');

    // 构建项目
    console.log(`🔨 Building project...`);
    exec(config.buildCommand);

    // 部署到 GitHub Pages
    console.log(`📤 Deploying to GitHub Pages...`);
    exec(`npx gh-pages -d ${config.distDir} -b ${config.deployBranch} -m "Deploy: $(date)"`);

    console.log('✅ Deployment successful!');
    
    // 可选：发送通知
    // sendNotification('Deployment successful!');

  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

// 执行部署
deploy().catch(console.error);
