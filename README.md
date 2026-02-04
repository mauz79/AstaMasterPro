[![Latest release](https://img.shields.io/github/v/release/mauz79/AstaMasterPro?include_prereleases&sort=semver)](https://github.com/mauz79/AstaMasterPro/releases/latest)

# AstaMasterPro v1.5.0 — Analyst Edition
> La Web App definitiva per l'asta del Fantacalcio.  
> **Ricerca**, **Analisi**, **Scouting Avanzato** e **Gestione Mercato** in un unico strumento.

---

## 🌟 Novità v1.5.0
- **Multi-Filtro a Soglie**: Combina filtri multipli contemporaneamente (es. MV > 6.0 **AND** Aff > 80% **AND** Presenze > 15).
- **Ordinamento Totale**: Ordina i risultati per oltre **20 metriche diverse**:
  - *Generale*: Nome, Squadra, Quotazione, Presenze, Affidabilità.
  - *Voti*: Media Voto (Tot/Casa/Fuori), FantaMedia (Tot/Casa/Fuori), **Deviazione Standard** (Costanza).
  - *Bonus/Malus*: Gol, Assist, Rigori Parati, Gol su Rigore, Autogol, Ammonizioni, Espulsioni.
- **Badge Fanta**: Visualizzazione stato mercato (Occupato/Libero) differenziata per **Divisione** (Serie A/B/C).
- **UI Riprogettata**: Pannello filtri ottimizzato e pulsante di chiusura rapida scheda giocatore.

---

## 1. Architettura
Web app **statica** (HTML/CSS/JS vanilla) ospitabile ovunque (GitHub Pages consigliato).
- **Zero Dipendenze**: Nessun framework, nessun build process. Modifica e usa.
- **Dati JSON**: Caricamento dinamico delle stagioni dalla cartella `/data/`.
- **Configurazione Esterna**: Le fantasquadre sono lette da un CSV, senza modificare il codice.

```text
/
├─ index.html            # Core UI
├─ styles.css            # Stili (Dark/Light mode)
├─ app.js                # Logica (Filtri, Ranking, Statistiche)
├─ /data/
│  ├─ squadre.csv        # Configurazione Leghe (Serie;Squadra)
│  ├─ 2025_2026.json     # Dati Stagione
│  └─ seasons.json       # Indice stagioni (opzionale)
├─ /img/                 # Foto giocatori (<COD>.jpg)
└─ /tools/               # Convertitore Excel -> JSON
```

**Note**
- Le **foto** dei giocatori vanno in `img/` e devono chiamarsi **`<COD>.<estensione>`** (dove `COD` è l’ID univoco del giocatore nei dati). L’app prova **in ordine**: `jpg`, `png`, `webp`.
- I **file stagione** devono risiedere in `data/` e possono chiamarsi **`YYYY_YYYY+1.json`**, **`YYYY.json`** oppure **`YYYY-YYYY+1.json`** (l’app tenta tutte le varianti).

---

2. Flusso di Lavoro & Installazione
A. Preparazione Dati
Esporta le statistiche da FantaCalcio Manager in Excel (.xls).

Usa il tool /tools/FCM_Excel_2_JSON.exe per convertirlo in JSON.

Assicurati che il campo TIn (Tesserato In) contenga le fantasquadre.

Copia il JSON in /data/ (es. rinominandolo 2025_2026.json).

B. Configurazione Leghe
Per abilitare i filtri per divisione (es. "Mostra solo svincolati in Serie B"), crea il file data/squadre.csv:

```text
serie a;Atletico MaNonTroppo
serie a;Real Colizzati
serie b;Scarsenal
serie b;Borussia Porcmund
...

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

C. Deploy
Carica tutti i file su una repository GitHub.

Attiva GitHub Pages dalle impostazioni della repo (Source: main branch, folder /).

3. Funzionalità Avanzate
Ranking di Ruolo (Z-Score)
Il sistema calcola in tempo reale il posizionamento del giocatore rispetto al suo ruolo:

Percentile: "È nel top 5% dei difensori".

Z-Score: Deviazioni standard dalla media del ruolo.

Utile per capire se un 6.20 è un voto eccezionale o nella media per quel ruolo in quella stagione.

Filtri Mercato
Divisione: Seleziona la tua lega specifica.

Stato: Filtra tra Svincolati (nella tua divisione) e Tesserati.

Logica: Se cerchi "Svincolati in Serie A", il sistema ti mostrerà Lautaro Martinez solo se nessuna squadra di "serie a" nel CSV lo possiede (anche se è preso in Serie B).

4. Legenda Icone & Metriche
MV/FM: Media Voto / FantaMedia.

Aff%: Affidabilità (percentuale di voti validi su giornate giocate).

σ (Dev.Std): Indice di costanza. Più è basso, più il rendimento è costante.

TIn: Squadra di appartenenza nel Fantacalcio.

5. Troubleshooting
Filtri Divisione vuoti: Controlla che data/squadre.csv esista e usi il separatore ;.

Nessun Risultato: Verifica di non aver impostato soglie troppo alte (es. MV > 8.0). Premi "Reset Tutto".

Foto mancanti: Verifica che i file in /img/ corrispondano al COD del giocatore.

AstaMasterPro ©2025 mauz79