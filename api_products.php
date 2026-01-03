<?php
/**
 * API Endpoint for Shop Products
 * Returns products from MySQL database as JSON
 */

header('Content-Type: application/json');

// Check if config exists
if (!file_exists(__DIR__ . '/config.php')) {
    echo json_encode([
        'success' => false,
        'error' => 'Database not configured. Please run install.php first.'
    ]);
    exit;
}

require_once __DIR__ . '/config.php';

try {
    $pdo = new PDO(
        "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
        DB_USER,
        DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
        ]
    );
    
    // Fetch all active products
    $stmt = $pdo->query("SELECT id, name, category, price, unit, description, image, badge FROM products ORDER BY id ASC");
    $products = $stmt->fetchAll();
    
    // Format products for JavaScript
    $formattedProducts = array_map(function($product) {
        return [
            'id' => (int)$product['id'],
            'name' => $product['name'],
            'category' => $product['category'],
            'price' => (float)$product['price'],
            'unit' => $product['unit'],
            'description' => $product['description'],
            'image' => $product['image'] ?: '📦',
            'badge' => $product['badge']
        ];
    }, $products);
    
    echo json_encode([
        'success' => true,
        'products' => $formattedProducts
    ]);
    
} catch (PDOException $e) {
    error_log('Database error in api_products.php: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Tietokantavirhe. Yritä myöhemmin uudelleen.'
    ]);
}
