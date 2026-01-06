<?php
/**
 * Admin Panel for Product Management
 * Allows editing products displayed in shop.html
 */

// Configure secure session cookie parameters before starting the session
$isSecureRequest = (
    (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
    || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443)
);

session_set_cookie_params([
    'httponly' => true,
    'secure'   => $isSecureRequest,
    'samesite' => 'Strict',
]);
session_start();

// Check if config exists
if (!file_exists(__DIR__ . '/config.php')) {
    header('Location: install.php');
    exit;
}

require_once __DIR__ . '/config.php';

// Shared category definitions
// Note: Import functionality is more flexible and accepts any category string
define('ALLOWED_CATEGORIES', [
    'varaosat' => 'Varaosat',
    'huoltopaketit' => 'Huoltopaketit',
    'nesteet' => 'Öljyt ja nesteet',
    'tyokalut' => 'Työkalut',
    'Korjaamolaitteet' => 'Korjaamolaitteet',
    'Sähkölaitteet' => 'Sähkölaitteet',
    'Työkalut' => 'Työkalut',
    'Tauko-/keittiö' => 'Tauko-/keittiö'
]);

// Load import functions
define('ADMIN_IMPORT_ALLOWED', true);
require_once __DIR__ . '/admin_import.php';

// Database connection
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
} catch (PDOException $e) {
    die('Tietokantayhteys epäonnistui: ' . htmlspecialchars($e->getMessage()));
}

// Ensure image_path column exists and uploads directory is ready
ensureImagePathColumn($pdo);
ensureUploadsDirectory(__DIR__ . '/uploads/products');

