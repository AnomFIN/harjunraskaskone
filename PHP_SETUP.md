# PHP-pohjainen tuotehallinnan asennus

Tämä dokumentti kuvaa, miten asennetaan ja käytetään PHP-pohjaista tuotehallintajärjestelmää shop.html-sivulle.

## Vaatimukset

- PHP 7.4 tai uudempi
- MySQL 5.7 tai uudempi (tai MariaDB 10.2+)
- Web-palvelin (Apache, Nginx, jne.)
- PHP PDO MySQL -laajennus

## Asennus

### 1. Varmista PHP-tuki

Tarkista, että palvelimellasi on PHP ja MySQL asennettuna:

```bash
php -v
mysql --version
```

### 2. Suorita install.php

Avaa selaimessa: `http://localhost/install.php` (tai oma domain)

Anna seuraavat tiedot:

#### MySQL-tietokanta:
- **Tietokantapalvelin**: Yleensä `localhost`
- **Tietokannan nimi**: Esim. `harjun_shop` (luodaan automaattisesti)
- **Käyttäjätunnus**: MySQL-käyttäjätunnus
- **Salasana**: MySQL-salasana

#### Admin-tunnus:
- **Käyttäjätunnus**: Valitse haluamasi tunnus (esim. `admin`)
- **Salasana**: Valitse vahva salasana hallintapaneelia varten

### 3. Asennus luo automaattisesti

- `config.php` - Tietokantayhteyden asetukset
- `products`-taulu - Tuotetiedot
- `admin_users`-taulu - Admin-käyttäjät
- Oletustuotteet tietokantaan (shop.html:n nykyiset tuotteet)

## Käyttö

### Hallintapaneeli (admin.php)

1. Avaa: `http://localhost/admin.php`
2. Kirjaudu sisään asennuksessa luomillasi tunnuksilla
3. Hallinnoi tuotteita:
   - **Lisää uusi tuote**: Klikkaa "+ Lisää uusi tuote"
   - **Muokkaa tuotetta**: Klikkaa "Muokkaa" tuotteen rivillä
   - **Poista tuote**: Klikkaa "Poista" (vahvistusdialogi)

### Verkkokauppa (shop.html)

- shop.html lataa tuotteet automaattisesti `api_products.php`-rajapinnasta
- Jos PHP/MySQL ei ole saatavilla, käytetään oletustuotteita (fallback)
- Ostoskori toimii kuten ennenkin (localStorage)

## Tiedostorakenne

```
/
├── install.php          # Asennusohjelma
├── admin.php            # Hallintapaneeli
├── api_products.php     # REST API tuotteille
├── config.php           # Tietokanta-asetukset (luodaan automaattisesti)
└── shop.html            # Verkkokauppa (lataa tuotteet API:sta)
```

## Tietoturva

### Käytössä olevat turvatoimet:

1. **Salasanat**: Hashattu bcrypt-algoritmilla
2. **SQL Injection**: Estetty prepared statements -kyselyillä
3. **XSS**: Estetty htmlspecialchars()-funktiolla
4. **Session**: PHP-sessiot admin-tunnistautumiseen
5. **CSRF**: Ei erillistä suojausta – lisää CSRF-tokenit lomakkeisiin ennen tuotantokäyttöä

### Suositukset:

- **Käytä vahvoja salasanoja** admin-tunnukselle
- **Rajoita pääsy** admin.php- ja install.php-sivuille palomuurilla/IP-rajoituksilla
- **Ota HTTPS käyttöön** tuotantoympäristössä
- **Varmuuskopioi tietokanta** säännöllisesti

## Tietokannan rakenne

### products-taulu

| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | INT | Pääavain (auto_increment) |
| name | VARCHAR(255) | Tuotteen nimi |
| category | VARCHAR(50) | Kategoria (varaosat, huoltopaketit, nesteet, tyokalut) |
| price | DECIMAL(10,2) | Hinta euroissa |
| unit | VARCHAR(20) | Yksikkö (kpl, L, pkt, sarja) |
| description | TEXT | Tuotekuvaus |
| image | VARCHAR(10) | Emoji-kuvake |
| badge | VARCHAR(50) | Badge-teksti (Suosittu, Uusi, Pro) |
| created_at | TIMESTAMP | Luontiaika |
| updated_at | TIMESTAMP | Päivitysaika |

### admin_users-taulu

