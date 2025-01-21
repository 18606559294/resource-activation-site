CREATE DATABASE IF NOT EXISTS resource_activation
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE resource_activation;

CREATE TABLE IF NOT EXISTS backups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    backup_id VARCHAR(255) NOT NULL UNIQUE,
    iv TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
