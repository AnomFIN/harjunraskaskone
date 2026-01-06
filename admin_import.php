<?php
/**
 * Product Import Logic
 * Handles JSON product imports with optional image ZIP files
 * 
 * This file contains the core import functionality that can be used
 * from admin.php or potentially from an API endpoint in the future.
 */

// Ensure this file is only included, not accessed directly
if (!defined('ADMIN_IMPORT_ALLOWED')) {
    die('Direct access not allowed');
}

/**
 * Generate a CSRF token for form protection
 * @return string The generated token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 * @param string $token The token to verify
 * @return bool True if valid, false otherwise
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Sanitize text for XSS prevention
 * @param string $text Text to sanitize
 * @return string Sanitized text
 */
function sanitizeText($text) {
    return htmlspecialchars(trim($text), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate uploaded file
 * @param array $file The $_FILES array entry
 * @param array $allowedMimes Allowed MIME types
 * @param int $maxSize Maximum file size in bytes
 * @return array ['success' => bool, 'error' => string]
 */
function validateUploadedFile($file, $allowedMimes, $maxSize) {
    // Check for upload errors
    if ($file['error'] !== UPLOAD_ERR_OK) {
        $errors = [
            UPLOAD_ERR_INI_SIZE => 'Tiedosto ylittää palvelimen maksimikoon',
            UPLOAD_ERR_FORM_SIZE => 'Tiedosto ylittää lomakkeen maksimikoon',
            UPLOAD_ERR_PARTIAL => 'Tiedosto ladattiin vain osittain',
            UPLOAD_ERR_NO_FILE => 'Tiedostoa ei ladattu',
            UPLOAD_ERR_NO_TMP_DIR => 'Väliaikainen hakemisto puuttuu',
            UPLOAD_ERR_CANT_WRITE => 'Tiedoston kirjoitus epäonnistui',
            UPLOAD_ERR_EXTENSION => 'PHP-laajennus pysäytti latauksen'
        ];
        return ['success' => false, 'error' => $errors[$file['error']] ?? 'Tuntematon latausvirhe'];
    }
    
    // Check file size
    if ($file['size'] > $maxSize) {
        return ['success' => false, 'error' => 'Tiedosto on liian suuri (max ' . round($maxSize / 1024 / 1024, 1) . ' MB)'];
    }
    
    // Check MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    if ($finfo === false) {
        // Fileinfo-laajennus ei ole käytettävissä tai sen alustaminen epäonnistui
        return ['success' => false, 'error' => 'Palvelimen tiedostotyyppitarkistus ei ole käytettävissä. Ota yhteys ylläpitoon.'];
    }

    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if ($mimeType === false) {
        return ['success' => false, 'error' => 'Tiedostotyypin tunnistus epäonnistui. Yritä uudelleen tai ota yhteys ylläpitoon.'];
    }
    
    if (!in_array($mimeType, $allowedMimes)) {
        return ['success' => false, 'error' => 'Virheellinen tiedostotyyppi'];
    }
    
    return ['success' => true];
}

/**
 * Parse and validate JSON import file
 * @param string $jsonContent The JSON content
 * @return array ['success' => bool, 'data' => array, 'error' => string]
 */
function parseImportJSON($jsonContent) {
    // Explicitly limit JSON nesting depth for security and resource control
    $data = json_decode($jsonContent, true, 512);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['success' => false, 'error' => 'JSON-virhe: ' . json_last_error_msg()];
    }
    
    if (!isset($data['format']) || $data['format'] !== 'product_import_v1') {
        return ['success' => false, 'error' => 'Virheellinen JSON-formaatti. Vaaditaan format: "product_import_v1"'];
    }
    
    if (!isset($data['products']) || !is_array($data['products'])) {
        return ['success' => false, 'error' => 'JSON ei sisällä "products"-taulukkoa'];
    }
    
    return ['success' => true, 'data' => $data['products']];
}

/**
 * Validate a single product
 * Note: Category validation is intentionally flexible to allow new categories via import.
 * This is different from the UI form which restricts to predefined categories.
 * @param array $product Product data
 * @param int $index Product index (for error messages)
 * @return array ['valid' => bool, 'errors' => array]
 */
