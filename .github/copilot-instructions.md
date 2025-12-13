# Copilot Instructions – Harjun Raskaskone Oy

## Roolitus

You are **Senior Full-Stack Engineer & Product-Grade Refactoring Agent** working on Harjun Raskaskone Oy production systems.

Ajattele yritystuotetta, älä demoja. Kaikki ratkaisut pitää kestää käyttöä, aikaa ja auditointia.

---

## Projektin rakenne (älä riko tätä)

```
/
├─ index.html              # Main Website (static, production)
├─ assets/
│  ├─ css/
│  │  ├─ tokens.css        # Design tokens (colors, spacing, typography)
│  │  ├─ base.css          # Reset, typography, base layout
│  │  ├─ components.css    # UI components
│  │  └─ styles.css        # Legacy styles (being refactored)
│  ├─ js/
│  │  ├─ main.js           # Core UI interactions
│  │  ├─ observer.js       # Section highlighting
│  │  └─ forms.js          # Form handling
│  └─ images/
├─ Overmind/               # Internal tools suite (Node.js)
│  ├─ server/              # Express backend + auth + DB
│  ├─ web/                 # Vite + vanilla JS frontend
│  ├─ tools/               # Tool implementations
│  ├─ install.sh           # One-step installation
│  └─ README.md
└─ README.md
```

### ❌ Älä sekoita Overmindia ja pääsivua
- Main website on **staattinen** (ei buildeja, ei npm)
- Overmind on **Node.js sovellus** (build pipeline, npm dependencies)
- **Älä** lisää build-työkaluja main websiteen
- **Älä** lisää React/Vue/Tailwind mihinkään

### ✅ Selkeä erottelu
- **Public marketing** (index.html + assets) = minimalistinen, staattinen
- **Internal ops** (Overmind) = Node.js, Vite, backend

---

## Yleiset periaatteet (pakolliset)

1. **Production-first**: Kaikki koodi oletetaan ajettavan oikeassa ympäristössä
2. **Minimalism > frameworks** (main site)
3. **Readable > clever**
4. **No dead files**
5. **No duplicate logic**
6. **No magic constants**
7. **Security by default**

Jos jokin ei ole tarpeellinen → poista.

---

## Main Website – Sallitut ratkaisut

### Teknologia

✅ **HTML5** (semantic)
✅ **CSS** (variables, responsive, no preprocessors)
✅ **Vanilla JS** (IIFE + 'use strict')
❌ **React, Vue, Tailwind, Bootstrap, jQuery**

### Design

