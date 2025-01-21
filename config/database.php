<?php
class DatabaseConfig {
    private static $config = [
        'host' => 'localhost',
        'dbname' => 'resource_activation',
        'user' => 'root',
        'pass' => '',
        'charset' => 'utf8mb4',
        'max_retries' => 3,
        'retry_delay' => 2,
        'timeout' => 5,
        'pool_size' => 10
    ];

    public static function get($key) {
        return getenv('DB_' . strtoupper($key)) ?? self::$config[$key];
    }
}

class DatabaseLogger {
    public static function log($message, $level = 'info') {
        $date = date('Y-m-d H:i:s');
        $logMessage = "[$date][$level] $message\n";
        error_log($logMessage, 3, __DIR__ . '/../logs/database.log');
    }
}

class DatabasePool {
    private static $connections = [];
    private static $inUse = [];
    
    public static function getConnection() {
        foreach (self::$connections as $key => $conn) {
            if (!isset(self::$inUse[$key]) || !self::$inUse[$key]) {
                self::$inUse[$key] = true;
                return $conn;
            }
        }
        
        if (count(self::$connections) < DatabaseConfig::get('pool_size')) {
            $conn = Database::createConnection();
            $key = count(self::$connections);
            self::$connections[$key] = $conn;
            self::$inUse[$key] = true;
            return $conn;
        }
        
        throw new Exception("No available connections in pool");
    }
    
    public static function releaseConnection($conn) {
        $key = array_search($conn, self::$connections);
        if ($key !== false) {
            self::$inUse[$key] = false;
        }
    }
}

class Database {
    private static $instance = null;

    public static function createConnection() {
        $retries = DatabaseConfig::get('max_retries');
        $delay = DatabaseConfig::get('retry_delay');
        
        while ($retries > 0) {
            try {
                $dsn = sprintf(
                    "mysql:host=%s;dbname=%s;charset=%s",
                    DatabaseConfig::get('host'),
                    DatabaseConfig::get('dbname'),
                    DatabaseConfig::get('charset')
                );
                
                $conn = new PDO(
                    $dsn,
                    DatabaseConfig::get('user'),
                    DatabaseConfig::get('pass'),
                    [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                        PDO::ATTR_TIMEOUT => DatabaseConfig::get('timeout')
                    ]
                );
                
                DatabaseLogger::log("Database connection established successfully");
                return $conn;
                
            } catch (PDOException $e) {
                $retries--;
                DatabaseLogger::log("Connection attempt failed: " . $e->getMessage(), 'error');
                
                if ($retries > 0) {
                    DatabaseLogger::log("Retrying in {$delay} seconds...", 'info');
                    sleep($delay);
                } else {
                    throw new Exception("Database connection failed after multiple attempts: " . $e->getMessage());
                }
            }
        }
    }

    public static function getConnection() {
        try {
            return DatabasePool::getConnection();
        } catch (Exception $e) {
            DatabaseLogger::log("Failed to get connection from pool: " . $e->getMessage(), 'error');
            throw $e;
        }
    }

    public static function releaseConnection($conn) {
        DatabasePool::releaseConnection($conn);
    }
}