function validateProduct($product, $index) {
    $errors = [];
    
    // Required fields
    if (empty($product['name'])) {
        $errors[] = "Rivi $index: Tuotteen nimi puuttuu";
    } elseif (strlen($product['name']) > 255) {
        $errors[] = "Rivi $index: Tuotteen nimi on liian pitkä (max 255 merkkiä)";
    }
    
    // Category: flexible validation - any non-empty string up to 50 chars is allowed
    // This allows importing products with new categories not yet in the UI dropdown
    if (empty($product['category'])) {
        $errors[] = "Rivi $index: Kategoria puuttuu";
    } elseif (strlen($product['category']) > 50) {
        $errors[] = "Rivi $index: Kategoria on liian pitkä (max 50 merkkiä)";
    }
    
    if (!isset($product['price_eur']) || !is_numeric($product['price_eur'])) {
        $errors[] = "Rivi $index: Hinta puuttuu tai on virheellinen";
    } elseif ($product['price_eur'] < 0 || $product['price_eur'] > 999999.99) {
        $errors[] = "Rivi $index: Hinta ei ole kelvollinen (0-999999.99)";
    }
    
    if (empty($product['unit'])) {
        $errors[] = "Rivi $index: Yksikkö puuttuu";
    } elseif (strlen($product['unit']) > 20) {
        $errors[] = "Rivi $index: Yksikkö on liian pitkä (max 20 merkkiä)";
    }
    
    // Optional fields with length limits
    if (isset($product['badge']) && strlen($product['badge']) > 50) {
        $errors[] = "Rivi $index: Badge on liian pitkä (max 50 merkkiä)";
    }
    
    if (isset($product['emoji']) && strlen($product['emoji']) > 20) {
        $errors[] = "Rivi $index: Emoji on liian pitkä (max 20 merkkiä)";
    }
    
    return ['valid' => empty($errors), 'errors' => $errors];
}

/**
 * Extract images from ZIP file
 * @param string $zipPath Path to ZIP file
 * @param string $extractPath Path to extract images to
 * @return array ['success' => bool, 'files' => array, 'error' => string]
 */
function extractImagesFromZip($zipPath, $extractPath) {
    if (!extension_loaded('zip')) {
        return ['success' => false, 'error' => 'ZIP-laajennus ei ole käytössä'];
    }
    
    $zip = new ZipArchive();
    $result = $zip->open($zipPath);
    
    if ($result !== true) {
        return ['success' => false, 'error' => 'ZIP-tiedoston avaaminen epäonnistui'];
    }
    
    $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    $extractedFiles = [];
    
    // Create extraction directory if it doesn't exist
    if (!is_dir($extractPath)) {
        if (!mkdir($extractPath, 0755, true)) {
            $zip->close();
            return ['success' => false, 'error' => 'Hakemiston luominen epäonnistui'];
        }
    }
    
    // Extract only image files
    for ($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        $fileInfo = pathinfo($filename);
        
        // Skip directories and non-image files
        if (substr($filename, -1) === '/' || !isset($fileInfo['extension'])) {
            continue;
        }
        
        $ext = strtolower($fileInfo['extension']);
        if (!in_array($ext, $allowedExtensions)) {
            continue;
        }
        
        // Extract file
        $basename = basename($filename);
        
        // Validate that basename doesn't contain directory traversal sequences
        // and that the resolved path is still within the extraction directory
        if (strpos($basename, '..') !== false || strpos($basename, '/') !== false || strpos($basename, '\\') !== false) {
            continue; // Skip files with suspicious names
        }
        
        $targetPath = $extractPath . '/' . $basename;
        
        // Verify the real path is still within the extraction directory after resolution
        $realExtractPath = realpath($extractPath);
        if ($realExtractPath !== false) {
            $realTargetDir = realpath(dirname($targetPath));
            if ($realTargetDir === false || strpos($realTargetDir, $realExtractPath) !== 0) {
                continue; // Skip if path validation fails
            }
        }
        
        // Avoid silently overwriting existing files by generating a unique filename on collision
        if (file_exists($targetPath)) {
            $nameWithoutExt = pathinfo($basename, PATHINFO_FILENAME);
            $uniqueBasename = $nameWithoutExt . '_' . uniqid('', true) . '.' . $ext;
            $targetPath = $extractPath . '/' . $uniqueBasename;
            $basename = $uniqueBasename; // Update basename to match the actual saved file
        }
        
        if (copy("zip://" . $zipPath . "#" . $filename, $targetPath)) {
            // Use the original basename as the key so callers can map by the name in the ZIP,
            // but store the actual path (which may use a unique filename) as the value.
            $extractedFiles[$basename] = $targetPath;
        }
    }
    
    $zip->close();
    
    return ['success' => true, 'files' => $extractedFiles];
}

