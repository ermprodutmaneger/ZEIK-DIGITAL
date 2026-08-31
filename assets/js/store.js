/* ==========================================================================
   ZEIK DIGITAL — Store (localStorage + proteções de dados)
   Arquivo: assets/js/store.js
   - Persistência 100% local (localStorage), sem backend
   - Autosave com debounce, snapshots automáticos (backup interno), export/import
   - Proteção contra corrupção (cópia do arquivo inválido) e contra perda (undo)
   - Bloqueio de tela opcional com PIN (hash SHA-256 + salt, com lockout)
   ========================================================================== */
(function () {
  "use strict";

  var KEY = "zeik.crm.v3";
  var SNAP_KEY = "zeik.crm.snapshots.v3";
  var LOCK_KEY = "zeik.crm.lock.v3";
  var MAX_SNAPSHOTS = 12;
  var SNAPSHOT_EVERY = 25; // autosnapshot a cada N alterações

  function uid(prefix) {
    return (prefix || "id") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  function todayISO(d) {
    var x = d ? new Date(d) : new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  }
  function monthKey(d) {
    var x = d ? new Date(d) : new Date();
    return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0");
  }
  function safeParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
  }
  function storageOK() {
    try {
      var t = "__zeik_probe__";
      localStorage.setItem(t, "1");
      localStorage.removeItem(t);
      return true;
    } catch (e) { return false; }
  }
  /* Acesso tolerante: em file:// ou com bloqueio de cookies o navegador lança
     SecurityError ao tocar em localStorage — o painel tem de abrir mesmo assim. */
  var L = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} },
    keys: function () { try { return Object.keys(localStorage); } catch (e) { return []; } }
  };

  function defaultState() {
    return {
      version: 3,
      criadoEm: new Date().toISOString(),
      config: {
        agencia: "Zeik Digital",
        responsavel: "Ermison",
        cidade: "São Paulo — Zona Sul",
        bairros: ["Capão Redondo", "Jardim Ângela", "Campo Limpo", "M'Boi Mirim", "Grajaú"],
        whatsapp: "5511990147836",
        whatsappDisplay: "(11) 99014-7836",
        email: "zeikdigital@gmail.com",
        siteZeik: "",
        precoSite: 550,
        precoSiteMin: 500,
        precoSiteMax: 600,
        manutMes: 97,
        precoInsta: 350,
        precoFeed: 250,
        precoGmn: 200,
        prazoEntrega: "48 horas",
        metaSitesMes: 8,
        metaProspectsDia: 10,
        custoFixoMes: 250
      },
      prospects: [],
      deals: [],
      clientes: [],
      financeiro: [],
      tarefas: [],
      atividades: []
    };
  }

  /* ------------------------------ helpers de data ---------------------- */
  function fmtBRL(v) {
    var n = Number(v) || 0;
    return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });
  }
  function fmtData(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
  }
  function fmtDataHora(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d)) return "—";
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " " +
      d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  function diasDesde(iso) {
    if (!iso) return null;
    var d = new Date(iso); if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  function diasAte(iso) {
    if (!iso) return null;
    var a = new Date(iso + "T12:00:00"); if (isNaN(a)) return null;
    var b = new Date(todayISO() + "T12:00:00");
    return Math.round((a - b) / 86400000);
  }
  function diasAteData(isoDate) {
    if (!isoDate) return null;
    var a = new Date(isoDate + "T12:00:00"); if (isNaN(a)) return null;
    var b = new Date(todayISO() + "T12:00:00");
    return Math.round((a - b) / 86400000);
  }
  function addDays(n, from) {
    var d = from ? new Date(from) : new Date();
    d.setDate(d.getDate() + n);
    return todayISO(d);
  }

  /* ------------------------------ PHONE -------------------------------- */
  function onlyDigits(t) { return String(t || "").replace(/\D/g, ""); }
  function toWa(t) {
    var d = onlyDigits(t);
    if (!d) return null;
    if (d.length === 11 || d.length === 10) return "55" + d;
    if (d.length === 8) return "5511" + d;
    return d;
  }
  function fmtTel(t) {
    var d = onlyDigits(t);
    if (d.length === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    if (d.length === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    if (d.length === 8) return d.slice(0, 4) + "-" + d.slice(4);
    return t || "";
  }

  var Etapas = {
    lead: { id: "lead", nome: "Lead", cor: "gray", ordem: 0 },
    contatado: { id: "contatado", nome: "Contatado", cor: "blue", ordem: 1 },
    proposta: { id: "proposta", nome: "Proposta", cor: "orange", ordem: 2 },
    ganho: { id: "ganho", nome: "Ganho", cor: "green", ordem: 3 },
    perdido: { id: "perdido", nome: "Perdido", cor: "red", ordem: 4 }
  };

  /* ==================================================================== */
  window.ZeikStore = {
    KEY: KEY,
    Etapas: Etapas,
    uid: uid, todayISO: todayISO, monthKey: monthKey,
    fmtBRL: fmtBRL, fmtData: fmtData, fmtDataHora: fmtDataHora,
    diasAteData: diasAteData, addDays: addDays,
    onlyDigits: onlyDigits, toWa: toWa, fmtTel: fmtTel,
    storageOK: storageOK,

    state: defaultState(),
    _undo: [],
    _redo: [],
    _changes: 0,
    _timer: null,
    _ready: false,
    lastError: null,

    /* ------------------------- ciclo de vida -------------------------- */
    init: function (seed) {
      var self = this;
      var raw = L.get(KEY);
      var loaded = safeParse(raw);
      var aviso = null;

      if (loaded && typeof loaded === "object" && loaded.version) {
        var base = defaultState();
        // merge raso protegido: garante campos novos de config em versões antigas
        self.state = Object.assign(base, loaded);
        self.state.config = Object.assign(base.config, loaded.config || {});
      } else if (raw && !loaded) {
        // dado corrompido: preserva cópia bruta para recuperação manual
        var guardado = L.set(KEY + ".corrompido." + Date.now(), raw);
        self.state = defaultState();
        aviso = guardado
          ? "Os dados anteriores estavam corrompidos. Guardei uma cópia bruta (chave .corrompido) e recomecei pela base da Zona Sul — procure um backup .json em Configurações."
          : "Não foi possível ler os dados salvos neste navegador. Começando pela base da Zona Sul.";
      }

      if (!self.state.prospects.length && seed) self.importSeed(seed);
      self.migrate();
      self.saveNow();          // salva por cima → só depois definimos o aviso
      self.lastError = aviso;
      self._ready = true;
      return self.state;
    },

    /* Atualiza a lista-base (telefone, site?, Instagram?) nos prospects que o usuário
       ainda NÃO tocou — status "novo" e sem contato registrado. Nada é apagado. */
    mergeSeed: function (seed) {
      var byName = {}, atualizados = 0;
      (seed.prospects || []).forEach(function (p) { if (p && p.nome) byName[p.nome.toLowerCase().trim()] = p; });
      this.state.prospects.forEach(function (p) {
        if (p.status !== "novo" || p.ultimoContato) return;
        var s = byName[(p.nome || "").toLowerCase().trim()];
        if (!s) return;
        var mudou = false;
        if (!p.telefone && s.telefone) { p.telefone = s.telefone; mudou = true; }
        if (!p.endereco && s.endereco) { p.endereco = s.endereco; mudou = true; }
        if (p.temSite == null && s.temSite !== undefined) { p.temSite = s.temSite; mudou = true; }
        if (p.temInstagram == null && s.temInstagram !== undefined) { p.temInstagram = s.temInstagram; mudou = true; }
        if (!p.insta && s.insta) { p.insta = s.insta; mudou = true; }
        if (!p.obs && s.obs) { p.obs = s.obs; mudou = true; }
        if (mudou) { p.atualizadoEm = new Date().toISOString(); atualizados++; }
      });
      if (atualizados) { this.saveNow(); }
      return atualizados;
    },
    importSeed: function (seed) {
      var st = this.state;
      var existing = {};
      st.prospects.forEach(function (p) { existing[p.nome.toLowerCase()] = 1; });
      (seed.prospects || []).forEach(function (p) {
        if (!p || !p.nome) return;
        if (existing[p.nome.toLowerCase()]) return;
        st.prospects.push({
          id: uid("p"),
          nome: p.nome,
          contato: p.contato || "",
          segmento: p.segmento || "generico",
          bairro: p.bairro || "Capão Redondo",
          endereco: p.endereco || "",
          telefone: p.telefone || "",
          temSite: (p.temSite === undefined ? null : p.temSite),
          temInstagram: (p.temInstagram === undefined ? null : p.temInstagram),
          insta: p.insta || "",
          prioridade: p.prioridade || "media",
          status: p.status || "novo",
          origem: p.origem || "Pesquisa",
          obs: p.obs || "",
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString(),
          ultimoContato: null,
          convertidoId: null
        });
        existing[p.nome.toLowerCase()] = 1;
      });
    },

    migrate: function () {
      var st = this.state, now = new Date().toISOString();
      ["prospects", "deals", "clientes", "financeiro", "tarefas", "atividades"].forEach(function (k) {
        if (!Array.isArray(st[k])) st[k] = [];
      });
      st.prospects.forEach(function (p) {
        if (!p.id) p.id = uid("p");
        if (!p.segmento) p.segmento = "generico";
        if (!p.status) p.status = "novo";
      });
      st.deals.forEach(function (d) { if (!d.etapa) d.etapa = "lead"; if (!d.historico) d.historico = []; });
      st.financeiro.forEach(function (f) { if (!f.mes) f.mes = monthKey(f.data); });
      st.clientes.forEach(function (c) { if (c.manutencao === undefined) c.manutencao = false; });
      // dedupe de prospects por nome
      var seen = {}, out = [];
      st.prospects.forEach(function (p) {
        var k = (p.nome || "").toLowerCase().trim();
        if (!k || seen[k]) return; seen[k] = 1; out.push(p);
      });
      st.prospects = out;
    },

    /* ------------------------- persistência ---------------------------- */
    save: function () {
      var self = this;
      clearTimeout(self._timer);
      self._timer = setTimeout(function () { self.saveNow(); }, 120);
    },
    saveNow: function () {
      var self = this;
      clearTimeout(self._timer);
      if (!self.storageOK()) { self._offline = true;
        self.lastError = "O navegador não permitiu salvar neste endereço. Se você abriu o arquivo pelo disco (file://), use a URL da Vercel (ou um servidor local) — assim tudo fica salvo.";
        return false;
      }
      try {
        if (!L.set(KEY, JSON.stringify(self.state))) throw new Error("quota");
        self.lastError = null;
      } catch (e) {
        self.lastError = "Falha ao salvar: armazenamento cheio. Exporte um backup e limpe registros antigos. (" + e.name + ")";
        if (window.ZeikUI && ZeikUI.toast) ZeikUI.toast(self.lastError, "err", 8000);
        return false;
      }
      self._changes++;
      if (self._changes % SNAPSHOT_EVERY === 0) self.snapshot("automático");
      return true;
    },
    pushUndo: function (label) {
      try {
        this._undo.push({ label: label || "alteração", json: JSON.stringify(this.state) });
        if (this._undo.length > 25) this._undo.shift();
        this._redo = [];
      } catch (e) { /* memória */ }
    },
    undo: function () {
      if (!this._undo.length) return false;
      var prev = this._undo.pop();
      this._redo.push({ label: "desfazer", json: JSON.stringify(this.state) });
      this.state = safeParse(prev.json) || this.state;
      this.saveNow();
      return prev.label;
    },
    canUndo: function () { return this._undo.length > 0; },

    /* ------------------------- snapshots / backup ---------------------- */
    _snaps: function () { return safeParse(L.get(SNAP_KEY)) || []; },
    snapshot: function (label) {
      var list = this._snaps();
      list.unshift({
        at: new Date().toISOString(),
        label: label || "manual",
        bytes: JSON.stringify(this.state).length,
        json: JSON.stringify(this.state)
      });
      // limita por quantidade e por tamanho (~2.5 MB no total)
      var total = 0, cut = 0;
      for (var i = 0; i < list.length; i++) {
        total += list[i].bytes || 0;
        if (total > 2.4e6 || i >= MAX_SNAPSHOTS) { cut = i; break; }
      }
      if (cut) list = list.slice(0, cut);
      if (!L.set(SNAP_KEY, JSON.stringify(list))) { list = list.slice(0, 3); L.set(SNAP_KEY, JSON.stringify(list)); }
      return list.length;
    },
    listSnapshots: function () {
      return this._snaps().map(function (s, i) {
        return { i: i, at: s.at, label: s.label, bytes: s.bytes };
      });
    },
    restoreSnapshot: function (i) {
      var s = this._snaps()[i];
      if (!s) return false;
      var data = safeParse(s.json);
      if (!data) return false;
      this.pushUndo("antes de restaurar snapshot");
      this.state = data;
      this.migrate();
      this.saveNow();
      return true;
    },
    dropSnapshots: function () { L.del(SNAP_KEY) },

    exportJSON: function () {
      return JSON.stringify({ app: "Zeik Digital — Painel de Prospecção", versao: 3, exportadoEm: new Date().toISOString(), dados: this.state }, null, 2);
    },
    importJSON: function (text) {
      var parsed = safeParse(text);
      if (!parsed) return { ok: false, msg: "Arquivo inválido: não é um JSON legível." };
      var dados = parsed.dados || parsed;
      if (!dados || (!dados.prospects && !dados.clientes && !dados.deals)) {
        return { ok: false, msg: "JSON válido, mas sem dados do painel (esperado campos prospects/deals/clientes)." };
      }
      this.pushUndo("antes de importar backup");
      this.state = Object.assign(defaultState(), dados);
      this.state.config = Object.assign(defaultState().config, dados.config || {});
      this.migrate();
      this.saveNow();
      return { ok: true, msg: "Backup restaurado: " + (dados.prospects || []).length + " prospects, " + (dados.clientes || []).length + " clientes." };
    },

    /* ------------------------- log de atividades ----------------------- */
    log: function (tipo, texto, ref) {
      this.state.atividades.unshift({ id: uid("a"), tipo: tipo, texto: texto, ref: ref || null, em: new Date().toISOString() });
      if (this.state.atividades.length > 400) this.state.atividades.length = 400;
      this.save();
    },

    /* ------------------------- pontuação ICP --------------------------- */
    score: function (p) {
      var s = 50;
      if (p.temSite === false) s += 22;
      if (p.temSite === true) s -= 10;
      if (p.temInstagram === false) s += 10;
      if (p.temInstagram === null) s += 3;
      if (p.telefone) s += 8;
      if (p.obs) s += 3;
      var prio = { alta: 14, media: 6, baixa: -6 };
      s += prio[p.prioridade] || 0;
      var hot = ["barbearia", "salao", "estetica", "odonto", "pet", "auto", "food", "constru"];
      if (hot.indexOf(p.segmento) >= 0) s += 6;
      return Math.max(0, Math.min(100, Math.round(s)));
    },

    /* ------------------------- métricas -------------------------------- */
    stats: function () {
      var st = this.state, now = new Date();
      var m0 = monthKey(now), m1 = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 15));
      var out = {
        prospects: st.prospects.length,
        prospectNovos: st.prospects.filter(function (p) { return p.status === "novo"; }).length,
        contatados: st.prospects.filter(function (p) { return p.status !== "novo"; }).length,
        semSite: st.prospects.filter(function (p) { return p.temSite === false; }).length,
        semInsta: st.prospects.filter(function (p) { return p.temInstagram === false; }).length,
        instaAConferir: st.prospects.filter(function (p) { return p.temInstagram == null; }).length,
        deals: st.deals.length,
        emNegociacao: st.deals.filter(function (d) { return d.etapa === "lead" || d.etapa === "contatado" || d.etapa === "proposta"; }).length,
        propostas: st.deals.filter(function (d) { return d.etapa === "proposta"; }).length,
        ganhos: st.deals.filter(function (d) { return d.etapa === "ganho"; }).length,
        perdidos: st.deals.filter(function (d) { return d.etapa === "perdido"; }).length,
        clientes: st.clientes.length,
        clientesAtivos: st.clientes.filter(function (c) { return c.status === "ativo"; }).length,
        comManut: st.clientes.filter(function (c) { return c.manutencao && c.status === "ativo"; }).length,
        mrr: 0,
        totalMes: 0, totalMesAnterior: 0,
        totalGeral: 0, aReceber: 0, ticket: 0,
        sitesMes: 0, tarefasPendentes: 0, tarefasAtrasadas: 0,
        porMes: [], porSegmento: [], funil: [], pipeline: 0
      };
      st.clientes.forEach(function (c) { if (c.manutencao && c.status === "ativo") out.mrr += (st.config.manutMes * 1) || 97; });

      st.financeiro.forEach(function (f) {
        var v = Number(f.valor) || 0;
        if (f.status === "pago") {
          out.totalGeral += v;
          if (f.mes === m0) out.totalMes += v;
          if (f.mes === m1) out.totalMesAnterior += v;
        } else out.aReceber += v;
      });

      st.deals.forEach(function (d) { if (d.etapa !== "perdido") out.pipeline += Number(d.valor) || 0; });

      var ganhos = st.deals.filter(function (d) { return d.etapa === "ganho"; });
      out.ticket = ganhos.length ? Math.round(ganhos.reduce(function (a, d) { return a + (Number(d.valor) || 0); }, 0) / ganhos.length) : 0;

      var meses = [];
      for (var i = 5; i >= 0; i--) meses.push(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 15)));
      out.porMes = meses.map(function (mk) {
        var pago = 0, receber = 0, sites = 0;
        st.financeiro.forEach(function (f) {
          if (f.mes !== mk) return;
          if (f.status === "pago") pago += Number(f.valor) || 0; else receber += Number(f.valor) || 0;
          if (f.tipo === "site") sites++;
        });
        var label = new Date(mk + "-15T12:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        return { mes: mk, label: label, pago: pago, receber: receber, sites: sites };
      });
      out.sitesMes = (out.porMes[out.porMes.length - 1] || {}).sites || 0;

      var segs = {};
      st.prospects.forEach(function (p) { segs[p.segmento] = (segs[p.segmento] || 0) + 1; });
      st.deals.forEach(function (d) { if (d.segmento) segs[d.segmento] = (segs[d.segmento] || 0) + 1; });
      out.porSegmento = Object.keys(segs).map(function (k) { return { id: k, n: segs[k] }; }).sort(function (a, b) { return b.n - a.n; });

      var win = out.ganhos + out.perdidos;
      out.taxa = win ? Math.round((out.ganhos / win) * 100) : 0;

      out.tarefasPendentes = st.tarefas.filter(function (t) { return !t.concluida; }).length;
      out.tarefasAtrasadas = st.tarefas.filter(function (t) {
        if (t.concluida || !t.data) return false;
        return ZeikStore.diasAteData(t.data) < 0;
      }).length;
      return out;
    },

    /* ------------------------- bloqueio (PIN) --------------------------
       Hash do PIN com salt. Usa SHA-256 quando disponível; caso contrário,
       hash próprio (djb2+FNV em 128 bits) — o importante é o PIN nunca
       ficar salvo em texto puro no localStorage. 5 erros = 60s de espera. */
    lockGet: function () { return safeParse(L.get(LOCK_KEY)) || null; },
    lockSet: function (pin) {
      if (!pin) { L.del(LOCK_KEY); return Promise.resolve(false); }
      var salt = uid("s");
      return hashPin(String(pin), salt).then(function (h) {
        L.set(LOCK_KEY, JSON.stringify({
          salt: salt, hash: h, algoritmo: cryptoOK() ? "sha256" : "z1",
          criadoEm: new Date().toISOString(), tentativas: 0, bloqueadoAte: null
        }));
        return true;
      });
    },
    lockCheck: function (pin) {
      var l = this.lockGet();
      if (!l) return Promise.resolve(true);
      if (l.bloqueadoAte && Date.now() < l.bloqueadoAte) {
        return Promise.resolve({ ok: false, wait: Math.ceil((l.bloqueadoAte - Date.now()) / 1000) });
      }
      var self = this;
      return hashPin(String(pin), l.salt).then(function (h) {
        if (h === l.hash) {
          l.tentativas = 0; l.bloqueadoAte = null;
          L.set(LOCK_KEY, JSON.stringify(l));
          return true;
        }
        l.tentativas = (l.tentativas || 0) + 1;
        if (l.tentativas >= 5) { l.bloqueadoAte = Date.now() + 60000; l.tentativas = 0; }
        L.set(LOCK_KEY, JSON.stringify(l));
        return { ok: false, wait: l.bloqueadoAte ? 60 : null, left: Math.max(0, 5 - l.tentativas) };
      });
    },
    lockClear: function () { L.del(LOCK_KEY); },
    resetTudo: function () {
      [KEY, SNAP_KEY, LOCK_KEY].forEach(function (k) { L.del(k); });
      L.keys().filter(function (k) { return k.indexOf(KEY + ".corrompido") === 0; }).forEach(function (k) { L.del(k); });
      this.state = defaultState();
      this.saveNow();
    }
  };

  function cryptoOK() {
    return !!(window.crypto && window.crypto.subtle && window.TextEncoder &&
      window.isSecureContext !== false);
  }
  /* Hash de 128 bits (djb2 + FNV-1a em 4 cadeias) usado quando crypto.subtle
     não está disponível (ex.: abrindo o arquivo via file://). */
  function fallbackHash(str) {
    var h1 = 5381, h2 = 2166136261, h3 = 16777619, h4 = 65599, out = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      h1 = ((h1 << 5) + h1 + c) | 0;
      h2 = ((h2 ^ c) * 16777619) | 0;
      h3 = (((h3 + c) << 5) ^ c) | 0;
      h4 = (h4 * 33 + c) | 0;
    }
    out = [h1, h2, h3, h4].map(function (x) { return (x >>> 0).toString(16).padStart(8, "0"); });
    return "z1:" + out.join("");
  }
  function hashPin(pin, salt) {
    var input = salt + ":" + pin;
    if (!cryptoOK()) {
      // aplica várias rodadas para dificultar força bruta mesmo no fallback
      var h = input;
      for (var i = 0; i < 2000; i++) h = fallbackHash(h + i);
      return Promise.resolve(h);
    }
    return crypto.subtle.digest("SHA-256", new TextEncoder().encode(input)).then(function (buf) {
      return "sha256:" + Array.prototype.map.call(new Uint8Array(buf), function (x) {
        return x.toString(16).padStart(2, "0");
      }).join("");
    });
  }

  /* Exporta atalhos globais usados pelo app */
  window.Z = {
    uid: uid, todayISO: todayISO, monthKey: monthKey,
    fmtBRL: fmtBRL, fmtData: fmtData, fmtDataHora: fmtDataHora,
    diasAteData: diasAteData, diasDesde: diasDesde, addDays: addDays,
    toWa: toWa, fmtTel: fmtTel, onlyDigits: onlyDigits, esc: escapeHtml
  };
  function escapeHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
})();
