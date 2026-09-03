# 35xw

Statična web-stranica (HTML + CSS + JS), hostana na Cloudflare Pages.

## Datoteke

| Datoteka     | Opis                                                            |
|--------------|----------------------------------------------------------------|
| `index.html` | Glavna stranica aplikacije.                                    |
| `styles.css` | Svi stilovi.                                                    |
| `script.js`  | Sva logika aplikacije.                                          |
| `gate.html`  | Password gate koji se učitava u iframe prije glavne aplikacije. |

## Deploy na Cloudflare Pages

Stranica je čisti statični sadržaj, nema build koraka.

1. U Cloudflare nadzornoj ploči otvori **Workers & Pages → Create → Pages**.
2. Spoji ovaj GitHub repozitorij.
3. Postavke builda:
   - **Framework preset:** None
   - **Build command:** (ostavi prazno)
   - **Build output directory:** `/`
4. Spremi i deploy. Svaki push na granu automatski radi novi deploy.

Za lokalni pregled dovoljno je otvoriti `index.html` preko malog servera, npr.:

```
python3 -m http.server 8000
```

pa otvoriti `http://localhost:8000/`.

## Gate (ulazna stranica)

Koja se datoteka učitava kao gate određuje se na vrhu `index.html`:

```javascript
const GATE_FILE = "gate.html";
```

Stavi svoju datoteku u istu mapu i upiši njeno ime ovdje (npr. `"newgate.html"`).
`gate.html` je trenutno samo prazan držač s gumbom Enter.

Jedino što tvoj gate mora napraviti u trenutku kad pušta korisnika unutra je
izvršiti ovu liniju:

```javascript
window.parent.postMessage({ type: '35xw-unlock' }, '*');
```

Glavna stranica tada sama ugasi gate i pokrene aplikaciju.

## Napomena o oporavku

`index.html`, `styles.css` i `script.js` su oporavljene originalne datoteke.

`index.html` još referencira i datoteku `35xw 2FA.exe` (download u kartici
2FA). Taj binarni fajl nije oporavljen; dok se ne doda u repozitorij, taj
gumb za preuzimanje vraćat će 404. Sve ostalo na stranici radi bez njega.
