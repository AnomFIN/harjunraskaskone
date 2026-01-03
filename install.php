<?php
/**
 * Database Installation Script
 * Sets up MySQL connection and creates necessary tables for shop.html
 */

session_start();

// Configuration file path
define('CONFIG_FILE', __DIR__ . '/config.php');

// Check if already installed
$alreadyInstalled = file_exists(CONFIG_FILE);

$error = '';
$success = '';

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $dbHost = trim($_POST['db_host'] ?? '');
    $dbName = trim($_POST['db_name'] ?? '');
    $dbUser = trim($_POST['db_user'] ?? '');
    $dbPass = $_POST['db_pass'] ?? '';
    $adminUser = trim($_POST['admin_user'] ?? '');
    $adminPass = $_POST['admin_pass'] ?? '';
    
    // Validate inputs
    if (empty($dbHost) || empty($dbName) || empty($dbUser) || empty($adminUser) || empty($adminPass)) {
        $error = 'Kaikki kentät ovat pakollisia (MySQL-salasana voi olla tyhjä).';
    } elseif (!preg_match('/^[a-zA-Z0-9_]+$/', $dbName)) {
        $error = 'Tietokannan nimi saa sisältää vain kirjaimia, numeroita ja alaviivoja.';
    } else {
        try {
            // Test database connection
            $dsn = "mysql:host=$dbHost;charset=utf8mb4";
            $pdo = new PDO($dsn, $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
            
            // Create database if not exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `$dbName`");
            
            // Create products table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS products (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    category VARCHAR(50) NOT NULL,
                    price DECIMAL(10,2) NOT NULL,
                    unit VARCHAR(20) NOT NULL,
                    description TEXT,
                    image VARCHAR(10),
                    badge VARCHAR(50),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_category (category)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            
            // Create admin users table
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS admin_users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ");
            
            // Insert default admin user
            $passwordHash = password_hash($adminPass, PASSWORD_BCRYPT, ['cost' => 12]);

            // Check if admin user with the same username already exists to avoid silent password reset
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM admin_users WHERE username = ?");
            $stmt->execute([$adminUser]);
            $existingCount = (int) $stmt->fetchColumn();

            if ($existingCount > 0) {
                // Fail fast instead of silently overwriting existing admin password
                throw new RuntimeException('Ylläpitokäyttäjä on jo olemassa. Asennusta ei voi käyttää salasanan nollaamiseen.');
            }

            $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash) VALUES (?, ?)");
            $stmt->execute([$adminUser, $passwordHash]);
            
            // Insert default products from shop.html
            $defaultProducts = [
                ['Moottoriöljy 15W-40', 'nesteet', 89.00, '20L', 'Laadukas mineraaliöljy raskaaseen kalustoon. Täyttää API CJ-4 ja ACEA E7 -vaatimukset.', '🛢️', 'Suosittu'],
                ['Hydrauliöljy HLP 46', 'nesteet', 125.00, '20L', 'Korkealaatuinen hydrauliöljy työkoneisiin ja nostolaitteisiin.', '🛢️', null],
                ['Öljynsuodatin', 'varaosat', 24.50, 'kpl', 'Yleismalli kuorma-autoihin. Sopii useimpiin Scania, Volvo ja Mercedes-malleihin.', '⚙️', 'Uusi'],
                ['Ilmansuodatin', 'varaosat', 45.00, 'kpl', 'Tehokas ilmansuodatin dieselmoottoreihin. Pitkä käyttöikä.', '⚙️', null],
                ['Polttoainesuodatin', 'varaosat', 32.00, 'kpl', 'Korkealaatuinen polttoainesuodatin. Erottaa veden ja epäpuhtaudet tehokkaasti.', '⚙️', null],
                ['Perushuoltopaketti', 'huoltopaketit', 450.00, 'pkt', 'Sisältää öljynvaihdon (25L), kaikki suodattimet ja perushuollon kuorma-autolle.', '📦', 'Suosittu'],
                ['Laaja huoltopaketti', 'huoltopaketit', 890.00, 'pkt', 'Sisältää öljynvaihdon, kaikki suodattimet, jarrujen tarkastuksen ja erikoistarkastuksen.', '📦', null],
                ['Työkonehuolto', 'huoltopaketit', 650.00, 'pkt', 'Täydellinen huoltopaketti työkoneille. Hydrauliikka, öljyt ja perusteellinen tarkastus.', '📦', null],
                ['Jarruöljy DOT 4', 'nesteet', 18.50, '1L', 'Korkean suorituskyvyn jarruneste raskaaseen kalustoon.', '🛢️', null],
                ['Jäähdytinneste', 'nesteet', 45.00, '5L', 'Korkealaatuinen jäähdytinneste. Suojaa -35°C lämpötilaan.', '🛢️', null],
                ['Momenttiavain 1/2"', 'tyokalut', 189.00, 'kpl', 'Ammattilaisen momenttiavain 40-200 Nm. Sertifioitu tarkkuus.', '🔧', 'Pro'],
                ['Hylsysarja 1/2"', 'tyokalut', 145.00, 'sarja', 'Kattava 24-osainen hylsysarja metallisalkussa. Koot 10-32mm.', '🔧', null]
            ];
            
            // Check if products table is empty
            $count = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
            if ($count == 0) {
                $stmt = $pdo->prepare("INSERT INTO products (name, category, price, unit, description, image, badge) VALUES (?, ?, ?, ?, ?, ?, ?)");
                foreach ($defaultProducts as $product) {
                    $stmt->execute($product);
                }
            }
            
            // Create config.php
            $configContent = "<?php\n";
            $configContent .= "// Database configuration - Generated by install.php\n";
            $configContent .= "define('DB_HOST', " . var_export($dbHost, true) . ");\n";
            $configContent .= "define('DB_NAME', " . var_export($dbName, true) . ");\n";
            $configContent .= "define('DB_USER', " . var_export($dbUser, true) . ");\n";
            $configContent .= "define('DB_PASS', " . var_export($dbPass, true) . ");\n";
            
            if (file_put_contents(CONFIG_FILE, $configContent, LOCK_EX) === false) {
                throw new Exception('Konfiguraatiotiedoston kirjoitus epäonnistui');
            }
            
            // Restrict config.php permissions to owner read/write only
            if (!chmod(CONFIG_FILE, 0600)) {
                throw new Exception('Konfiguraatiotiedoston oikeuksien asettaminen epäonnistui (vaaditaan 0600)');
            }
            
            $success = 'Asennus onnistui! Voit nyt kirjautua admin.php -sivulle.';
            $alreadyInstalled = true;
            
        } catch (PDOException $e) {
            $error = 'Tietokantavirhe: ' . htmlspecialchars($e->getMessage());
        } catch (Exception $e) {
            $error = 'Virhe: ' . htmlspecialchars($e->getMessage());
        }
    }
}
?>
<!DOCTYPE html>
<html lang="fi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Asennusohjelma - Harjun Raskaskone</title>
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
        
        .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 500px;
            width: 100%;
            padding: 40px;
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }
        
        input[type="text"],
        input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.3s;
        }
        
        input[type="text"]:focus,
        input[type="password"]:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .help-text {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
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
            transition: transform 0.2s;
        }
        
        .submit-btn:hover {
            transform: translateY(-2px);
        }
        
        .submit-btn:active {
            transform: translateY(0);
        }
        
        .alert {
            padding: 12px 16px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .alert-error {
            background: #fee;
            color: #c33;
            border-left: 4px solid #c33;
        }
        
        .alert-success {
            background: #efe;
            color: #3c3;
            border-left: 4px solid #3c3;
        }
        
        .installed-message {
            text-align: center;
        }
        
        .installed-message h2 {
            color: #10b981;
            margin-bottom: 20px;
        }
        
        .btn-link {
            display: inline-block;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
            transition: transform 0.2s;
        }
        
        .btn-link:hover {
            transform: translateY(-2px);
        }
        
        .divider {
            margin: 30px 0;
            border-top: 2px solid #f0f0f0;
        }
        
        .section-title {
            font-size: 18px;
            color: #333;
            margin-bottom: 15px;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Asennusohjelma</h1>
        <p class="subtitle">Harjun Raskaskone - Verkkokauppa</p>
        
        <?php if ($error): ?>
            <div class="alert alert-error"><?php echo $error; ?></div>
        <?php endif; ?>
        
        <?php if ($success): ?>
            <div class="alert alert-success"><?php echo $success; ?></div>
        <?php endif; ?>
        
        <?php if ($alreadyInstalled && !$success): ?>
            <div class="installed-message">
                <h2>✓ Asennus on jo suoritettu</h2>
                <p>Järjestelmä on jo asennettu ja konfiguroitu.</p>
                <a href="admin.php" class="btn-link">Siirry hallintapaneeliin →</a>
            </div>
        <?php else: ?>
            <form method="POST" action="">
                <div class="section-title">MySQL-tietokanta</div>
                
                <div class="form-group">
                    <label for="db_host">Tietokantapalvelin *</label>
                    <input type="text" id="db_host" name="db_host" value="localhost" required>
                    <div class="help-text">Yleensä "localhost" tai palvelimen IP-osoite</div>
                </div>
                
                <div class="form-group">
                    <label for="db_name">Tietokannan nimi *</label>
                    <input type="text" id="db_name" name="db_name" value="harjun_shop" required>
                    <div class="help-text">Tietokanta luodaan automaattisesti jos sitä ei ole</div>
                </div>
                
                <div class="form-group">
                    <label for="db_user">Käyttäjätunnus *</label>
                    <input type="text" id="db_user" name="db_user" required>
                </div>
                
                <div class="form-group">
                    <label for="db_pass">Salasana</label>
                    <input type="password" id="db_pass" name="db_pass">
                    <div class="help-text">Jätä tyhjäksi jos ei salasanaa</div>
                </div>
                
                <div class="divider"></div>
                
                <div class="section-title">Admin-tunnus</div>
                
                <div class="form-group">
                    <label for="admin_user">Käyttäjätunnus *</label>
                    <input type="text" id="admin_user" name="admin_user" value="admin" required>
                </div>
                
                <div class="form-group">
                    <label for="admin_pass">Salasana *</label>
                    <input type="password" id="admin_pass" name="admin_pass" required>
                    <div class="help-text">Käytetään admin.php-kirjautumiseen</div>
                </div>
                
                <button type="submit" class="submit-btn">Asenna järjestelmä</button>
            </form>
        <?php endif; ?>
    </div>
</body>
</html>