| Kenttä | Tyyppi | Kuvaus |
|--------|--------|--------|
| id | INT | Pääavain |
| username | VARCHAR(50) | Käyttäjätunnus (uniikki) |
| password_hash | VARCHAR(255) | Bcrypt-hashattu salasana |
| created_at | TIMESTAMP | Luontiaika |

## API-dokumentaatio

### GET /api_products.php

Palauttaa kaikki tuotteet JSON-muodossa.

**Vastaus (onnistui):**
```json
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Moottoriöljy 15W-40",
      "category": "nesteet",
      "price": 89.00,
      "unit": "20L",
      "description": "Laadukas mineraaliöljy...",
      "image": "🛢️",
      "badge": "Suosittu"
    }
  ]
}
```

**Vastaus (virhe):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Vianmääritys

### "Database not configured"

- Suorita `install.php` uudelleen
- Tarkista, että `config.php` on luotu

### "Access denied for user"

- Tarkista MySQL-käyttäjätunnus ja -salasana
- Varmista, että käyttäjällä on oikeudet tietokantaan

### "Table doesn't exist"

- Suorita `install.php` uudelleen
- Taulut luodaan automaattisesti

### Tuotteet eivät näy shop.html:ssä

- Tarkista, että `api_products.php` on saavutettavissa
- Avaa selaimen konsoli ja katso virheviestit
- Tarkista, että PHP-palvelin on käynnissä
- Jos API ei toimi, shop.html käyttää oletustuotteita

## Kehitystyö

### Paikallinen testaus

Käytä PHP:n sisäänrakennettua palvelinta:

```bash
php -S localhost:8000
```

Avaa selaimessa: `http://localhost:8000/shop.html`

### Tietokannan varmuuskopiointi

```bash
mysqldump -u root -p harjun_shop > backup.sql
```

### Tietokannan palauttaminen

```bash
mysql -u root -p harjun_shop < backup.sql
```

## Tuotantoympäristö

### Ennen tuotantoon siirtoa:

1. **Poista tai suojaa install.php**
   - **Suositus:** Poista `install.php` kokonaan tuotantopalvelimelta asennuksen jälkeen.
   - Jos poistaminen ei ole mahdollista, estä pääsy tiedostoon web-palvelimen asetuksilla.

     **Apache (.htaccess samassa kansiossa kuin install.php):**

     ```apacheconf
     <Files "install.php">
         Require all denied
     </Files>
     ```

     Tämä estää kaiken HTTP-pääsyn `install.php`-tiedostoon.

     **Apache (virtuaalipalvelimen konfiguraatio, IP-allowlist esimerkki):**

     ```apacheconf
     <Location "/install.php">
         Require ip 10.0.0.0/8
         Require ip 192.168.0.0/16
         Require ip 127.0.0.1
     </Location>
     ```

     Tämä sallii pääsyn vain sisäverkon / kehitysympäristön IP-osoitteista. Muokkaa IP-osoitteet vastaamaan omaa verkkoasi.

     **nginx (palvelimen konfiguraatio):**

     ```nginx
     location = /install.php {
         # Vaihtoehto 1: Estä kaikki pääsy (turvallisin, tuotanto)
         deny all;

         # Vaihtoehto 2: Salli vain sisäverkon IP:t (poista "deny all;" jos käytät tätä)
         # allow 10.0.0.0/8;
         # allow 192.168.0.0/16;
         # allow 127.0.0.1;
         # deny all;
     }
     ```

     Varmista, että muutokset ladataan uudelleen (`apachectl graceful` tai `nginx -s reload`) ja testaa, että `install.php` ei ole julkisesti saavutettavissa.
2. **Ota HTTPS käyttöön**
   - Hanki SSL-sertifikaatti (Let's Encrypt on ilmainen)
   - Ohjaa HTTP-liikenne HTTPS:ään

3. **Rajoita admin.php-pääsy**
   - Lisää IP-allowlist
   - Käytä web-palvelimen autentikointia lisäkerroksena

4. **Optimoi suorituskyky**
   - Ota MySQL-välimuisti käyttöön
   - Harkitse CDN:ää staattisille tiedostoille

## Tuki

Ongelmatilanteissa tarkista:
- PHP error log
- MySQL error log  
- Selaimen kehittäjäkonsoli
- Verkkoliikenne (Network-välilehti)

## Lisenssi

© 2024 Harjun Raskaskone Oy. Yksityiskäyttöön.
