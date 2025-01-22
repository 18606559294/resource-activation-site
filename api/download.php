<?php
session_start();

// 加载配置
$config = json_decode(file_get_contents('../config/paths.json'), true);
$tools = json_decode(file_get_contents('../config/tools.json'), true);

// 工具箱根目录
define('TOOLS_ROOT', $config['tools_root']);

// 下载限速（KB/s）
define('DOWNLOAD_SPEED_LIMIT', 1024); // 1MB/s

// 并发控制
define('MAX_CONCURRENT_DOWNLOADS', 5); // 最大并发下载数
$lockFile = TOOLS_ROOT . '/download.lock';

// 获取并发下载数
function getConcurrentDownloads() {
    global $lockFile;
    if (!file_exists($lockFile)) {
        return 0;
    }
    $count = file_get_contents($lockFile);
    return intval($count);
}

// 增加并发下载数
function incrementConcurrentDownloads() {
    global $lockFile;
    $count = getConcurrentDownloads() + 1;
    file_put_contents($lockFile, $count);
}

// 减少并发下载数
function decrementConcurrentDownloads() {
    global $lockFile;
    $count = max(0, getConcurrentDownloads() - 1);
    file_put_contents($lockFile, $count);
}

// 安全检查函数
function validateRequest($toolId) {
    // 检查请求方法
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        return [false, '无效的请求方法'];
    }

    // 验证工具ID
    $tools = json_decode(file_get_contents('../config/tools.json'), true)['tools'];
    $validTool = false;
    foreach ($tools as $tool) {
        if ($tool['id'] === $toolId) {
            $validTool = true;
            break;
        }
    }
    if (!$validTool) {
        return [false, '无效的工具ID'];
    }

    // 检查下载频率限制
    if (isset($_SESSION['last_download'])) {
        $timeDiff = time() - $_SESSION['last_download'];
        if ($timeDiff < 60) { // 60秒内只能下载一次
            return [false, '请等待' . (60 - $timeDiff) . '秒后再试'];
        }
    }

    return [true, ''];
}

// 生成下载令牌
function generateDownloadToken($toolId) {
    $token = bin2hex(random_bytes(32));
    $_SESSION['download_token'] = [
        'token' => $token,
        'tool_id' => $toolId,
        'expires' => time() + 300 // 5分钟有效期
    ];
    return $token;
}

// 验证下载令牌
function validateDownloadToken($token, $toolId) {
    if (!isset($_SESSION['download_token'])) {
        return false;
    }

    $downloadToken = $_SESSION['download_token'];
    if ($downloadToken['token'] !== $token ||
        $downloadToken['tool_id'] !== $toolId ||
        $downloadToken['expires'] < time()) {
        return false;
    }

    return true;
}

// 获取文件MIME类型
function getMimeType($filename) {
    $mime_types = array(
        'exe' => 'application/octet-stream',
        'zip' => 'application/zip',
        'rar' => 'application/x-rar-compressed',
        '7z' => 'application/x-7z-compressed',
        'iso' => 'application/x-iso9660-image'
    );
    
    $ext = strtolower(pathinfo($filename, PATHINFO_EXTENSION));
    return isset($mime_types[$ext]) ? $mime_types[$ext] : 'application/octet-stream';
}

// 处理下载请求
if (isset($_POST['action']) && $_POST['action'] === 'request_download') {
    $toolId = $_POST['tool_id'] ?? '';
    
    // 验证请求
    [$valid, $message] = validateRequest($toolId);
    if (!$valid) {
        echo json_encode(['success' => false, 'message' => $message]);
        exit;
    }

    // 生成下载令牌
    $token = generateDownloadToken($toolId);
    $_SESSION['last_download'] = time();

    echo json_encode([
        'success' => true,
        'token' => $token,
        'expires' => 300 // 5分钟过期
    ]);
    exit;
}

// 处理实际下载
if (isset($_GET['token']) && isset($_GET['tool_id'])) {
    $token = $_GET['token'];
    $toolId = $_GET['tool_id'];

    // 验证令牌
    if (!validateDownloadToken($token, $toolId)) {
        header('HTTP/1.1 403 Forbidden');
        echo '下载链接已过期或无效';
        exit;
    }

    // 查找工具信息
    $toolInfo = null;
    foreach ($tools['tools'] as $tool) {
        if ($tool['id'] === $toolId) {
            $toolInfo = $tool;
            break;
        }
    }

    if (!$toolInfo) {
        header('HTTP/1.1 404 Not Found');
        echo '工具不存在';
        exit;
    }

    // 构建文件路径
    $filePath = TOOLS_ROOT . '/' . $toolInfo['path'];
    
    // 检查文件是否存在
    if (!file_exists($filePath)) {
        header('HTTP/1.1 404 Not Found');
        echo '文件不存在';
        exit;
    }

    // 检查并发下载数
    if (getConcurrentDownloads() >= MAX_CONCURRENT_DOWNLOADS) {
        header('HTTP/1.1 429 Too Many Requests');
        echo '服务器繁忙，请稍后再试';
        exit;
    }
    incrementConcurrentDownloads();

    // 记录下载日志
    $logEntry = [
        'timestamp' => time(),
        'tool_id' => $toolId,
        'file_size' => filesize($filePath),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT']
    ];
    
    // 将日志写入文件
    $logFile = TOOLS_ROOT . '/downloads.log';
    file_put_contents($logFile, json_encode($logEntry) . PHP_EOL, FILE_APPEND);

    // 清除下载令牌
    unset($_SESSION['download_token']);

    // 计算文件校验码
    $fileHash = md5_file($filePath);
    
    // 获取文件MIME类型
    $mimeType = getMimeType($filePath);
    
    // 添加校验头
    header('X-File-Hash: ' . $fileHash);

    // 发送文件
    header('Content-Type: ' . $mimeType);
    header('Content-Disposition: attachment; filename="' . basename($filePath) . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Pragma: no-cache');
    
    // 读取文件并发送
    $handle = fopen($filePath, 'rb');
    if ($handle === false) {
        header('HTTP/1.1 500 Internal Server Error');
        echo '无法读取文件';
        exit;
    }

    // 分块读取并发送文件
    while (!feof($handle)) {
        echo fread($handle, 8192);
        flush();
    }
    
    fclose($handle);
    decrementConcurrentDownloads();
    exit;
}

// 无效请求
header('HTTP/1.1 400 Bad Request');
echo '无效的请求';
?>
