# MostraMI, linguaggio visivo

Un calendario delle mostre di Milano che si legge come un orario: inchiostro su carta, titoli stretti e alti, una linea sottile che dice a che punto è ogni mostra. Il colore è un accento, e cambia con il contesto.

Fonte dei token: [`design-system/tokens.json`](design-system/tokens.json) (formato W3C DTCG). `npm run tokens` genera `src/styles/tokens.css`; la CI fallisce se il CSS non è allineato. Anteprima delle varianti: `npm run dev`, poi `/design-system/preview.html`.

## Cosa resta fisso, cosa cambia

Il linguaggio è riconoscibile per la **forma**, versatile per il **colore**.

| Fisso in ogni destinazione | Variabile |
| --- | --- |
| Archivo, con la larghezza che si stringe al crescere del testo | Il colore d'accento (`data-accent`) |
| Il neutro "ink", verde-inchiostro (hue ~150) | Quale ruolo fa da fondo e quale da figura (`data-destination`) |
| La timeline: linea di 2–3px, riempita fino a oggi, con un punto | |
| Il blocco data: mese, giorno grande, giorno della settimana | |
| Angoli quasi retti (4–8px), bordi da 1.5px sui controlli | |
| Il maiuscoletto per date e dati (`all-small-caps`, tabular) | |

## Colore: due assi

I componenti usano solo token **semantici** (`--color-bg-canvas`, `--color-accent-default`…). Due attributi HTML, messi sullo stesso elemento, decidono i valori:

```html
<section data-destination="campagna" data-accent="acqua">…</section>
```

Senza attributi valgono `app` e `viola`.

### Asse 1, accento (`data-accent`)

Ogni famiglia ha la stessa scala di luminosità a 11 step (50–950), quindi è intercambiabile senza ritoccare i contrasti.

| Accento | Hue OKLCH | Uso |
| --- | --- | --- |
| `viola` | 308 | MostraMI. 500 `#9B62C4` e 600 `#7A43A6` sono i viola del logo e della timeline. |
| `acqua` | 218 | DissetaMI, l'app sorella. Stesso linguaggio, altro colore. |

Per aggiungere un accento: una nuova scala in `color`, una voce in `accent`. Le destinazioni non vanno toccate.

### Asse 2, destinazione (`data-destination`)

| Destinazione | Dove | Logica cromatica |
| --- | --- | --- |
| `app` | Web app e PWA | Carta `ink.50`, inchiostro `ink.900`. L'accento solo su timeline, tag e logo. |
| `notte` | Interfaccia su fondo scuro | Scala ink invertita, accento schiarito (400). **Definita, non attiva**: il logo SVG ha i colori fissi e va prima adattato. |
| `campagna` | Social, poster, affissioni | L'accento diventa il campo (600), il testo è carta. La timeline è bianca. |
| `stampa` | B/N, fotocopie, timbri | Gli accenti collassano sull'inchiostro: la forma basta a riconoscere il marchio. |

### Ruoli semantici

| Token | app | notte | campagna | stampa |
| --- | --- | --- | --- | --- |
| `bg.canvas` | ink.50 | ink.950 | accent.600 | ink.0 |
| `bg.surface` | ink.0 | ink.900 | accent.700 | ink.0 |
| `bg.sunken` | ink.100 | ink.800 | accent.700 | ink.100 |
| `bg.inverse` | ink.900 | ink.50 | ink.0 | ink.900 |
| `text.primary` | ink.900 | ink.50 | ink.0 | ink.900 |
| `text.body` | ink.800 | ink.100 | accent.50 | ink.800 |
| `text.muted` | ink.600 | ink.400 | accent.100 | ink.600 |
| `text.inverse` | ink.0 | ink.950 | ink.900 | ink.0 |
| `border.subtle` | ink.200 | ink.800 | accent.500 | ink.200 |
| `border.default` | ink.300 | ink.700 | accent.400 | ink.300 |
| `border.strong` | ink.900 | ink.100 | ink.0 | ink.900 |
| `accent.default` | accent.500 | accent.400 | ink.0 | ink.900 |
| `accent.strong` | accent.600 | accent.300 | ink.0 | ink.900 |
| `accent.text` | accent.700 | accent.200 | accent.50 | ink.900 |
| `accent.subtle` | accent.100 | accent.900 | accent.800 | ink.100 |
| `accent.track` | accent.200 | accent.800 | accent.400 | ink.300 |
| `accent.track-strong` | accent.300 | accent.700 | accent.300 | ink.300 |
| `focus` | accent.600 | accent.300 | ink.0 | ink.900 |