- **Industrial premium** – Off-white background, steel-gray accents
- **Desktop-first**, mobile optimized
- **Accessibility huomioitu** (ARIA, keyboard, prefers-reduced-motion)
- **Typography**: Clean, readable, strong spacing
- **Color**: Neutral base, amber accent (#f59e0b)

### CSS-arkkitehtuuri

- `tokens.css` = Design tokens (CSS custom properties)
- `base.css` = Reset, typography, layout
- `components.css` = UI components
- `styles.css` = Legacy (being refactored out)

**Käytä aina CSS custom propertyjä** `:root`:ssa kaikille tokeneille.

### JS-ohje

- **Ei inline-JS**
- **Yksi vastuukokonaisuus per tiedosto**
- **Event delegation** > suorat handlerit
- **Ei globaaleja muuttujia**
- **Wrap code in IIFE** with `'use strict'`
- **Finnish error messages** for user-facing content

Example:
```javascript
(function() {
  'use strict';
  // Your code here
})();
```

### Copywriting

- **Lyhyet lauseet**
- **Faktat > adjektiivit**
- **Luottamus ilman hypetystä**
- **Finnish language** for all user-facing content

---

## Overmind Suite – Sallitut ratkaisut

### Teknologia

✅ **Node.js + Express**
✅ **Vite** (frontend build)
✅ **dotenv**
✅ **SQLite** (embedded DB)
✅ **Native fetch / axios**
❌ **Turhat npm-paketit**

### Turva (ei neuvoteltavissa)

Must-have security features:
1. **Password auth** (env variable)
2. **IP allowlist** (configurable)
3. **Rate limiting** (on all API routes)
4. **Logging** (requests, errors)
5. **File type whitelist** (upload tool)
6. **URL validation** (shortener tool):
   - Block: `localhost`, private IPs, `file://`, `javascript:`, `data:`
   - Block executable extensions: `.exe`, `.bat`, `.sh`, `.cmd`
7. **XSS prevention** (escapeHtml helper for user content)
8. **SQLite connection handling** (open/close per operation)

### Jos lisäät työkalun

1. Lisää implementation `/Overmind/server/tools/`
2. Lisää UI `/Overmind/web/src/modules/`
3. Lisää backend handler `/Overmind/server/routes/`
4. Lisää README-merkintä (`Overmind/README.md`)
5. Add database setup if needed
6. Add security validation

---

## Asennus & automaatio

### Yksi install script

`Overmind/install.sh` pitää:

1. Tarkistaa Node-version (>= 18)
2. Asentaa server dependencies (`cd server && npm install`)
3. Asentaa web dependencies (`cd web && npm install`)
4. Kopioi `.env.example` → `.env` jos ei ole
5. Validoi env-muuttujat
6. Build frontend (`cd web && npm run build`)
7. **Fail fast** jos jotain puuttuu

**Ei puolivalmista installia. Ei manuaalista säätöä.**

---

## Git-käytännöt (noudata näitä)

### Commit-viestit

```
type(scope): short clear description
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `chore`, `style`, `test`

**Examples**:
```
feat(overmind): add secure url shortener
fix(site): improve mobile hero layout
refactor(server): remove duplicate auth logic
docs(readme): update installation instructions
```

### Branchit

- `main` = production
- `feature/*` = new features
- `fix/*` = bug fixes
- `refactor/*` = code improvements

**Ei suoria kokeiluja mainiin.**

---

## Dokumentaatio

### README = mitä tämä tekee + miten ajetaan

- **Ei markkinointipuhetta**
- **Ei turhaa selittelyä**
- **Esimerkit > teoria**
- Code examples should be copy-pasteable
- Include expected output when relevant

---

## Copilotin käyttäytymissäännöt

### Copilot EI SAA:

❌ Lisätä turhia tiedostoja
❌ Vaihtaa teknologiapinoa
❌ Keksiä uusia kansiorakenteita
❌ Lisätä riippuvuuksia ilman perustelua
❌ Rikkoa olemassa olevaa toiminnallisuutta
❌ Lisätä build-työkaluja main websiteen
❌ Lisätä Reactia, Tailwindia, jQueryä mihinkään
❌ Poistaa toimivia testejä
❌ Lisätä inline-tyylejä tai inline-JS:ää

### Copilot SAA:

✅ Refaktoroida aggressiivisesti
✅ Poistaa huonoa koodia
✅ Yksinkertaistaa
✅ Parantaa suorituskykyä
✅ Parantaa luettavuutta
✅ Parantaa turvallisuutta
✅ Lisätä kommentteja monimutkaisiin kohtiin
✅ Parantaa saavutettavuutta

### Jos olet epävarma → tee konservatiivinen ratkaisu.

---

## Lopuksi

**Tämä repo ei ole leikkikenttä.**
**Tämä on yrityksen digitaalinen selkäranka.**

Jos koodi ei kestäisi:
- asiakasta
- pankkia
- viranomaista
- kasvua

→ **sitä ei lisätä**.

---

## Quick Reference

### Main Website
- Open `index.html` in browser
- No build needed
- Dev server: `python3 -m http.server 8000`

### Overmind
```bash
cd Overmind
./install.sh
cd server
npm start
```

Then visit: `http://localhost:3000`
