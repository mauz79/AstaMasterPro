[![Latest release](https://img.shields.io/github/v/release/mauz79/AstaMasterPro?include_prereleases&sort=semver)](https://github.com/mauz79/AstaMasterPro/releases/latest)

# AstaMasterPro – TEST build (v1.2.1 badge per stagione + toggle prev)

Questa è una repo di test per provare:
- badge ranking **FM** e **MV** per **stagioni selezionabili** (ora con **due selettori indipendenti**)
- possibilità di **non visualizzare** i badge della **stagione precedente** (toggle in Opzioni)

## Struttura
- `index.html`, `styles.css`, `app.js`
- `data/` → file stagionali JSON (accetta `YYYY_YYYY+1.json`, `YYYY.json`, `YYYY-YYYY+1.json`)
- `img/` → `placeholder.svg` + foto opzionali `COD.{jpg|png|webp}`
- `img/ico/` → icone opzionali
- `.nojekyll` → file vuoto

> La webapp scandisce automaticamente gli ultimi **8 anni** fino a **+1** in avanti e carica la prima corrispondenza valida per ciascuna stagione (una tra `YYYY_YYYY+1.json`, `YYYY.json`, `YYYY-YYYY+1.json`).

## Avvio locale (facoltativo)
Apri `index.html` con un server statico (es. VS Code Live Server o `python -m http.server`) per evitare problemi di CORS sul `fetch` dei JSON.

# AstaMasterPro v9c2 — **Main (ROOT)**
> Web app **static** per analisi rapida dei giocatori di Serie A.  
> **Ricerca istantanea**, schede **Stagione Corrente / Precedente / Storico**, badge e **Ranking di ruolo** (Percentile + Z‑score).

---

## Struttura della webapp (root del repo)
```text
/
├─ index.html            # Entry point (root)
├─ styles.css            # Stili
├─ app.js                # Logica: ricerca, pannelli, ranking
├─ .nojekyll             # Disattiva build Jekyll su GitHub Pages
├─ README.md             # Questo file
├─ /img/
│  ├─ placeholder.svg    # Segnaposto immagine giocatore
│  ├─ /ico/              # (opz.) icone SVG per le statistiche
│  └─ <COD>.{jpg|png|webp} # Foto giocatore (nome file = COD)
└─ /data/
   ├─ 2025_2026.json     # Stagione 2025/26 (formato supportato 1)
   ├─ 2025.json          # Stagione 2025/26 (formato supportato 2)
   └─ 2025-2026.json     # Stagione 2025/26 (formato supportato 3)
```

**Note**
- Le **foto** dei giocatori vanno in `img/` e devono chiamarsi **`<COD>.<estensione>`** (dove `COD` è l’ID univoco del giocatore nei dati). L’app prova **in ordine**: `jpg`, `png`, `webp`.
- I **file stagione** devono risiedere in `data/` e possono chiamarsi **`YYYY_YYYY+1.json`**, **`YYYY.json`** oppure **`YYYY-YYYY+1.json`** (l’app tenta tutte le varianti).

---

## Flusso dati
- La webapp utilizza gli **output di FantaCalcio Manager 8.6.0** (`.xls`) **convertiti in JSON** tramite **FCM_Excel_2_JSON** di *mauz79*:
  - Tool: https://github.com/mauz79/FCM_Excel_2_JSON
- Per le **foto** si consiglia il **FotoPack di AlfaAlfa per AstaManager** (compatibile AstaManager/AstaMaster). Le immagini vanno rinominate secondo il `COD` e collocate in `img/`.
  - FotoPack: https://www.legafantacalciosanremo.it/forum/viewtopic.php?t=3935

> Il formato JSON supporta sia **array di oggetti** `[{...}, …]` sia **tabellare** `{ columns:[], players:[] }` (con `players` come array di righe e `columns` per mappare i campi).  
> **Colonne riconosciute** (case‑insensitive): `COD`, `Nome`, `R/ruolo`, `Sq/squadra`, `P`, `Aff%`, `MVT`, `FMT`, `MVC/MVF/FMC/FMF`, `MVDSt/MVDlt/FMDSt/FMDlt`, `GF/GFR/RS/AS/AG/A/E` e, per i portieri, `GS/GSR/RP`.

---

## Ranking di ruolo (in Corrente e Precedente)
Per ogni ruolo (**P/D/C/A**) e metrica (**MV/FM**), filtrando per **min presenze**:
- **Percentile** = quota di giocatori del ruolo con metrica ≤ al valore.
- **Z‑score** = (valore − media) / deviazione standard.  
> La **nota esplicativa** è sempre visibile in entrambi i pannelli.

---

## Opzioni (pannello “Opzioni”)
- **Visualizzazione**: **Δ squadra (σ)**, **Dettagli** (Casa/Fuori, Dev.Std), **Indicatori testuali**.
- **Ranking**:
  - **Min presenze** (separate per Corrente/Precedente).
  - **Badge rank FM – stagione** *(NUOVO v1.2.1)* → mostra il **badge Rank FM** per l’anno scelto. Se “Nessuna”, **non viene mostrato**.
  - **Badge rank MV – stagione** *(NUOVO v1.2.1)* → mostra il **badge Rank MV** per l’anno scelto. Se “Nessuna”, **non viene mostrato**.
- **Soglie & Badge (Stagione precedente)**:
  - **MV/FM/Aff**: soglie per i badge su **stagione precedente**.
  - **Mostra i badge della stagione precedente** *(NUOVO v1.2.1)*: attiva/disattiva **in testata** i badge della precedente (MV/FM/Aff su soglia + **Cambio Ruolo/Squadra**).
- **Storico**: selezione stagioni, **Bonus/Malus**, **Statistiche per presenza**.

> I nuovi selettori e il toggle operano **solo sull’header** del giocatore; le card “Corrente/Precedente” e i relativi calcoli di ranking **restano invariati**.

---

## Legenda icone (cartella `img/ico/`)
Questi nomi (senza spazi, minuscoli) sono supportati da `app.js`. Aggiungi in `img/ico/` i relativi **SVG**:
```text
assist.svg                # 🎯 Assist
autogol.svg               # 🔴⚽ Autogol
ammonizioni.svg           # 🟡 Ammonizioni
espulsioni.svg            # 🟥 Espulsioni
gol.svg                   # ⚽ Gol (giocatori di movimento)
gol_rigore.svg            # 🅁⚽ Gol su rigore
rigori_sbagliati.svg      # 🅁🔴⚽ Rigori sbagliati
# per Portieri
gol_subiti.svg            # 🔴🧠 Gol subiti
gol_subiti_rigore.svg     # 🅁🔴🧠 Gol subiti su rigore
rigori_parati.svg         # 🅁🟢🧠 Rigori parati
```
> In assenza di SVG, puoi attivare gli **indicatori testuali** (emoji) dal pannello Opzioni.

---

## Deploy (GitHub Pages — ROOT)
1. In **root**: `index.html`, `styles.css`, `app.js`, `.nojekyll`, cartella `img/`.
2. Inserisci i JSON in `data/` con uno dei nomi supportati.
3. **Settings → Pages** → *Deploy from branch* → branch `main` → folder **/** (root) → **Save**.
4. Premi `Ctrl/Cmd + Q` per la ricerca e inizia a digitare.

### Troubleshooting
- “**Nessun file stagione trovato**”: controlla **nomi file** e **percorso** `data/`.  
  Apri la **Console (F12)**: vedrai l’elenco dei path caricati (log “Stagioni caricate”).
- Test locale: avvia un server (`python -m http.server`) e apri `http://localhost:8000`.

---

## Runbook & Tools
- **Runbook (repo)**: [tools/runbook.md](tools/runbook.md)
- **Prompt (repo)**: [tools/prompt_continue.txt](tools/prompt_continue.txt)
- **Release v1.2.1 — assets**: https://github.com/mauz79/AstaMasterPro/releases/tag/v1.2.1

> Cartella locale: `D:\DEV_APPS\AstaMasterPro	ools\`

---

## Release notes (test v1.2.1)
- **Nuovo**: selettori **indipendenti** per *Rank FM – stagione* e *Rank MV – stagione* (header).  
- **Nuovo**: toggle **Mostra i badge della stagione precedente** (MV/FM/Aff su soglia + Cambio Ruolo/Squadra).  
- **Invariato**: ranking nelle card, storico, auto‑discovery stagioni, nomi file supportati, foto per `COD`.

**AstaMasterPro ©2025 mauz79** — v9c2
