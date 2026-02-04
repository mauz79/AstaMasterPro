// AstaMasterPro v1.5.0 — app.js [Analyst Edition: Full Sorting & Thresholds]
(function () {
  'use strict';
  var DATA_DIRS = ['data/']; 
  var IMG_BASE = 'img/';
  var TEAMS_FILE = 'squadre.csv'; 
  var THEME_KEY = 'amp-theme';
  var $ = function (s) { return document.querySelector(s); };

  var SELECTED_COD = null, SEASONS = [], CUR = null, PREV = null, INDEX = [];
  var ROLE_CACHE = {}; 
  var FANTA_TEAMS = {}; 
  var KNOWN_DIVISIONS = new Set(); 

  // --------- UTIL ---------
  function escapeHtml(s) { return String(s == null ? '' : s).replace(/[&<>\"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]); }
  function fmt(v, d) { if (d === void 0) d = 2; if (v == null) return '—'; var n = Number(v); return isFinite(n) ? n.toFixed(d).replace('.', ',') : String(v); }
  function fmtInt(v) { if (v == null) return '—'; var n = Number(v); return isFinite(n) ? String(Math.round(n)) : String(v); }
  function fmtPercent(x) { if (x == null) return '—'; var v = Number(x); if (!isFinite(v)) return String(x); if (v <= 1) v *= 100; return (v.toFixed(1) + '%').replace('.', ','); }
  function norm(s){ try{ return String(s==null?'':s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim(); }catch(e){ return String(s==null?'':s).toLowerCase().trim(); } }
  function highlightMatch(t, q) { var lt=String(t||''),qq=String(q||''); var i=lt.toLowerCase().indexOf(qq.toLowerCase()); if(i<0) return escapeHtml(lt); var e=i+qq.length; return escapeHtml(lt.slice(0,i))+'<mark>'+escapeHtml(lt.slice(i,e))+'</mark>'+escapeHtml(lt.slice(e)); }
  function seasonStr(key){ return String(key||'').replace('_','/').replace('-','/'); }
  function getSerieForTeam(teamName) { return FANTA_TEAMS[norm(teamName)] || '??'; }

  // --------- FOTO & UI ---------
  var PHOTO_EXTS = ['jpg', 'png', 'webp'];
  function setPlayerPhoto(cod) {
    var img = $('#playerPhoto'); if (!img) return;
    var i = 0; function next(){ if(i>=PHOTO_EXTS.length){ img.src = IMG_BASE+'placeholder.svg'; return; } img.src = IMG_BASE+cod+'.'+PHOTO_EXTS[i++]; }
    img.onerror = next; next();
  }
  var TGL_KEYS = { cur: 'toggle-current', prev: 'toggle-prev', hist: 'toggle-storico' };
  function applyTheme(mode){ document.documentElement.setAttribute('data-theme', mode); var sw=$('#switchTheme'); if(sw) sw.checked=(mode==='dark'); }
  function setupTheme(){ var saved = localStorage.getItem(THEME_KEY); applyTheme(((saved==='light'||saved==='dark')?saved:'dark')); var sw=$('#switchTheme'); if(sw) sw.addEventListener('change', e=>{ var mode=e.target.checked?'dark':'light'; applyTheme(mode); localStorage.setItem(THEME_KEY, mode); }); }
  function applyToggles(){ var bCur=localStorage.getItem(TGL_KEYS.cur)!=='off', bPrev=localStorage.getItem(TGL_KEYS.prev)!=='off', bHist=localStorage.getItem(TGL_KEYS.hist)!=='off';
    var el; el=$('#switchCurrent'); if(el) el.checked=bCur; el=$('#wrapCurrent'); if(el) el.classList.toggle('hidden', !bCur);
    el=$('#switchPrev'); if(el) el.checked=bPrev; el=$('#wrapPrev'); if(el) el.classList.toggle('hidden', !bPrev);
    el=$('#switchStorico'); if(el) el.checked=bHist; el=$('#wrapStorico'); if(el) el.classList.toggle('hidden', !bHist);
  }
  function setupToggles(){
    ['Current','Prev','Storico'].forEach(k => { var sw=$('#switch'+k); if(sw) sw.addEventListener('change', e=>{ localStorage.setItem(TGL_KEYS[k.toLowerCase()], e.target.checked?'on':'off'); applyToggles(); }); });
    applyToggles();
  }

  // --------- OPTIONS ---------
  var OPTS = null, OPT_KEYS = {
    minPresRankCur: 'amp-minPresRankCur', minPresRankPrev:'amp-minPresRankPrev',
    mvPrevBadge: 'amp-mvPrevBadge', fmPrevBadge: 'amp-fmPrevBadge', affPrevBadge: 'amp-affPrevBadge',
    showPrevBadges: 'amp-showPrevBadges', showDelta: 'amp-showDelta', showDetails: 'amp-showDetails',
    histShowBM: 'amp-histShowBM', histShowPerPres:'amp-histShowPerPres', histSelSeasons: 'amp-histSelSeasons',
    useIndicators: 'amp-useIndicators', rankBadgeMetric:'amp-rankBadgeMetric', showRolePos: 'amp-showRolePos',
    rankBadgeSeasonFM: 'amp-rankBadgeSeasonFM', rankBadgeSeasonMV: 'amp-rankBadgeSeasonMV',
    badgeSeasonValues: 'amp-badgeSeasonValues', badgeSeasonAff: 'amp-badgeSeasonAff'
  };
  function loadOptions(){
    function qn(k,d){ var v=localStorage.getItem(k); return (v!=null&&isFinite(Number(v)))?Number(v):d; }
    function qb(k,d){ var v=localStorage.getItem(k); if(v==null) return d; return v==='1'; }
    function qarr(k,d){ var v=localStorage.getItem(k); try{ return v?JSON.parse(v):d; }catch(e){ return d; } }
    function qs(k,d){ var v=localStorage.getItem(k); return (v==null)?d:v; }
    var o = {
      minPresRankCur: qn(OPT_KEYS.minPresRankCur,10), minPresRankPrev:qn(OPT_KEYS.minPresRankPrev,10),
      mvPrevBadge: qn(OPT_KEYS.mvPrevBadge,6.20), fmPrevBadge: qn(OPT_KEYS.fmPrevBadge,6.50), affPrevBadge: qn(OPT_KEYS.affPrevBadge,70),
      showPrevBadges: qb(OPT_KEYS.showPrevBadges,false), showDelta: qb(OPT_KEYS.showDelta,true), showDetails: qb(OPT_KEYS.showDetails,true),
      histShowBM: qb(OPT_KEYS.histShowBM,true), histShowPerPres:qb(OPT_KEYS.histShowPerPres,true),
      histSelSeasons: qarr(OPT_KEYS.histSelSeasons,[]), useIndicators: qb(OPT_KEYS.useIndicators,false),
      showRolePos: qb(OPT_KEYS.showRolePos,true), rankBadgeMetric:(localStorage.getItem(OPT_KEYS.rankBadgeMetric) || 'FM'),
      rankBadgeSeasonFM: qs(OPT_KEYS.rankBadgeSeasonFM,""), rankBadgeSeasonMV: qs(OPT_KEYS.rankBadgeSeasonMV,""),
      badgeSeasonValues: qs(OPT_KEYS.badgeSeasonValues,""), badgeSeasonAff: qs(OPT_KEYS.badgeSeasonAff,"")
    };
    function set(id, val, isC){ var el=$('#'+id); if(!el) return; if(isC) el.checked=!!val; else el.value=val; }
    set('opt_minPresRankCur', o.minPresRankCur); set('opt_minPresRankPrev',o.minPresRankPrev);
    set('opt_mvPrevBadge', o.mvPrevBadge); set('opt_fmPrevBadge', o.fmPrevBadge); set('opt_affPrevBadge', o.affPrevBadge);
    set('opt_showPrevBadges', o.showPrevBadges, true); set('opt_showDelta', o.showDelta, true);
    set('opt_showDetails', o.showDetails, true); set('opt_histShowBM', o.histShowBM, true);
    set('opt_histShowPerPres', o.histShowPerPres, true); set('opt_useIndicators', o.useIndicators, true);
    set('opt_showRolePos', o.showRolePos, true); set('opt_rankBadgeMetric',o.rankBadgeMetric);
    set('opt_rankBadgeSeasonFM', o.rankBadgeSeasonFM); set('opt_rankBadgeSeasonMV', o.rankBadgeSeasonMV);
    set('opt_badgeSeasonValues', o.badgeSeasonValues); set('opt_badgeSeasonAff', o.badgeSeasonAff);
    return o;
  }
  function persistOptions(){ Object.keys(OPT_KEYS).forEach(k => { var v=OPTS[k.replace('amp-','')]; if(typeof v==='boolean') v=v?'1':'0'; else if(Array.isArray(v)) v=JSON.stringify(v); localStorage.setItem(OPT_KEYS[k], v); }); }

  function populateHistSeasonOptions(){
    var host = $('#opt_histSeasons'); if(!host) return; host.innerHTML = '';
    if(!SEASONS.length){ host.textContent='—'; return; }
    if(!OPTS.histSelSeasons || !OPTS.histSelSeasons.length){ OPTS.histSelSeasons = SEASONS.map(s=>s.seasonKey); persistOptions(); }
    SEASONS.forEach(s=>{
      var id='opt_hist_'+s.seasonKey, label=document.createElement('label');
      label.style.display='block'; label.style.margin='.15rem 0';
      label.innerHTML = '<input type="checkbox" id="'+id+'"> '+seasonStr(s.seasonKey);
      host.appendChild(label);
      var cb = label.querySelector('input'); cb.checked = OPTS.histSelSeasons.indexOf(s.seasonKey)>=0;
      cb.addEventListener('change', ()=>{ var set = new Set(OPTS.histSelSeasons||[]); if(cb.checked) set.add(s.seasonKey); else set.delete(s.seasonKey); OPTS.histSelSeasons = Array.from(set); persistOptions(); if(SELECTED_COD) selectPlayer(SELECTED_COD); });
    });
  }
  function populateAllBadgeSeasonOptions(){
    var map = [ { id:'opt_rankBadgeSeasonFM', key:'rankBadgeSeasonFM' }, { id:'opt_rankBadgeSeasonMV', key:'rankBadgeSeasonMV' }, { id:'opt_badgeSeasonValues', key:'badgeSeasonValues' }, { id:'opt_badgeSeasonAff', key:'badgeSeasonAff' } ];
    map.forEach(m=>{
      var el=$( '#'+m.id ); if(!el) return; el.innerHTML='';
      var optNone=document.createElement('option'); optNone.value=''; optNone.textContent='Nessuna'; el.appendChild(optNone);
      SEASONS.forEach(s=>{ var o=document.createElement('option'); o.value=s.seasonKey; o.textContent=seasonStr(s.seasonKey); el.appendChild(o); });
      var sel = OPTS[m.key] || ''; if(sel && !SEASONS.some(x=>x.seasonKey===sel)) sel=''; el.value = sel; OPTS[m.key]=sel;
    }); persistOptions();
  }
  function setupOptions(){
    OPTS = loadOptions();
    function sync(){ 
        OPTS.minPresRankCur=Number($('#opt_minPresRankCur').value); OPTS.minPresRankPrev=Number($('#opt_minPresRankPrev').value);
        OPTS.mvPrevBadge=Number($('#opt_mvPrevBadge').value); OPTS.fmPrevBadge=Number($('#opt_fmPrevBadge').value); OPTS.affPrevBadge=Number($('#opt_affPrevBadge').value);
        OPTS.showPrevBadges=$('#opt_showPrevBadges').checked; OPTS.showDelta=$('#opt_showDelta').checked; OPTS.showDetails=$('#opt_showDetails').checked;
        OPTS.histShowBM=$('#opt_histShowBM').checked; OPTS.histShowPerPres=$('#opt_histShowPerPres').checked; OPTS.useIndicators=$('#opt_useIndicators').checked; OPTS.showRolePos=$('#opt_showRolePos').checked;
        persistOptions(); if(SELECTED_COD) selectPlayer(SELECTED_COD);
    }
    document.querySelectorAll('.options input, .options select').forEach(el=>el.addEventListener('change', sync));
    var selRank = document.querySelector('#opt_rankBadgeMetric'); if(selRank) selRank.addEventListener('change', ()=>{ OPTS.rankBadgeMetric = (selRank.value==='MV') ? 'MV' : 'FM'; persistOptions(); if(SELECTED_COD) selectPlayer(SELECTED_COD); });
    function bindSel(id,key){ var el=$(id); if(!el) return; el.addEventListener('change', ()=>{ OPTS[key]=el.value||''; persistOptions(); if(SELECTED_COD) selectPlayer(SELECTED_COD); }); }
    bindSel('#opt_rankBadgeSeasonFM','rankBadgeSeasonFM'); bindSel('#opt_rankBadgeSeasonMV','rankBadgeSeasonMV'); bindSel('#opt_badgeSeasonValues','badgeSeasonValues'); bindSel('#opt_badgeSeasonAff','badgeSeasonAff');
    $('#btnCloseOptions')?.addEventListener('click', ()=>{ $('details.options').removeAttribute('open'); });
    $('#btnCloseOptionsTop')?.addEventListener('click', ()=>{ $('details.options').removeAttribute('open'); });
    $('#btnResetOptions')?.addEventListener('click', ()=>{ localStorage.clear(); location.reload(); });
    return OPTS;
  }

  // --------- DATA LOADING ---------
  async function loadFantaTeams(){
    try {
      var res = await fetch(DATA_DIRS[0] + TEAMS_FILE);
      if(!res.ok) throw new Error('File squadre non trovato');
      var txt = await res.text();
      var lines = txt.split('\n');
      lines.forEach(line => {
        var p = line.split(';');
        if(p.length >= 2){
          var serie = p[0].trim().toLowerCase();
          var team  = p[1].trim();
          if(team){
             FANTA_TEAMS[norm(team)] = serie;
             KNOWN_DIVISIONS.add(serie);
          }
        }
      });
      var selDiv = $('#filterDivision');
      if(selDiv){
          selDiv.innerHTML = '<option value="">Tutte le leghe</option>';
          Array.from(KNOWN_DIVISIONS).sort().forEach(d => {
              var opt = document.createElement('option'); opt.value = d; opt.textContent = d.charAt(0).toUpperCase() + d.slice(1);
              selDiv.appendChild(opt);
          });
      }
    } catch(e){ console.warn('Impossibile caricare squadre.csv', e); }
  }

  function candidateSeasonKeys(){ var y=(new Date()).getFullYear(); var keys=[]; for(var yy=y-8; yy<=y+1; yy++){ keys.push(yy+'_'+(yy+1)); } return keys.reverse(); }
  function fileCandidatesFor(key){ var start=Number(String(key).split('_')[0]), next=start+1; return [key+'.json', start+'.json', (String(start)+'-'+String(next)+'.json')]; }
  
  function normRow(obj){
    var R = String(obj['R']||obj['ruolo']||obj['r']||'').toUpperCase();
    var isP = (R==='P');
    function takef(k){ var v=obj[k]; if(v===''||v==null) return null; var n=Number(v); return isFinite(n)?n:v; }
    function takei(k){ var v=obj[k]; if(v===''||v==null) return 0; var n=Number(v); return isFinite(n)?Math.trunc(n):0; }
    
    var fsq = obj['TIn'] || obj['Fantasquadra'] || obj['FantaSquadra'] || obj['FantaTeam'];
    if(!fsq || String(fsq) === '0' || String(fsq) === 'NaN') fsq = null;
    else fsq = String(fsq).trim();

    return {
      cod: obj['COD']||obj['cod']||obj['Cod']||obj['Id']||obj['ID'],
      nome: obj['Nome']||obj['nome'],
      sq: obj['Sq']||obj['squadra']||obj['Sq.']||obj['Team'],
      fantaSq: fsq, 
      r: R, p: takei('P'), aff: takef('Aff%'),
      quot: takei('FMld'), // Quotazione (FMld in FCM)
      mvt: takef('MVT'), fmt: takef('FMT'),
      mvc: takef('MVC'), mvf: takef('MVF'), fmc: takef('FMC'), fmf: takef('FMF'),
      mvdst: takef('MVDSt'), fmdst: takef('FMDSt'),
      gf: takei('GF'), gfr: takei('GFR'), rs: takei('RS'), as: takei('AS'), ag: takei('AG'), a: takei('A'), e: takei('E'),
      gs: isP? takei('GS'):null, gsr: isP? takei('GSR'):null, rp: isP? takei('RP'):null
    };
  }
  function parseRaw(raw){
    var rows=[];
    if(Array.isArray(raw)) rows = raw;
    else if(raw && Array.isArray(raw.players)){
      if(Array.isArray(raw.columns) && Array.isArray(raw.players[0])){
        var cols = raw.columns;
        rows = raw.players.map(r=>{ var o={}; for(var i=0;i<cols.length;i++) o[cols[i]] = (r[i]==null? null : r[i]); return o; });
      } else rows = raw.players;
    } else return null;
    return rows.map(normRow).filter(r=>r.cod && r.nome);
  }
  async function loadSeasonAuto(key){
    for(var d=0; d<DATA_DIRS.length; d++){
      var files=fileCandidatesFor(key);
      for(var i=0;i<files.length;i++){
        try{
          var res = await fetch(DATA_DIRS[d]+files[i], { cache:'no-store' });
          if(res.ok){
            var raw = await res.json(); var rows=parseRaw(raw); if(!rows) continue;
            return { seasonKey:key, seasonStart:Number(key.split('_')[0]), players:rows };
          }
        }catch(e){}
      }
    }
    return null;
  }
  async function discoverSeasons(){
    var keys=candidateSeasonKeys(), out=[];
    for(var i=0;i<keys.length;i++){ var s=await loadSeasonAuto(keys[i]); if(s) out.push(s); }
    out.sort((a,b)=>a.seasonStart - b.seasonStart);
    return out;
  }

  // --------- RICERCA, FILTRI & ORDINAMENTO (v1.5.0) ---------
  function buildIndex(){
    INDEX = [];
    var prevMap = new Map(), realTeams = new Set();
    if(PREV) PREV.players.forEach(p=>prevMap.set(String(p.cod), p));
    if(!CUR) return;
    CUR.players.forEach(c=>{
      var pr = prevMap.get(String(c.cod));
      if(c.sq) realTeams.add(c.sq);
      
      var takenSeries = [];
      if(c.fantaSq){
          c.fantaSq.split(',').forEach(t=>{
              var s = getSerieForTeam(t.trim());
              if(s && s!=='??') takenSeries.push(s);
          });
      }

      INDEX.push({ 
        cod:String(c.cod), nome:c.nome, ruolo:c.r, squadra:c.sq,
        fantaSq: c.fantaSq, takenSeries: takenSeries,
        
        // FULL STATS INDEXING
        mvt: Number(c.mvt)||0, fmt: Number(c.fmt)||0, 
        mvc: Number(c.mvc)||0, mvf: Number(c.mvf)||0,
        fmc: Number(c.fmc)||0, fmf: Number(c.fmf)||0,
        mvdst: Number(c.mvdst)||0, fmdst: Number(c.fmdst)||0,
        
        p: Number(c.p)||0, aff: Number(c.aff)||0, quot: Number(c.quot)||0,
        gf: Number(c.gf)||0, gfr: Number(c.gfr)||0, as: Number(c.as)||0,
        gs: Number(c.gs)||0, rp: Number(c.rp)||0, rs: Number(c.rs)||0,
        ag: Number(c.ag)||0, a: Number(c.a)||0, e: Number(c.e)||0,
        
        prevRuolo: pr?pr.r:null, prevSquadra: pr?pr.sq:null,
        changedRole: !!(pr && pr.r && c.r && pr.r !== c.r), 
        changedTeam: !!(pr && pr.sq && c.sq && pr.sq !== c.sq)
      });
    });
    
    var sel=$('#filterTeam');
    if(sel){ sel.innerHTML='<option value="">Tutte</option>'; Array.from(realTeams).sort().forEach(t=>{ var o=document.createElement('option'); o.value=t; o.textContent=t; sel.appendChild(o); }); }
  }

  function renderResults(items, q){
    var ul=$('#results'); if(!ul) return; ul.innerHTML='';
    items.slice(0,100).forEach(item => {
      var li=document.createElement('li'); li.className='result-item'; li.tabIndex=0;
      var badges=[];
      if(item.fantaSq) badges.push('<span class="badge fanta small">Taken</span>');
      if(OPTS.showPrevBadges){
        if(item.changedRole) badges.push('<span class="badge warn">Ruolo</span>');
        if(item.changedTeam) badges.push('<span class="badge alert">Sq</span>');
      }
      li.innerHTML = `<span class="result-title">${highlightMatch(item.nome, q)}</span><span><span class="result-meta">${item.ruolo} · ${item.squadra}</span> ${badges.join(' ')}</span>`;
      li.addEventListener('click', () => selectPlayer(item.cod));
      li.addEventListener('keydown', e => { if(e.key==='Enter') selectPlayer(item.cod); });
      ul.appendChild(li);
    });
  }

  function search(){
    var q = $('#searchInput').value, nq = norm(q);
    var fRole = $('#filterRole')?.value || '';
    var fTeam = $('#filterTeam')?.value || '';
    var fDivision = $('#filterDivision')?.value || ''; 
    var fStatus = $('#filterStatus')?.value || '';
    
    // SOGLIE MULTIPLE (AND Logic)
    var fMinMV = parseFloat($('#filterMinMV')?.value) || 0;
    var fMinFM = parseFloat($('#filterMinFM')?.value) || 0;
    var fMinAff = parseFloat($('#filterMinAff')?.value) || 0;
    var fMinPres = parseFloat($('#filterMinPres')?.value) || 0;

    var sortBy = $('#sortBy')?.value || 'nome';

    // Se tutto vuoto e no filtri, nascondi
    if(!nq && !fRole && !fTeam && !fDivision && !fStatus && !fMinMV && !fMinFM && !fMinAff && !fMinPres){ $('#panelResults').classList.add('hidden'); return; }

    var res = INDEX.filter(x => {
      if(nq && !norm(x.nome).includes(nq)) return false;
      if(fRole && x.ruolo !== fRole) return false;
      if(fTeam && x.squadra !== fTeam) return false;
      
      // Thresholds check
      if(fMinMV > 0 && x.mvt < fMinMV) return false;
      if(fMinFM > 0 && x.fmt < fMinFM) return false;
      if(fMinAff > 0 && x.aff < fMinAff) return false; // aff is percent e.g. 95
      if(fMinPres > 0 && x.p < fMinPres) return false;

      // Division/Status Logic
      if(fStatus || fDivision) {
          var isTakenInDiv = false;
          if(fDivision){ isTakenInDiv = x.takenSeries.includes(fDivision); }
          else { isTakenInDiv = (x.takenSeries.length > 0); }

          if(fStatus === 'free' && isTakenInDiv) return false;
          if(fStatus === 'taken' && !isTakenInDiv) return false;
      }
      return true;
    });

    // --- SORTING LOGIC ---
    res.sort(function(a, b){
        // Malus/DevStd (Crescente: meglio basso)
        if(['gs','ag','rs','a','e','mvdst','fmdst'].includes(sortBy)){
            return a[sortBy] - b[sortBy];
        }
        // Bonus/Medie (Decrescente: meglio alto)
        if(['mvt','fmt','mvc','mvf','fmc','fmf','p','gf','as','rp','gfr','aff','quot'].includes(sortBy)){
            return b[sortBy] - a[sortBy];
        }
        // Strings (Ascending)
        if(sortBy === 'squadra') return a.squadra.localeCompare(b.squadra);
        // Default: nome
        return a.nome.localeCompare(b.nome);
    });

    $('#panelResults').classList.remove('hidden');
    renderResults(res, q);
  }

  function wireSearch(){
    var inp = $('#searchInput');
    var inputs = ['#filterRole', '#filterTeam', '#filterDivision', '#filterStatus', '#filterMinMV', '#filterMinFM', '#filterMinAff', '#filterMinPres', '#sortBy'];
    function trig(){ setTimeout(search, 150); }
    
    if(inp) inp.addEventListener('input', trig);
    inputs.forEach(sel => { 
        var el=$(sel); 
        if(el) { el.addEventListener('change', trig); if(sel.includes('Min')) el.addEventListener('input', trig); }
    });
    
    $('#btnClearFilters')?.addEventListener('click', () => { 
        inputs.forEach(s => { var el=$(s); if(el) el.value=''; }); 
        $('#sortBy').value = 'nome'; // Default sort
        inp.value=''; 
        $('#panelResults').classList.add('hidden'); 
    });
    
    // CLOSE CARD
    $('#btnClosePlayer')?.addEventListener('click', () => {
        $('#playerSection').classList.add('hidden');
        // Riapri lista se c'è ricerca
        var q = inp.value;
        var hasFilters = inputs.some(f => $(f).value !== '' && !f.includes('sortBy'));
        if(q || hasFilters) $('#panelResults').classList.remove('hidden');
    });
  }

  // --------- RANKING & BADGES ---------
  function ensureRoleCache(seasonKey){ if(!ROLE_CACHE[seasonKey]) ROLE_CACHE[seasonKey] = {}; return ROLE_CACHE[seasonKey]; }
  function getRoleDistribution(seasonObj, role, metric, minPres){
    if(!seasonObj) return null;
    var r=String(role||'').toUpperCase(); if(!r) return null;
    var cacheSeason=ensureRoleCache(seasonObj.seasonKey); if(!cacheSeason[r]) cacheSeason[r]={};
    var key=metric+'__'+String(minPres);
    if(!cacheSeason[r][key]){
      var vals=seasonObj.players.filter(p => (p.r===r) && ((Number(p.p)||0) >= (minPres||0))).map(p => Number(p[metric])).filter(n => isFinite(n)).sort((a,b) => a-b);
      var N=vals.length, mean=N? vals.reduce((a,b)=>a+b,0)/N : 0, variance=N? vals.reduce((s,x)=>s+(x-mean)*(x-mean),0)/N : 0;
      cacheSeason[r][key] = { vals: vals, N: N, mean: mean, std: Math.sqrt(variance) };
    }
    return cacheSeason[r][key];
  }
  function computeRankForSeason(seasonObj, metric, value, role, minPres){
    try{
      var v=Number(value); if(!isFinite(v)) return null;
      var dist=getRoleDistribution(seasonObj, role, metric, minPres); if(!dist || !dist.N) return null;
      var less=0, equal=0, eps=1e-9;
      for(var i=0;i<dist.vals.length;i++){ var x=dist.vals[i]; if(x<v-eps) less++; else if(Math.abs(x-v)<=eps) equal++; }
      var pct=(less+0.5*equal)/dist.N, z=dist.std>0 ? (v-dist.mean)/dist.std : 0;
      return { pct:pct, z:z, N:dist.N, rank: Math.max(1, dist.N-(less+equal)+1) };
    }catch(e){ return null; }
  }
  function addBadge(arr, text, cls, title){ arr.push('<span class="badge '+(cls||'info')+'" title="'+escapeHtml(title||'')+'">'+escapeHtml(text)+'</span>'); }
  function buildSeasonRankingBadges(seasonObj, rec, type){
    var b=[], y=seasonStr(seasonObj.seasonKey), minP=(CUR&&seasonObj.seasonKey===CUR.seasonKey)?OPTS.minPresRankCur:OPTS.minPresRankPrev;
    if(type==='FM'||type==='both'){ var rk=computeRankForSeason(seasonObj,'fmt',rec.fmt,rec.r,minP); if(rk) addBadge(b,'Rank FM '+y+' '+rk.rank+'°','info','Pct: '+fmt(rk.pct*100,1)+'%'); }
    if(type==='MV'||type==='both'){ var rk=computeRankForSeason(seasonObj,'mvt',rec.mvt,rec.r,minP); if(rk) addBadge(b,'Rank MV '+y+' '+rk.rank+'°','info','Pct: '+fmt(rk.pct*100,1)+'%'); }
    return b;
  }

  // --------- RENDER CARDS ---------
  function labelWithMark(text, iconKey, indicator){ return (OPTS.useIndicators?(indicator?indicator+' ':''):(iconKey?'<img src="'+IMG_BASE+'ico/'+iconKey+'.svg" class="ico stat" alt="" onerror="this.style.display=\'none\'"> ':'')) + escapeHtml(text); }
  function row(label, value, opts){ opts=opts||{}; return '<div class="row"><span class="key">'+escapeHtml(label)+'</span><span class="val">'+(opts.percent?fmtPercent(value):fmt(value))+'</span></div>'; }
  function rowInt(label, value){ return '<div class="row"><span class="key">'+escapeHtml(label)+'</span><span class="val">'+fmtInt(value)+'</span></div>'; }
  function rowHTMLInt(labelHtml, value){ return '<div class="row"><span class="key">'+labelHtml+'</span><span class="val">'+fmtInt(value)+'</span></div>'; }

  function renderCard(el, rec, seasonObj, isPrev){
    if(!rec){ el.innerHTML='<div class="small">Dati non disponibili.</div>'; return; }
    var isP=(rec.r==='P'), parts=[];
    parts.push(row('Squadra', rec.sq)); parts.push(row('Ruolo', rec.r)); parts.push(rowInt('Presenze', rec.p));
    parts.push(row('Affidabilità %', rec.aff, {percent:true}));
    parts.push(row('Quotazione', rec.quot)); // Added Quotazione
    parts.push(row('MV (Tot)', rec.mvt)); parts.push(row('FM (Tot)', rec.fmt));
    parts.push(rowHTMLInt(labelWithMark(isP?'GS':'Gol', isP?'gol_subiti':'gol', isP?'🔴🧠':'⚽'), isP?rec.gs:rec.gf));
    parts.push(rowHTMLInt(labelWithMark('Assist','assist','🎯'), rec.as));
    parts.push(rowHTMLInt(labelWithMark('Amm.','ammonizioni','🟡'), rec.a));
    parts.push(rowHTMLInt(labelWithMark('Esp.','espulsioni','🟥'), rec.e));
    if(OPTS.showDelta){ parts.push(row('Δ squadra MV (σ)', rec.mvdlt)); parts.push(row('Δ squadra FM (σ)', rec.fmdlt)); }
    
    if(OPTS.showRolePos){
      var y=seasonStr(seasonObj.seasonKey), minP=isPrev?OPTS.minPresRankPrev:OPTS.minPresRankCur;
      var rkFM=computeRankForSeason(seasonObj,'fmt',rec.fmt,rec.r,minP), rkMV=computeRankForSeason(seasonObj,'mvt',rec.mvt,rec.r,minP);
      if(rkFM || rkMV){
        parts.push('<div class="separator" style="border:none;margin:.4rem 0 0"></div><div class="small"><strong>Ranking '+escapeHtml(y)+'</strong></div>');
        if(rkFM) parts.push('<div class="row"><span class="key">FM (pctl)</span><span class="val">'+fmt(rkFM.pct*100,1)+'%</span></div>');
        if(rkMV) parts.push('<div class="row"><span class="key">MV (pctl)</span><span class="val">'+fmt(rkMV.pct*100,1)+'%</span></div>');
      }
    }
    if(OPTS.showDetails){
      parts.push('<details class="small"><summary>Dettagli</summary><div class="card-body" style="padding:.6rem 0 0">'+
        row('MV (Casa)', rec.mvc)+row('MV (Fuori)', rec.mvf)+row('FM (Casa)', rec.fmc)+row('FM (Fuori)', rec.fmf)+
        row('Dev.Std MV', rec.mvdst)+row('Dev.Std FM', rec.fmdst)+ // Added DevStd details
      '</div></details>');
    }
    el.innerHTML = parts.join('');
  }

  function renderStorico(cod){
    var el=$('#cardStorico'), found=[];
    SEASONS.forEach(s=>{ var r=s.players.find(p=>String(p.cod)===String(cod)); if(r) found.push({season:s, rec:r}); });
    if(!found.length){ el.innerHTML='<div class="small">Nessun dato storico.</div>'; return; }
    var sel=new Set(OPTS.histSelSeasons), filtered=found.filter(x=>sel.has(x.season.seasonKey));
    if(!filtered.length){ el.innerHTML='<div class="small">Nessuna stagione selezionata.</div>'; return; }
    
    var n=filtered.length, list=filtered.map(x=>seasonStr(x.season.seasonKey)).join(', ');
    var pres=filtered.reduce((s,x)=>s+(Number(x.rec.p)||0),0);
    var mvNum=filtered.reduce((s,x)=>s+((Number(x.rec.mvt)||0)*(Number(x.rec.p)||0)),0);
    var fmNum=filtered.reduce((s,x)=>s+((Number(x.rec.fmt)||0)*(Number(x.rec.p)||0)),0);
    
    var r0=filtered[0].rec, isP=(r0.r==='P');
    function sum(k){ return filtered.reduce((s,x)=>s+(Number(x.rec[k])||0),0); }
    var gf=sum('gf'), as=sum('as'), ag=sum('ag'), amm=sum('a'), esp=sum('e'), gs=isP?sum('gs'):null, rp=isP?sum('rp'):null;

    var html = '<div class="small"><strong>Stagioni</strong>: '+escapeHtml(list)+'</div>' +
               rowInt('Presenze totali', pres) +
               row('MV Media Pesata', pres?mvNum/pres:0) +
               row('FM Media Pesata', pres?fmNum/pres:0);
    html += '<div class="small" style="margin-top:.4rem"><strong>Totali</strong></div>' +
            (isP ? rowInt('Gol Subiti', gs)+rowInt('Rigori Parati', rp) : rowInt('Gol', gf)) +
            rowInt('Assist', as) + rowInt('Amm/Esp', amm+' / '+esp);
            
    if(OPTS.histShowPerPres){
        html += '<div class="small" style="margin-top:.4rem"><strong>Freq. Bonus</strong></div>' +
                (isP ? row('Pres/Rig. Parato', rp>0?pres/rp:0) : row('Pres/Gol', gf>0?pres/gf:0)) +
                row('Pres/Assist', as>0?pres/as:0);
    }
    el.innerHTML = html;
  }

  // --------- SELEZIONE GIOCATORE ---------
  function selectPlayer(cod){
    SELECTED_COD=String(cod);
    $('#playerSection').classList.remove('hidden'); $('#panelResults').classList.add('hidden');
    var curRec = CUR && CUR.players.find(p=>String(p.cod)===cod);
    var prevRec= PREV ? PREV.players.find(p=>String(p.cod)===cod) : null;
    var idx = INDEX.find(x=>String(x.cod)===cod);

    $('#playerName').textContent = (idx?idx.nome:(curRec?curRec.nome:'Giocatore'));
    setPlayerPhoto(cod);
    var role = idx ? idx.ruolo : (curRec?curRec.r:'');
    var sq   = idx ? idx.squadra : (curRec?curRec.sq:'');
    var rCls = ['P','D','C','A'].includes(role) ? 'chip chip--role role--'+role : 'badge';
    $('#playerMeta').innerHTML = '<span class="'+rCls+'">'+role+'</span> <span class="badge">'+sq+'</span>';

    var hdr=[];
    
    // BADGE FANTASQUADRA (da CSV esterno)
    if(curRec && curRec.fantaSq){
        var teams = curRec.fantaSq.split(',').map(t=>t.trim()).filter(t=>t.length>0);
        teams.forEach(t => {
            var s = getSerieForTeam(t).toUpperCase();
            addBadge(hdr, t + ' • ' + s, 'fanta-taken', 'Tesserato in ' + s);
        });
    } else if(curRec) {
        addBadge(hdr, 'Libero da contratto', 'fanta-free', 'Giocatore svincolato ovunque');
    }

    if(OPTS.showPrevBadges){
      if(idx && idx.changedRole) addBadge(hdr,'Cambio Ruolo','warn');
      if(idx && idx.changedTeam) addBadge(hdr,'Cambio Squadra','alert');
      if(prevRec){
        var yp=seasonStr(PREV.seasonKey);
        if(Number(prevRec.mvt)>=OPTS.mvPrevBadge) addBadge(hdr,'MV '+yp+' '+fmt(prevRec.mvt), 'good');
        if(Number(prevRec.fmt)>=OPTS.fmPrevBadge) addBadge(hdr,'FM '+yp+' '+fmt(prevRec.fmt), 'good');
      }
    }
    if(OPTS.rankBadgeSeasonFM){
       var s=SEASONS.find(x=>x.seasonKey===OPTS.rankBadgeSeasonFM), r=s?s.players.find(p=>String(p.cod)===cod):null;
       if(r) buildSeasonRankingBadges(s,r,'FM').forEach(b=>hdr.push(b));
    }
    if(OPTS.rankBadgeSeasonMV){
       var s=SEASONS.find(x=>x.seasonKey===OPTS.rankBadgeSeasonMV), r=s?s.players.find(p=>String(p.cod)===cod):null;
       if(r) buildSeasonRankingBadges(s,r,'MV').forEach(b=>hdr.push(b));
    }
    if(OPTS.badgeSeasonValues){
        var s=SEASONS.find(x=>x.seasonKey===OPTS.badgeSeasonValues), r=s?s.players.find(p=>String(p.cod)===cod):null;
        if(r){
            if(Number(r.mvt)>=OPTS.mvPrevBadge) addBadge(hdr,'MV '+seasonStr(s.seasonKey)+' '+fmt(r.mvt),'good');
            if(Number(r.fmt)>=OPTS.fmPrevBadge) addBadge(hdr,'FM '+seasonStr(s.seasonKey)+' '+fmt(r.fmt),'good');
        }
    }

    $('#playerBadges').innerHTML = hdr.join(' ');
    $('#lblCurrent').textContent='Stagione '+seasonStr(CUR?CUR.seasonKey:'—');
    renderCard($('#cardCurrent'), curRec, CUR, false);
    $('#lblPrev').textContent=PREV?('Stagione '+seasonStr(PREV.seasonKey)):'Stagione precedente';
    renderCard($('#cardPrev'), prevRec, PREV, true);
    renderStorico(cod);
  }

  function init(){
    setupTheme(); setupToggles(); setupOptions(); wireSearch();
    loadFantaTeams().then(() => {
        return discoverSeasons();
    }).then(list=>{
      SEASONS = list||[];
      if(SEASONS.length){
        CUR = SEASONS[SEASONS.length-1];
        PREV= SEASONS.length>=2 ? SEASONS[SEASONS.length-2] : null;
        buildIndex(); populateHistSeasonOptions(); populateAllBadgeSeasonOptions();
        $('#dataDirInfo').textContent='Dati caricati: '+SEASONS.length+' stagioni';
      }
    }).catch(console.error);
  }
  if(document.readyState==='complete') setTimeout(init,0); else document.addEventListener('DOMContentLoaded', init);
})();