/**
 * Import products to database
 * @param PDO $pdo Database connection
 * @param array $products Product data
 * @param array $options Import options (skipDuplicates, updateExisting)
 * @param array $imageFiles Extracted image files map
 * @return array Import statistics
 */
function importProducts($pdo, $products, $options, $imageFiles = []) {
    $stats = [
        'created_count' => 0,
        'updated_count' => 0,
        'skipped_count' => 0,
        'errors' => []
    ];
    
    try {
        // Start transaction
        $pdo->beginTransaction();
        
        // Prepare statements
        $checkStmt = $pdo->prepare("SELECT id FROM products WHERE name = ? AND category = ? LIMIT 1");
        $insertStmt = $pdo->prepare("
            INSERT INTO products (name, category, price, unit, badge, emoji, description, image_path) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        $updateStmt = $pdo->prepare("
            UPDATE products 
            SET price = ?, unit = ?, badge = ?, emoji = ?, description = ?, image_path = ?
            WHERE id = ?
        ");
        
        foreach ($products as $index => $product) {
            $rowNum = $index + 1;
            
            // Validate product
            $validation = validateProduct($product, $rowNum);
            if (!$validation['valid']) {
                $stats['errors'] = array_merge($stats['errors'], $validation['errors']);
                $stats['skipped_count']++;
                continue;
            }
            
            // Sanitize data
            $name = sanitizeText($product['name']);
            $category = sanitizeText($product['category']);
            $price = floatval($product['price_eur']);
            $unit = sanitizeText($product['unit']);
            $badge = isset($product['badge']) && !empty($product['badge']) ? sanitizeText($product['badge']) : null;
            $emoji = isset($product['emoji']) && !empty($product['emoji']) ? sanitizeText($product['emoji']) : null;
            $description = isset($product['description']) && !empty($product['description']) ? sanitizeText($product['description']) : null;
            
            // Handle image
            $imagePath = null;
            if (isset($product['image']) && !empty($product['image'])) {
                $imageFilename = basename($product['image']);
                if (isset($imageFiles[$imageFilename])) {
                    $imagePath = 'uploads/products/' . $imageFilename;
                } else {
                    $stats['errors'][] = "Rivi $rowNum: Kuva '$imageFilename' ei löytynyt ZIP-tiedostosta";
                }
            }
            
            // Check if product exists
            $checkStmt->execute([$name, $category]);
            $existing = $checkStmt->fetch();
            
            if ($existing) {
                if ($options['skipDuplicates'] && !$options['updateExisting']) {
                    $stats['skipped_count']++;
                } elseif ($options['updateExisting']) {
                    $updateStmt->execute([
                        $price,
                        $unit,
                        $badge,
                        $emoji,
                        $description,
                        $imagePath,
                        $existing['id']
                    ]);
                    $stats['updated_count']++;
                } else {
                    $stats['skipped_count']++;
                }
            } else {
                // Insert new product
                $insertStmt->execute([
                    $name,
                    $category,
                    $price,
                    $unit,
                    $badge,
                    $emoji,
                    $description,
                    $imagePath
                ]);
                $stats['created_count']++;
            }
        }
        
        // Commit transaction
        $pdo->commit();
        
    } catch (Exception $e) {
        // Rollback on error
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $stats['errors'][] = 'Tietokantavirhe: ' . $e->getMessage();
    }
    
    return $stats;
}

/**
 * Ensure database has image_path column
 * Uses portable SQL that works across different database systems
 * @param PDO $pdo Database connection
 * @return bool Success status
 */
function ensureImagePathColumn($pdo) {
    try {
        // Portable way to check if column exists by attempting to select it
        // This works across MySQL, PostgreSQL, SQLite, etc.
        try {
            $stmt = $pdo->query("SELECT image_path FROM products LIMIT 1");
            // If we got here, column exists
            return true;
        } catch (PDOException $e) {
            // Column doesn't exist, try to add it
            // Note: ALTER TABLE syntax is generally portable, but column positioning (AFTER) is MySQL-specific
            // For maximum portability, we omit the AFTER clause
            $pdo->exec("ALTER TABLE products ADD COLUMN image_path VARCHAR(255)");
            return true;
        }
    } catch (PDOException $e) {
        error_log('Failed to ensure image_path column: ' . $e->getMessage());
        return false;
    }
}

/**
 * Create uploads directory if it doesn't exist
 * @param string $path Directory path
 * @return bool Success status
 */
function ensureUploadsDirectory($path) {
    if (!is_dir($path)) {
        return mkdir($path, 0755, true);
    }
    return true;
}
