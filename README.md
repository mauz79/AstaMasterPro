# AstaMasterPro v9c2 — **Main (ROOT)**

> Web app **static** per analisi rapida dei giocatori di Serie A.
> **Ricerca istantanea**, schede **Stagione corrente / Precedente / Storico**, badge e **Ranking di ruolo** (Percentile + Z‑score).

<p align="center"><img alt="AstaMasterPro" src="img/placeholder.svg" width="220"/></p>

## ✨ Funzioni principali

- 🔎 **Ricerca immediata** (Ctrl/Cmd + Q) con evidenziazione e scelta rapida.
- 🧩 **Schede**:
  - **Stagione corrente**: dati sintetici + **Posizione nel ruolo** con **Percentile** e **Z‑score** (nota esplicativa **sempre visibile**).
  - **Stagione precedente**: come sopra, soglie configurabili per badge (MV/FM/Aff).
  - **Storico**: elenco stagioni presenti, pesate MV/FM, aggregati, *Bonus/Malus* e *Statistiche per presenza* (opzionali).
- 🏷️ **Badge intelligenti** (stagione precedente): MV/FM/Aff con soglia configurabile; **ranking ruolo** con z‑score e percentile.
- ⚙️ **Opzioni** (dal pannello *Opzioni*):
  - *Visualizzazione*: Δ squadra (σ), Dettagli (Casa/Fuori, Dev.Std), indicatori testuali.
  - *Ranking*: **Min presenze** separate per corrente e precedente.
  - *Storico*: selezione stagioni e visibilità sezioni.
- 🌓 **Tema** light/dark persistito in LocalStorage.

## 📂 Dati richiesti
Metti i JSON nella **cartella `data/` alla radice** del repo (stessa dove si trova `index.html`).
Sono supportati **tre nomi** per ciascun anno:

- `YYYY_YYYY+1.json` (es. `2024_2025.json`)
- `YYYY.json` (es. `2024.json`)
- `YYYY-YYYY+1.json` (es. `2024-2025.json`)

> La webapp scansiona automaticamente gli ultimi **8 anni** fino a **+1** in avanti e carica i file disponibili.

### Formati supportati
- **Array di oggetti** `[{...}, ...]`
- oppure **oggetti tabellari** `{ columns:[], players:[] }` (con `players` array di righe, in cui le colonne sono mappate per indice).

**Colonne gestite** (case-insensitive): `COD`, `Nome`, `R/ruolo`, `Sq/squadra`, `P`, `Aff%`, `MVT`, `FMT`, `MVC/MVF/FMC/FMF`, `MVDSt/MVDlt/FMDSt/FMDlt`, `GF/GFR/RS/AS/AG/A/E` e per i portieri `GS/GSR/RP`.

## 🧮 Ranking di ruolo
Per metrica (MV o FM) e per ruolo (P/D/C/A) su set filtrato per **min presenze**, calcoliamo:
- **Percentile** = quota di giocatori con metrica ≤ al valore.
- **Z‑score** = (valore − media) / deviazione standard.

> La **nota esplicativa** è sempre mostrata sia nel pannello **Corrente** sia in **Precedente**.

## 🚀 Deploy (ROOT del repo)
1. Copia **questi file** nella **root** del repo: `index.html`, `styles.css`, `app.js`, `.nojekyll`, cartella `img/`.
2. Aggiungi (o mantieni) la cartella **`data/`** con i tuoi JSON.
3. GitHub → **Settings → Pages** → **Build and deployment** → *Source* = **Deploy from branch** → branch `main` → folder **/** (root) → **Save**.
4. Aggiorna il sito. Se non vedi le stagioni:
   - Verifica i **nomi file** (`2024_2025.json`, `2024.json` oppure `2024-2025.json`).
   - Controlla che i file siano **pubblici** nel repo e in **`/data`** (case-sensitive!).
   - Apri la **Console (F12)**: la webapp logga i path caricati o errori di fetch.

## 🔧 Troubleshooting rapido
- Messaggio *“Nessun file stagione trovato”*: la app non trova JSON in `/data/` con nomi attesi; rinomina i file oppure verifica il percorso.
- File `.nojekyll`: serve per bypassare eventuali build Jekyll (sicuro in ROOT). Se usi solo HTML/JS/CSS, **lascialo**.
- Test locale: `python -m http.server` e apri `http://localhost:8000` (le fetch di file locali spesso richiedono un server).

---

**AstaMasterPro v9c2** — by Maurizio · Made with ❤ for fantallenatori.
