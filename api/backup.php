<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';

class BackupAPI {
    private $db;
    private $backupDir = __DIR__ . '/../backups/';
    private $maxBackups = 30; // 最多保留30个备份

    public function __construct() {
        $this->db = Database::getConnection();
        $this->ensureBackupDirectory();
    }

    // 确保备份目录存在
    private function ensureBackupDirectory() {
        if (!file_exists($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }

    // 创建备份
    public function createBackup($data) {
        try {
            // 验证数据
            if (!$this->validateBackupData($data)) {
                throw new Exception('Invalid backup data');
            }

            // 生成备份文件名
            $backupId = uniqid('backup_', true);
            $backupFile = $this->backupDir . $backupId . '.json';

            // 保存备份
            file_put_contents($backupFile, json_encode($data));

            // 清理旧备份
            $this->cleanupOldBackups();

            return [
                'status' => 'success',
                'backupId' => $backupId,
                'timestamp' => date('c')
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    // 获取备份
    public function getBackup($backupId) {
        try {
            $backupFile = $this->backupDir . $backupId . '.json';

            if (!file_exists($backupFile)) {
                throw new Exception('Backup not found');
            }

            $data = file_get_contents($backupFile);
            return [
                'status' => 'success',
                'data' => json_decode($data, true)
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    // 删除备份
    public function deleteBackup($backupId) {
        try {
            $backupFile = $this->backupDir . $backupId . '.json';

            if (!file_exists($backupFile)) {
                throw new Exception('Backup not found');
            }

            unlink($backupFile);
            return [
                'status' => 'success',
                'message' => 'Backup deleted'
            ];
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    // 验证备份数据
    private function validateBackupData($data) {
        $requiredFields = ['iv', 'data'];
        foreach ($requiredFields as $field) {
            if (!isset($data[$field])) {
                return false;
            }
        }
        return true;
    }

    // 清理旧备份
    private function cleanupOldBackups() {
        $backups = glob($this->backupDir . '*.json');
        if (count($backups) > $this->maxBackups) {
            // 按时间排序
            usort($backups, function($a, $b) {
                return filemtime($a) - filemtime($b);
            });

            // 删除最旧的备份
            $toDelete = count($backups) - $this->maxBackups;
            for ($i = 0; $i < $toDelete; $i++) {
                unlink($backups[$i]);
            }
        }
    }
}

// 处理请求
$backupAPI = new BackupAPI();

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        echo json_encode($backupAPI->createBackup($data));
        break;
        
    case 'GET':
        if (isset($_GET['backupId'])) {
            echo json_encode($backupAPI->getBackup($_GET['backupId']));
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing backupId']);
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['backupId'])) {
            echo json_encode($backupAPI->deleteBackup($_GET['backupId']));
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing backupId']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
        break;
}
