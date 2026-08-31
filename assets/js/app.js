/* ==========================================================================
   ZEIK DIGITAL — App (views, dashboard, prospecção, kanban + drag&drop)
   Arquivo: assets/js/app.js
   ========================================================================== */
(function () {
  "use strict";

  var App = window.App = window.App || {};
  App.handlers = App.handlers || {};
  App.filters = {
    q: "", bairro: "", segmento: "", status: "", prio: "", need: "", ordem: "score",
    cq: "", cstatus: "", fperiodo: "12", tq: "pendentes"
  };

  var ui = function () { return window.ZeikUI; };
  var st = function () { return window.ZeikStore.state; };
  var esc = function (s) { return Z.esc(s); };
  var money = function (v) { return Z.fmtBRL(v); };

  function seg(id) { return ui().segById(id); }
  function badge(txt, color) { return '<span class="badge ' + (color || "") + '">' + esc(txt) + '</span>'; }
  function scoreBar(score) {
    var cls = score >= 75 ? "hi" : score >= 55 ? "mid" : "lo";
    return '<span class="score ' + cls + '" title="Score ICP: quanto maior, mais quente o lead"><span class="bar"><i style="width:' + score + '%"></i></span>' + score + '</span>';
  }

  var STATUS_LABEL = {
    novo: ["Novo", "gray"],
    contato_feito: ["Contato feito", "blue"],
    respondeu: ["Respondeu", "green"],
    Orcamento: ["Orçamento enviado", "orange"],
    sem_retorno: ["Sem retorno", "red"],
    convertido: ["Na negociação", "indigo"],
    cliente: ["Cliente", "purple"],
    adiado: ["Adiado", "orange"]
  };
  function statusPill(s) {
    var d = STATUS_LABEL[s] || STATUS_LABEL.novo;
    return badge(d[0], d[1]);
  }

  /* ====================================================================== */
  /*  RENDER ROOT                                                            */
  /* ====================================================================== */
  App.render = function () {
    var view = ui().currentView();
    App.view = view;
    var host = document.getElementById("view");
    document.body.dataset.view = view;
    var html = "";
    switch (view) {
      case "prospeccao": html = viewProspect(); break;
      case "pipeline": html = viewPipeline(); break;
      case "clientes": html = viewClientes(); break;
      case "financeiro": html = viewFinanceiro(); break;
      case "tarefas": html = viewTarefas(); break;
      case "scripts": html = viewScripts(); break;
      case "gerador": html = viewGerador(); break;
      case "config": html = viewConfig(); break;
      default: html = viewDashboard();
    }
    host.innerHTML = html;
    document.querySelectorAll(".nav-item").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-view") === view);
    });
    var scrim = document.getElementById("scrim");
    if (scrim) scrim.classList.toggle("hidden", !document.body.classList.contains("nav-open"));
    App.refreshBadges();
    App.renderSearchActive();
    if (view === "pipeline") bindDragDrop();
    if (view === "dashboard" || view === "financeiro") bindSliders();
    if (view === "prospeccao" || view === "clientes" || view === "tarefas" || view === "scripts") { /* inputs delegados */ }
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  };

  App.refreshBadges = function () {
    var s = st(), S = window.ZeikStore, S_ = S.stats();
    var map = {
      prospeccao: s.prospects.filter(function (p) { return p.status === "novo"; }).length,
      pipeline: s.deals.filter(function (d) { return ["lead", "contatado", "proposta"].indexOf(d.etapa) >= 0; }).length,
      clientes: s.clientes.length,
      financeiro: s.financeiro.filter(function (f) { return f.status === "a_receber"; }).length,
      tarefas: s.tarefas.filter(function (t) { return !t.concluida && Z.diasAteData(t.data) <= 1; }).length
    };
    document.querySelectorAll("[data-count]").forEach(function (el) {
      var k = el.getAttribute("data-count");
      var v = map[k];
      if (v === undefined) return;
      el.textContent = v;
      el.style.display = v ? "" : "none";
      if (k === "tarefas") el.classList.toggle("badge", false);
    });
    var stEl = document.getElementById("saveStatus");
    if (stEl) {
      var err = window.ZeikStore.lastError;
      stEl.innerHTML = '<span class="dot' + (err ? " warn" : "") + '"></span>' + (err ? "Atenção: verifique o aviso" : "Dados salvos neste navegador");
    }
  };
  App.renderSearchActive = function () {
    var i = document.querySelector("[data-filter=search]");
    if (i && i.value !== App.filters.q) i.value = App.filters.q;
  };

  function topbar(title, sub, actions) {
    return '<div class="topbar"><div><h1>' + esc(title) + '</h1><div class="sub">' + sub + '</div></div>' +
      '<div class="topbar-actions">' + (actions || "") + '</div></div>';
  }

  /* ====================================================================== */
  /*  DASHBOARD                                                              */
  /* ====================================================================== */
  function viewDashboard() {
    var S = window.ZeikStore, s = st(), m = S.stats(), cfg = s.config;
    var hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

    var kpis = [
      ["Prospects na lista", m.prospects, "blue", m.prospectNovos + " ainda não contatados", 0],
      ["Em negociação", m.emNegociacao, "cyan", m.propostas + " proposta(s) enviada(s)", 0],
      ["Ganhos (mês)", m.sitesMes, "green", m.ganhos + " no total · taxa " + m.taxa + "%", 0],
      ["Faturado no mês", m.totalMes, "indigo", (m.totalMes >= m.totalMesAnterior ? "▲ " : "▼ ") + money(Math.abs(m.totalMes - m.totalMesAnterior)) + " vs mês passado", 1],
      ["A receber", m.aReceber, "orange", s.financeiro.filter(function (f) { return f.status === "a_receber"; }).length + " lançamento(s)", 1],
      ["MRR (manutenções)", m.mrr, "purple", m.comManut + " cliente(s) a " + money(cfg.manutMes) + "/mês", 1]
    ].map(function (k) {
      return '<div class="card kpi accent-' + k[2] + ' hoverable"><div class="label">' + k[0] + '</div><div class="value">' +
        (k[4] ? money(k[1]) : k[1]) + '</div><div class="delta">' + esc(k[3]) + '</div></div>';
    }).join("");

    /* gráfico 6 meses */
    var max = Math.max.apply(null, m.porMes.map(function (x) { return Math.max(x.pago, x.receber); }).concat([1]));
    var chart = m.porMes.map(function (x, i) {
      var last = i === m.porMes.length - 1;
      var h = Math.round((x.pago / max) * 118) + 3;
      var hr = Math.round((x.receber / max) * 118);
      return '<div class="bar-wrap" title="' + x.label + ": " + money(x.pago) + ' recebido • ' + money(x.receber) + ' a receber">' +
        '<div class="bar-val">' + (x.pago ? (x.pago >= 1000 ? (x.pago / 1000).toFixed(1).replace(".0", "") + "k" : x.pago) : "") + '</div>' +
        '<div style="width:100%;max-width:46px;display:flex;flex-direction:column;justify-content:flex-end;height:126px;gap:3px">' +
        (x.receber ? '<div style="height:' + Math.max(hr, 3) + 'px;border-radius:8px 8px 4px 4px;background:rgba(255,149,0,.45)" title="A receber"></div>' : "") +
        '<div class="bar' + (last ? " current" : "") + '" style="height:' + h + 'px"></div></div>' +
        '<div class="bar-lbl">' + esc(x.label) + '</div></div>';
    }).join("");

    /* meta */
    var pctMeta = Math.min(100, Math.round((m.sitesMes / (cfg.metaSitesMes || 1)) * 100));
    var faltam = Math.max(0, (cfg.metaSitesMes || 0) - m.sitesMes);

    /* funil */
    var etps = ["lead", "contatado", "proposta", "ganho"];
    var fun = etps.map(function (e) {
      var n = s.deals.filter(function (d) { return d.etapa === e; }).length;
      return { nome: S.Etapas[e].nome, n: n };
    });
    var maxFun = Math.max.apply(null, fun.map(function (x) { return x.n; }).concat([1]));
    var funil = fun.map(function (x, i) {
      return '<div class="hbar"><span>' + esc(x.nome) + '</span><span class="track"><i style="width:' + Math.round((x.n / maxFun) * 100) + '%;background:' +
        ["var(--text-3)", "var(--blue)", "var(--orange)", "var(--green)"][i] + '"></i></span><span class="n">' + x.n + '</span></div>';
    }).join("");

    /* segmentos */
    var maxSeg = Math.max.apply(null, m.porSegmento.map(function (x) { return x.n; }).concat([1]));
    var segs = m.porSegmento.slice(0, 8).map(function (x) {
      var sg = seg(x.id);
      return '<div class="hbar"><span class="truncate">' + esc((sg.emoji || "") + " " + sg.nome) + '</span>' +
        '<span class="track"><i style="width:' + Math.round((x.n / maxSeg) * 100) + '%"></i></span><span class="n">' + x.n + '</span></div>';
    }).join("") || '<p class="tiny">Sem dados ainda.</p>';

    /* próximas ações */
    var prox = s.tarefas.filter(function (t) { return !t.concluida; })
      .sort(function (a, b) { return (a.data || "9999") < (b.data || "9999") ? -1 : 1; }).slice(0, 6);
    var proxHtml = prox.length ? prox.map(function (t) {
      var d = Z.diasAteData(t.data);
      var label = d < 0 ? ("atrasada " + Math.abs(d) + "d") : d === 0 ? "hoje" : d === 1 ? "amanhã" : "em " + d + " dias";
      return '<div class="li" style="padding:10px 12px"><div class="li-seg" style="background:rgba(0,113,227,.10)">⏰</div>' +
        '<div class="li-lead"><div class="li-title" style="font-size:13.5px">' + esc(t.titulo) + '</div>' +
        '<div class="li-meta">' + (t.cliente ? esc(t.cliente) + ' · ' : '') + '<span class="badge ' + (d < 0 ? "red" : d === 0 ? "orange" : "blue") + '">' + label + '</span></div></div>' +
        '<div class="li-actions"><button class="btn xs quiet" data-act="tarefa-concluir" data-id="' + t.id + '">✓ Feito</button>' +
        '<button class="btn xs ghost" data-act="tarefa-editar" data-id="' + t.id + '">✏️</button></div></div>';
    }).join("") : '<p class="tiny">Nenhuma tarefa pendente. Use "Agendar follow-up" no Kanban para criar uma.</p>';

    /* quem precisa de atenção (calor do funil de prospecção) */
    var quentes = s.prospects.filter(function (p) { return p.status === "respondeu" || p.status === "Orcamento"; });
    var esfriando = s.prospects.filter(function (p) { return p.status === "contato_feito" && (Z.diasDesde(p.ultimoContato || p.atualizadoEm) || 0) >= 4; });

    return topbar(
      "Bom dia, " + (cfg.responsavel || "chefe").split(" ")[0] + " 👋",
      hoje + " · " + esc(cfg.cidade) + " · " + m.prospects + " empresas mapeadas",
      '<button class="btn sm ghost" data-act="export-backup">⬇ Backup</button>' +
      '<button class="btn sm" data-act="novo-prospect">+ Novo prospect</button>'
    ) +
      '<div class="grid kpis k6" style="margin-bottom:14px">' + kpis + '</div>' +
      '<div class="grid side" style="margin-bottom:14px">' +
      '<div class="card"><div class="card-title">📈 Faturamento dos últimos 6 meses <span class="tiny" style="margin-left:auto">laranja = a receber · verde = mês atual</span></div>' +
      '<div class="chart">' + chart + '</div>' +
      '<hr class="hr"><div class="row" style="gap:22px;flex-wrap:wrap">' +
      kv("Recebido no ano", money(s.financeiro.filter(function (f) { return f.status === "pago" && f.mes && f.mes.slice(0, 4) === String(new Date().getFullYear()); }).reduce(function (a, f) { return a + Number(f.valor || 0); }, 0))) +
      kv("Ticket médio", money(m.ticket)) +
      kv("Sites entregues", String(s.deals.filter(function (d) { return d.etapa === "ganho"; }).length)) +
      kv("Clientes ativos", String(m.clientesAtivos)) +
      '</div></div>' +
      '<div class="col">' +
      '<div class="card"><div class="card-title">🎯 Meta do mês — ' + esc(cfg.metaSitesMes) + ' sites</div>' +
      '<div class="row" style="gap:14px"><div style="font-size:34px;font-weight:600;letter-spacing:-.03em">' + m.sitesMes + '<span style="font-size:15px;color:var(--text-3)">/' + esc(cfg.metaSitesMes) + '</span></div>' +
      '<div class="grow"><div class="prog ' + (pctMeta >= 100 ? "green" : pctMeta >= 50 ? "" : "orange") + '"><i style="width:' + pctMeta + '%"></i></div>' +
      '<p class="tiny" style="margin:6px 0 0">' + (faltam ? "Faltam " + faltam + " pra bater a meta · " + (faltam * Math.max(1, Math.round(m.prospects / 6))) + " abordagens no mínimo" : "Meta batida! 🎉") + '</p></div></div></div>' +
      '<div class="card"><div class="card-title">🔥 Precisa de você hoje</div><div class="col" style="gap:8px">' +
      mini('Respondeu e não recebeu proposta', quentes.length, 'prospeccao', 'status=respondeu', "orange") +
      mini('Contato esfriando (4+ dias)', esfriando.length, 'prospeccao', 'status=contato_feito', "red") +
      mini('Sem site (venda fácil)', m.semSite, 'prospeccao', 'need=site', "blue") +
      mini('Sem Instagram (combo)', m.semInsta, 'prospeccao', 'need=insta', "purple") +
      mini('Instagram a conferir no Maps', m.instaAConferir, 'prospeccao', 'need=insta2', "gray") +
      '</div></div>' +
      '</div></div>' +

      '<div class="grid three" style="margin-bottom:14px">' +
      '<div class="card"><div class="card-title">🪜 Funil de negociação</div>' + funil +
      '<p class="tiny" style="margin:10px 0 0">Conversão ganho/(ganho+perdido): <b>' + m.taxa + '%</b> · valor em pipeline: <b>' + money(m.pipeline) + '</b></p></div>' +
      '<div class="card"><div class="card-title">🧬 Sua lista por segmento</div><div class="hbars">' + segs + '</div></div>' +
      lucroCard() +
      '</div>' +

      '<div class="card"><div class="card-title">⏰ Próximas ações</div><div class="list">' + proxHtml + '</div></div>';
  }

  function kv(k, v) { return '<div><div class="tiny">' + esc(k) + '</div><div style="font-weight:600;letter-spacing:-.01em">' + v + '</div></div>'; }
  function mini(label, n, view, query, color) {
    return '<button class="row between jumpbtn" data-act="jump" data-view="' + view + '" data-query="' + query + '" ' +
      'style="width:100%;border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;padding:8px 10px;border-radius:12px;text-align:left">' +
      '<span style="font-size:13px">' + esc(label) + '</span><span class="badge ' + color + '">' + n + '</span></button>';
  }

  function lucroCard() {
    var s = st(), cfg = s.config, S = window.ZeikStore;
    var ativos = s.clientes.filter(function (c) { return c.status === "ativo"; });
    var comManut = ativos.filter(function (c) { return c.manutencao; }).length;
    var mrr = comManut * cfg.manutMes;
    var v = App.lucro = App.lucro || { sites: 4, preco: cfg.precoSite, manut: comManut, custo: cfg.custoFixoMes };
    var receita = v.sites * v.preco + mrr;
    var lucro = receita - v.custo;
    var breakEven = v.preco > 0 ? Math.ceil(v.custo / v.preco) : 0;
    return '<div class="card"><div class="card-title">💹 Calculadora de lucro (recorrência incluída)</div>' +
      '<div class="col" style="gap:9px">' +
      slider("sites", "Sites no mês", v.sites, 0, 20, 1) +
      slider("preco", "Preço médio do site", v.preco, 300, 1500, 50, true) +
      slider("custo", "Custo fixo do mês", v.custo, 0, 3000, 50, true) +
      '</div><hr class="hr">' +
      '<div class="kv"><span class="k">Receita de sites</span><span class="v">' + money(v.sites * v.preco) + '</span></div>' +
      '<div class="kv"><span class="k">MRR (' + comManut + " × " + money(cfg.manutMes) + ')</span><span class="v">' + money(mrr) + '</span></div>' +
      '<div class="kv"><span class="k">Receita total</span><span class="v">' + money(receita) + '</span></div>' +
      '<div class="kv"><span class="k">Custo fixo</span><span class="v" style="color:var(--red)">− ' + money(v.custo) + '</span></div>' +
      '<div class="kv"><span class="k"><b>Lucro esperado</b></span><span class="v" style="color:' + (lucro >= 0 ? "var(--green)" : "var(--red)") + ';font-size:17px">' + money(lucro) + '</span></div>' +
      '<p class="tiny" style="margin:8px 0 0">Precisa de <b>' + breakEven + ' site(s)</b> só para cobrir o custo. Com ' + comManut + ' manutenção(ões), seu ponto de equilíbrio cai para <b>' +
      (v.preco > 0 ? Math.max(0, Math.ceil((v.custo - mrr) / v.preco)) : 0) + '</b>. Meta sugerida: +3 manut/mês → ' + money(3 * cfg.manutMes * 12) + '/ano recorrente.</p>' +
      '</div>';
  }
  function slider(key, label, val, min, max, step, moneyFmt) {
    return '<label class="field"><span class="lbl row between">' + esc(label) + '<b class="mono">' + (moneyFmt ? Z.fmtBRL(val) : val) + '</b></span>' +
      '<input type="range" data-slider="' + key + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + val + '"></label>';
  }
  function bindSliders() {
    document.querySelectorAll("[data-slider]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        App.lucro[inp.getAttribute("data-slider")] = Number(inp.value);
        var card = inp.closest(".card");
        var v = App.lucro;
        var s = st(), cfg = s.config;
        var comManut = s.clientes.filter(function (c) { return c.status === "ativo" && c.manutencao; }).length;
        var mrr = comManut * cfg.manutMes;
        var receita = v.sites * v.preco + mrr, lucro = receita - v.custo;
        inp.closest("label").querySelector("b").textContent = (inp.getAttribute("data-slider") === "sites") ? String(v.sites) : Z.fmtBRL(Number(inp.value));
        // os 5 números do card: sites, MRR, receita total, custo, lucro
        var nums = card.querySelectorAll(".kv .v");
        if (nums.length < 5) return;
        nums[0].textContent = Z.fmtBRL(v.sites * v.preco);
        nums[2].textContent = Z.fmtBRL(receita);
        nums[3].textContent = "− " + Z.fmtBRL(v.custo);
        nums[4].textContent = Z.fmtBRL(lucro);
        nums[4].style.color = lucro >= 0 ? "var(--green)" : "var(--red)";
        var meta = card.querySelector("p.tiny b");
        if (meta) meta.textContent = String(v.preco > 0 ? Math.ceil(v.custo / v.preco) : 0);
      });
    });
  }

  /* ====================================================================== */
  /*  PROSPECÇÃO                                                             */
  /* ====================================================================== */
  function viewProspect() {
    var S = window.ZeikStore, s = st(), f = App.filters;
    var list = s.prospects.slice();
    if (f.q) {
      var q = f.q.toLowerCase();
      list = list.filter(function (p) {
        return [p.nome, p.contato, p.endereco, p.telefone, p.obs, p.bairro, (seg(p.segmento) || {}).nome].join(" ").toLowerCase().indexOf(q) >= 0;
      });
    }
    if (f.bairro) list = list.filter(function (p) { return p.bairro === f.bairro; });
    if (f.segmento) list = list.filter(function (p) { return p.segmento === f.segmento; });
    if (f.status) list = list.filter(function (p) { return p.status === f.status; });
    if (f.prio) list = list.filter(function (p) { return p.prioridade === f.prio; });
    if (f.need === "site") list = list.filter(function (p) { return p.temSite === false; });
    if (f.need === "insta") list = list.filter(function (p) { return p.temInstagram === false; });
    if (f.need === "insta2") list = list.filter(function (p) { return p.temInstagram == null; });
    if (f.need === "nada") list = list.filter(function (p) { return p.temSite === false && p.temInstagram === false; });
    if (f.need === "telefone") list = list.filter(function (p) { return !p.telefone; });
    if (f.ordem === "score") list.sort(function (a, b) { return S.score(b) - S.score(a); });
    else if (f.ordem === "nome") list.sort(function (a, b) { return a.nome.localeCompare(b.nome); });
    else if (f.ordem === "recente") list.sort(function (a, b) { return (b.atualizadoEm || "") < (a.atualizadoEm || "") ? -1 : 1; });
    else if (f.ordem === "antigo") list.sort(function (a, b) { return (a.atualizadoEm || "") < (b.atualizadoEm || "") ? -1 : 1; });

    var bairros = s.config.bairros.concat(Object.keys(s.prospects.reduce(function (o, p) { if (p.bairro) o[p.bairro] = 1; return o; }, {})))
      .filter(function (v, i, a) { return a.indexOf(v) === i; });
    var opts = function (arr, cur, lbl) {
      return '<option value="">' + lbl + '</option>' + arr.map(function (x) {
        return '<option value="' + esc(x.id || x) + '"' + (cur === (x.id || x) ? " selected" : "") + '>' + esc(x.nome || x) + '</option>';
      }).join("");
    };

    var semTelefone = s.prospects.filter(function (p) { return !p.telefone; }).length;
    var contatadosHoje = s.prospects.filter(function (p) { return p.ultimoContato && p.ultimoContato.slice(0, 10) === Z.todayISO(); }).length;

    return topbar("Prospecção — Zona Sul",
      list.length + " de " + s.prospects.length + " empresas · buscar com ⌘K / Ctrl+K",
      '<button class="btn sm quiet" data-act="atualizar-lista" title="Preenche telefone, site e Instagram que a pesquisa descobriu depois — sem mexer no que você já marcou">↻ Atualizar lista-base</button>' +
      '<button class="btn sm quiet" data-act="caca">🔎 Caçar mais empresas</button>' +
      '<button class="btn sm quiet" data-act="importar">⬆ Importar</button>' +
      '<button class="btn sm" data-act="novo-prospect">+ Novo prospect</button>') +

      '<div class="grid three" style="margin-bottom:14px">' +
      stat("Sem site próprio", s.prospects.filter(function (p) { return p.temSite === false; }).length, "Venda mais fácil — dor concreta.", "blue") +
      stat("Sem Instagram", s.prospects.filter(function (p) { return p.temInstagram === false; }).length, "Venda o combo: site + perfil criado/organizado.", "purple") +
      stat("Contatadas hoje", contatadosHoje, "Meta diária: " + st().config.metaProspectsDia + " abordagens.", "green") +
      '</div>' +

      '<div class="card" style="padding:14px 16px;margin-bottom:14px">' +
      '<div class="filters" style="margin:0">' +
      '<div class="search grow"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '<input type="search" data-filter="search" placeholder="Buscar empresa, bairro, telefone, observação…" value="' + esc(f.q) + '"></div>' +
      '<select data-filter="bairro">' + opts(bairros, f.bairro, "Todos os bairros") + '</select>' +
      '<select data-filter="segmento">' + opts(window.ZEIK_SEED.segmentos, f.segmento, "Todos os segmentos") + '</select>' +
      '<select data-filter="status">' + opts(Object.keys(STATUS_LABEL).map(function (k) { return { id: k, nome: STATUS_LABEL[k][0] }; }), f.status, "Qualquer status") + '</select>' +
      '<select data-filter="prio">' + opts([{ id: "alta", nome: "Prioridade alta" }, { id: "media", nome: "Prioridade média" }, { id: "baixa", nome: "Prioridade baixa" }], f.prio, "Qualquer prioridade") + '</select>' +
      '<select data-filter="need">' + opts([{ id: "site", nome: "Só sem site" }, { id: "insta", nome: "Só sem Instagram" }, { id: "insta2", nome: "Instagram a conferir" }, { id: "nada", nome: "Sem site E sem Instagram" }, { id: "telefone", nome: "Falta telefone" }], f.need, "Todas as necessidades") + '</select>' +
      '<select data-filter="ordem">' + opts([{ id: "score", nome: "Ordenar: score ICP" }, { id: "recente", nome: "Ordenar: atividade recente" }, { id: "antigo", nome: "Ordenar: mais antigos" }, { id: "nome", nome: "Ordenar: nome" }], f.ordem, "") + '</select>' +
      (semTelefone ? '<button class="btn xs orange" data-act="jump" data-view="prospeccao" data-query="need=telefone">📞 ' + semTelefone + ' sem telefone</button>' : '') +
      '<button class="btn xs quiet" data-act="limpar-filtros">Limpar</button>' +
      '</div></div>' +

      '<div class="list">' +
      (list.length ? list.slice(0, 400).map(prospectRow).join("") :
        '<div class="card empty"><div class="big">🗺️</div><b>Nenhum prospect com esses filtros</b><p class="tiny">Ajuste os filtros, limpe a busca ou use "Caçar mais empresas" para ampliar a lista.</p>' +
        '<button class="btn sm" data-act="limpar-filtros" style="margin-top:8px">Limpar filtros</button></div>') +
      '</div>' +
      (list.length > 400 ? '<p class="tiny center">Mostrando 400 de ' + list.length + " — refine os filtros.</p>" : "");
  }

  function stat(label, n, sub, color) {
    return '<div class="card kpi accent-' + color + '"><div class="label">' + esc(label) + '</div><div class="value">' + n + '</div><div class="delta">' + esc(sub) + '</div></div>';
  }

  function prospectRow(p) {
    var S = window.ZeikStore, sc = S.score(p), g = seg(p.segmento);
    var dias = Z.diasDesde(p.ultimoContato || p.criadoEm);
    var needs = [];
    if (p.temSite === false) needs.push('<span class="need">🌐 sem site</span>');
    if (p.temSite === true) needs.push('<span class="badge gray">tem site</span>');
    if (p.temInstagram === false) needs.push('<span class="need">📷 sem Instagram</span>');
    if (p.temInstagram == null) needs.push('<span class="badge gray" title="O anúncio não mostrava rede social — cheque no Maps">IG a conferir</span>');
    if (p.temInstagram === true) needs.push('<span class="badge gray">' + esc(p.insta || "tem IG") + '</span>');
    return '<div class="li" data-pid="' + p.id + '">' +
      '<div class="li-seg" title="' + esc(g.nome) + '">' + esc(g.emoji || "🏪") + '</div>' +
      '<div class="li-lead"><div class="row" style="gap:7px">' +
      '<span class="li-title truncate">' + esc(p.nome) + '</span>' +
      statusPill(p.status) +
      (p.prioridade === "alta" ? badge("🔥 alta", "red") : p.prioridade === "baixa" ? badge("baixa", "gray") : "") +
      '</div>' +
      '<div class="li-meta">' +
      '<span>' + esc(p.bairro) + '</span>' + (p.endereco ? '<span class="truncate">· ' + esc(p.endereco) + '</span>' : '') +
      (p.telefone ? '<span class="mono">· ' + esc(Z.fmtTel(p.telefone)) + '</span>' : '<span class="need">· sem telefone</span>') +
      '<span>· ' + scoreBar(sc) + '</span>' +
      (dias != null && p.status !== "novo" ? '<span class="tiny">· último contato há ' + dias + 'd</span>' : "") +
      '</div>' +
      (p.obs ? '<p class="tiny" style="margin:4px 0 0">💡 ' + esc(p.obs) + '</p>' : "") +
      '<div class="row wrap" style="gap:5px;margin-top:7px">' + needs.join("") + '</div>' +
      '</div>' +
      '<div class="li-actions">' +
      (p.telefone ? '<button class="btn xs" data-act="p-ligar" data-id="' + p.id + '" title="Ligar agora">📞</button>' +
        '<button class="btn xs wa" data-act="p-wa" data-id="' + p.id + '" title="WhatsApp">💬</button>' : '') +
      '<button class="btn xs ghost" data-act="p-script" data-id="' + p.id + '" title="Script de abordagem">🧠 Script</button>' +
      '<button class="btn xs ghost" data-act="p-maps" data-id="' + p.id + '" title="Ver no Google Maps">🗺️</button>' +
      '<button class="btn xs quiet" data-act="p-editar" data-id="' + p.id + '" title="Editar">✏️</button>' +
      '<button class="btn xs quiet" data-act="p-menu" data-id="' + p.id + '" title="Mais">⋯</button>' +
      '</div></div>';
  }

  /* ====================================================================== */
  /*  PIPELINE / KANBAN + DRAG & DROP                                       */
  /* ====================================================================== */
  function viewPipeline() {
    var S = window.ZeikStore, s = st(), m = S.stats();
    var cols = ["lead", "contatado", "proposta", "ganho", "perdido"].map(function (e) {
      var items = s.deals.filter(function (d) { return d.etapa === e; })
        .sort(function (a, b) { return (a.ordem || 0) - (b.ordem || 0); });
      var soma = items.reduce(function (a, d) { return a + (Number(d.valor) || 0); }, 0);
      return '<div class="kcol" data-col="' + e + '">' +
        '<div class="kcol-head"><span class="pip" style="background:var(--' +
        ({ gray: "text-3", blue: "blue", orange: "orange", green: "green", red: "red" })[S.Etapas[e].cor] +
        ')"></span><span class="name">' + S.Etapas[e].nome + '</span><span class="n">' + items.length + '</span></div>' +
        '<div class="sum">' + (items.length ? money(soma) + " em jogos" : "vazio") + '</div>' +
        '<div class="kbody" data-drop="' + e + '">' + items.map(kanbanCard).join("") +
        (items.length ? "" : '<p class="tiny center" style="padding:14px 6px;border:1px dashed var(--hairline);border-radius:12px">Arraste um card pra cá<br>ou crie um novo</p>') +
        '</div></div>';
    }).join("");

    return topbar("Pipeline de vendas",
      "Arraste os cards entre as colunas — ao mover para <b>Contatado</b> o painel oferece follow-up automático",
      '<button class="btn sm quiet" data-act="proposta-em-aberto">📨 ' + m.propostas + ' em proposta</button>' +
      '<button class="btn sm" data-act="novo-deal">+ Novo negócio</button>') +
      '<div class="grid kpis" style="margin-bottom:14px">' +
      stat("Valor em pipeline", money(m.pipeline), "Soma de tudo que está aberto", "blue") +
      stat("Taxa de conversão", m.taxa + "%", m.ganhos + " ganhos / " + (m.ganhos + m.perdidos) + " fechados", "green") +
      stat("Ticket médio", money(m.ticket), "de negócio fechado", "indigo") +
      stat("Propostas paradas", m.propostas, "Sem resposta há 3+ dias: cobre hoje", "orange") +
      '</div>' +
      '<div class="kanban-hint"><span>↔️</span> Dica: no celular, segure o card ¼ de segundo e arraste. Toque no ⠿ para mover também.</div>' +
      '<div class="kanban" id="kanban">' + cols + '</div>';
  }

  function siteSit(d) {
    // "tem site?" mora no prospect de origem; o card do Kanban puxa de lá
    if (d.temSiteSit) return d.temSiteSit;
    var p = d.prospectId ? st().prospects.filter(function (x) { return x.id === d.prospectId; })[0] : null;
    if (!p) return d.temSite === false ? "nao" : d.temSite === true ? "sim" : "";
    return p.temSite === false ? "nao" : p.temSite === true ? "sim" : p.temSite === "velho" ? "velho" : "";
  }
  function kanbanCard(d) {
    var s = st(), S = window.ZeikStore;
    var t = s.tarefas.filter(function (x) { return !x.concluida && x.dealId === d.id; }).sort(function (a, b) { return a.data < b.data ? -1 : 1; })[0];
    var due = t ? Z.diasAteData(t.data) : null;
    var late = due != null && due < 0;
    var g = seg(d.segmento);
    var dias = Z.diasDesde(d.atualizadoEm || d.criadoEm);
    return '<article class="kcard" draggable="false" tabindex="0" data-deal="' + d.id + '" data-etapa="' + d.etapa + '">' +
      '<span class="drag-handle" data-handle title="Arrastar">⠿</span>' +
      '<div class="t truncate">' + esc(d.empresa) + '</div>' +
      '<div class="m">' + esc((g.emoji || "") + " " + (g.nome || "")) + ' · ' + esc(d.bairro || "—") + '</div>' +
      '<div class="badges">' +
      (d.contato ? badge("👤 " + d.contato, "gray") : "") +
      ((d.manutencao || (d.itens && d.itens.manut)) ? badge("+ " + Z.fmtBRL(st().config.manutMes) + "/mês", "purple") : "") +
      (siteSit(d) === "nao" ? badge("sem site", "blue") : siteSit(d) === "sim" ? badge("tem site", "gray") : siteSit(d) === "velho" ? badge("site fraco", "orange") : "") +
      ((d.instagramOferta || (d.itens && d.itens.insta)) ? badge("combo Instagram", "purple") : "") +
      (d.itens && d.itens.gmn ? badge("Google Meu Negócio", "cyan") : "") +
      '</div>' +
      '<div class="foot">' +
      (d.telefone ? '<button class="btn xs wa" data-act="d-wa" data-id="' + d.id + '" title="WhatsApp">💬</button>' +
        '<button class="btn xs" data-act="d-ligar" data-id="' + d.id + '" title="Ligar">📞</button>' : "") +
      '<button class="btn xs ghost" data-act="d-proposta" data-id="' + d.id + '" title="Gerar proposta">📄</button>' +
      '<button class="btn xs quiet" data-act="d-menu" data-id="' + d.id + '" title="Mais ações">⋯</button>' +
      '<span class="v">' + money(d.valor || 0) + '</span>' +
      '</div>' +
      (t ? '<div class="due' + (late ? " late" : "") + '" style="margin-top:7px">⏰ ' + (late ? "atrasado " + Math.abs(due) + "d" : due === 0 ? "hoje" : "em " + due + "d") + " · " + esc(t.titulo) + '</div>' : "") +
      (dias >= 4 && d.etapa !== "ganho" && d.etapa !== "perdido" ? '<div class="due late" style="margin-top:5px">🥶 parado há ' + dias + " dias</div>" : "") +
      '</article>';
  }

  /* ------------------------- drag & drop (ponteiro) -------------------- */
  var drag = null;
  function bindDragDrop() {
    var kan = document.getElementById("kanban");
    if (!kan) return;
    kan.addEventListener("pointerdown", onDown);
  }
  function onDown(ev) {
    var card = ev.target.closest(".kcard");
    if (!card) return;
    if (ev.target.closest("button")) return;              // não arrasta quando clica em ação
    var touch = ev.pointerType !== "mouse";
    var onHandle = !!ev.target.closest("[data-handle]");
    drag = {
      card: card, id: card.getAttribute("data-deal"), from: card.getAttribute("data-etapa"),
      x0: ev.clientX, y0: ev.clientY, started: false, touch: touch, armed: false,
      armedTimer: null, pointerId: ev.pointerId
    };
    if (touch && !onHandle) {
      drag.armedTimer = setTimeout(function () { if (drag) drag.armed = true; }, 240);
    } else if (touch) { drag.armed = true; card.style.touchAction = "none"; }
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    document.addEventListener("touchmove", blockScroll, { passive: false });
  }
  function blockScroll(ev) { if (drag && drag.started && drag.touch) { /* deixa rolar se não começou */ if (ev.cancelable) ev.preventDefault(); } }
  function onMove(ev) {
    if (!drag) return;
    var dx = ev.clientX - drag.x0, dy = ev.clientY - drag.y0;
    if (!drag.started) {
      if (Math.abs(dx) + Math.abs(dy) < 9) return;
      if (drag.touch && !drag.armed) { cancel(); return; }
      start(ev);
    }
    move(ev);
  }
  function start(ev) {
    drag.started = true;
    clearTimeout(drag.armedTimer);
    var ghost = drag.card.cloneNode(true);
    ghost.id = "dragGhost";
    ghost.className = "kcard";
    ghost.style.width = drag.card.offsetWidth + "px";
    ghost.querySelectorAll("button").forEach(function (b) { b.remove(); });
    document.body.appendChild(ghost);
    drag.ghost = ghost;
    drag.card.classList.add("dragging");
    document.body.style.userSelect = "none";
    move(ev);
  }
  function move(ev) {
    var g = drag.ghost;
    g.style.left = (ev.clientX - 24) + "px";
    g.style.top = (ev.clientY - 18) + "px";
    g.style.position = "fixed";
    drag.card.style.visibility = "hidden";
    var under = document.elementFromPoint(ev.clientX, ev.clientY);
    var col = under && under.closest ? under.closest(".kcol") : null;
    document.querySelectorAll(".kcol.drop").forEach(function (c) { if (c !== col) c.classList.remove("drop"); });
    drag.over = col ? col.getAttribute("data-col") : null;
    if (col) col.classList.add("drop");
  }
  function onUp() {
    if (!drag) return;
    if (drag.started) {
      var target = drag.over;
      var id = drag.id, from = drag.from;
      cancel();
      if (target && target !== from) App.moveDeal(id, target);
      else render();
    } else {
      var tocado = drag.id;
      cancel();
      App.modalDeal(tocado);          // toque simples no card abre o negócio
    }
  }
  function cancel() {
    if (!drag) return;
    clearTimeout(drag.armedTimer);
    if (drag.ghost) drag.ghost.remove();
    if (drag.card) { drag.card.classList.remove("dragging"); drag.card.style.visibility = ""; drag.card.style.touchAction = ""; }
    document.querySelectorAll(".kcol.drop").forEach(function (c) { c.classList.remove("drop"); });
    document.body.style.userSelect = "";
    document.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onUp);
    document.removeEventListener("touchmove", blockScroll);
    drag = null;
  }

  App.moveDeal = function (id, novaEtapa) {
    var S = window.ZeikStore, s = st();
    var d = s.deals.filter(function (x) { return x.id === id; })[0];
    if (!d) return;
    if (!S.Etapas[novaEtapa]) { ui().toast("Etapa desconhecida — nada foi movido.", "warn", 4000); render(); return; }
    var anterior = d.etapa;
    if (anterior === novaEtapa) return;
    S.pushUndo("mover card");
    d.etapa = novaEtapa;
    d.ordem = Date.now() % 100000;
    d.atualizadoEm = new Date().toISOString();
    d.historico = (d.historico || []); d.historico.push({ etapa: novaEtapa, em: d.atualizadoEm });
    S.log("pipeline", d.empresa + ": " + ((S.Etapas[anterior] || {}).nome || anterior) + " → " + S.Etapas[novaEtapa].nome, d.id);
    S.saveNow();

    if (novaEtapa === "contatado") { App.modalFollowUp(d, anterior); return; }
    if (novaEtapa === "proposta") {
      App.modalProposta(d); return;
    }
    if (novaEtapa === "ganho") { App.modalGanho(d); return; }
    if (novaEtapa === "perdido") { App.modalPerdido(d); return; }
    render();
    ui().toast("Movido para " + S.Etapas[novaEtapa].nome, "ok");
  };

  /* ====================================================================== */
  /*  CLIENTES                                                               */
  /* ====================================================================== */
  function viewClientes() {
    var s = st(), f = App.filters;
    var list = s.clientes.slice();
    if (f.cq) {
      var q = f.cq.toLowerCase();
      list = list.filter(function (c) { return [c.empresa, c.contato, c.bairro, c.telefone, c.obs, c.segmento].join(" ").toLowerCase().indexOf(q) >= 0; });
    }
    if (f.cstatus) list = list.filter(function (c) { return c.status === f.cstatus; });
    list.sort(function (a, b) { return (b.valor || 0) - (a.valor || 0); });

    var ativos = s.clientes.filter(function (c) { return c.status === "ativo"; });
    var comManut = ativos.filter(function (c) { return c.manutencao; });
    var semManut = ativos.filter(function (c) { return !c.manutencao; });
    var mrr = comManut.length * s.config.manutMes;

    var rows = list.length ? list.map(function (c) {
      var g = seg(c.segmento);
      return '<div class="li">' +
        '<div class="li-seg">' + esc(g.emoji || "🤝") + '</div>' +
        '<div class="li-lead"><div class="row" style="gap:7px"><span class="li-title truncate">' + esc(c.empresa) + '</span>' +
        badge(c.status === "ativo" ? "ativo" : c.status === "negociacao" ? "em negociação" : "inativo", c.status === "ativo" ? "green" : c.status === "negociacao" ? "orange" : "gray") +
        (c.manutencao ? badge("MRR " + money(s.config.manutMes), "purple") : badge("sem manutenção", "gray")) + '</div>' +
        '<div class="li-meta"><span>' + esc(c.bairro || "—") + '</span>' + (c.telefone ? '<span class="mono">· ' + esc(Z.fmtTel(c.telefone)) + '</span>' : '') +
        (c.entregue ? '<span>· site no ar desde ' + Z.fmtData(c.entregue) + '</span>' : '<span class="need">· site não entregue</span>') + '</div>' +
        (c.obs ? '<p class="tiny" style="margin:3px 0 0">' + esc(c.obs) + '</p>' : '') + '</div>' +
        '<div class="li-actions">' +
        (c.telefone ? '<button class="btn xs wa" data-act="c-wa" data-id="' + c.id + '">💬</button>' : '') +
        '<button class="btn xs ghost" data-act="c-gerar-site" data-id="' + c.id + '">🌐 Gerar site</button>' +
        '<button class="btn xs ghost" data-act="c-proposta" data-id="' + c.id + '">📄 Proposta</button>' +
        '<button class="btn xs" data-act="c-receber" data-id="' + c.id + '">＋ Receita</button>' +
        '<button class="btn xs quiet" data-act="c-editar" data-id="' + c.id + '">✏️</button>' +
        '<button class="btn xs quiet" data-act="c-menu" data-id="' + c.id + '">⋯</button></div></div>';
    }).join("") : '<div class="card empty"><div class="big">🤝</div><b>Nenhum cliente ainda</b><p class="tiny">Feche um negócio no Pipeline (arraste para <b>Ganho</b>) e ele vira cliente automaticamente.</p><button class="btn sm" data-act="novo-cliente" style="margin-top:8px">Cadastrar mesmo assim</button></div>';

    return topbar("Clientes",
      ativos.length + " ativos · " + mrr + "/mês de receita recorrente",
      '<button class="btn sm quiet" data-act="novo-cliente">+ Cliente</button>' +
      '<button class="btn sm ghost" data-act="campanha-manutencao">Ofertar manutenção (' + semManut.length + ')</button>') +
      '<div class="grid kpis" style="margin-bottom:14px">' +
      stat("Clientes ativos", ativos.length, "Sites entregues, relacionamento em andamento", "green") +
      stat("Com manutenção", comManut.length, "MRR " + money(mrr) + " por mês", "purple") +
      stat("Sem manutenção", semManut.length, "Up-sell imediato de " + money(s.config.manutMes) + "/mês", "orange") +
      stat("Valor da carteira", money(s.clientes.reduce(function (a, c) { return a + (Number(c.valor) || 0); }, 0)), "Total já fechado", "indigo") +
      '</div>' +
      '<div class="card" style="padding:13px 16px;margin-bottom:14px"><div class="filters" style="margin:0">' +
      '<div class="search grow"><svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6"/><path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '<input type="search" data-filter="csearch" placeholder="Buscar cliente…" value="' + esc(f.cq) + '"></div>' +
      '<select data-filter="cstatus">' +
      [{ id: "", nome: "Todos" }, { id: "ativo", nome: "Ativos" }, { id: "negociacao", nome: "Em negociação" }, { id: "inativo", nome: "Inativos" }, { id: "manut", nome: "Só com manutenção" }]
        .map(function (o) { return '<option value="' + o.id + '"' + (f.cstatus === o.id ? " selected" : "") + '>' + o.nome + '</option>'; }).join("") +
      '</select></div></div>' +
      '<div class="list">' + rows + '</div>';
  }

  /* ====================================================================== */
  /*  FINANCEIRO                                                             */
  /* ====================================================================== */
  function viewFinanceiro() {
    var S = window.ZeikStore, s = st(), m = S.stats();
    var per = App.filters.fperiodo === "all" ? null : Number(App.filters.fperiodo);
    var list = s.financeiro.slice().sort(function (a, b) { return (b.data || "") < (a.data || "") ? -1 : 1; });
    if (per) {
      var lim = Z.addDays(-per * 30);
      list = list.filter(function (f) { return (f.data || "") >= lim; });
    }
    var pago = list.filter(function (f) { return f.status === "pago"; }).reduce(function (a, f) { return a + Number(f.valor || 0); }, 0);
    var aRec = list.filter(function (f) { return f.status !== "pago"; }).reduce(function (a, f) { return a + Number(f.valor || 0); }, 0);
    var sites = list.filter(function (f) { return f.tipo === "site" && f.status === "pago"; }).length;

    var rows = list.length ? list.map(function (f) {
      var c = s.clientes.filter(function (x) { return x.id === f.clienteId; })[0];
      return '<tr>' +
        '<td>' + Z.fmtData(f.data) + '</td>' +
        '<td><b>' + esc(f.descricao || c && c.empresa || "—") + '</b>' + (c ? '<div class="tiny">' + esc(c.empresa) + '</div>' : '') + '</td>' +
        '<td>' + badge(f.tipo === "site" ? "site" : f.tipo === "manutencao" ? "manutenção" : f.tipo === "insta" ? "instagram" : "outro", f.tipo === "manutencao" ? "purple" : f.tipo === "site" ? "blue" : "gray") + '</td>' +
        '<td class="num"><b>' + money(f.valor) + '</b></td>' +
        '<td>' + (f.status === "pago" ? badge("pago " + (f.metodo || ""), "green") : '<button class="btn xs green" data-act="f-receber" data-id="' + f.id + '">Receber</button>') + '</td>' +
        '<td class="right"><button class="btn xs quiet" data-act="f-editar" data-id="' + f.id + '">✏️</button> ' +
        '<button class="btn xs quiet" data-act="f-del" data-id="' + f.id + '">🗑</button></td></tr>';
    }).join("") : '<tr><td colspan="6" class="center" style="padding:26px;color:var(--text-2)">Nenhum lançamento no período. Clique em <b>＋ Lançamento</b> ou feche um negócio no Pipeline.</td></tr>';

    return topbar("Faturamento", "Receita, a receber e recorrência — tudo em R$",
      '<button class="btn sm ghost" data-act="csv-financeiro">⇩ CSV</button>' +
      '<button class="btn sm" data-act="novo-pagamento">+ Lançamento</button>') +
      '<div class="grid kpis" style="margin-bottom:14px">' +
      stat("Recebido (período)", money(pago), "Dinheiro que entrou", "green") +
      stat("A receber", money(aRec), list.filter(function (f) { return f.status !== "pago"; }).length + " cobrança(s) pendente(s)", "orange") +
      stat("Ticket médio", money(m.ticket), "por projeto fechado", "indigo") +
      stat("Sites vendidos", sites, "no período selecionado", "blue") +
      '</div>' +
      '<div class="grid side" style="margin-bottom:14px">' +
      '<div class="card"><div class="card-title">📊 Mês a mês (últimos 6)</div><div class="chart">' +
      m.porMes.map(function (x) {
        var max = Math.max.apply(null, m.porMes.map(function (y) { return y.pago; }).concat([1]));
        return '<div class="bar-wrap"><div class="bar-val">' + (x.pago ? Math.round(x.pago / 100) / 10 + "k" : "") + '</div>' +
          '<div class="bar" style="height:' + (Math.round((x.pago / max) * 120) + 3) + 'px"></div><div class="bar-lbl">' + esc(x.label) + '</div></div>';
      }).join("") + '</div></div>' +
      lucroCard() + '</div>' +
      '<div class="card" style="padding:13px 16px;margin-bottom:12px"><div class="filters" style="margin:0">' +
      '<span class="tiny">Período</span>' +
      [{ id: "3", nome: "3 meses" }, { id: "6", nome: "6 meses" }, { id: "12", nome: "12 meses" }, { id: "all", nome: "Tudo" }]
        .map(function (o) { return '<button class="btn xs ' + (App.filters.fperiodo === o.id ? "" : "quiet") + '" data-act="periodo" data-val="' + o.id + '">' + o.nome + '</button>'; }).join("") +
      '</div></div>' +
      '<div class="card" style="padding:6px 8px"><div class="tbl-wrap"><table class="tbl">' +
      '<thead><tr><th>Data</th><th>Descrição</th><th>Tipo</th><th class="num">Valor</th><th>Status</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div></div>';
  }
  App.setPeriodo = function (v) { App.filters.fperiodo = v; render(); };

  /* ====================================================================== */
  /*  TAREFAS                                                                */
  /* ====================================================================== */
  function viewTarefas() {
    var s = st(), f = App.filters;
    var list = s.tarefas.slice();
    var tab = f.tq || "pendentes";
    if (tab === "pendentes") list = list.filter(function (t) { return !t.concluida; });
    else if (tab === "hoje") list = list.filter(function (t) { return !t.concluida && Z.diasAteData(t.data) <= 0; });
    else if (tab === "atrasadas") list = list.filter(function (t) { return !t.concluida && Z.diasAteData(t.data) < 0; });
    else if (tab === "feitas") list = list.filter(function (t) { return t.concluida; });
    list.sort(function (a, b) { return (a.data || "9999") < (b.data || "9999") ? -1 : 1; });
    if (f.tq2) { var q = f.tq2.toLowerCase(); list = list.filter(function (t) { return (t.titulo + " " + (t.cliente || "")).toLowerCase().indexOf(q) >= 0; }); }

    var atrasadas = s.tarefas.filter(function (t) { return !t.concluida && Z.diasAteData(t.data) < 0; }).length;

    var rows = list.length ? list.map(function (t) {
      var d = Z.diasAteData(t.data);
      var cls = t.concluida ? "gray" : d < 0 ? "red" : d === 0 ? "orange" : "blue";
      var quando = t.concluida ? "concluída" : d < 0 ? "atrasada " + Math.abs(d) + "d" : d === 0 ? "hoje" : d === 1 ? "amanhã" : "em " + d + " dias";
      return '<div class="li" style="' + (t.concluida ? "opacity:.6" : "") + '">' +
        '<label class="check" style="flex:0 0 auto"><input type="checkbox" ' + (t.concluida ? "checked " : "") + 'data-act="tarefa-check" data-id="' + t.id + '"></label>' +
        '<div class="li-lead"><div class="li-title" style="text-decoration:' + (t.concluida ? "line-through" : "none") + '">' + esc(t.titulo) + '</div>' +
        '<div class="li-meta">' + badge(quando, cls) + (t.cliente ? '<span>· ' + esc(t.cliente) + '</span>' : "") + (t.ciclo ? '<span class="tiny">· ciclo automático</span>' : "") + '</div>' +
        (t.notas ? '<p class="tiny" style="margin:3px 0 0">' + esc(t.notas) + '</p>' : '') + '</div>' +
        '<div class="li-actions">' + (t.link ? '<button class="btn xs wa" data-act="tarefa-wa" data-id="' + t.id + '">💬 Cobrar</button>' : '') +
        '<button class="btn xs quiet" data-act="tarefa-editar" data-id="' + t.id + '">✏️</button>' +
        '<button class="btn xs quiet" data-act="tarefa-del" data-id="' + t.id + '">🗑</button></div></div>';
    }).join("") : '<div class="card empty"><div class="big">✅</div><b>Nada por aqui</b><p class="tiny">Tarefas são criadas automaticamente quando você agenda um follow-up no Kanban.</p></div>';

    return topbar("Tarefas e follow-ups", atrasadas ? '<b style="color:var(--red)">' + atrasadas + ' atrasada(s)</b> — cobre hoje' : "Tudo em dia 👌",
      '<button class="btn sm" data-act="nova-tarefa">+ Nova tarefa</button>') +
      '<div class="pill-tabs" style="margin-bottom:12px">' +
      [["pendentes", "Pendentes"], ["hoje", "Hoje e atrasadas"], ["atrasadas", "Só atrasadas"], ["feitas", "Concluídas"], ["todas", "Todas"]]
        .map(function (t) { return '<button class="btn sm ' + (tab === t[0] ? "" : "quiet") + '" data-act="tarefas-tab" data-tab="' + t[0] + '">' + t[1] + '</button>'; }).join("") +
      '</div>' +
      '<div class="list">' + rows + '</div>';
  }

  /* ====================================================================== */
  /*  SCRIPTS                                                                */
  /* ====================================================================== */
  function viewScripts() {
    var s = st();
    var cards = window.ZEIK_SEED.segmentos.map(function (g) {
      var n = s.prospects.filter(function (p) { return p.segmento === g.id; }).length;
      return '<div class="card hoverable"><div class="card-title">' + g.emoji + ' ' + esc(g.nome) + (n ? '<span class="tiny" style="margin-left:auto">' + n + ' na lista</span>' : "") + '</div>' +
        '<p class="tiny" style="margin:0 0 8px"><b>Dor:</b> ' + esc(g.dor) + '</p>' +
        '<p class="tiny" style="margin:0 0 12px"><b>Gancho:</b> ' + esc(g.gancho) + '</p>' +
        '<div class="row wrap"><button class="btn xs" data-act="ver-script" data-seg="' + g.id + '">💬 Ver script</button>' +
        '<button class="btn xs ghost" data-act="ver-script" data-seg="' + g.id + '" data-tipo="followup">🔁 Follow-up</button>' +
        '<button class="btn xs ghost" data-act="ver-script" data-seg="' + g.id + '" data-tipo="fechamento">🤝 Fechamento</button></div></div>';
    }).join("");

    var obj = window.ZEIK_SEED.objecoes.map(function (o) {
      var qc = ui().fillVars(o.q, ui().scriptCtx());
      return '<div class="card hoverable" style="cursor:pointer" data-act="ver-objecao" data-q="' + esc(o.q) + '"><div class="card-title">🛡 ' + esc(qc) + '</div>' +
        '<p class="tiny" style="margin:0">' + esc(ui().fillVars(o.a, ui().scriptCtx())).slice(0, 130) + '…</p></div>';
    }).join("");

    return topbar("Scripts e abordagem", "Personalize antes de enviar: nada de mensagem genérica em série",
      '<button class="btn sm ghost" data-act="copiar-tudo">⧉ Copiar playbook</button>') +
      '<div class="callout" style="margin-bottom:14px">📌 <b>Como usar:</b> abra o script pelo card do prospect (botão 🧠). O texto já sai com o nome da empresa, o bairro e o preço que você definiu em Configurações. Copie e cole no WhatsApp — ou dispare direto pelo botão.</div>' +
      '<h3 style="margin:4px 0 10px">Por segmento</h3>' +
      '<div class="grid three" style="margin-bottom:20px">' + cards + '</div>' +
      '<h3 style="margin:4px 0 10px">Quebra de objeções</h3>' +
      '<div class="grid two">' + obj + '</div>';
  }

  /* ====================================================================== */
  /*  GERADOR DE SITE                                                        */
  /* ====================================================================== */
  function viewGerador() {
    var s = st();
    var base = s.clientes.concat(s.deals.map(function (d) { return { id: d.id, _deal: true, empresa: d.empresa, bairro: d.bairro, telefone: d.telefone, segmento: d.segmento, contato: d.contato }; }));
    var opts = base.map(function (c) {
      return '<option value="' + (c._deal ? "d:" : "c:") + c.id + '">' + esc(c.empresa) + (c.bairro ? " — " + esc(c.bairro) : "") + '</option>';
    }).join("");
    return topbar("Gerador de site", "Cria o HTML final do cliente no estilo Apple — mesmo arquivo que você entrega",
      "") +
      '<div class="grid side">' +
      '<div class="card"><div class="card-title">🌐 Dados do cliente</div>' +
      '<div class="form-grid">' +
      '<label class="field"><span class="lbl">Usar dados de…</span><select id="g-base">' + (opts || '<option value="">nenhum cadastro ainda</option>') + '</select></label>' +
      '<label class="field"><span class="lbl">Segmento (define o conteúdo)</span><select id="g-seg">' +
      window.ZEIK_SEED.segmentos.map(function (g) { return '<option value="' + g.id + '">' + g.emoji + " " + esc(g.nome) + '</option>'; }).join("") + '</select></label>' +
      '<label class="field full"><span class="lbl">Nome da empresa</span><input type="text" id="g-empresa" placeholder="Ex.: Barbearia Dona Navalha"></label>' +
      '<label class="field"><span class="lbl">Bairro / região</span><input type="text" id="g-bairro" placeholder="Capão Redondo"></label>' +
      '<label class="field"><span class="lbl">Endereço</span><input type="text" id="g-end" placeholder="Av. Comendador Sant\'Anna, 416"></label>' +
      '<label class="field"><span class="lbl">Telefone / WhatsApp</span><input type="tel" id="g-tel" placeholder="(11) 90000-0000"></label>' +
      '<label class="field"><span class="lbl">Horários</span><input type="text" id="g-hor" placeholder="Ter a Sáb — 9h às 19h"></label>' +
      '<label class="field full"><span class="lbl">Texto "Sobre" (opcional)</span><textarea id="g-sobre" placeholder="Conte a história do negócio — isso aumenta confiança."></textarea></label>' +
      '</div>' +
      '<div class="row wrap" style="margin-top:14px">' +
      '<button class="btn" data-act="gerar-site">✨ Gerar e baixar HTML</button>' +
      '<button class="btn quiet" data-act="gerar-site-previa">👁 Prévia em tela</button>' +
      '<button class="btn ghost" data-act="ver-modelo">Abrir modelo do Zeik</button>' +
      '</div></div>' +
      '<div class="col">' +
      '<div class="card"><div class="card-title">📦 O que o cliente recebe</div>' +
      '<ul class="checks" style="margin:0">' +
      '<li>Arquivo <b>.html</b> único — hospeda em qualquer lugar (Vercel, Netlify, hospedagem do cliente)</li>' +
      '<li>Estilo Apple, responsivo, leve (carrega no 4G do bairro)</li>' +
      '<li>Botão flutuante de WhatsApp com mensagem pronta</li>' +
      '<li>Título, descrição e <b>JSON-LD LocalBusiness</b> — o Google entende nome, endereço e telefone</li>' +
      '<li>Crédito "Site criado por Zeik Digital" no rodapé (seu marketing grátis)</li>' +
      '</ul></div>' +
      '<div class="card"><div class="card-title">🗣 O que dizer ao entregar</div>' +
      '<p class="tiny" style="margin:0">“Prontinho, ' + '{empresa}' + '! Seu site já está no ar e o botão de WhatsApp leva direto pro seu número. Qualquer alteração, me chama aqui — a manutenção de ' + money(st().config.manutMes) + '/mês cobre isso. Se quiser, no próximo passo eu organizo o Instagram no mesmo padrão.”</p></div>' +
      '</div></div>' +
      '<div id="sitePrev" style="margin-top:14px"></div>';
  }

  /* ====================================================================== */
  /*  CONFIGURAÇÕES                                                          */
  /* ====================================================================== */
  function viewConfig() {
    var S = window.ZeikStore, s = st(), cfg = s.config;
    var lock = S.lockGet();
    var snaps = S.listSnapshots();
    var bytes = (localStorage.getItem(S.KEY) || "").length;
    var inp = function (path, label, type, hint) {
      var v = getPath(s, path);
      return '<label class="field"><span class="lbl">' + esc(label) + '</span>' +
        '<input type="' + (type || "text") + '" data-autosave="' + path + '" value="' + esc(String(v == null ? "" : v)) + '"' + (type === "number" ? ' step="10"' : "") + '>' +
        (hint ? '<span class="tiny">' + esc(hint) + '</span>' : '') + '</label>';
    };
    return topbar("Configurações", "Tudo é salvo neste navegador — nada sai do seu celular/PC",
      '<button class="btn sm quiet" data-act="export-backup">⬇ Exportar backup</button>' +
      '<button class="btn sm quiet" data-act="snapshot-agora">📸 Snapshot</button>') +
      '<div class="grid two" style="margin-bottom:14px">' +
      '<div class="card"><div class="card-title">🏷 Sua agência (usado nos scripts e propostas)</div><div class="form-grid">' +
      inp("config.agencia", "Nome da agência") + inp("config.responsavel", "Seu nome (assinatura)") +
      inp("config.cidade", "Região atendida") + inp("config.instagram", "Instagram da Zeik (sem @)") +
      inp("config.whatsapp", "WhatsApp (só números, com DDI)", "text", "Usado nos links wa.me — ex.: 5511990147836") +
      inp("config.whatsappDisplay", "WhatsApp (formatado)", "text", "Aparece nos textos") +
      inp("config.email", "E-mail") + inp("config.siteZeik", "Site / portfolio (opcional)") +
      '</div></div>' +
      '<div class="card"><div class="card-title">💵 Preços e metas (entram em todos os textos)</div><div class="form-grid">' +
      inp("config.precoSite", "Preço do site", "number") + inp("config.precoSiteMin", "Preço mínimo", "number") +
      inp("config.precoSiteMax", "Preço máximo", "number") + inp("config.manutMes", "Manutenção mensal", "number") +
      inp("config.precoInsta", "Criação de Instagram", "number") + inp("config.precoFeed", "Organização de feed", "number") +
      inp("config.precoGmn", "Google Meu Negócio", "number") + inp("config.prazoEntrega", "Prazo de entrega") +
      inp("config.metaSitesMes", "Meta: sites por mês", "number") + inp("config.metaProspectsDia", "Meta: abordagens por dia", "number") +
      inp("config.custoFixoMes", "Custo fixo do mês", "number") +
      '</div>' +
      '<div class="field" style="margin-top:12px"><span class="lbl">Bairros atendidos (um por linha)</span>' +
      '<textarea data-autosave="config._bairrosTxt">' + esc(cfg.bairros.join("\n")) + '</textarea></div>' +
      '</div></div>' +

      '<div class="grid three" style="margin-bottom:14px">' +
      '<div class="card"><div class="card-title">🔒 Proteção do painel</div>' +
      '<p class="tiny" style="margin:0 0 10px">' + (lock && lock.hash ? "PIN ativo — a tela de entrada fica bloqueada sem ele." : "Nenhum PIN definido. Como os dados ficam <b>só neste navegador</b>, o PIN é útil se o aparelho é compartilhado.") + '</p>' +
      '<div class="row"><input type="password" id="pinInput" inputmode="numeric" maxlength="8" placeholder="PIN 4-8 dígitos" style="max-width:150px">' +
      (lock && lock.hash ? '<button class="btn quiet sm" data-act="pin-remover">Remover</button>' : '<button class="btn sm" data-act="pin-salvar">Ativar PIN</button>') + '</div>' +
      '<hr class="hr"><div class="kv"><span class="k">Tamanho dos dados</span><span class="v">' + Math.round(bytes / 1024) + ' KB</span></div>' +
      '<div class="kv"><span class="k">Snapshots guardados</span><span class="v">' + snaps.length + '</span></div>' +
      '<div class="kv"><span class="k">Navegador suporta salvar</span><span class="v" style="color:' + (S.storageOK() ? "var(--green)" : "var(--red)") + '">' + (S.storageOK() ? "sim" : "não (modo privado)") + '</span></div>' +
      '</div>' +

      '<div class="card"><div class="card-title">📸 Snapshots automáticos</div>' +
      '<p class="tiny" style="margin:0 0 8px">A cada 25 alterações o painel guarda uma cópia interna. Restaurar não apaga o estado atual (ele também vira snapshot).</p>' +
      (snaps.length ? '<div class="col" style="gap:6px;max-height:190px;overflow:auto">' + snaps.map(function (sn) {
        return '<div class="row between" style="padding:7px 10px;border:1px solid var(--hairline);border-radius:12px;font-size:12.5px">' +
          '<span>' + new Date(sn.at).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) + ' · <span class="muted">' + esc(sn.label) + '</span></span>' +
          '<span class="row"><span class="tiny">' + Math.round((sn.bytes || 0) / 1024) + ' KB</span><button class="btn xs quiet" data-act="restaurar-snap" data-i="' + sn.i + '">Restaurar</button></span></div>';
      }).join("") + '</div>' : '<p class="tiny">Nenhum snapshot ainda.</p>') +
      '</div>' +

      '<div class="card"><div class="card-title">🛟 Backup, importação e reset</div>' +
      '<div class="col">' +
      '<button class="btn quiet" data-act="export-backup">⬇ Baixar backup .json (guarde no Google Drive)</button>' +
      '<button class="btn quiet" data-act="export-csv">⇩ Exportar prospects e clientes em .csv (Excel)</button>' +
      '<button class="btn quiet" data-act="importar">⬆ Restaurar de um arquivo .json</button>' +
      '<button class="btn quiet" data-act="reset-dados">🧹 Limpar tudo e recarregar a base da Zona Sul</button>' +
      '</div>' +
      '<div class="callout warn" style="margin-top:12px">⚠️ <b>localStorage é por navegador e por dispositivo.</b> Trocar de celular ou limpar dados do navegador apaga o painel. Exporte o backup 1x por semana — o painel te lembra sozinho.</div>' +
      '</div></div>' +
      '<p class="tiny center">Zeik Digital · painel offline-first, sem backend, sem rastreio. Base inicial: ' + s.prospects.length + ' empresas reais da Zona Sul (telefones de diretório público — confirme antes de ligar).</p>';
  }
  function getPath(obj, path) {
    return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj);
  }

  /* ------------------------------- helpers ----------------------------- */
  function render() { ui().render(); }
  App.renderAll = render;   // atalho usado por modals.js
  App.esc = esc; App.money = money; App.seg = seg; App.badge = badge;
  App.prospectRow = prospectRow; App.kanbanCard = kanbanCard; App.statusPill = statusPill;
  App.STATUS_LABEL = STATUS_LABEL;
  App.getPath = getPath;
  App.get = function () { return st(); };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { });
})();
