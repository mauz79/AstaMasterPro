# Aggiornamenti • AstaMasterPro
Questa guida ti dà i **comandi pronti** per aggiornare rapidamente la webapp (nuove stagioni in `data/`, foto in `img/`, fix minori) e pubblicare su **GitHub Pages**.
> Ambiente: **Windows 11** con **Git for Windows** installato e GitHub Pages già attivo dalla **root** della repo.

---

## 0) Apri il terminale nella cartella del progetto
```powershell
cd D:\DEV_APPS\AstaMasterPro
```
Se non l’hai mai fatto su questa macchina:
```powershell
git config --global user.name "mauz79"
git config --global user.email "<la-tua-email-su-github>"
git config --global credential.helper manager-core  # login via browser/token automatico
```

---

## 1) Aggiungere nuove stagioni (JSON)
1. Copia i file nella cartella `data/` (root del progetto).
2. **Nomi supportati per ogni stagione**: `YYYY_YYYY+1.json` **oppure** `YYYY.json` **oppure** `YYYY-YYYY+1.json`.
3. **Formati JSON supportati**: **array di oggetti** oppure **tabellare** `{ columns:[], players:[] }`.

**Test locale (facoltativo):**
```powershell
python -m http.server
# apri http://localhost:8000 e verifica caricamento stagioni in Console (F12)
```

---

## 2) Aggiungere/aggiornare foto
- Metti le foto in `img/` rinominate come **`<COD>.{jpg|png|webp}`**.
- L’app prova le estensioni **in quest’ordine**: `jpg`, `png`, `webp`.

---

## 3) Aggiornamento rapido (commit & push)
> Usa questo blocco per *qualsiasi* aggiornamento (dati, immagini, README…).
```powershell
# Allinea la tua main con il remoto (se serve)
git pull --rebase origin main
# Aggiungi tutto ciò che è cambiato
git add -A
# Commit con data automatica (PowerShell)
$today = Get-Date -Format 'yyyy-MM-dd'
git commit -m "chore: update data/images/README ($today)"
# Push
git push origin main
```
Dopo 1–2 minuti, GitHub Pages aggiorna automaticamente il sito.  
**Hard refresh** del browser se vedi versioni vecchie: `Ctrl + F5` (Windows) / `Cmd + Shift + R` (macOS).

---

## 4) Solo dati (comando ultrarapido)
```powershell
$today = Get-Date -Format 'yyyy-MM-dd'
git add data/*.json
git commit -m "data: add/update seasons ($today)"
git push origin main
```

---

## 5) Creare un tag di versione (opzionale)
```powershell
# Scegli il nuovo tag (es. v9c3)
git tag -a v9c3 -m "AstaMasterPro v9c3"
git push origin v9c3
```

---

## 6) Se il push viene rifiutato (remote ahead)
> Il remoto ha commit che tu non hai ancora in locale.
**Integra e riprova:**
```powershell
git fetch origin
git pull --rebase origin main
# risolvi eventuali conflitti, poi
git push origin main
```
**Vuoi *sovrascrivere tutto* (operazione distruttiva)?**
```powershell
# Sovrascrive la main remota con la tua storia locale
# USARE SOLO SE SEI SICURO
git push origin main --force
```

---

## 7) Ripristinare un file/commit
**Vedi la cronologia recente:**
```powershell
git log --oneline -n 20
```
**Ripristina un file da un commit specifico (senza muovere la HEAD):**
```powershell
git checkout <commit> -- path/del/file
```
**Annulla un commit pubblico (crea un commit inverso):**
```powershell
git revert <commit>
git push origin main
```

---

## 8) Checklist pre‑push
- `data/` contiene i JSON corretti e con **nomi supportati**.
- `img/` contiene le foto rinominate sul **COD** con estensione valida (`jpg`/`png`/`webp`).
- In root sono presenti: `index.html`, `styles.css`, `app.js`, `.nojekyll`, `README.md`.
- Il sito locale funziona (`python -m http.server`).
- In **Console (F12)**, a runtime, l’app logga “**Stagioni caricate:** …” con i path dei JSON trovati.

---

## 9) Snippet comandi pronti
### Tutto in uno (update completo + data nel messaggio)
```powershell
cd D:\DEV_APPS\AstaMasterPro
$today = Get-Date -Format 'yyyy-MM-dd'
git pull --rebase origin main
git add -A
git commit -m "chore: update data/images/README ($today)"
git push origin main
```

### Solo nuove stagioni in /data
```powershell
cd D:\DEV_APPS\AstaMasterPro
$today = Get-Date -Format 'yyyy-MM-dd'
git add data/*.json
git commit -m "data: add seasons ($today)"
git push origin main
```

### Solo immagini in /img
```powershell
cd D:\DEV_APPS\AstaMasterPro
$today = Get-Date -Format 'yyyy-MM-dd'
git add img/
git commit -m "images: update FotoPack ($today)"
git push origin main
```

---

## 10) Aggiornare **stagione 2025/2026** (esempio pratico)
> Usa **uno solo** dei tre nomi: `2025_2026.json` **oppure** `2025.json` **oppure** `2025-2026.json`.  
> Le **foto** vanno in `img/` come `COD.{jpg|png|webp}`.

```powershell
cd D:\DEV_APPS\AstaMasterPro

# Aggiungi la stagione (scegli uno dei tre nomi)
git add data/2025_2026.json

# Aggiungi/aggiorna le foto
git add img/

# Commit e push
$today = Get-Date -Format 'yyyy-MM-dd'
git commit -m "data: add 2025/2026 + images ($today)"
git push origin main
```

> Dopo il deploy, apri la pagina e verifica da **Opzioni → Ranking** i badge *Rank FM/MV – stagione*.  
> Se vuoi nascondere i badge della precedente in testata, **disattiva** “Mostra i badge della stagione precedente”.  
> In Console (F12) vedrai “**Stagioni caricate:** …” con i path effettivamente utilizzati.
