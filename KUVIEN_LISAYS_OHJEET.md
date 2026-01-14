# Ohjeet: Kuvien lisääminen Suvenkari-sivustolle

## Tilanne
HTML-tiedosto on päivitetty käyttämään JPG-kuvia SVG-kuvien sijaan, mutta kuvat puuttuvat vielä. Sinun täytyy ladata ne manuaalisesti.

## Tarvittavat kuvat

### 1. Hero-osion kuva (hero-construction.jpg)
- **Koko:** 1200x800 px
- **Hakusanat:** "rakennustyömaa nosturi", "modern construction site crane", "building construction Finland"
- **Tyyli:** Ammattimainen, moderni rakennustyömaa nostokurjen kanssa, sininen taivas
- **Sijainti:** `assets/images/hero-construction.jpg`

### 2. Palvelukuvat (800x600 px kukin)

#### A. Uudisrakentaminen (service-newbuild.jpg)
- **Hakusanat:** "uusi talo rakenteilla", "new house construction", "residential building construction"
- **Tyyli:** Moderni uudisrakennus rakenteilla
- **Sijainti:** `assets/images/service-newbuild.jpg`

#### B. Saneeraus ja remontointi (service-renovation.jpg)
- **Hakusanat:** "rakennuksen saneeraus", "building renovation", "construction renovation work"
- **Tyyli:** Sisä- tai ulkosaneeraus käynnissä
- **Sijainti:** `assets/images/service-renovation.jpg`

#### C. Huoneistoremontit (service-interior.jpg)
- **Hakusanat:** "sisustusremontti", "interior renovation", "apartment renovation modern"
- **Tyyli:** Siisti, moderni sisäremontti työn alla
- **Sijainti:** `assets/images/service-interior.jpg`

#### D. Rakennuspalvelut yrityksille (service-business.jpg)
- **Hakusanat:** "liikerakennus rakentaminen", "commercial building construction", "office building construction"
- **Tyyli:** Moderni liikerakennus tai toimistotila
- **Sijainti:** `assets/images/service-business.jpg`

## Mistä ladata kuvat (ILMAISET, kaupallinen käyttö sallittu)

### 1. Unsplash (Suositeltu)
- URL: https://unsplash.com/s/photos/construction
- Lisenssi: Ilmainen kaupallinen käyttö
- Laatu: Erittäin korkea
- Lataus: Klikkaa kuva → Download free → Valitse koko (Large tai Medium)

### 2. Pexels
- URL: https://www.pexels.com/search/construction/
- Lisenssi: Ilmainen kaupallinen käyttö
- Laatu: Korkea
- Lataus: Klikkaa kuva → Download (valitse koko)

### 3. Pixabay
- URL: https://pixabay.com/images/search/construction/
- Lisenssi: Ilmainen kaupallinen käyttö
- Laatu: Vaihteleva
- Lataus: Klikkaa kuva → Free download (valitse koko)

## Asennusohjeet

### Vaihe 1: Lataa kuvat
1. Mene yhteen yllä mainituista sivustoista
2. Hae sopivia kuvia hakusanoilla
3. Lataa kuvat oikeassa koossa
4. Nimeä tiedostot oikein (ks. tiedostonimet yllä)

### Vaihe 2: Optimoi kuvat (valinnainen mutta suositeltava)
Pienennä tiedostokokoa ilman laatuhäviötä:

**Verkkotyökalu:**
- TinyPNG: https://tinypng.com/
- Compressor.io: https://compressor.io/

**Tavoite:** ~200-300 KB per kuva

### Vaihe 3: Siirrä kuvat oikeaan paikkaan
```bash
# Kopioi ladatut kuvat assets/images/ -kansioon
cp ~/Downloads/hero-construction.jpg assets/images/
cp ~/Downloads/service-newbuild.jpg assets/images/
cp ~/Downloads/service-renovation.jpg assets/images/
cp ~/Downloads/service-interior.jpg assets/images/
cp ~/Downloads/service-business.jpg assets/images/
```

### Vaihe 4: Tarkista että kuvat näkyvät
1. Avaa index.html selaimessa
2. Varmista että kuvat latautuvat oikein
3. Tarkista että kuvat näkyvät hyvin eri laitteilla

## Huomioitavaa

1. **Kuvien laatu**: Valitse korkealaatuisia, ammattimaisia kuvia
2. **Suomalainen tyyli**: Etsi mieluiten suomalaisia rakennustyömaita jos mahdollista
3. **Yhtenäinen tyyli**: Valitse kuvat jotka sopivat yhteen (samantyylinen väritys, valaistus)
4. **Tekijänoikeudet**: Käytä vain ilmaisia, kaupalliseen käyttöön sopivia kuvia
5. **Tiedostokoko**: Optimoi kuvat ladattavuuden parantamiseksi (<300 KB per kuva)

## Tarkistuslista

- [ ] hero-construction.jpg (1200x800 px, ~200-300 KB)
- [ ] service-newbuild.jpg (800x600 px, ~150-250 KB)
- [ ] service-renovation.jpg (800x600 px, ~150-250 KB)
- [ ] service-interior.jpg (800x600 px, ~150-250 KB)
- [ ] service-business.jpg (800x600 px, ~150-250 KB)
- [ ] Kaikki kuvat optimoitu
- [ ] Kaikki kuvat siirretty assets/images/ -kansioon
- [ ] Sivusto testattu selaimessa
- [ ] Kuvat näkyvät oikein kaikilla laitteilla

## Apua tarvittaessa

Jos törmäät ongelmiin:
1. Tarkista että tiedostonimet ovat täsmälleen oikein (pienet kirjaimet, .jpg-pääte)
2. Tarkista että kuvat ovat oikeassa kansiossa (assets/images/)
3. Tyhjennä selaimen välimuisti (Ctrl+F5 tai Cmd+Shift+R)
4. Tarkista selaimen konsolista (F12) mahdolliset virheilmoitukset
