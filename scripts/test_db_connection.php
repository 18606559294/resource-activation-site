<?php
require __DIR__ . '/../config/database.php';

try {
    $conn = Database::getConnection();
    echo "Database connection successful\n";
} catch (Exception $e) {
    echo "Connection failed: " . $e->getMessage() . "\n";
}
