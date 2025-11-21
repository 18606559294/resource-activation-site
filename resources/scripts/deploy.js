import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} Config
 * @property {string} branch
 * @property {string} buildCommand
 * @property {string} distDir
 * @property {string} deployBranch
 */

// 配置
/** @type {Config} */
const config = {
  branch: 'main',  // 部署分支
  buildCommand: 'npm run build',  // 构建命令
  distDir: 'dist',  // 构建输出目录
  deployBranch: 'gh-pages'  // 部署分支
};

/**
 * 执行命令并打印输出
 * @param {string} command 要执行的命令
 */
function exec(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    process.exit(1);
  }
}

// 检查部署锁
function checkDeployLock() {
  const lockFile = '.deploy.lock';
  if (fs.existsSync(lockFile)) {
    console.error('❌ Deployment is already in progress. Please wait for the current deployment to finish.');
    process.exit(1);
  }
  fs.writeFileSync(lockFile, process.pid.toString());
}

// 清理部署锁
function cleanupDeployLock() {
  const lockFile = '.deploy.lock';
  if (fs.existsSync(lockFile)) {
    fs.unlinkSync(lockFile);
  }
}

// 主函数
async function deploy() {
  console.log('🚀 Starting deployment process...');

  // 检查部署锁
  checkDeployLock();

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
  } finally {
    // 清理部署锁
    cleanupDeployLock();
  }
}

// 执行部署
deploy().catch(console.error);