### Contrasti verificati (WCAG)

| Coppia | Rapporto |
| --- | --- |
| app, testo su carta | 15.5:1 |
| app, testo secondario su carta | 5.3:1 |
| app, tag viola / acqua | 6.7:1 / 6.2:1 |
| notte, testo / secondario | 17.6:1 / 7.4:1 |
| campagna viola, testo / secondario | 6.6:1 / 5.3:1 |
| campagna acqua, testo / secondario | 5.9:1 / 4.8:1 |

`accent.default` in app (3.8:1 viola, 3.4:1 acqua) è solo grafico: non usarlo per testo.

### Regole

- Mai un primitivo (`--color-viola-500`) o un esadecimale in un componente: solo ruoli semantici.
- L'accento non porta mai da solo un significato: la timeline ha sempre le date, il tag ha sempre la parola.
- In `app` l'accento resta sotto il 10% della superficie. In `campagna` è il fondo, e allora l'unico altro colore è la carta.

## Tipografia

Archivo, un solo carattere. La gerarchia nasce dalla larghezza (`font-stretch`) oltre che da corpo e peso.

| Ruolo | Corpo | Peso | Larghezza |
| --- | --- | --- | --- |
| `display-xl` (H1 home) | 46px | 800 | 68% |
| `display-lg` (H1 pagine) | 40px | 800 | 68% |
| `date` (giorno nel blocco data) | 34px | 800 | 62% |
| `heading-lg` (sezioni) | 26px | 800 | 72% |
| `heading-md` / `heading-sm` | 22 / 20px | 800 | 72% |
| `title` (righe) | 18px | 700 | 78% |
| `body-lg` / `body` | 16 / 15px | 400 | 100% |
| `ui` / `meta` / `caption` / `tag` | 14 / 13 / 12 / 11px | 500–600 | 100% |

Le date usano il maiuscoletto con cifre tabulari, larghezza 72%. I token di corpo esistono, ma i componenti usano ancora valori in px: la migrazione riguarda per ora solo i colori.

## Spazio, forma, movimento

- Margine di pagina `space.gutter` 20px. Sezioni a 44px. Larghezza massima 640px.
- Controlli alti 50px, chip 36px, aree di tocco minime 44px.
- Raggi: chip 4px, controlli 6px, card 8px.
- Pressione: scala 0.96 in 150ms. Ingressi in 300ms. Le molle sono rese con `cubic-bezier(0.2, 0, 0, 1)`. Senza "riduci movimento" restano solo le dissolvenze.

## Componenti

| Componente | File | Note |
| --- | --- | --- |
| Header | `src/components/Header.jsx` | Tre slot: indietro, logo, calendario |
| Button | `src/components/Button.jsx` | `primary` (pieno) e `outline`, variante `compact` |
| Chip, ChipRow, ChipSelect | `src/components/Chip.jsx` | Toggle con `aria-pressed`, oppure link |
| Timeline | `src/components/Timeline.jsx` | `sm` nelle liste, `lg` nella scheda |
| DateBlock | `src/components/DateBlock.jsx` | Mese, giorno, giorno della settimana |
| TimelineRow, DateRow, PlaceRow | `src/components/Rows.jsx` | Le tre righe delle liste |
| AbbTag | `src/components/AbbTag.jsx` | Tag Abbonamento Musei |
| SectionHead | `src/components/SectionHead.jsx` | Titolo di sezione con link |

## Limiti noti

- `public/logo.svg` ha i colori fissi (ink.900 e viola.500): in `notte` e `campagna` va prima reso adattabile.
- `data-accent` va messo sullo stesso elemento di `data-destination`: i valori semantici si risolvono dove sono dichiarati.
