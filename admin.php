<?php
/**
 * Admin Panel for Product Management
 * Allows editing products displayed in shop.html
 */

session_start();

// Check if config exists
if (!file_exists(__DIR__ . '/config.php')) {
    header('Location: install.php');
    exit;
}

require_once __DIR__ . '/config.php';

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

// Helper function to escape HTML
function e($text) {
    return htmlspecialchars($text, ENT_QUOTES, 'UTF-8');
}

// Check authentication
$isAuthenticated = isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated'] === true;

// Handle login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT password_hash FROM admin_users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['admin_authenticated'] = true;
        session_regenerate_id(true);
        $_SESSION['admin_username'] = $username;
        header('Location: admin.php');
        exit;
    } else {
        $loginError = 'Virheellinen käyttäjätunnus tai salasana';
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
                $image = trim($_POST['image'] ?? '');
                $badge = trim($_POST['badge'] ?? '');
                
                // Validation
                $allowedCategories = ['varaosat', 'huoltopaketit', 'nesteet', 'tyokalut'];
                
                if (empty($name) || strlen($name) > 255) {
                    throw new Exception('Tuotteen nimi on pakollinen (max 255 merkkiä)');
                }
                if (!in_array($category, $allowedCategories)) {
                    throw new Exception('Virheellinen kategoria');
                }
                if ($price < 0 || $price > 999999.99) {
                    throw new Exception('Hinta ei ole kelvollinen');
                }
                if (empty($unit) || strlen($unit) > 20) {
                    throw new Exception('Yksikkö on pakollinen (max 20 merkkiä)');
                }
                if (strlen($image) > 10) {
                    throw new Exception('Kuva on liian pitkä (max 10 merkkiä)');
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
                            <option value="varaosat">Varaosat</option>
                            <option value="huoltopaketit">Huoltopaketit</option>
                            <option value="nesteet">Öljyt ja nesteet</option>
                            <option value="tyokalut">Työkalut</option>
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
                    <input type="text" id="image" name="image" placeholder="esim. ⚙️, 🛢️, 📦, 🔧" maxlength="10">
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
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showNotification(data.message, 'success');
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                showNotification('Virhe poistamisessa', 'error');
                console.error(error);
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
    </script>
</body>
</html>