// Helper function to escape HTML
function e($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

// Check authentication
$isAuthenticated = isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $username = trim($_POST['username'] ?? '');
    // Simple session-based rate limiting for login attempts
    $maxAttempts = 5;
    $lockoutSeconds = 300; // 5 minutes
    $now = time();

    $lockedUntil = $_SESSION['login_locked_until'] ?? 0;

    if ($lockedUntil > $now) {
        // Too many attempts recently, do not even try to authenticate
        $loginError = 'Liian monta kirjautumisyritystä. Yritä uudelleen myöhemmin.';
    } else {
        // Lockout expired (if there was one)
        if ($lockedUntil > 0 && $lockedUntil <= $now) {
            unset($_SESSION['login_locked_until']);
            $_SESSION['login_attempts'] = 0;
        }

        $username = trim($_POST['username'] ?? '');
        $password = $_POST['password'] ?? '';

        $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password_hash'])) {
            // Successful login resets attempt counter and lockout
            $_SESSION['login_attempts'] = 0;
            unset($_SESSION['login_locked_until']);

            $_SESSION['admin_authenticated'] = true;
            $_SESSION['admin_username'] = $username;
            header('Location: admin.php');
            exit;
        } else {
            // Failed login: increase attempt counter and possibly lock out
            $attempts = $_SESSION['login_attempts'] ?? 0;
            $attempts++;
            $_SESSION['login_attempts'] = $attempts;

            if ($attempts >= $maxAttempts) {
                $_SESSION['login_locked_until'] = $now + $lockoutSeconds;
            }

            $loginError = 'Virheellinen käyttäjätunnus tai salasana';
        }
    }
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// Show login form if not authenticated
if (!$isAuthenticated) {
    ?>
    <!DOCTYPE html>
    <html lang="fi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Kirjaudu sisään - Admin</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .login-container {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 100%;
                padding: 40px;
            }
            
            h1 {
                color: #333;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .form-group {
                margin-bottom: 20px;
            }
            
            label {
                display: block;
                margin-bottom: 8px;
                color: #333;
                font-weight: 500;
            }
            
            input[type="text"],
            input[type="password"] {
                width: 100%;
                padding: 12px;
                border: 2px solid #e0e0e0;
                border-radius: 6px;
                font-size: 14px;
            }
            
            input[type="text"]:focus,
            input[type="password"]:focus {
                outline: none;
                border-color: #667eea;
            }
            
            .submit-btn {
                width: 100%;
                padding: 14px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            }
            
            .error {
                background: #fee;
                color: #c33;
                padding: 12px;
                border-radius: 6px;
                margin-bottom: 20px;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>Admin-kirjautuminen</h1>
            
            <?php if (isset($loginError)): ?>
                <div class="error"><?php echo e($loginError); ?></div>
            <?php endif; ?>
            
            <form method="POST">
                <input type="hidden" name="action" value="login">
                
                <div class="form-group">
                    <label for="username">Käyttäjätunnus</label>
                    <input type="text" id="username" name="username" required autofocus>
                </div>
                
                <div class="form-group">
                    <label for="password">Salasana</label>
                    <input type="password" id="password" name="password" required>
                </div>
                
                <button type="submit" class="submit-btn">Kirjaudu sisään</button>
            </form>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle import preview request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'preview_import') {
    header('Content-Type: application/json');
    
    // Verify CSRF token
    if (!isset($_POST['csrf_token']) || !verifyCSRFToken($_POST['csrf_token'])) {
        echo json_encode(['success' => false, 'error' => 'Virheellinen CSRF-token']);
        exit;
    }
    
    try {
        // Validate JSON file
        if (!isset($_FILES['json_file']) || $_FILES['json_file']['error'] === UPLOAD_ERR_NO_FILE) {
            throw new Exception('JSON-tiedosto puuttuu');
        }
        
        $validation = validateUploadedFile(
            $_FILES['json_file'],
            ['application/json'],
            20 * 1024 * 1024 // 20MB
        );
        
        if (!$validation['success']) {
            throw new Exception($validation['error']);
        }
        
        // Parse JSON
        $jsonContent = file_get_contents($_FILES['json_file']['tmp_name']);
        $parseResult = parseImportJSON($jsonContent);
        
        if (!$parseResult['success']) {
            throw new Exception($parseResult['error']);
        }
        
        // Validate products
        $products = $parseResult['data'];
        $validProducts = [];
        $errors = [];
        
        foreach ($products as $index => $product) {
            $validation = validateProduct($product, $index + 1);
            if ($validation['valid']) {
                $validProducts[] = $product;
            } else {
                $errors = array_merge($errors, $validation['errors']);
            }
        }
        
        echo json_encode([
            'success' => true,
            'products' => $validProducts,
            'total' => count($products),
            'valid' => count($validProducts),
            'invalid' => count($products) - count($validProducts),
            'errors' => $errors
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Handle import execution request
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'execute_import') {
    header('Content-Type: application/json');
    
    // Verify CSRF token
    if (!isset($_POST['csrf_token']) || !verifyCSRFToken($_POST['csrf_token'])) {
        echo json_encode(['success' => false, 'error' => 'Virheellinen CSRF-token']);
        exit;
    }
    
    try {
        // Validate JSON file
        if (!isset($_FILES['json_file']) || $_FILES['json_file']['error'] === UPLOAD_ERR_NO_FILE) {
            throw new Exception('JSON-tiedosto puuttuu');
        }
        
        $validation = validateUploadedFile(
            $_FILES['json_file'],
            ['application/json', 'text/plain'],
            20 * 1024 * 1024 // 20MB
        );
        
        if (!$validation['success']) {
            throw new Exception($validation['error']);
        }
        
        // Parse JSON
        $jsonContent = file_get_contents($_FILES['json_file']['tmp_name']);
        $parseResult = parseImportJSON($jsonContent);
        
        if (!$parseResult['success']) {
            throw new Exception($parseResult['error']);
        }
        
        $products = $parseResult['data'];
        
        // Handle image ZIP if provided
        $imageFiles = [];
        if (isset($_FILES['image_zip']) && $_FILES['image_zip']['error'] !== UPLOAD_ERR_NO_FILE) {
            $validation = validateUploadedFile(
                $_FILES['image_zip'],
                ['application/zip', 'application/x-zip-compressed'],
                200 * 1024 * 1024 // 200MB
            );
            
            if (!$validation['success']) {
                throw new Exception($validation['error']);
            }
            
            // Extract images
            $extractPath = __DIR__ . '/uploads/products';
            $extractResult = extractImagesFromZip($_FILES['image_zip']['tmp_name'], $extractPath);
            
            if (!$extractResult['success']) {
                throw new Exception($extractResult['error']);
            }
            
            $imageFiles = $extractResult['files'];
        }
        
        // Get import options
        $options = [
            'skipDuplicates' => isset($_POST['skip_duplicates']) && $_POST['skip_duplicates'] === '1',
            'updateExisting' => isset($_POST['update_existing']) && $_POST['update_existing'] === '1'
        ];
        
        // Execute import
        $stats = importProducts($pdo, $products, $options, $imageFiles);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}

// Handle AJAX requests
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['ajax'])) {
    header('Content-Type: application/json');
    
    $action = $_POST['action'] ?? '';
    
    try {
        switch ($action) {
            case 'add':
            case 'update':
                // Validate required fields
                $name = trim($_POST['name'] ?? '');
                $category = trim($_POST['category'] ?? '');
                $price = floatval($_POST['price'] ?? 0);
                $unit = trim($_POST['unit'] ?? '');
                $description = trim($_POST['description'] ?? '');
                // Note: 'image' field stores emoji/icon, not file path
                // 'image_path' field (used by import) stores actual image file paths
                $image = trim($_POST['image'] ?? '');
                $badge = trim($_POST['badge'] ?? '');
                
                // Validation
                if (empty($name) || strlen($name) > 255) {
                    throw new Exception('Tuotteen nimi on pakollinen (max 255 merkkiä)');
                }
                // Category validation: Allow any category for flexibility, but limit length
                if (empty($category) || strlen($category) > 50) {
                    throw new Exception('Kategoria on pakollinen (max 50 merkkiä)');
                }
                if ($price < 0 || $price > 999999.99) {
                    throw new Exception('Hinta ei ole kelvollinen');
                }
                if (empty($unit) || strlen($unit) > 20) {
                    throw new Exception('Yksikkö on pakollinen (max 20 merkkiä)');
                }
                if (strlen($image) > 20) {
                    throw new Exception('Kuva on liian pitkä (max 20 merkkiä)');
                }
                if (strlen($badge) > 50) {
                    throw new Exception('Badge on liian pitkä (max 50 merkkiä)');
                }
                
                if ($action === 'add') {
                    $stmt = $pdo->prepare("INSERT INTO products (name, category, price, unit, description, image, badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
                    $stmt->execute([
                        $name,
                        $category,
                        $price,
                        $unit,
                        $description,
                        $image ?: null,
                        $badge ?: null
                    ]);
                    echo json_encode(['success' => true, 'message' => 'Tuote lisätty']);
                } else {
                    $id = intval($_POST['id'] ?? 0);
                    if ($id <= 0) {
                        throw new Exception('Virheellinen tuote-ID');
                    }
                    $stmt = $pdo->prepare("UPDATE products SET name=?, category=?, price=?, unit=?, description=?, image=?, badge=? WHERE id=?");
                    $stmt->execute([
                        $name,
                        $category,
                        $price,
                        $unit,
                        $description,
                        $image ?: null,
                        $badge ?: null,
                        $id
                    ]);
                    echo json_encode(['success' => true, 'message' => 'Tuote päivitetty']);
                }
                break;
                
            case 'delete':
                $id = intval($_POST['id'] ?? 0);
                if ($id <= 0) {
                    throw new Exception('Virheellinen tuote-ID');
                }
                $stmt = $pdo->prepare("DELETE FROM products WHERE id=?");
                $stmt->execute([$id]);
                echo json_encode(['success' => true, 'message' => 'Tuote poistettu']);
                break;
                
            default:
                echo json_encode(['success' => false, 'message' => 'Tuntematon toiminto']);
        }
    } catch (PDOException $e) {
        error_log('Database error in admin.php: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Tietokantavirhe. Yritä uudelleen.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
    exit;
}

// Fetch all products for list view (only columns shown in the table)
$products = $pdo->query("
    SELECT id, name, category, price, unit, badge
    FROM products
    ORDER BY id ASC
")->fetchAll();
?>
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hallintapaneeli - Harjun Raskaskone</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .header h1 {
            font-size: 24px;
        }
        
        .logout-btn {
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
        }
        
        .logout-btn:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .container {
            max-width: 1200px;
            margin: 40px auto;
            padding: 0 20px;
        }
        
        .actions {
            margin-bottom: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
        }
        
        .btn:hover {
            background: #5568d3;
        }
        
        .btn-small {
            padding: 6px 12px;
            font-size: 14px;
            margin: 0 5px;
        }
        
        .btn-danger {
            background: #ef4444;
        }
        
        .btn-danger:hover {
            background: #dc2626;
        }
        
        .products-table {
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: #f9fafb;
            padding: 16px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        
        td {
            padding: 16px;
            border-bottom: 1px solid #e5e7eb;
        }
        
        tr:hover {
            background: #f9fafb;
        }
        
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            align-items: center;
            justify-content: center;
        }
        
        .modal.active {
            display: flex;
        }
        
        .modal-content {
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }
        
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        
        .modal-header h2 {
            font-size: 24px;
        }
        
        .close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #999;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
        }
        
        input[type="text"],
        input[type="number"],
        textarea,
        select {
            width: 100%;
            padding: 10px;
            border: 2px solid #e5e7eb;
            border-radius: 6px;
            font-size: 14px;
        }
        
        input:focus,
        textarea:focus,
        select:focus {
            outline: none;
            border-color: #667eea;
        }
        
        textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 2000;
            animation: slideIn 0.3s;
        }
        
        @keyframes slideIn {
            from { transform: translateX(400px); }
            to { transform: translateX(0); }
        }
        
        .notification.success {
            background: #10b981;
        }
        
        .notification.error {
            background: #ef4444;
        }
        
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
        }
        
        .back-link {
            display: inline-block;
            color: white;
            text-decoration: none;
            margin-top: 10px;
            opacity: 0.9;
        }
        
        .back-link:hover {
            opacity: 1;
        }
        
        /* Import section styles */
        .import-section {
            background: white;
            border-radius: 8px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .import-section h2 {
            font-size: 20px;
            margin-bottom: 20px;
            color: #374151;
        }
        
        .file-input-group {
            margin-bottom: 20px;
        }
        
        .file-input-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #374151;
        }
        
        .file-input-group input[type="file"] {
            width: 100%;
            padding: 10px;
            border: 2px dashed #e5e7eb;
            border-radius: 6px;
            cursor: pointer;
        }
        
        .checkbox-group {
            margin-bottom: 20px;
        }
        
        .checkbox-group label {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            cursor: pointer;
        }
        
        .checkbox-group input[type="checkbox"] {
            margin-right: 8px;
            width: 18px;
            height: 18px;
            cursor: pointer;
        }
        
        .preview-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .preview-table th,
        .preview-table td {
            padding: 10px;
            border: 1px solid #e5e7eb;
            text-align: left;
        }
        
        .preview-table th {
            background: #f9fafb;
            font-weight: 600;
        }
        
        .preview-table tbody tr:hover {
            background: #f9fafb;
        }
        
        .import-stats {
            background: #f0f9ff;
            border-left: 4px solid #3b82f6;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .import-stats h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #1e40af;
        }
        
        .import-stats ul {
            list-style: none;
            padding: 0;
        }
        
        .import-stats li {
            padding: 5px 0;
            color: #374151;
        }
        
        .error-list {
            background: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 16px;
            border-radius: 6px;
            margin: 20px 0;
        }
        
        .error-list h3 {
            font-size: 16px;
            margin-bottom: 10px;
            color: #dc2626;
        }
        
        .error-list ul {
            list-style: disc;
            padding-left: 20px;
        }
        
        .error-list li {
            padding: 3px 0;
            color: #991b1b;
        }
        
        .btn-secondary {
            background: #6b7280;
        }
        
        .btn-secondary:hover {
            background: #4b5563;
        }
        
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-content">
            <div>
                <h1>Tuotteiden hallinta</h1>
                <a href="shop.html" class="back-link">← Takaisin verkkokauppaan</a>
            </div>
            <a href="?logout=1" class="logout-btn">Kirjaudu ulos</a>
        </div>
    </div>
    
    <div class="container">
        <div class="actions">
            <button class="btn" onclick="openModal()">+ Lisää uusi tuote</button>
        </div>
        
        <!-- Import Section -->
        <div class="import-section">
            <h2>📦 Tuo tuotteet (JSON)</h2>
            
            <form id="importForm" enctype="multipart/form-data">
                <input type="hidden" name="csrf_token" value="<?php echo generateCSRFToken(); ?>">
                
                <div class="file-input-group">
                    <label for="json_file">JSON-tiedosto * (max 20MB)</label>
                    <input type="file" id="json_file" name="json_file" accept=".json,application/json" required>
                    <small style="color: #6b7280; display: block; margin-top: 5px;">
                        Formaatti: product_import_v1
                    </small>
                </div>
                
                <div class="file-input-group">
                    <label for="image_zip">Kuvien ZIP-tiedosto (valinnainen, max 200MB)</label>
                    <input type="file" id="image_zip" name="image_zip" accept=".zip,application/zip">
                    <small style="color: #6b7280; display: block; margin-top: 5px;">
                        Sisältää tuotteiden kuvat (jpg, png, webp)
                    </small>
                </div>
                
                <div class="checkbox-group">
                    <label>
                        <input type="checkbox" name="skip_duplicates" id="skip_duplicates" checked>
                        Ohita duplikaatit (nimi + kategoria)
                    </label>
                    <label>
                        <input type="checkbox" name="update_existing" id="update_existing">
                        Päivitä olemassaolevat (nimi + kategoria match)
                    </label>
                </div>
                
                <div style="display: flex; gap: 10px;">
                    <button type="button" class="btn" onclick="previewImport()">Esikatsele</button>
                    <button type="button" class="btn btn-secondary hidden" id="executeImportBtn" onclick="executeImport()">Tuo tuotteet</button>
                </div>
            </form>
            
            <!-- Preview Results -->
            <div id="previewResults" class="hidden"></div>
            
            <!-- Import Results -->
            <div id="importResults" class="hidden"></div>
        </div>
        
        <div class="products-table">
            <?php if (count($products) > 0): ?>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nimi</th>
                            <th>Kategoria</th>
                            <th>Hinta</th>
                            <th>Yksikkö</th>
                            <th>Badge</th>
                            <th>Toiminnot</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td><?php echo e($product['id']); ?></td>
                                <td><?php echo e($product['name']); ?></td>
                                <td><?php echo e($product['category']); ?></td>
                                <td><?php echo number_format($product['price'], 2, ',', ' '); ?> €</td>
                                <td><?php echo e($product['unit']); ?></td>
                                <td><?php echo e($product['badge'] ?: '-'); ?></td>
                                <td>
                                    <button class="btn btn-small edit-product-btn" 
                                        data-product-id="<?php echo e($product['id']); ?>"
                                        data-product-name="<?php echo e($product['name']); ?>"
                                        data-product-category="<?php echo e($product['category']); ?>"
                                        data-product-price="<?php echo e($product['price']); ?>"
                                        data-product-unit="<?php echo e($product['unit']); ?>"
                                        data-product-badge="<?php echo e($product['badge']); ?>"
                                        data-product-image="<?php echo e($product['image']); ?>"
                                        data-product-description="<?php echo e($product['description']); ?>">
                                        Muokkaa
                                    </button>
                                    <button class="btn btn-small btn-danger" onclick="deleteProduct(<?php echo e($product['id']); ?>)">Poista</button>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php else: ?>
                <div class="empty-state">
                    <p>Ei tuotteita. Lisää ensimmäinen tuote.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
    
    <!-- Modal -->
    <div class="modal" id="productModal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="modalTitle">Lisää tuote</h2>
                <button class="close-btn" onclick="closeModal()">&times;</button>
            </div>
            
            <form id="productForm" onsubmit="saveProduct(event)">
                <input type="hidden" id="productId" name="id">
                
                <div class="form-group">
                    <label for="name">Tuotteen nimi *</label>
                    <input type="text" id="name" name="name" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Kategoria *</label>
                        <select id="category" name="category" required>
                            <?php foreach (ALLOWED_CATEGORIES as $value => $label): ?>
                                <option value="<?php echo e($value); ?>"><?php echo e($label); ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="price">Hinta (€) *</label>
                        <input type="number" id="price" name="price" step="0.01" min="0" required>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="unit">Yksikkö *</label>
                        <input type="text" id="unit" name="unit" placeholder="esim. kpl, L, pkt" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="badge">Badge</label>
                        <input type="text" id="badge" name="badge" placeholder="esim. Suosittu, Uusi">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="image">Emoji-kuvake</label>
                    <input type="text" id="image" name="image" placeholder="esim. ⚙️, 🛢️, 📦, 🔧" maxlength="20">
                    <small style="color: #6b7280; display: block; margin-top: 5px;">
                        Huom: Tämä on emoji/ikoni. Varsinaiset kuvatiedostot ladataan tuontiominaisuuden kautta.
                    </small>
                </div>
                
                <div class="form-group">
                    <label for="description">Kuvaus</label>
                    <textarea id="description" name="description"></textarea>
                </div>
                
                <button type="submit" class="btn" style="width: 100%;">Tallenna</button>
            </form>
        </div>
    </div>
    
    <script>
        let editingProductId = null;
        
        function openModal() {
            editingProductId = null;
            document.getElementById('modalTitle').textContent = 'Lisää tuote';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            document.getElementById('productModal').classList.add('active');
        }
        
        function closeModal() {
            document.getElementById('productModal').classList.remove('active');
        }
        
        function editProduct(button) {
            const dataset = button.dataset;
            editingProductId = dataset.productId;
            document.getElementById('modalTitle').textContent = 'Muokkaa tuotetta';
            document.getElementById('productId').value = dataset.productId;
            document.getElementById('name').value = dataset.productName;
            document.getElementById('category').value = dataset.productCategory;
            document.getElementById('price').value = dataset.productPrice;
            document.getElementById('unit').value = dataset.productUnit;
            document.getElementById('badge').value = dataset.productBadge || '';
            document.getElementById('image').value = dataset.productImage || '';
            document.getElementById('description').value = dataset.productDescription || '';
            document.getElementById('productModal').classList.add('active');
        }
        
        // Add event listeners to edit buttons
        document.addEventListener('DOMContentLoaded', function() {
            document.querySelectorAll('.edit-product-btn').forEach(button => {
                button.addEventListener('click', function() {
                    editProduct(this);
                });
            });
        });
        
        function saveProduct(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            formData.append('ajax', '1');
            formData.append('action', editingProductId ? 'update' : 'add');
            
            fetch('admin.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    closeModal();
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                showNotification('Virhe tallennuksessa', 'error');
                console.error(error);
            });
        }
        
        function deleteProduct(id) {
            if (!confirm('Haluatko varmasti poistaa tämän tuotteen?')) {
                return;
            }
            
            const formData = new FormData();
            formData.append('ajax', '1');
            formData.append('action', 'delete');
            formData.append('id', id);
            
            fetch('admin.php', {
                method: 'POST',
                body: formData
            })
            .then(response => {
                // Handle HTTP error statuses explicitly before parsing JSON
                if (!response.ok) {
                    // Encode status in the error message for later inspection
                    throw new Error('HTTP_STATUS_' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(data.message || 'Tuntematon virhe poistettaessa tuotetta', 'error');
                }
            })
            .catch(error => {
                let message;
                
                // Network offline
                if (typeof navigator !== 'undefined' && navigator && navigator.onLine === false) {
                    message = 'Ei verkkoyhteyttä. Tarkista yhteys ja yritä uudelleen.';
                }
                // HTTP status-based errors (from above)
                else if (error && typeof error.message === 'string' && error.message.startsWith('HTTP_STATUS_')) {
                    const status = error.message.substring('HTTP_STATUS_'.length);
                    if (status[0] === '5') {
                        message = 'Palvelimella on tilapäinen virhe (' + status + '). Yritä hetken kuluttua uudelleen.';
                    } else {
                        message = 'Pyyntö epäonnistui (' + status + '). Lataa sivu uudelleen ja yritä uudelleen.';
                    }
                }
                // Fallback for other errors (including JSON parse issues)
                else {
                    message = 'Tuntematon virhe poistamisessa. Yritä uudelleen.';
                }
                
                showNotification(message, 'error');
                console.error('Virhe tuotteen poistamisessa:', error);
            });
        }
        
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
        
        // Close modal on outside click
        document.getElementById('productModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
        
        // Close modal on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
        
        // Import functions
        function previewImport() {
            const form = document.getElementById('importForm');
            const formData = new FormData(form);
            formData.append('action', 'preview_import');
            
            const jsonFile = document.getElementById('json_file').files[0];
            if (!jsonFile) {
                showNotification('Valitse JSON-tiedosto', 'error');
                return;
            }
            
            // Show loading
            const previewResults = document.getElementById('previewResults');
            previewResults.innerHTML = '<p style="padding: 20px; text-align: center;">Ladataan...</p>';
            previewResults.classList.remove('hidden');
            document.getElementById('executeImportBtn').classList.add('hidden');
            document.getElementById('importResults').classList.add('hidden');
            
            fetch('admin.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayPreview(data);
                    if (data.valid > 0) {
                        document.getElementById('executeImportBtn').classList.remove('hidden');
                    }
                } else {
                    // Clear previous content and safely render error message without using innerHTML for user data
                    previewResults.innerHTML = '';

                    const errorList = document.createElement('div');
                    errorList.className = 'error-list';

                    const heading = document.createElement('h3');
                    heading.textContent = '❌ Virhe';

                    const message = document.createElement('p');
                    // Use textContent to avoid interpreting any HTML in error message
                    message.textContent = data.error || 'Tuntematon virhe esikatselussa';

                    errorList.appendChild(heading);
                    errorList.appendChild(message);
                    previewResults.appendChild(errorList);
                }
            })
            .catch(error => {
                showNotification('Virhe esikatselussa: ' + error.message, 'error');
                console.error(error);
                previewResults.classList.add('hidden');
            });
        }
        
        function displayPreview(data) {
            let html = '<div class="import-stats">';
            html += '<h3>📊 Esikatselu</h3>';
            html += '<ul>';
            html += `<li>Yhteensä tuotteita: ${data.total}</li>`;
            html += `<li>Kelvolliset: ${data.valid}</li>`;
            html += `<li>Virheelliset: ${data.invalid}</li>`;
            html += '</ul>';
            html += '</div>';
            
            if (data.errors && data.errors.length > 0) {
                html += '<div class="error-list">';
                html += '<h3>⚠️ Virheet</h3>';
                html += '<ul>';
                data.errors.forEach(error => {
                    html += `<li>${escapeHtml(String(error))}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            if (data.products && data.products.length > 0) {
                html += '<div style="overflow-x: auto;">';
                html += '<table class="preview-table">';
                html += '<thead><tr>';
                html += '<th>Nimi</th><th>Kategoria</th><th>Hinta (€)</th><th>Yksikkö</th>';
                html += '<th>Badge</th><th>Emoji</th><th>Kuvaus</th>';
                html += '</tr></thead>';
                html += '<tbody>';
                
                data.products.slice(0, 10).forEach(product => {
                    html += '<tr>';
                    html += `<td>${escapeHtml(product.name || '')}</td>`;
                    html += `<td>${escapeHtml(product.category || '')}</td>`;
                    html += `<td>${product.price_eur || 0}</td>`;
                    html += `<td>${escapeHtml(product.unit || '')}</td>`;
                    html += `<td>${escapeHtml(product.badge || '-')}</td>`;
                    html += `<td>${escapeHtml(product.emoji || '-')}</td>`;
                    html += `<td>${escapeHtml((product.description || '').substring(0, 50))}${product.description && product.description.length > 50 ? '...' : ''}</td>`;
                    html += '</tr>';
                });
                
                if (data.products.length > 10) {
                    html += `<tr><td colspan="7" style="text-align: center; color: #6b7280;">... ja ${data.products.length - 10} muuta tuotetta</td></tr>`;
                }
                
                html += '</tbody></table>';
                html += '</div>';
            }
            
            document.getElementById('previewResults').innerHTML = html;
        }
        
        function executeImport() {
            if (!confirm('Haluatko varmasti tuoda tuotteet tietokantaan?')) {
                return;
            }
            
            const form = document.getElementById('importForm');
            const formData = new FormData(form);
            formData.append('action', 'execute_import');
            formData.append('skip_duplicates', document.getElementById('skip_duplicates').checked ? '1' : '0');
            formData.append('update_existing', document.getElementById('update_existing').checked ? '1' : '0');
            
            // Show loading
            const importResults = document.getElementById('importResults');
            importResults.innerHTML = '<p style="padding: 20px; text-align: center;">Tuodaan tuotteita...</p>';
            importResults.classList.remove('hidden');
            document.getElementById('executeImportBtn').disabled = true;
            
            fetch('admin.php', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayImportResults(data.stats);
                    showNotification('Tuonti valmis!', 'success');
                    
                    // Reload page after 3 seconds to show new products
                    setTimeout(() => {
                        location.reload();
                    }, 3000);
                } else {
                    importResults.innerHTML = `
                        <div class="error-list">
                            <h3>❌ Virhe</h3>
                            <p>${escapeHtml(data.error)}</p>
                        </div>
                    `;
                    showNotification('Tuonti epäonnistui', 'error');
                    document.getElementById('executeImportBtn').disabled = false;
                }
            })
            .catch(error => {
                showNotification('Virhe tuonnissa: ' + error.message, 'error');
                console.error(error);
                importResults.innerHTML = `
                    <div class="error-list">
                        <h3>❌ Virhe</h3>
                        <p>Tuntematon virhe tuonnissa</p>
                    </div>
                `;
                document.getElementById('executeImportBtn').disabled = false;
            });
        }
        
        function displayImportResults(stats) {
            let html = '<div class="import-stats">';
            html += '<h3>✅ Tuonti valmis</h3>';
            html += '<ul>';
            html += `<li>Luotiin: ${stats.created_count} tuotetta</li>`;
            html += `<li>Päivitettiin: ${stats.updated_count} tuotetta</li>`;
            html += `<li>Ohitettiin: ${stats.skipped_count} tuotetta</li>`;
            html += '</ul>';
            html += '</div>';
            
            if (stats.errors && stats.errors.length > 0) {
                html += '<div class="error-list">';
                html += '<h3>⚠️ Virheet</h3>';
                html += '<ul>';
                stats.errors.forEach(error => {
                    html += `<li>${escapeHtml(error)}</li>`;
                });
                html += '</ul>';
                html += '</div>';
            }
            
            document.getElementById('importResults').innerHTML = html;
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>
