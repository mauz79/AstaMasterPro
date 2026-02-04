
# AstaMasterPro v1.1 — Riepilogo Completo

Questo documento contiene tutte le informazioni utili per mantenere, aggiornare e distribuire AstaMasterPro tramite GitHub Pages, incluse patch recenti e struttura del progetto.

## Contenuto principale
- Struttura cartelle
- Flusso aggiornamenti (Git)
- Patch app.js (conteggi interi, metrica FM/MV, ranking MV)
- Procedure per Release, Pre-release e GitHub Pages
- Istruzioni backup e ZIP root-ready

## Struttura cartelle del progetto
```
AstaMasterPro/
│ index.html
│ styles.css
│ app.js
│ README.md
│ .nojekyll
│ aggiornamenti.md
├── img/
│   └── <foto giocatori>
├── data/
│   └── <stagioni JSON>
└── ico/
    └── <icone statistiche>
```

## Patch principali applicate
### 1. Conteggi mostrati come interi
Campi convertiti: Gol, Gol su Rigore, Rigori Sbagliati, Assist, Autogol, Ammonizioni, Espulsioni + Portieri (GS, GSR, RP).

### 2. Scelta metrica ranking badge
Nuova opzione:
```
<select id="opt_rankBadgeMetric">
  <option value="FM">FM</option>
  <option value="MV">MV</option>
</select>
```

### 3. Ranking MV mostrato anche in "Posizione nel ruolo"
Aggiunto: `(X° su N)` per MV oltre al Percentile.

## Flusso aggiornamenti Git
### Commit e push
```
cd D:\DEV_APPS\AstaMasterPro
git pull --rebase origin main
git add -A
$today = Get-Date -Format 'yyyy-MM-dd'
git commit -m "update ($today)"
git push origin main
```

### Creare una release ufficiale
1. Vai su GitHub → Releases → Draft a new release
2. Tag: `AstamasterPro_1.1`
3. Titolo: `AstaMasterPro 1.1`
4. Genera note o incollale
5. Allegare ZIP root-ready
6. Publish release

### ZIP root-ready (PowerShell)
```
Compress-Archive -Path index.html,styles.css,app.js,img,data,README.md,.nojekyll,aggiornamenti.md -DestinationPath AstaMasterPro_1.1_root-ready.zip -Force
```

## GitHub Pages
- Source: `main`
- Folder: `/`
- Attesa: 30-90 secondi per CDN refresh

## Note finali
- Nessun dato sensibile incluso
- Sicuro da condividere

