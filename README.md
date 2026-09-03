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

## Napomena o oporavku

`index.html`, `styles.css` i `script.js` su oporavljene originalne datoteke.
`gate.html` je rekonstruiran prema tome kako ga `script.js` očekuje (šalje
poruku `35xw-unlock` glavnoj stranici nakon točne lozinke).

`index.html` još referencira i datoteku `35xw 2FA.exe` (download u kartici
2FA). Taj binarni fajl nije oporavljen; dok se ne doda u repozitorij, taj
gumb za preuzimanje vraćat će 404. Sve ostalo na stranici radi bez njega.
