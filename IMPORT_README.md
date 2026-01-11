# Product Import Feature

## Yleiskuvaus

Tämä ominaisuus mahdollistaa tuotteiden massatuonnin JSON-tiedostosta admin.php-paneelissa. Tukee myös kuvien lataamista ZIP-tiedostosta.

## Ominaisuudet

- ✅ JSON-muotoinen tuonti
- ✅ Kuvien lataus ZIP-tiedostosta
- ✅ Esikatselu ennen tuontia
- ✅ Duplikaattien ohitus
- ✅ Olemassaolevien tuotteiden päivitys
- ✅ Transaktiopohjainen tuonti (rollback virheen sattuessa)
- ✅ CSRF-suojaus
- ✅ Tiedostojen validointi (MIME, koko, tyyppi)
- ✅ XSS-suojaus
- ✅ Yksityiskohtainen virheraportointi

## JSON-formaatti

```json
{
  "format": "product_import_v1",
  "products": [
    {
      "name": "Tuotteen nimi",
      "category": "Kategoria",
      "price_eur": 1234.56,
      "unit": "kpl",
      "badge": "Suosittu",
      "emoji": "🛞",
      "description": "Tuotteen kuvaus",
      "image": "tuote_kuva.jpg"
    }
  ]
}
```

### Kentät

| Kenttä | Tyyppi | Pakollinen | Kuvaus |
|--------|--------|-----------|---------|
| `name` | string (max 255) | Kyllä | Tuotteen nimi |
| `category` | string (max 50) | Kyllä | Tuotteen kategoria |
| `price_eur` | number | Kyllä | Hinta euroissa (0-999999.99) |
| `unit` | string (max 20) | Kyllä | Yksikkö (esim. kpl, L, pkt) |
| `badge` | string (max 50) | Ei | Badge-teksti (esim. Suosittu, Uusi) |
| `emoji` | string (max 20) | Ei | Emoji-kuvake |
| `description` | text | Ei | Tuotteen kuvaus |
| `image` | string | Ei | Kuvatiedoston nimi ZIP:ssä |

## Käyttö

### 1. Valmistele JSON-tiedosto

Luo JSON-tiedosto yllä olevan formaatin mukaisesti. Katso esimerkki: `tuote_import_db.json`

### 2. (Valinnainen) Valmistele kuvat

Jos haluat ladata kuvia:
1. Luo ZIP-tiedosto
2. Lisää kuvat (jpg, png, webp) ZIP:iin
3. Varmista että JSON:n `image`-kentässä on oikea tiedostonimi

### 3. Tuo tuotteet

1. Kirjaudu admin.php-paneeliin
2. Etsi "Tuo tuotteet (JSON)" -osio
3. Valitse JSON-tiedosto
4. (Valinnainen) Valitse kuvien ZIP-tiedosto
5. Valitse asetukset:
   - **Ohita duplikaatit**: Ei lisää tuotetta jos nimi+kategoria on jo olemassa
   - **Päivitä olemassaolevat**: Päivittää tuotteen jos nimi+kategoria löytyy
6. Klikkaa "Esikatsele" nähdäksesi mitä tuodaan
7. Klikkaa "Tuo tuotteet" suorittaaksesi tuonnin

## Turvallisuus

- ✅ **CSRF-suojaus**: Kaikki lomakkeet suojattu tokeneilla
- ✅ **Tiedostovalidointi**: MIME-tyypit ja tiedostopäätteet tarkistetaan
- ✅ **Kokorajoitukset**: JSON max 20MB, ZIP max 200MB
- ✅ **XSS-suojaus**: Kaikki tekstit sanitoidaan
- ✅ **SQL Injection -suojaus**: Prepared statements käytössä
- ✅ **Transaktiot**: Rollback jos tuonti epäonnistuu

## Virheenkäsittely

Tuonti näyttää yksityiskohtaisen yhteenvedon:

- **Luotu**: Uusien tuotteiden määrä
- **Päivitetty**: Päivitettyjen tuotteiden määrä
- **Ohitettu**: Ohitettujen tuotteiden määrä
- **Virheet**: Lista virheistä rivikohtaisesti

## Tekninen toteutus

### Tiedostot

- `admin.php`: Pääpaneeli ja UI
- `admin_import.php`: Import-logiikka ja apufunktiot
- `uploads/products/`: Kuvatiedostojen tallennushakemisto

### Tietokanta

Lisätty `image_path`-sarake `products`-tauluun:
```sql
ALTER TABLE products ADD COLUMN image_path VARCHAR(255) NULL AFTER image;
```

### API-rajapinnat

**Preview Import** (`POST /admin.php`)
```
action: preview_import
json_file: File
csrf_token: String
```

**Execute Import** (`POST /admin.php`)
```
action: execute_import
json_file: File
image_zip: File (optional)
skip_duplicates: 0|1
update_existing: 0|1
csrf_token: String
```

## Esimerkkikäyttö

Katso `tuote_import_db.json` täydellinen esimerkki 16 tuotteen tuonnista.

## Rajoitukset

- JSON-tiedosto: max 20MB
- ZIP-tiedosto: max 200MB
- Tuetut kuvaformaatit: JPG, PNG, WEBP
- Emoji-kenttä: max 20 merkkiä (tukee useita emojeja)

## Kehityssuositukset

Jos haluat laajentaa tuontia:

1. **Lisää tukea muille formaateille** (CSV, XML)
2. **Lisää tuki bulk-operaatioille** (poisto, kategoriapäivitys)
3. **Lisää edistymispalkki** suurille tuonneille
4. **Lisää ajoitettu tuonti** (cron)
5. **Lisää tuontiloki** tietokantaan

## Vianmääritys

### "JSON-virhe: Syntax error"
- Tarkista JSON-formaatti JSONLint.com:ssa
- Varmista UTF-8 -enkoodaus

### "Tiedosto on liian suuri"
- Pienennä JSON-tiedostoa
- Pakkaa kuvat paremmin
- Tarkista PHP:n `upload_max_filesize` ja `post_max_size`

### "Kuva ei löytynyt ZIP-tiedostosta"
- Tarkista että tiedostonimi JSON:ssa vastaa ZIP:ssä olevaa
- Älä käytä kansioita ZIP:ssä (vain kuvat juuressa)

### "Tietokantavirhe"
- Tarkista että `image_path`-sarake on olemassa
- Suorita migraatio uudelleen tai asenna järjestelmä alusta

## Lisenssi

© 2024 Harjun Raskaskone Oy
