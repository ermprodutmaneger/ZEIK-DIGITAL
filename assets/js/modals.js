/* ==========================================================================
   ZEIK DIGITAL — Ações, formulários e modais
   Arquivo: assets/js/modals.js  (usa App.handlers definidos em ui.js/app.js)
   ========================================================================== */
(function () {
  "use strict";

  var App = window.App, U = window.ZeikUI, S = null;
  function st() { return window.ZeikStore.state; }
  function render() { U.render(); }
  function esc(s) { return Z.esc(s); }
  function money(v) { return Z.fmtBRL(v); }
  function seg(id) { return U.segById(id); }
  function byId(arr, id) { for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i]; return null; }
  function findProspect(id) { return byId(st().prospects, id); }
  function findDeal(id) { return byId(st().deals, id); }
  function findCliente(id) { return byId(st().clientes, id); }
  function findTarefa(id) { return byId(st().tarefas, id); }
  function findPag(id) { return byId(st().financeiro, id); }

  function readForm(root) {
    var o = {};
    root.querySelectorAll("[data-f]").forEach(function (el) {
      var k = el.getAttribute("data-f");
      if (el.type === "radio") { if (el.checked) o[k] = el.value; return; }   // grupo: só o marcado vale
      if (el.type === "checkbox") { o[k] = !!el.checked; return; }
      if (el.type === "number") { o[k] = el.value === "" ? "" : Number(el.value); return; }
      o[k] = (el.value || "").trim();
    });
    return o;
  }
  function fld(label, html) { return '<label class="field"><span class="lbl">' + esc(label) + '</span>' + html + '</label>'; }
  function inp(name, val, type, ph, extra) {
    return '<input type="' + (type || "text") + '" data-f="' + name + '" value="' + esc(val == null ? "" : val) + '" placeholder="' + esc(ph || "") + '" ' + (extra || "") + '>';
  }
  function sel(name, opts, cur) {
    return '<select data-f="' + name + '">' + opts.map(function (o) {
      return '<option value="' + esc(o.id != null ? o.id : o) + '"' + (String(cur) === String(o.id != null ? o.id : o) ? " selected" : "") + '>' + esc(o.nome != null ? o.nome : o) + '</option>';
    }).join("") + '</select>';
  }
  function txta(name, val, ph) { return '<textarea data-f="' + name + '" placeholder="' + esc(ph || "") + '">' + esc(val || "") + '</textarea>'; }

  /* ====================================================================== */
  /*  PROSPECÇÃO — CRUD                                                      */
  /* ====================================================================== */
  function prospectForm(p) {
    var cfg = st().config, bairros = cfg.bairros;
    var sgm = window.ZEIK_SEED.segmentos.map(function (g) { return { id: g.id, nome: g.emoji + " " + g.nome }; });
    return U.modalShell(
      p ? "Editar prospect" : "Novo prospect",
      p ? '<span class="badge gray">' + esc(p.origem || "manual") + '</span>' : "Cadastre agora o que você viu na rua — leva 20 segundos",
      '<div class="form-grid">' +
      '<label class="field full"><span class="lbl">Nome da empresa *</span>' + inp("nome", p && p.nome, "text", "Ex.: Barbearia do Zé") + '</label>' +
      fld("Pessoa do contato", inp("contato", p && p.contato, "text", "Dono / gerente — nome aumenta a conversão")) +
      fld("Segmento", sel("segmento", sgm, p && p.segmento || "generico")) +
      fld("Bairro", sel("bairro", bairros.concat(p && p.bairro && bairros.indexOf(p.bairro) < 0 ? [p.bairro] : []), p && p.bairro || bairros[0])) +
      fld("Telefone / WhatsApp", inp("telefone", p && p.telefone, "tel", "(11) 90000-0000")) +
      fld("Endereço", inp("endereco", p && p.endereco, "text", "Rua, número")) +
      fld("Prioridade", sel("prioridade", [{ id: "alta", nome: "🔥 Alta" }, { id: "media", nome: "Média" }, { id: "baixa", nome: "Baixa" }], p && p.prioridade || "media")) +
      fld("Status", sel("status", Object.keys(App.STATUS_LABEL).map(function (k) { return { id: k, nome: App.STATUS_LABEL[k][0] }; }), p && p.status || "novo")) +
      '<label class="field"><span class="lbl">Tem site?</span>' + sel("temSite", [{ id: "nao", nome: "Não (venda fácil)" }, { id: "sim", nome: "Sim" }, { id: "?", nome: "Não sei / checar" }], p ? (p.temSite === false ? "nao" : p.temSite === true ? "sim" : "?") : "nao") + '</label>' +
      '<label class="field"><span class="lbl">Tem Instagram?</span>' + sel("temInstagram", [{ id: "nao", nome: "Não (venda o combo)" }, { id: "sim", nome: "Sim" }, { id: "?", nome: "Não sei / checar" }], p ? (p.temInstagram === false ? "nao" : p.temInstagram === true ? "sim" : "?") : "?") + '</label>' +
      fld("Instagram (se tiver)", inp("insta", p && p.insta, "text", "@perfil")) +
      '<label class="field full"><span class="lbl">Observações / gancho de venda</span>' + txta("obs", p && p.obs, "Fachada nova, movimento alto, concorrência direta, quem decide…") + '</label>' +
      '</div>',
      (p ? '<button class="btn red quiet" data-act="p-del" data-id="' + p.id + '" style="margin-right:auto">🗑 Apagar</button>' : "") +
      '<button class="btn quiet" data-close>Cancelar</button>' +
      '<button class="btn" data-save>' + (p ? "Salvar alterações" : "Adicionar à lista") + '</button>'
    );
  }

  App.modalProspect = function (id) {
    var p = id ? findProspect(id) : null;
    var ov = U.openModal(prospectForm(p), { wide: true });
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      if (!v.nome) { U.toast("Dê um nome pra empresa.", "err"); return; }
      var data = {
        nome: v.nome, contato: v.contato, segmento: v.segmento, bairro: v.bairro,
        telefone: v.telefone, endereco: v.endereco, prioridade: v.prioridade, status: v.status,
        temSite: v.temSite === "nao" ? false : v.temSite === "sim" ? true : null,
        temInstagram: v.temInstagram === "nao" ? false : v.temInstagram === "sim" ? true : null,
        insta: v.insta, obs: v.obs, atualizadoEm: new Date().toISOString()
      };
      S.pushUndo(p ? "editar prospect" : "novo prospect");
      if (p) Object.assign(p, data);
      else { data.id = Z.uid("p"); data.criadoEm = data.atualizadoEm; data.ultimoContato = null; data.convertidoId = null; data.origem = "Manual"; st().prospects.unshift(data); }
      S.log("prospect", (p ? "Atualizou " : "Adicionou prospect ") + v.nome, data.id || p && p.id);
      S.saveNow(); U.closeModal(ov); render();
      U.toast(p ? "Prospect atualizado" : "Prospect adicionado à lista", "ok");
    });
  };

  App.modalProspectMenu = function (id) {
    var p = findProspect(id); if (!p) return;
    var opts = Object.keys(App.STATUS_LABEL).map(function (k) {
      return '<button class="btn quiet sm block" data-act="p-status" data-id="' + id + '" data-status="' + k + '" style="justify-content:flex-start">' +
        (p.status === k ? "● " : "○ ") + App.STATUS_LABEL[k][0] + '</button>';
    }).join("");
    var ov = U.openModal(U.modalShell(p.nome, "O que fazer com este prospect?",
      '<div class="row wrap" style="margin-bottom:12px">' +
      (p.telefone ? '<button class="btn sm" data-act="p-wa" data-id="' + id + '">💬 WhatsApp</button>' +
        '<button class="btn sm quiet" data-act="p-ligar" data-id="' + id + '">📞 Ligar</button>' : '<div class="callout warn" style="margin-bottom:10px">Sem telefone. Passe na loja e anote — ou ache no Maps e cole aqui.</div>') +
      '<button class="btn sm ghost" data-act="p-maps" data-id="' + id + '">🗺️ Google Maps</button>' +
      '<button class="btn sm ghost" data-act="p-google" data-id="' + id + '">🔎 Google</button>' +
      '<button class="btn sm ghost" data-act="p-copiar" data-id="' + id + '">⧉ Copiar ficha</button>' +
      '</div>' +
      '<div class="grid two">' +
      '<div><div class="card-title">Marcar status</div><div class="col" style="gap:5px">' + opts + '</div></div>' +
      '<div><div class="card-title">Ações de venda</div><div class="col" style="gap:5px">' +
      '<button class="btn sm block" data-act="p-script" data-id="' + id + '" style="justify-content:flex-start">🧠 Script personalizado</button>' +
      '<button class="btn sm block" data-act="p-converter" data-id="' + id + '" style="justify-content:flex-start">🚀 Converter em negociação</button>' +
      '<button class="btn sm block green" data-act="p-fechar-cliente" data-id="' + id + '" style="justify-content:flex-start">🤝 Ele já disse sim — fechar direto</button>' +
      '<button class="btn sm block quiet" data-act="p-novo-prospect-similar" data-id="' + id + '" style="justify-content:flex-start">➕ Cadastrar vizinho parecido</button>' +
      '<button class="btn sm block quiet" data-act="p-editar" data-id="' + id + '" style="justify-content:flex-start">✏️ Editar / completar dados</button>' +
      '<button class="btn sm block red quiet" data-act="p-del" data-id="' + id + '" style="justify-content:flex-start">🗑 Apagar</button>' +
      '</div></div></div>'));
    return ov;
  };

  App.prospectDelete = function (id) {
    var list = st().prospects, i = -1;
    for (var k = 0; k < list.length; k++) if (list[k].id === id) i = k;
    if (i < 0) return;
    var removed = list[i];
    S.pushUndo("apagar prospect");
    list.splice(i, 1);
    S.log("prospect", "Removeu prospect " + removed.nome, null);
    S.saveNow(); render();
    U.toast("“" + removed.nome + "” foi apagado.", "warn", 9000, {
      label: "Desfazer", fn: function () {
        S.pushUndo("restaurar prospect"); list.splice(i, 0, removed); S.saveNow(); render();
        U.toast("Restaurado ✔", "ok");
      }
    });
  };

  /* ====================================================================== */
  /*  CAÇA A NOVOS PROSPECTS                                                 */
  /* ====================================================================== */
  App.modalCaca = function () {
    var cfg = st().config;
    var segs = window.ZEIK_SEED.segmentos;
    var linhas = [];
    cfg.bairros.forEach(function (b) {
      segs.slice(0, 8).forEach(function (g) {
        var q = g.nome.replace(/s\/?$/i, "") + " " + b + " São Paulo";
        var q2 = g.nome.split(" /")[0].split(" ")[0] + " " + b;
        linhas.push({ bairro: b, seg: g, q: q2 });
      });
    });
    var corpo = linhas.slice(0, 40).map(function (l, i) {
      return '<div class="row" style="padding:7px 0;border-bottom:1px solid var(--hairline);gap:8px">' +
        '<span style="width:20px" class="tiny">' + (i + 1) + '</span>' +
        '<span class="grow" style="font-size:13px">' + esc(l.seg.emoji + " " + l.q) + '</span>' +
        '<button class="btn xs ghost" data-act="caca-maps" data-q="' + esc(l.q) + '">🗺️ Maps</button>' +
        '<button class="btn xs ghost" data-act="caca-google" data-q="' + esc(l.q) + '">🔎 Google</button>' +
        '<button class="btn xs quiet" data-act="caca-ig" data-q="' + esc(l.q) + '">📷 IG</button>' +
        '<button class="btn xs" data-act="caca-add" data-bairro="' + esc(l.bairro) + '" data-seg="' + l.seg.id + '">+ Adicionar</button>' +
        '</div>';
    }).join("");

    U.openModal(U.modalShell("🔎 Caçar novos prospects na Zona Sul",
      "Rode 10 por dia. Abre a busca, você acha 3 empresas com telefone e joga aqui no <b>+ Adicionar</b>.",
      '<div class="callout good" style="margin-bottom:12px"><b>Rotina de 15 minutos que enche o funil:</b><br>' +
      '1) Abra o Maps e busque o segmento no bairro · 2) olhe quem tem <b>menos de 20 avaliações</b> ou nenhuma nota (precisam de ajuda) · ' +
      '3) veja se tem Instagram (se não tem, é o combo) · 4) adicione aqui com o telefone que está no Maps.</div>' +
      '<div class="row wrap" style="margin-bottom:12px">' +
      '<button class="btn sm ghost" data-act="caca-google" data-q="bairros comercial Capão Redondo São Paulo telefone">Pesquisar diretórios de bairro</button>' +
      '<button class="btn sm ghost" data-act="caca-google" data-q="encontrasopaulo.com.br Capao Redondo">encontrasopaulo.com.br</button>' +
      '<button class="btn sm ghost" data-act="caca-google" data-q="site:apontador.com.br Jardim Ângela São Paulo telefone">Apontador — Jd. Ângela</button>' +
      '<button class="btn sm quiet" data-act="importar">⬆ Importar CSV/JSON</button>' +
      '</div>' +
      '<div style="max-height:320px;overflow:auto">' + corpo + '</div>',
      '<button class="btn quiet" data-close>Fechar</button>'), { wide: true });
  };

  /* ====================================================================== */
  /*  NEGÓCIOS (deals)                                                       */
  /* ====================================================================== */
  App.modalDeal = function (id) {
    var d = id ? findDeal(id) : null;
    var cfg = st().config;
    var sgm = window.ZEIK_SEED.segmentos.map(function (g) { return { id: g.id, nome: g.emoji + " " + g.nome }; });
    var ov = U.openModal(U.modalShell(d ? "Editar negociação" : "Nova negociação", d ? "Etapa atual: " + S.Etapas[d.etapa].nome : "Abra um negócio mesmo sem prospect cadastrado",
      '<div class="form-grid">' +
      '<label class="field full"><span class="lbl">Empresa *</span>' + inp("empresa", d && d.empresa) + '</label>' +
      fld("Contato", inp("contato", d && d.contato)) +
      fld("Telefone", inp("telefone", d && d.telefone, "tel", "(11) 9...")) +
      fld("Segmento", sel("segmento", sgm, d && d.segmento || "generico")) +
      fld("Bairro", sel("bairro", cfg.bairros, d && d.bairro || cfg.bairros[0])) +
      fld("Valor do projeto", inp("valor", d ? d.valor : cfg.precoSite, "number")) +
      fld("Etapa", sel("etapa", Object.keys(S.Etapas).map(function (k) { return { id: k, nome: S.Etapas[k].nome }; }), d && d.etapa || "lead")) +
      '<label class="field"><span class="lbl">Site atual do cliente</span>' + sel("temSite", [{ id: "?", nome: "Não verificado" }, { id: "nao", nome: "Não tem" }, { id: "velho", nome: "Tem, mas está ruim/parado" }, { id: "ok", nome: "Tem e é bom" }], d && d.temSiteSit || "?") + '</label>' +
      '<label class="field"><span class="lbl">Escopo (itens da proposta)</span><div class="col" style="gap:4px">' +
      chk("site", "Site institucional", d ? d.itens && d.itens.site !== false : true) +
      chk("insta", "Criar / organizar Instagram", d ? !!(d.itens && d.itens.insta) : true) +
      chk("gmn", "Google Meu Negócio", d ? !!(d.itens && d.itens.gmn) : false) +
      chk("manut", "Manutenção mensal (+" + money(cfg.manutMes) + "/mês)", d ? !!(d.itens && d.itens.manut) : false) +
      '</div></label>' +
      '<label class="field full"><span class="lbl">Notas do negócio</span>' + txta("notas", d && d.notas, "O que ele pediu, objeções, combinados…") + '</label>' +
      '</div>',
      (d ? '<button class="btn red quiet" data-act="d-del" data-id="' + d.id + '" style="margin-right:auto">🗑 Excluir</button>' : "") +
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>' + (d ? "Salvar" : "Criar negociação") + '</button>'), { wide: true });

    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      if (!v.empresa) { U.toast("Informe a empresa.", "err"); return; }
      var itens = { site: v.site, insta: v.insta, gmn: v.gmn, manut: v.manut };
      delete v.site; delete v.insta; delete v.gmn; delete v.manut;
      v.itens = itens;
      v.temSiteSit = v.temSite; delete v.temSite;
      v.valor = Number(v.valor) || 0;
      S.pushUndo(d ? "editar negócio" : "novo negócio");
      if (d) {
        var oldEtapa = d.etapa;
        Object.assign(d, { empresa: v.empresa, contato: v.contato, telefone: v.telefone, segmento: v.segmento, bairro: v.bairro, valor: v.valor, itens: v.itens, notas: v.notas, temSiteSit: v.temSiteSit, atualizadoEm: new Date().toISOString() });
        if (v.etapa !== oldEtapa) { d.etapa = v.etapa; (d.historico = d.historico || []).push({ etapa: v.etapa, em: new Date().toISOString() }); }
      } else {
        v.id = Z.uid("d"); v.criadoEm = v.atualizadoEm = new Date().toISOString();
        v.ordem = Date.now() % 100000; v.historico = [{ etapa: v.etapa, em: v.criadoEm }]; v.propostas = [];
        st().deals.push(v);
      }
      S.log("deal", (d ? "Atualizou " : "Abriu negócio ") + v.empresa + " · " + money(v.valor), v.id);
      S.saveNow(); U.closeModal(ov); render();
      U.toast(d ? "Negócio atualizado" : "Negócio criado — arraste no Kanban para avançar", "ok");
    });
  };
  function chk(name, label, on) {
    return '<label class="check"><input type="checkbox" data-f="' + name + '"' + (on ? " checked" : "") + '> ' + esc(label) + '</label>';
  }

  App.modalDealMenu = function (id) {
    var d = findDeal(id); if (!d) return;
    var etapas = Object.keys(S.Etapas).map(function (k) {
      return '<button class="btn sm block ' + (d.etapa === k ? "" : "quiet") + '" data-act="d-mover" data-id="' + id + '" data-etapa="' + k + '" style="justify-content:flex-start">' +
        (d.etapa === k ? "● " : "○ ") + S.Etapas[k].nome + '</button>';
    }).join("");
    U.openModal(U.modalShell(d.empresa, "Etapa atual: " + S.Etapas[d.etapa].nome,
      '<div class="row wrap" style="margin-bottom:12px">' +
      (d.telefone ? '<button class="btn sm wa" data-act="d-wa" data-id="' + id + '">💬 WhatsApp</button><button class="btn sm" data-act="d-ligar" data-id="' + id + '">📞 Ligar</button>' : "") +
      '<button class="btn sm ghost" data-act="d-proposta" data-id="' + id + '">📄 Gerar proposta</button>' +
      '<button class="btn sm ghost" data-act="d-script" data-id="' + id + '">🧠 Script</button>' +
      '<button class="btn sm ghost" data-act="d-followup" data-id="' + id + '">⏰ Agendar follow-up</button>' +
      '</div>' +
      '<div class="grid two"><div><div class="card-title">Mover para</div><div class="col" style="gap:5px">' + etapas + '</div></div>' +
      '<div><div class="card-title">Registrar</div><div class="col" style="gap:5px">' +
      '<button class="btn sm block quiet" data-act="d-editar" data-id="' + id + '">✏️ Editar negócio</button>' +
      '<button class="btn sm block quiet" data-act="d-historico" data-id="' + id + '">🕓 Histórico (' + ((d.historico || []).length) + ')</button>' +
      '<button class="btn sm block quiet" data-act="d-tarefa" data-id="' + id + '">➕ Tarefa avulsa</button>' +
      '<button class="btn sm block red quiet" data-act="d-del" data-id="' + id + '">🗑 Excluir</button>' +
      '</div></div></div>'), { wide: true });
  };

  /* ====================================================================== */
  /*  FOLLOW-UP AUTOMÁTICO (ao mover para "Contatado")                      */
  /* ====================================================================== */
  App.modalFollowUp = function (d, etapaAnterior) {
    var opts = [{ id: 1, nome: "1 dia — amanhã" }, { id: 2, nome: "2 dias" }, { id: 3, nome: "3 dias (recomendado)" }, { id: 7, nome: "7 dias" }, { id: 15, nome: "15 dias" }];
    var ov = U.openModal(U.modalShell("Contatado ✔ — quer marcar follow-up?",
      "Isso cria a tarefa no Pipeline e no quadro de Tarefas automaticamente.",
      '<div class="callout" style="margin-bottom:12px">Negócio: <b>' + esc(d.empresa) + '</b> · ' + esc(d.bairro || "") + '<br>' +
      'Sem follow-up marcado, ' + (st().deals.filter(function (x) { return x.etapa === "contatado"; }).length) + ' negociação(ões) vão esfriar.</div>' +
      '<div class="col">' + opts.map(function (o) {
        return '<label class="check"><input type="radio" name="fu" data-f="dias" value="' + o.id + '"' + (o.id === 3 ? " checked" : "") + '> ' + o.nome + ' <span class="tiny">(' + Z.addDays(o.id) + ')</span></label>';
      }).join("") +
      '<label class="check"><input type="radio" name="fu" data-f="dias" value="0"> Nenhuma — só hoje não preciso</label>' +
      fld("Título da tarefa", txta("titulo", "Cobrar resposta — " + d.empresa, "")) +
      '<label class="check"><input type="checkbox" data-f="ciclo" checked> Repetir a cada 4 dias se eu não registrar resposta (cadência)</label>' +
      '</div>',
      '<button class="btn quiet" data-act="fu-sem" data-id="' + d.id + '">Só mover, sem tarefa</button>' +
      '<button class="btn" data-save>⏰ Criar follow-up</button>'), {
      onMount: function (o) { }
    });
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      var dias = Number(v.dias);
      if (dias > 0) {
        criarTarefa({
          titulo: v.titulo || ("Follow-up — " + d.empresa),
          data: Z.addDays(dias), dealId: d.id, cliente: d.empresa, tipo: "follow-up",
          ciclo: !!v.ciclo, origem: "follow-up automático", link: d.telefone
        });
        d.ultimoContato = new Date().toISOString();
        d.proxPasso = "Cobrar resposta em " + dias + " dia(s)";
        S.log("followup", "Follow-up de " + d.empresa + " agendado para " + Z.addDays(dias), d.id);
        S.saveNow();
        U.toast("Tarefa criada para " + Z.addDays(dias) + " — o painel vai repetir a cada 4 dias se você não responder.", "ok");
      } else U.toast("Ok, sem tarefa desta vez.", "warn");
      U.closeModal(ov); render();
    });
  };

  function criarTarefa(t) {
    var tarefa = {
      id: Z.uid("t"), titulo: t.titulo, tipo: t.tipo || "follow-up", data: t.data || Z.todayISO(),
      hora: t.hora || "", concluida: false, criadoEm: new Date().toISOString(),
      dealId: t.dealId || null, clienteId: t.clienteId || null, prospectId: t.prospectId || null,
      cliente: t.cliente || "", notas: t.notas || "", ciclo: !!t.ciclo, origem: t.origem || "manual", link: t.link || ""
    };
    st().tarefas.unshift(tarefa);
    return tarefa;
  }

  /* ====================================================================== */
  /*  PROPOSTA / ORÇAMENTO                                                   */
  /* ====================================================================== */
  function precosProposta(deal, cliente) {
    var cfg = st().config;
    var itens = (deal && deal.itens) || (cliente && cliente.itens) || { site: true, insta: true, gmn: false, manut: false };
    var linhas = [];
    var total = 0;
    if (itens.site) { var pv = Number(deal && deal.valor) || cfg.precoSite; linhas.push({ nome: "Site profissional (landing + páginas de serviços)", valor: pv }); total += pv; }
    if (itens.insta) { linhas.push({ nome: "Criação do Instagram OU organização de feed + destaques", valor: cfg.precoInsta }); total += cfg.precoInsta; }
    if (itens.gmn) { linhas.push({ nome: "Google Meu Negócio configurado (endereço, fotos, avaliações)", valor: cfg.precoGmn }); total += cfg.precoGmn; }
    if (itens.manut) { linhas.push({ nome: "Manutenção mensal (alterações, backup, suporte)", valor: cfg.manutMes, mensal: true }); }
    if (!linhas.length) { total = cfg.precoSite; linhas.push({ nome: "Site profissional", valor: cfg.precoSite }); }
    return { linhas: linhas, total: total, itens: itens };
  }

  function gerarTextoProposta(nomeEmpresa, d, ctx) {
    var cfg = st().config;
    var P = precosProposta(d);
    var hoje = new Date();
    var validade = new Date(hoje.getTime() + 5 * 86400000);
    var l = [];
    l.push("*" + (d && d.tituloProposta || "PROPOSTA — " + nomeEmpresa.toUpperCase()) + "*");
    l.push(cfg.agencia + " · " + cfg.cidade);
    l.push(hoje.toLocaleDateString("pt-BR") + " · válida até " + validade.toLocaleDateString("pt-BR"));
    l.push("");
    if (d.contato) l.push(d.contato + ", tudo bem?");
    l.push("Conforme conversamos, " + nomeEmpresa + " foi analisado por aqui: pesquisa de mercado no bairro + concorrência online. O diagnóstico abaixo é o que eu faria.");
    l.push("");
    l.push("*1. O QUE EU VI*");
    l.push(ctx.diagnostico);
    l.push("");
    l.push("*2. O QUE EU ENTREGO*");
    P.linhas.forEach(function (x, i) {
      l.push((i + 1) + ") " + x.nome + " — " + money(x.valor) + (x.mensal ? "/mês" : ""));
      l.push("   " + (DETALHE[x.nome] || "Feito à mão, no seu estilo, com textos revisados."));
    });
    l.push("");
    l.push("*3. PRAZO*");
    l.push("Começo após o OK e o envio do material (fotos, textos, logo). Entrega em " + cfg.prazoEntrega + ".");
    l.push("");
    l.push("*4. INVESTIMENTO*");
    l.push("Total: *" + money(P.total) + "*");
    l.push("Forma: PIX à vista (5% de desconto até " + validade.toLocaleDateString("pt-BR") + ") ou 3x no cartão.");
    if (P.itens.manut) l.push("Manutenção: " + money(cfg.manutMes) + "/mês, sem fidelidade — cancelar quando quiser.");
    l.push("");
    l.push("*5. GARANTIA*");
    l.push("Se você não gostar da primeira versão, eu refaço. Se ainda assim não servir, devolvo o valor pago.");
    l.push("");
    l.push("Qualquer dúvida, é só me chamar aqui. Se estiver de acordo, responda \"fechado\" que eu já começo hoje. 🚀");
    l.push("");
    l.push("Att,");
    l.push((cfg.responsavel || "Zeik Digital") + " — " + cfg.agencia);
    l.push(cfg.whatsappDisplay + " · " + cfg.email);
    return l.join("\n").replace(/\n{3,}/g, "\n\n");
  }
  var DETALHE = {
    "Site profissional (landing + páginas de serviços)": "Layout exclusivo, responsivo, velocidade otimizada, botão de WhatsApp, endereço/mapa, SEO local (título, descrição e dados estruturados).",
    "Criação do Instagram OU organização de feed + destaques": "Nome e bio que aparecem na busca, avatar, destaques (serviços, preços, avaliações), 12 posts com padrão visual e legendas prontas.",
    "Google Meu Negócio configurado (endereço, fotos, avaliações)": "Perfil reivindicado, categorias, horários, 15 fotos otimizadas, link do site e roteiro de pedidos de avaliação.",
    "Manutenção mensal (alterações, backup, suporte)": "Você manda o pedido no WhatsApp, eu ajusto (preços, fotos, textos, promoções) e mantenho backup do site."
  };

  App.modalProposta = function (d) {
    var cfg = st().config;
    d.itens = d.itens || { site: true, insta: true, gmn: false, manut: false };
    d.propostas = d.propostas || [];
    var g = seg(d.segmento);
    var diagnostico = (d.temSiteSit === "nao" ? "• Não existe site quando alguém pesquisa \"" + g.nome.split(" /")[0] + " na " + d.bairro + "\" — quem aparece é o concorrente.\n" : d.temSiteSit === "velho" ? "• O site atual está parado/lento no celular, o que derruba a decisão de compra.\n" : "") +
      (d.itens && d.itens.insta ? "• O Instagram não está organizado para vender (sem destaques de preço, sem prova social).\n" : "") +
      "• O que mais falta é um caminho direto: ver o serviço → confiar → falar no WhatsApp.";
    var texto = gerarTextoProposta(d.empresa, d, { diagnostico: diagnostico, contato: d.contato });

    var ov = U.openModal(U.modalShell("📄 Proposta pronta para " + d.empresa,
      "Gerei com base na etapa e nos itens do negócio. Ajuste o texto se quiser — o botão copia exatamente o que está aqui embaixo.",
      '<div class="row wrap" style="margin-bottom:10px">' +
      Object.keys(DETALHE).length + ' itens selecionados · total ' + money(precosProposta(d).total) +
      '</div>' +
      '<div class="form-grid" style="margin-bottom:12px">' +
      '<label class="field full"><span class="lbl">Incluir na proposta</span><div class="row wrap" style="gap:14px">' +
      chk2("i_site", "Site", d.itens.site !== false) + chk2("i_insta", "Instagram/feed", !!d.itens.insta) +
      chk2("i_gmn", "Google Meu Negócio", !!d.itens.gmn) + chk2("i_manut", "Manutenção mensal", !!d.itens.manut) +
      '</div></label>' +
      fld("Valor do site", inp("valor_site", Number(d.valor) || cfg.precoSite, "number")) +
      fld("Título da proposta", inp("titulo", d.tituloProposta || ("Proposta — " + d.empresa))) +
      '</div>' +
      '<div class="card-title">Texto para copiar e colar no WhatsApp</div>' +
      '<textarea data-f="texto" style="min-height:320px;font-size:13px">' + esc(texto) + '</textarea>',
      '<button class="btn quiet" data-close>Fechar</button>' +
      '<button class="btn ghost" data-act="copiar-texto" data-target="[data-f=texto]">⧉ Copiar</button>' +
      '<button class="btn wa" data-save>💬 Enviar no WhatsApp</button>' +
      '<button class="btn green" data-reg>✓ Registrar proposta enviada</button>'));

    function refresh() {
      var v = readForm(ov);
      d.itens = { site: !!v.i_site, insta: !!v.i_insta, gmn: !!v.i_gmn, manut: !!v.i_manut };
      d.valor = Number(v.valor_site) || d.valor;
      d.tituloProposta = v.titulo;
      var t = gerarTextoProposta(d.empresa, d, { diagnostico: diagnostico, contato: d.contato });
      ov.querySelector("[data-f=texto]").value = t;
      ov.querySelector(".row.wrap").innerHTML = Object.keys(DETALHE).length + " itens possíveis · total <b>" + money(precosProposta(d).total) + "</b>";
      S.save();
    }
    ov.querySelectorAll("[data-f=i_site],[data-f=i_insta],[data-f=i_gmn],[data-f=i_manut],[data-f=valor_site]").forEach(function (el) {
      el.addEventListener("change", refresh); el.addEventListener("input", el.type === "number" ? debounceNum : refresh);
    });
    function debounceNum() { setTimeout(refresh, 400); }

    ov.querySelector("[data-save]").addEventListener("click", function () {
      var t = ov.querySelector("[data-f=texto]").value;
      if (U.openWa(d.telefone, t)) { d.propostaEnviadaEm = new Date().toISOString(); S.saveNow(); U.closeModal(ov); }
      else U.copy(t);
    });
    ov.querySelector("[data-reg]").addEventListener("click", function () {
      d.propostas = d.propostas || [];
      d.propostas.unshift({ em: new Date().toISOString(), texto: ov.querySelector("[data-f=texto]").value, total: precosProposta(d).total });
      d.etapa = "proposta"; d.atualizadoEm = new Date().toISOString();
      (d.historico = d.historico || []).push({ etapa: "proposta", em: d.atualizadoEm });
      criarTarefa({ titulo: "Cobrar proposta — " + d.empresa, data: Z.addDays(2), dealId: d.id, cliente: d.empresa, tipo: "cobrar", link: d.telefone });
      S.log("proposta", "Proposta enviada para " + d.empresa + " · " + money(precosProposta(d).total), d.id);
      S.saveNow(); U.closeModal(ov); render();
      U.toast("Proposta registrada e follow-up de 2 dias criado ✔", "ok");
    });
  };
  function chk2(name, label, on) { return '<label class="check"><input type="checkbox" data-f="' + name + '"' + (on ? " checked" : "") + '> ' + esc(label) + '</label>'; }

  App.modalPropostaCliente = function (c) {
    var fake = { empresa: c.empresa, contato: c.contato, telefone: c.telefone, bairro: c.bairro, segmento: c.segmento, valor: c.valor || st().config.precoSite, itens: c.itens || { site: true, insta: true, gmn: false, manut: !!c.manutencao }, temSiteSit: "nao", propostas: [] };
    App.modalProposta(fake);
  };

  /* ====================================================================== */
  /*  FECHAR GANHO / PERDA                                                   */
  /* ====================================================================== */
  App.modalGanho = function (d) {
    var cfg = st().config;
    var P = precosProposta(d);
    var ov = U.openModal(U.modalShell("🎉 Ganhou: " + d.empresa,
      "O painel vira cliente + lançamento financeiro com o que você marcar aqui.",
      '<div class="form-grid">' +
      fld("Valor fechado", inp("valor", Number(d.valor) || P.total, "number")) +
      fld("Data do fechamento", inp("data", Z.todayISO(), "date")) +
      '<label class="field full"><span class="lbl">Recebimento</span>' +
      sel("receb", [{ id: "pago", nome: "Já recebi (PIX/dinheiro)" }, { id: "parcial", nome: "Recebi 50% agora" }, { id: "a_receber", nome: "A receber" }], "pago") + '</label>' +
      '<label class="field full"><span class="lbl">O que criar junto</span><div class="col" style="gap:4px">' +
      chk("criarCliente", "Cadastrar como cliente", true) +
      chk("site", "Marcar site como entregue em 48h (tarefa + prazo)", true) +
      chk("manut", "Ativar manutenção mensal (" + money(cfg.manutMes) + "/mês)", !!(d.itens && d.itens.manut)) +
      chk("insta", "Incluir entrega de Instagram no escopo", !!(d.itens && d.itens.insta)) +
      '</div></label>' +
      fld("Mensagem de agradecimento", txta("grato", "Fechado, {{contato}}! 🤝\n\nComeço hoje e te mando a primeira versão em 48h. Só preciso de: fotos, logo (se tiver), serviços, endereço, horário e o número do WhatsApp.")) +
      '</div>',
      '<button class="btn quiet" data-close>Voltar</button><button class="btn green" data-save>✓ Confirmar ganho</button>'));

    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      var valor = Number(v.valor) || 0;
      S.pushUndo("fechar ganho");
      d.etapa = "ganho"; d.valor = valor; d.atualizadoEm = new Date().toISOString();
      (d.historico = d.historico || []).push({ etapa: "ganho", em: d.atualizadoEm });

      if (v.criarCliente) {
        var c = {
          id: Z.uid("c"), empresa: d.empresa, contato: d.contato, telefone: d.telefone, segmento: d.segmento,
          bairro: d.bairro, valor: valor, status: "ativo", manutencao: !!v.manut, itens: d.itens,
          fechadoEm: v.data, entregue: "", obs: v.notas || "", criadoEm: new Date().toISOString(), dealId: d.id
        };
        st().clientes.unshift(c);
        d.clienteId = c.id;
        if (v.site) criarTarefa({ titulo: "Entregar site — " + d.empresa, data: Z.addDays(2), clienteId: c.id, cliente: d.empresa, tipo: "entrega", notas: "Primeira versão no ar + ajustes" });
        if (v.insta) criarTarefa({ titulo: "Entregar Instagram/feed — " + d.empresa, data: Z.addDays(3), clienteId: c.id, cliente: d.empresa, tipo: "entrega" });
      }
      var pago = v.receb === "pago";
      st().financeiro.unshift({
        id: Z.uid("f"), clienteId: d.clienteId || null, dealId: d.id, tipo: "site",
        descricao: "Site — " + d.empresa, valor: pago ? valor : Math.round(valor / 2), data: v.data, mes: Z.monthKey(v.data),
        status: pago ? "pago" : "a_receber", metodo: pago ? "PIX" : "50% entrada"
      });
      if (!pago) st().financeiro.unshift({
        id: Z.uid("f"), clienteId: d.clienteId || null, dealId: d.id, tipo: "site",
        descricao: "Site — " + d.empresa + " (parcela final na entrega)", valor: Math.round(valor / 2), data: Z.addDays(2), mes: Z.monthKey(Z.addDays(2)),
        status: "a_receber", metodo: ""
      });
      if (v.manut) st().financeiro.unshift({
        id: Z.uid("f"), clienteId: d.clienteId || null, dealId: d.id, tipo: "manutencao", descricao: "Manutenção mensal — " + d.empresa,
        valor: cfg.manutMes, data: Z.addDays(30), mes: Z.monthKey(Z.addDays(30)), status: "a_receber", metodo: "", recorrente: true
      });

      if (d.prospectId) {
        var p = findProspect(d.prospectId);
        if (p) { p.status = "cliente"; p.convertidoId = d.clienteId || d.id; p.atualizadoEm = new Date().toISOString(); }
      }
      var msg = U.fillVars(v.grato, U.scriptCtx({ empresa: d.empresa, contato: d.contato }));
      S.log("ganho", "FECHOU: " + d.empresa + " · " + money(valor) + (v.manut ? " + manutenção" : ""), d.id);
      S.snapshot("antes do ganho");
      S.saveNow(); U.closeModal(ov); render();

      U.toast("🎉 " + d.empresa + " fechado por " + money(valor) + " — cliente, receita e tarefas criados.", "ok", 9500, {
        label: "Copiar agradecimento", fn: function () { U.copy(msg, "Mensagem de agradecimento copiada — cole no WhatsApp dele."); }
      });
      if (window.ZeikUI.__celebrate) window.ZeikUI.__celebrate();
    });
  };

  App.modalPerdido = function (d) {
    var motivos = ["Preço", "Não respondeu", "Fechou com concorrente", "Já tem site e não quer trocar", "Fora do perfil", "Mudou de endereço/fechou", "Só vai querer depois", "Outro"];
    var ov = U.openModal(U.modalShell("Marcar como perdido: " + d.empresa,
      "Registrar o motivo é o que faz a lista virar inteligência — depois de 10 perdidos você vê onde está a objeção real.",
      '<div class="form-grid">' +
      fld("Motivo", sel("motivo", motivos, "Não respondeu")) +
      fld("Data", inp("data", Z.todayISO(), "date")) +
      '<label class="field full"><span class="lbl">O que aconteceu (e o que aprender)</span>' + txta("obs", "", "Ex.: pediu pra pensar, sumiu depois de ver o preço → testar pacote de R$ 500 na primeira mensagem.") + '</label>' +
      '<label class="check full"><input type="checkbox" data-f="reagendar"> Criar tarefa de reativação em 60 dias</label>' +
      '<label class="check full"><input type="checkbox" data-f="prospect" checked> Marcar o prospect relacionado como "sem retorno"</label>' +
      '</div>',
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn red" data-save>Marcar perdido</button>'));
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      S.pushUndo("marcar perdido");
      d.etapa = "perdido"; d.motivoPerdido = v.motivo; d.obs = v.obs; d.atualizadoEm = new Date().toISOString();
      (d.historico = d.historico || []).push({ etapa: "perdido", motivo: v.motivo, em: d.atualizadoEm });
      if (v.reagendar) criarTarefa({ titulo: "Reativar " + d.empresa, data: Z.addDays(60), dealId: d.id, cliente: d.empresa, tipo: "reativar", notas: "Motivo anterior: " + v.motivo });
      if (v.prospect && d.prospectId) { var p = findProspect(d.prospectId); if (p) { p.status = "sem_retorno"; p.atualizadoEm = new Date().toISOString(); } }
      S.log("perdido", "Perdido: " + d.empresa + " (" + v.motivo + ")", d.id);
      S.saveNow(); U.closeModal(ov); render();
      var perdidos = st().deals.filter(function (x) { return x.etapa === "perdido" && x.motivoPerdido; });
      var cont = {}; perdidos.forEach(function (x) { cont[x.motivoPerdido] = (cont[x.motivoPerdido] || 0) + 1; });
      var top = Object.keys(cont).sort(function (a, b) { return cont[b] - cont[a]; })[0];
      U.toast(top ? "Registrado. Motivo nº1 hoje: " + top + " (" + cont[top] + "x) — vale mudar a abordagem nesse ponto." : "Registrado.", "warn", 6000);
    });
  };

  App.modalProspectGanho = function (p) {
    if (!p) return;
    var cfg = st().config;
    var ov = U.openModal(U.modalShell("Fechar " + esc(p.nome) + " direto como cliente",
      "Usado quando ele já disse sim por telefone/WhatsApp e não passou pelo Kanban.",
      '<div class="form-grid">' +
      fld("Valor fechado", inp("valor", p.valorFechado || cfg.precoSite, "number")) +
      fld("Data do fechamento", inp("data", Z.todayISO(), "date")) +
      fld("Recebimento", sel("receb", [{ id: "pago", nome: "Já pago (PIX/cartão)" }, { id: "metade", nome: "50% agora, 50% na entrega" }, { id: "a_receber", nome: "A receber (50/50)" }], "metade")) +
      fld("Site entregue em", inp("entregue", Z.addDays(2), "date")) +
      '<label class="field full"><span class="lbl">Recorrência</span><div class="row wrap" style="gap:16px">' +
      chk("manut", "Manutenção mensal (" + money(cfg.manutMes) + "/mês)", true) +
      chk("insta", "Pacote de Instagram incluso", p.temInstagram === false) +
      '</div></label>' +
      '</div>' +
      '<div class="callout" style="margin-top:12px">Isso cria o <b>cliente</b>, o <b>lançamento</b> no financeiro, a <b>tarefa de entrega</b> e marca o prospect como Cliente. Se você se arrepender, o botão Desfazer do aviso resolve.</div>',
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>Confirmar fechamento</button>'));
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov), valor = Number(v.valor) || cfg.precoSite, pago = v.receb === "pago";
      S.pushUndo("fechar prospect como cliente");
      var cli = {
        id: Z.uid("c"), empresa: p.nome, contato: p.contato || "", telefone: p.telefone || "", segmento: p.segmento,
        bairro: p.bairro, valor: valor, status: "ativo", manutencao: !!v.manut, fechadoEm: v.data, entregue: v.entregue || "",
        itens: { site: true, insta: !!v.insta, manut: !!v.manut }, obs: p.obs || "", prospectId: p.id,
        criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString()
      };
      st().clientes.unshift(cli);
      st().financeiro.unshift({
        id: Z.uid("f"), clienteId: cli.id, tipo: "site", descricao: "Site — " + p.nome,
        valor: pago ? valor : Math.round(valor / 2), data: v.data, mes: Z.monthKey(v.data),
        status: pago ? "pago" : "a_receber", metodo: pago ? "PIX" : "50% entrada"
      });
      if (!pago) st().financeiro.unshift({
        id: Z.uid("f"), clienteId: cli.id, tipo: "site", descricao: "Site — " + p.nome + " (parcela final na entrega)",
        valor: Math.round(valor / 2), data: v.entregue || Z.addDays(2), mes: Z.monthKey(v.entregue || Z.addDays(2)), status: "a_receber", metodo: ""
      });
      if (v.manut) st().financeiro.unshift({
        id: Z.uid("f"), clienteId: cli.id, tipo: "manutencao", descricao: "Manutenção mensal — " + p.nome,
        valor: cfg.manutMes, data: Z.addDays(30), mes: Z.monthKey(Z.addDays(30)), status: "a_receber", metodo: "", recorrente: true
      });
      criarTarefa({ titulo: "Entregar site de " + p.nome, data: v.entregue || Z.addDays(2), clienteId: cli.id, cliente: p.nome, tipo: "entrega" });
      if (v.entregue) criarTarefa({ titulo: "Subir o site de " + p.nome + " e treinar o WhatsApp", data: Z.addDays(1), clienteId: cli.id, cliente: p.nome, tipo: "entrega" });
      p.status = "cliente"; p.convertidoId = cli.id; p.atualizadoEm = new Date().toISOString();
      S.log("ganho", "FECHOU (direto): " + p.nome + " · " + money(valor), p.id);
      S.snapshot("antes do fechamento");
      S.saveNow(); U.closeModal(ov); render();
      U.toast("🎉 " + p.nome + " agora é cliente — " + money(valor) + (v.manut ? " + manutenção." : "."), "ok", 8000, { label: "Desfazer", fn: function () { App.undo(); } });
      if (U.__celebrate) U.__celebrate();
    });
  };

  /* ====================================================================== */
  /*  SCRIPTS                                                                */
  /* ====================================================================== */
  App.modalScript = function (p) {
    var g = seg(p.segmento);
    var ctx = U.scriptCtx({
      empresa: p.nome, contato: p.contato || "chefe", bairro: p.bairro, segmento: (g.nome || "").toLowerCase(),
      servico: (g.nome || "").split(" /")[0].toLowerCase()
    });
    var abas = [["script", "1º contato"], ["followup", "Follow-up"], ["fechamento", "Fechamento"]];
    var cur = { i: 0 };

    function texto() { return U.fillVars(g[abas[cur.i][0]] || g.script, ctx); }
    function render2() {
      var body = ov.querySelector("[data-corpo]");
      body.innerHTML = '<div class="script-box" style="max-height:300px">' + esc(texto()) + '</div>' +
        '<div class="row wrap" style="margin-top:10px">' +
        abas.map(function (a, i) { return '<button class="btn xs ' + (i === cur.i ? "" : "quiet") + '" data-tab="' + i + '">' + a[1] + '</button>'; }).join("") +
        '<span class="tiny" style="margin-left:auto">' + esc(p.temSite === false ? "🌐 Sem site = argumento forte" : p.temSite === true ? "🌐 Tem site: venda velocidade/Google" : "🌐 Checar site antes") +
        ' · ' + esc(p.temInstagram === false ? "📷 Sem Instagram = combo fechado" : "📷 Instagram " + (p.insta || "a verificar")) + '</span>' +
        '</div>';
      body.querySelectorAll("[data-tab]").forEach(function (b) {
        b.addEventListener("click", function () { cur.i = Number(b.getAttribute("data-tab")); render2(); });
      });
    }
    var ov = U.openModal(U.modalShell("🧠 Script — " + p.nome,
      "Personalizado com o nome da empresa, o bairro e o seu preço. Leia antes de mandar: adapte 1 linha e a resposta muda.",
      '<div data-corpo></div>' +
      '<hr class="hr"><div class="row wrap" style="gap:8px">' +
      '<button class="btn sm ghost" data-act="edit-note">✍️ Ajustar texto</button>' +
      '<span class="tiny">Se a empresa for muito quente, ligue em vez de mandar texto frio.</span></div>',
      '<button class="btn quiet" data-close>Fechar</button>' +
      '<button class="btn ghost" data-act="copiar-texto" data-sel="[data-corpo] .script-box">⧉ Copiar</button>' +
      '<button class="btn green" data-wa>💬 Abrir no WhatsApp</button>'));
    render2();

    ov.querySelector("[data-wa]").addEventListener("click", function () {
      var t = ov.querySelector("[data-corpo] .script-box").textContent;
      if (!U.openWa(p.telefone, t)) { U.copy(t, "Script copiado. Sem telefone no cadastro — cole onde for mandar."); return; }
      S.pushUndo("registrar contato");
      p.status = "contato_feito"; p.ultimoContato = new Date().toISOString(); p.atualizadoEm = p.ultimoContato;
      S.log("contato", "Abordou " + p.nome + " (" + (g.nome || "") + ")", p.id);
      S.saveNow(); U.closeModal(ov); render();
      App.modalFollowUpProspect(p);
    });
    ov.querySelector("[data-act='edit-note']").addEventListener("click", function () {
      var box = ov.querySelector("[data-corpo] .script-box");
      box.setAttribute("contenteditable", "true"); box.focus();
      U.toast("Texto editável agora. Copia do jeito que você deixar.", "ok");
    });
  };

  App.modalFollowUpProspect = function (p) {
    var ov = U.openModal(U.modalShell("Agendar follow-up de " + p.nome,
      "Lead que não é cobrado em 3 dias vira lead morto. Marque agora.",
      '<div class="col">' + [1, 2, 3, 7, 15].map(function (n) {
        return '<label class="check"><input type="radio" name="fu2" data-f="dias" value="' + n + '"' + (n === 3 ? " checked" : "") + '> Em ' + n + ' dia(s) — ' + Z.addDays(n) + '</label>';
      }).join("") +
      '<label class="check"><input type="radio" name="fu2" data-f="dias" value="0"> Agora não preciso</label>' +
      '</div>',
      '<button class="btn quiet" data-close>Pular</button><button class="btn" data-save>⏰ Criar tarefa</button>'));
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var dias = Number(readForm(ov).dias);
      if (dias > 0) {
        criarTarefa({ titulo: "Cobrar resposta — " + p.nome, data: Z.addDays(dias), prospectId: p.id, cliente: p.nome, tipo: "follow-up", link: p.telefone, origem: "follow-up de prospecção" });
        S.saveNow(); U.toast("Follow-up marcado para " + Z.addDays(dias) + ".", "ok");
      }
      U.closeModal(ov); render();
    });
  };

  App.modalObjecao = function (q) {
    var o = (window.ZEIK_SEED.objecoes || []).filter(function (x) { return x.q === q; })[0];
    if (!o) return;
    var texto = U.fillVars(o.a, U.scriptCtx());
    U.openModal(U.modalShell("Objeção: " + U.fillVars(o.q, U.scriptCtx()), "Resposta pronta — fale com calma, sem defender, com números.",
      '<div class="script-box">' + esc(texto) + '</div>',
      '<button class="btn quiet" data-close>Fechar</button><button class="btn ghost" data-act="copiar-texto" data-sel=".script-box">⧉ Copiar</button>'));
  };

  /* ====================================================================== */
  /*  CLIENTES / PAGAMENTOS / TAREFAS                                        */
  /* ====================================================================== */
  App.modalCliente = function (id) {
    var c = id ? findCliente(id) : null, cfg = st().config;
    var sgm = window.ZEIK_SEED.segmentos.map(function (g) { return { id: g.id, nome: g.emoji + " " + g.nome }; });
    var ov = U.openModal(U.modalShell(c ? "Editar cliente" : "Novo cliente", "Site gerado, notas e financeiro ficam amarrados aqui",
      '<div class="form-grid">' +
      '<label class="field full"><span class="lbl">Empresa *</span>' + inp("empresa", c && c.empresa) + '</label>' +
      fld("Contato", inp("contato", c && c.contato)) + fld("Telefone", inp("telefone", c && c.telefone, "tel")) +
      fld("Segmento", sel("segmento", sgm, c && c.segmento || "generico")) +
      fld("Bairro", sel("bairro", cfg.bairros, c && c.bairro || cfg.bairros[0])) +
      fld("Valor pago", inp("valor", c ? c.valor : cfg.precoSite, "number")) +
      fld("Status", sel("status", [{ id: "ativo", nome: "Ativo" }, { id: "negociacao", nome: "Em negociação" }, { id: "inativo", nome: "Inativo" }], c && c.status || "ativo")) +
      fld("Site entregue em", inp("entregue", c && c.entregue || "", "date")) +
      fld("Fechado em", inp("fechado", c && c.fechadoEm || Z.todayISO(), "date")) +
      '<label class="field full"><span class="lbl">Recorrência</span><div class="row wrap" style="gap:16px">' +
      chk("manutencao", "Manutenção mensal (" + money(cfg.manutMes) + "/mês)", c ? !!c.manutencao : true) +
      chk("insta", "Cliente também tem pacote de Instagram", c ? !!(c.itens && c.itens.insta) : false) +
      '</div></label>' +
      '<label class="field full"><span class="lbl">Notas (senhas, hospedagem, dominios, combinados)</span>' + txta("obs", c && c.obs, "Domínio: ; Hospedagem: ; Acessos: ;") + '</label>' +
      '</div>',
      (c ? '<button class="btn red quiet" data-act="c-del" data-id="' + c.id + '" style="margin-right:auto">🗑 Apagar</button>' : "") +
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>Salvar</button>'), { wide: true });
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      if (!v.empresa) { U.toast("Informe a empresa.", "err"); return; }
      v.valor = Number(v.valor) || 0;
      v.itens = { insta: !!v.insta, manut: !!v.manutencao, site: true };
      delete v.insta;
      S.pushUndo(c ? "editar cliente" : "novo cliente");
      if (c) Object.assign(c, v, { atualizadoEm: new Date().toISOString() });
      else { v.id = Z.uid("c"); v.criadoEm = new Date().toISOString(); st().clientes.unshift(v); }
      S.log("cliente", (c ? "Atualizou cliente " : "Novo cliente ") + v.empresa, v.id);
      S.saveNow(); U.closeModal(ov); render(); U.toast("Cliente salvo ✔", "ok");
    });
  };

  App.modalPagamento = function (opts) {
    opts = opts || {};
    var f = opts.id ? findPag(opts.id) : null, cfg = st().config;
    var clientes = [{ id: "", nome: "— sem cliente —" }].concat(st().clientes.map(function (c) { return { id: c.id, nome: c.empresa }; }));
    var ov = U.openModal(U.modalShell(f ? "Editar lançamento" : "Novo lançamento", "Pago entra no faturado; a receber entra em cobrança",
      '<div class="form-grid">' +
      fld("Data", inp("data", (f && f.data) || Z.todayISO(), "date")) +
      fld("Valor", inp("valor", f ? f.valor : cfg.precoSite, "number")) +
      fld("Cliente", sel("clienteId", clientes, f && f.clienteId || opts.clienteId || "")) +
      fld("Tipo", sel("tipo", [{ id: "site", nome: "Site" }, { id: "manutencao", nome: "Manutenção mensal" }, { id: "insta", nome: "Instagram/feed" }, { id: "outro", nome: "Outro" }], f && f.tipo || "site")) +
      fld("Status", sel("status", [{ id: "pago", nome: "Pago" }, { id: "a_receber", nome: "A receber" }], f && f.status || "pago")) +
      fld("Forma", sel("metodo", ["PIX", "Dinheiro", "Cartão", "Transferência", ""], f && f.metodo || "PIX")) +
      '<label class="field full"><span class="lbl">Descrição</span>' + inp("descricao", f && f.descricao, "text", "Site institucional + entrega") + '</label>' +
      '<label class="check full"><input type="checkbox" data-f="recorrente" ' + (f ? (f.recorrente ? "checked" : "") : "") + '> Repetir mensalmente (gera lançamento no mês seguinte)</label>' +
      '</div>',
      (f ? '<button class="btn red quiet" data-act="f-del" data-id="' + f.id + '" style="margin-right:auto">🗑 Apagar</button>' : "") +
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>Salvar</button>'));
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      v.valor = Number(v.valor) || 0;
      v.mes = Z.monthKey(v.data || Z.todayISO());
      v.recorrente = !!v.recorrente;
      S.pushUndo(f ? "editar lançamento" : "novo lançamento");
      if (f) Object.assign(f, v);
      else { v.id = Z.uid("f"); st().financeiro.unshift(v); }
      S.log("financeiro", (v.status === "pago" ? "Recebeu " : "Cobrança de ") + money(v.valor) + " — " + (v.descricao || "lançamento"), v.id);
      S.saveNow(); U.closeModal(ov); render(); U.toast("Lançamento salvo ✔", "ok");
    });
  };

  App.modalTarefa = function (id, prefill) {
    var t = id ? findTarefa(id) : null;
    var vinc = [{ id: "", nome: "Nenhum" }]
      .concat(st().deals.map(function (d) { return { id: "d:" + d.id, nome: "🎯 " + d.empresa }; }))
      .concat(st().clientes.map(function (c) { return { id: "c:" + c.id, nome: "🤝 " + c.empresa }; }))
      .concat(st().prospects.filter(function (p) { return p.status !== "cliente"; }).slice(0, 60).map(function (p) { return { id: "p:" + p.id, nome: "🧲 " + p.nome }; }));
    var ov = U.openModal(U.modalShell(t ? "Editar tarefa" : "Nova tarefa",
      "Prazo curto e título específico: tarefa vaga não é feita.",
      '<div class="form-grid">' +
      '<label class="field full"><span class="lbl">Título *</span>' + inp("titulo", t && t.titulo || (prefill && prefill.titulo), "text", "Cobrar resposta da Barbearia X") + '</label>' +
      fld("Data", inp("data", (t && t.data) || (prefill && prefill.data) || Z.todayISO(), "date")) +
      fld("Tipo", sel("tipo", [{ id: "follow-up", nome: "Follow-up" }, { id: "cobrar", nome: "Cobrar proposta" }, { id: "ligacao", nome: "Ligação" }, { id: "entrega", nome: "Entrega" }, { id: "visita", nome: "Visita" }, { id: "reativar", nome: "Reativação" }, { id: "outro", nome: "Outro" }], t && t.tipo || (prefill && prefill.tipo) || "follow-up")) +
      fld("Vincular a", sel("vinc", vinc, t ? (t.dealId ? "d:" + t.dealId : t.clienteId ? "c:" + t.clienteId : t.prospectId ? "p:" + t.prospectId : "") : (prefill && prefill.vinc) || "")) +
      '<label class="field full"><span class="lbl">Notas / script do que falar</span>' + txta("notas", t && t.notas) + '</label>' +
      '<label class="check full"><input type="checkbox" data-f="amanha"> Empurrar automaticamente se eu não concluir (re-today +1d)</label>' +
      '</div>',
      (t ? '<button class="btn red quiet" data-act="tarefa-del" data-id="' + t.id + '" style="margin-right:auto">🗑 Apagar</button>' : "") +
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>Salvar tarefa</button>'));

    ov.querySelector("[data-save]").addEventListener("click", function () {
      var v = readForm(ov);
      if (!v.titulo) { U.toast("Escreva o que precisa ser feito.", "err"); return; }
      S.pushUndo(t ? "editar tarefa" : "nova tarefa");
      var base = { titulo: v.titulo, data: v.data, tipo: v.tipo, notas: v.notas, concluida: t ? t.concluida : false, auto: !!v.amanha };
      base.dealId = base.clienteId = base.prospectId = null; base.cliente = "";
      if (v.vinc) {
        var parts = v.vinc.split(":"), ref = parts[1];
        if (parts[0] === "d") { base.dealId = ref; base.cliente = (findDeal(ref) || {}).empresa || ""; }
        if (parts[0] === "c") { base.clienteId = ref; base.cliente = (findCliente(ref) || {}).empresa || ""; }
        if (parts[0] === "p") { base.prospectId = ref; base.cliente = (findProspect(ref) || {}).nome || ""; }
      }
      if (t) Object.assign(t, base);
      else { base.id = Z.uid("t"); base.criadoEm = new Date().toISOString(); base.ciclo = false; st().tarefas.unshift(base); }
      S.log("tarefa", (t ? "Atualizou tarefa " : "Criou tarefa ") + base.titulo + " para " + Z.fmtData(base.data), base.id);
      S.saveNow(); U.closeModal(ov); render(); U.toast("Tarefa criada para " + Z.fmtData(base.data), "ok");
    });
  };

  /* ====================================================================== */
  /*  GERADOR DE SITE                                                        */
  /* ====================================================================== */
  App.gerarSite = function (preview) {
    var g = function (id) { var el = document.getElementById(id); return el ? el.value : ""; };
    var base = g("g-base");
    var d = {
      empresa: g("g-empresa") || "Sua Empresa",
      bairro: g("g-bairro") || "Zona Sul de São Paulo",
      endereco: g("g-end"), telefone: g("g-tel"), horarios: g("g-hor"), sobre: g("g-sobre"),
      segmento: g("g-seg") || "generico"
    };
    if (base) {
      var kind = base[0], id = base.slice(2);
      var src = kind === "c" ? findCliente(id) : findDeal(id);
      if (src) {
        var fromSrc = {
          empresa: src.empresa, bairro: src.bairro || "", endereco: src.endereco || "",
          telefone: src.telefone || "", segmento: src.segmento || "generico",
          sobre: src.obs && !d.sobre ? src.obs : d.sobre
        };
        // o que o usuário digitou no formulário vence; o que está vazio vem do cadastro
        Object.keys(fromSrc).forEach(function (k) { if (!d[k] || d[k] === "Sua Empresa" || d[k] === "Zona Sul de São Paulo") d[k] = fromSrc[k]; });
      }
    }
    if (!Z.onlyDigits(d.telefone)) {
      U.toast("Sem telefone/WhatsApp o botão não funciona — preencha o telefone.", "warn");
    }
    var html = window.ZeikSite.gerar(Object.assign({}, d, {
      telefoneFmt: d.telefone ? Z.fmtTel(d.telefone) : "",
      whatsapp: Z.toWa(d.telefone) || st().config.whatsapp
    }));
    if (preview) {
      var host = document.getElementById("sitePrev");
      host.innerHTML = '<div class="card" style="padding:0;overflow:hidden"><div class="row between" style="padding:12px 16px;border-bottom:1px solid var(--hairline)">' +
        '<div class="card-title" style="margin:0">👁 Prévia — ' + esc(d.empresa) + '</div>' +
        '<button class="btn xs" data-act="baixar-site" >⬇ Baixar HTML</button></div>' +
        '<iframe style="width:100%;height:62vh;border:0;background:#fff" srcdoc="' + esc(html) + '" title="Prévia do site"></iframe></div>';
      host.dataset.html = html; host.dataset.name = slug(d.empresa) + ".html";
      host.scrollIntoView({ behavior: "smooth", block: "start" });
      U.toast("Prévia gerada. Role para baixo — e teste o botão de WhatsApp.", "ok");
      return;
    }
    window.ZeikSite.baixar(slug(d.empresa) + ".html", html);
    S.log("site", "Gerou site para " + d.empresa, null);
    S.save();
  };
  function csvCell(x) {
    var v = String(x == null ? "" : x).replace(/"/g, '""').replace(/[\r\n]+/g, " ");
    return '"' + v + '"';
  }
  function slug(s) {
    return String(s || "site").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site";
  }

  /* ====================================================================== */
  /*  BACKUP / IMPORT / PIN                                                  */
  /* ====================================================================== */
  App.exportBackup = function () {
    var nome = "zeik-backup-" + Z.todayISO() + ".json";
    U.download(nome, S.exportJSON(), "application/json");
    st().config.ultimoBackupExport = new Date().toISOString();
    S.snapshot("antes do download");
    S.saveNow();
  };
  App.exportCSV = function () {
    var s = st(), lines = [];
    var head = "empresa;contato;segmento;bairro;endereco;telefone;status;prioridade;tem_site;tem_instagram;obs\n";
    lines.push(head);
    s.prospects.forEach(function (p) {
      lines.push([p.nome, p.contato, seg(p.segmento).nome, p.bairro, p.endereco, p.telefone, (App.STATUS_LABEL[p.status] || [""])[0], p.prioridade,
      p.temSite === false ? "não" : p.temSite ? "sim" : "?", p.temInstagram === false ? "não" : p.temInstagram ? "sim" : "?", (p.obs || "")]
        .map(csvCell).join(";"));
    });
    var csvCli = "\n# CLIENTES\nempresa;contato;segmento;bairro;telefone;valor;status;manutencao;entregue\n";
    s.clientes.forEach(function (c) {
      csvCli += [c.empresa, c.contato, seg(c.segmento).nome, c.bairro, c.telefone, c.valor, c.status, c.manutencao ? "sim" : "não", c.entregue || ""]
        .map(csvCell).join(";") + "\n";
    });
    var csvFin = "\n# FINANCEIRO\ndata;descricao;tipo;valor;status\n";
    s.financeiro.forEach(function (f) { csvFin += [f.data, f.descricao || "", f.tipo, f.valor, f.status].map(csvCell).join(";") + "\n"; });
    U.download("zeik-zona-sul-" + Z.todayISO() + ".csv", "\ufeff" + lines.join("\n") + csvCli + csvFin, "text/csv");
  };
  App.modalImport = function () {
    var ov = U.openModal(U.modalShell("⬆ Restaurar backup",
      "Aceita o .json exportado por este painel. O estado atual vira snapshot antes de sobrescrever.",
      '<div class="col">' +
      '<label class="field"><span class="lbl">Arquivo .json</span><input type="file" id="impFile" accept=".json,application/json"></label>' +
      '<span class="tiny">ou cole o conteúdo abaixo</span>' +
      '<textarea data-f="json" placeholder=\'{"app":"Zeik Digital…"}\' style="min-height:120px"></textarea>' +
      '</div>',
      '<button class="btn quiet" data-close>Cancelar</button><button class="btn" data-save>Restaurar</button>'));
    var file = ov.querySelector("#impFile");
    file.addEventListener("change", function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { ov.querySelector("[data-f=json]").value = fr.result; U.toast("Arquivo lido: " + f.name, "ok"); };
      fr.onerror = function () { U.toast("Não consegui ler esse arquivo.", "err"); };
      fr.readAsText(f);
    });
    ov.querySelector("[data-save]").addEventListener("click", function () {
      var txt = ov.querySelector("[data-f=json]").value.trim();
      if (!txt) { U.toast("Escolha o arquivo ou cole o JSON.", "err"); return; }
      var r = S.importJSON(txt);
      if (!r.ok) { U.toast(r.msg, "err", 6000); return; }
      U.closeModal(ov); render(); U.toast(r.msg, "ok");
    });
  };

  /* ====================================================================== */
  /*  HANDLERS                                                               */
  /* ====================================================================== */
  var handlers = App.handlers;   // para delegar um handler a outro

  Object.assign(App.handlers, {

    /* ---- atalhos que faltavam ligação entre telas e modais ---- */

    /* ---- concluir tarefa direto na lista (atalho do card) ---- */
    "tarefa-concluir": function (el) { return handlers["tarefa-check"](el); },

    /* ---- prospect que já fechou com você sem passar pelo Kanban ---- */
    "p-fechar-cliente": function (el) { App.modalProspectGanho(findProspect(el.getAttribute("data-id"))); },
    /* dashboard */
    jump: function (t) {
      var view = t.getAttribute("data-view"), q = t.getAttribute("data-query") || "";
      Object.keys(App.filters).forEach(function (k) { if (k[0] !== "f") App.filters[k] = ""; });
      q.split("&").forEach(function (pair) { var kv = pair.split("="); if (kv.length === 2) App.filters[kv[0]] = decodeURIComponent(kv[1]); });
      U.go(view); setTimeout(render, 10);
    },
    "limpar-filtros": function () {
      var keep = { fperiodo: App.filters.fperiodo, tq: App.filters.tq };
      App.filters = Object.assign(App.filters, { q: "", bairro: "", segmento: "", status: "", prio: "", need: "", ordem: "score", cq: "", cstatus: "" }, keep);
      render();
    },
    "novo-prospect": function () { App.modalProspect(); },
    "prospect-editar": function (t) { App.modalProspect(t.getAttribute("data-id")); },
    caca: function () { App.modalCaca(); },
    "caca-maps": function (t) { U.openMaps(t.getAttribute("data-q")); },
    "caca-google": function (t) { U.google(t.getAttribute("data-q")); },
    "caca-ig": function (t) { U.google("instagram " + t.getAttribute("data-q")); },
    "caca-add": function (t) {
      var bairro = t.getAttribute("data-bairro"), segmento = t.getAttribute("data-seg");
      U.closeAllModals();
      App.modalProspect();
      var ov = document.querySelector(".overlay:last-child");
      if (!ov) return;
      var set = function (name, val) { var el = ov.querySelector('[data-f="' + name + '"]'); if (el && val) el.value = val; };
      set("bairro", bairro); set("segmento", segmento);
      set("prioridade", "alta"); set("temSite", "nao"); set("temInstagram", "?");
      var nome = ov.querySelector('[data-f="nome"]'); if (nome) nome.focus();
      U.toast("Bairro e segmento já preenchidos — só digite o que você viu no Maps.", "ok", 4200);
    },
    "export-backup": function () { App.exportBackup(); },
    "export-csv": function () { App.exportCSV(); },
    "atualizar-lista": function () {
      var n = S.mergeSeed(window.ZEIK_SEED);
      var antes = st().prospects.length;
      S.importSeed(window.ZEIK_SEED);
      var novos = st().prospects.length - antes;
      S.saveNow(); render();
      U.toast(n || novos
        ? "Lista-base atualizada: " + n + " ficha(s) completada(s)" + (novos ? " e " + novos + " empresa(s) nova(s) na fila" : "") + ". Seus contatos e status não foram tocados."
        : "Sua lista já está com os dados mais recentes da pesquisa.", "ok", 6000);
    },
    "snapshot-agora": function () { var n = S.snapshot("manual"); U.toast("Snapshot guardado (" + n + " disponíveis no painel).", "ok"); render(); },
    "restaurar-snap": function (t) {
      var i = Number(t.getAttribute("data-i"));
      S.snapshot("antes de restaurar");
      if (S.restoreSnapshot(i)) { render(); U.toast("Snapshot restaurado.", "ok"); } else U.toast("Snapshot ilegível.", "err");
    },
    importar: function () { App.modalImport(); },
    "reset-dados": function () {
      U.confirmBox("Limpar tudo?", "Isso apaga prospects, clientes e financeiro <b>deste navegador</b> e recarrega a base da Zona Sul.<br><br>Exporte o backup antes, se tiver clientes reais.", function () {
        S.snapshot("antes do reset");
        S.resetTudo(); S.importSeed(window.ZEIK_SEED); S.saveNow(); render();
        U.toast("Painel reiniciado com a base da Zona Sul.", "ok");
      }, true);
    },
    "pin-salvar": function () {
      var v = document.getElementById("pinInput").value;
      if (!/^[0-9]{4,8}$/.test(v)) { U.toast("PIN precisa ter 4 a 8 dígitos numéricos.", "err"); return; }
      S.lockSet(v).then(function () {
        U.toast("PIN ativo. Na próxima abertura do painel, ele pede o código.", "ok");
        render();
      });
    },
    "pin-remover": function () { S.lockClear(); U.toast("PIN removido.", "warn"); render(); },

    /* prospect */
    "p-ligar": function (t) { var p = findProspect(t.getAttribute("data-id")); if (U.openTel(p.telefone)) { marcarContato(p, "ligação"); } },
    "p-wa": function (t) {
      var p = findProspect(t.getAttribute("data-id"));
      var g = seg(p.segmento);
      var texto = U.fillVars(g.script, U.scriptCtx({ empresa: p.nome, contato: p.contato || "chefe", bairro: p.bairro, servico: (g.nome || "").split(" /")[0].toLowerCase() }));
      if (U.openWa(p.telefone, texto)) { marcarContato(p, "whatsapp"); U.copy(texto, "Script copiado também — se o WhatsApp abrir no app, cole lá."); }
    },
    "p-script": function (t) { App.modalScript(findProspect(t.getAttribute("data-id"))); },
    "p-maps": function (t) { var p = findProspect(t.getAttribute("data-id")); U.openMaps(p.nome + " " + p.bairro + " São Paulo"); },
    "p-google": function (t) { var p = findProspect(t.getAttribute("data-id")); U.google(p.nome + " " + p.bairro + " São Paulo"); },
    "p-editar": function (t) { App.modalProspect(t.getAttribute("data-id")); },
    "p-menu": function (t) { App.modalProspectMenu(t.getAttribute("data-id")); },
    "p-del": function (t) {
      var id = t.getAttribute("data-id"), p = findProspect(id);
      U.confirmBox("Apagar prospect?", "“" + esc(p.nome) + "” sai da lista. Você consegue desfazer pelo aviso que aparece depois.", function () {
        U.closeAllModals(); App.prospectDelete(id);
      }, true);
    },
    "p-status": function (t) {
      var p = findProspect(t.getAttribute("data-id"));
      S.pushUndo("mudar status");
      p.status = t.getAttribute("data-status"); p.atualizadoEm = new Date().toISOString();
      if (p.status !== "novo") p.ultimoContato = p.ultimoContato || new Date().toISOString();
      S.log("status", p.nome + " → " + (App.STATUS_LABEL[p.status] || [p.status])[0], p.id);
      S.saveNow(); U.closeAllModals(); render();
    },
    "p-converter": function (t) {
      var p = findProspect(t.getAttribute("data-id"));
      S.pushUndo("converter prospect");
      var d = {
        id: Z.uid("d"), empresa: p.nome, contato: p.contato, telefone: p.telefone, bairro: p.bairro,
        segmento: p.segmento, valor: st().config.precoSite, etapa: "lead", itens: { site: p.temSite !== true, insta: true, gmn: false, manut: false },
        criadoEm: new Date().toISOString(), atualizadoEm: new Date().toISOString(), ordem: Date.now() % 100000,
        historico: [{ etapa: "lead", em: new Date().toISOString() }], propostas: [], prospectId: p.id, temSiteSit: p.temSite === false ? "nao" : p.temSite ? "ok" : "?"
      };
      st().deals.push(d);
      p.status = "convertido"; p.convertidoId = d.id; p.atualizadoEm = d.criadoEm;
      S.log("prospect", "Converteu " + p.nome + " em negociação", d.id);
      S.saveNow(); U.closeAllModals(); U.go("pipeline");
      U.toast("Está no Kanban, coluna Lead. Arraste para Contatado quando mandar a primeira mensagem.", "ok");
    },
    "p-novo-prospect-similar": function (t) {
      var p = findProspect(t.getAttribute("data-id"));
      U.closeAllModals();
      App.modalProspect();
      var ov = document.querySelector(".overlay:last-child");
      if (ov) {
        ov.querySelector('[data-f=bairro]').value = p.bairro;
        ov.querySelector('[data-f=segmento]').value = p.segmento;
      }
      U.toast("Mesmo bairro e segmento do anterior — só troque o nome e o telefone.", "ok", 5000);
    },
    "p-copiar": function (t) {
      var p = findProspect(t.getAttribute("data-id"));
      var g = seg(p.segmento);
      U.copy([p.nome, p.contato && ("Contato: " + p.contato), p.telefone && ("Tel: " + Z.fmtTel(p.telefone)),
      p.endereco && ("End: " + p.endereco + " — " + p.bairro), "Segmento: " + g.nome,
      "Site: " + (p.temSite === false ? "não tem" : p.temSite ? "tem" : "?"),
      "Instagram: " + (p.temInstagram === false ? "não tem" : (p.insta || "?")), p.obs && ("Obs: " + p.obs)].filter(Boolean).join("\n"));
    },

    /* deals */
    "novo-deal": function () { App.modalDeal(); },
    "d-editar": function (t) { U.closeAllModals(); App.modalDeal(t.getAttribute("data-id")); },
    "d-menu": function (t) { App.modalDealMenu(t.getAttribute("data-id")); },
    "d-wa": function (t) { var d = findDeal(t.getAttribute("data-id")); var g = seg(d.segmento); U.openWa(d.telefone, U.fillVars(g.script, U.scriptCtx({ empresa: d.empresa, contato: d.contato || "chefe", bairro: d.bairro }))); },
    "d-ligar": function (t) { U.openTel(findDeal(t.getAttribute("data-id")).telefone); },
    "d-proposta": function (t) { U.closeAllModals(); App.modalProposta(findDeal(t.getAttribute("data-id"))); },
    "d-script": function (t) {
      var d = findDeal(t.getAttribute("data-id"));
      App.modalScript({ _deal: true, id: d.id, nome: d.empresa, contato: d.contato, telefone: d.telefone, bairro: d.bairro, segmento: d.segmento, temSite: d.temSiteSit === "nao" ? false : null, temInstagram: d.itens && d.itens.insta ? null : false, insta: "", obs: "" });
    },
    "d-followup": function (t) { U.closeAllModals(); App.modalFollowUp(findDeal(t.getAttribute("data-id")), "atual"); },
    "d-tarefa": function (t) { var d = findDeal(t.getAttribute("data-id")); U.closeAllModals(); App.modalTarefa(null, { titulo: "Ação — " + d.empresa, vinc: "d:" + d.id }); },
    "d-mover": function (t) { U.closeAllModals(); App.moveDeal(t.getAttribute("data-id"), t.getAttribute("data-etapa")); },
    "d-del": function (t) {
      var id = t.getAttribute("data-id"), d = findDeal(id);
      U.confirmBox("Excluir negociação?", "“" + esc(d.empresa) + "” sai do Kanban. Clientes e pagamentos já criados continuam.", function () {
        var arr = st().deals, i = arr.indexOf(d);
        S.pushUndo("excluir deal"); arr.splice(i, 1); S.saveNow(); U.closeAllModals(); render();
        U.toast("Negociação excluída.", "warn", 7000, { label: "Desfazer", fn: function () { arr.splice(i, 0, d); S.saveNow(); render(); } });
      }, true);
    },
    "d-historico": function (t) {
      var d = findDeal(t.getAttribute("data-id"));
      var h = (d.historico || []).slice().reverse();
      U.closeAllModals();
      U.openModal(U.modalShell("Histórico — " + d.empresa, ((d.propostas || []).length) + " proposta(s) · " + h.length + " movimento(s) de etapa",
        '<div class="timeline">' + h.map(function (x) {
          return '<div class="tl"><span class="bullet"></span><div class="body">' + esc(S.Etapas[x.etapa] ? S.Etapas[x.etapa].nome : x.etapa) +
            (x.motivo ? " · motivo: " + esc(x.motivo) : "") + '<div class="when">' + Z.fmtDataHora(x.em) + '</div></div></div>';
        }).join("") + ((d.propostas || []).map(function (p) {
          return '<div class="tl"><span class="bullet" style="background:var(--orange)"></span><div class="body">Proposta enviada · ' + money(p.total) +
            '<div class="when">' + Z.fmtDataHora(p.em) + '</div></div></div>';
        }).join("")) + (d.notas ? '<hr class="hr"><p class="tiny">📝 ' + esc(d.notas) + '</p>' : "") + '</div>'));
    },
    "fu-sem": function (t) { var d = findDeal(t.getAttribute("data-id")); d.ultimoContato = new Date().toISOString(); S.saveNow(); U.closeAllModals(); render(); },
    "proposta-em-aberto": function () { U.go("pipeline"); setTimeout(function () { U.toast("Coluna Proposta: cobre hoje os parados há 3+ dias — o card mostra 🥶.", "ok", 6000); }, 400); },

    /* clientes */
    "novo-cliente": function () { App.modalCliente(); },
    "c-editar": function (t) { App.modalCliente(t.getAttribute("data-id")); },
    "c-menu": function (t) {
      var c = findCliente(t.getAttribute("data-id"));
      U.openModal(U.modalShell(c.empresa, "Cliente · " + (c.status === "ativo" ? "ativo" : c.status) + (c.manutencao ? " · com manutenção" : ""),
        '<div class="row wrap">' +
        (c.telefone ? '<a class="btn wa sm" target="_blank" rel="noopener" href="' + U.waLink(c.telefone, "") + '">💬 WhatsApp</a>' : "") +
        '<button class="btn sm ghost" data-act="c-proposta" data-id="' + c.id + '">📄 Proposta</button>' +
        '<button class="btn sm ghost" data-act="c-gerar-site" data-id="' + c.id + '">🌐 Gerar site</button>' +
        '<button class="btn sm ghost" data-act="c-manut-toggle" data-id="' + c.id + '">' + (c.manutencao ? "Cancelar manutenção" : "Ativar manutenção (+" + money(st().config.manutMes) + "/mês)") + '</button>' +
        '<button class="btn sm" data-act="c-receber" data-id="' + c.id + '">＋ Lançamento</button>' +
        '<button class="btn sm quiet" data-act="c-tarefa" data-id="' + c.id + '">⏰ Tarefa</button>' +
        '<button class="btn sm quiet" data-act="c-editar" data-id="' + c.id + '">✏️ Editar</button>' +
        '<button class="btn sm red quiet" data-act="c-del" data-id="' + c.id + '">🗑 Apagar</button>' +
        '</div>' + (c.obs ? '<hr class="hr"><p class="tiny">' + esc(c.obs) + '</p>' : '')));
    },
    "c-wa": function (t) { U.openWa(findCliente(t.getAttribute("data-id")).telefone); },
    "c-proposta": function (t) { U.closeAllModals(); App.modalPropostaCliente(findCliente(t.getAttribute("data-id"))); },
    "c-receber": function (t) { var c = findCliente(t.getAttribute("data-id")); U.closeAllModals(); App.modalPagamento({ clienteId: c.id }); },
    "c-tarefa": function (t) { var c = findCliente(t.getAttribute("data-id")); U.closeAllModals(); App.modalTarefa(null, { titulo: "Atendimento — " + c.empresa, vinc: "c:" + c.id, tipo: "visita" }); },
    "c-gerar-site": function (t) {
      U.closeAllModals(); var c = findCliente(t.getAttribute("data-id"));
      var html = window.ZeikSite.gerar({
        empresa: c.empresa, bairro: c.bairro, endereco: c.endereco || "", telefone: c.telefone,
        telefoneFmt: Z.fmtTel(c.telefone), whatsapp: Z.toWa(c.telefone), segmento: c.segmento, sobre: c.sobre || ""
      });
      window.ZeikSite.baixar(slug(c.empresa) + ".html", html);
      S.log("site", "Site gerado para o cliente " + c.empresa, c.id);
      if (!c.entregue) { c.pendenteSite = true; }
      S.saveNow();
      U.toast("Site do cliente baixado. Abra o arquivo, ajuste textos e hospede.", "ok", 5000);
    },
    "baixar-site": function () {
      var host = document.getElementById("sitePrev");
      if (host && host.dataset.html) window.ZeikSite.baixar(host.dataset.name, host.dataset.html);
    },
    "c-manut-toggle": function (t) {
      var c = findCliente(t.getAttribute("data-id"));
      S.pushUndo("manutenção");
      c.manutencao = !c.manutencao;
      if (c.manutencao) {
        st().financeiro.unshift({ id: Z.uid("f"), clienteId: c.id, tipo: "manutencao", descricao: "Manutenção mensal — " + c.empresa, valor: st().config.manutMes, data: Z.addDays(30), mes: Z.monthKey(Z.addDays(30)), status: "a_receber", recorrente: true });
      }
      S.saveNow(); U.closeAllModals(); render();
      U.toast(c.manutencao ? "Manutenção ativada + cobrança em 30 dias." : "Manutenção cancelada.", c.manutencao ? "ok" : "warn");
    },
    "c-del": function (t) {
      var c = findCliente(t.getAttribute("data-id"));
      U.confirmBox("Apagar cliente?", "“" + esc(c.empresa) + "” sai da carteira. Lançamentos financeiros ficam.", function () {
        var arr = st().clientes, i = arr.indexOf(c);
        S.pushUndo("apagar cliente"); arr.splice(i, 1); S.saveNow(); U.closeAllModals(); render();
        U.toast("Cliente apagado.", "warn", 8000, { label: "Desfazer", fn: function () { arr.splice(i, 0, c); S.saveNow(); render(); } });
      }, true);
    },
    "campanha-manutencao": function () {
      var s = st(), cfg = s.config;
      var alvos = s.clientes.filter(function (c) { return c.status === "ativo" && !c.manutencao; });
      if (!alvos.length) { U.toast("Todos os clientes ativos já têm manutenção. Sobe o preço 😉", "ok"); return; }
      var texto = U.fillVars(
        "Oi {{contato}}, tudo certo por aí? 😊\n\nAqui é {{nomeZeik}}.\n\nSeu site já está no ar há um tempo e eu faço questão de manter ele atualizado pra você — preços novos, fotos novas, promoções.\n\nTenho um plano de manutenção que custa {{manut}}/mês e inclui:\n• Alterações quando você quiser (eu mudo, você só fala)\n• Backup do site e revisão de velocidade\n• Ajuste de texto/imagem de campanhas do mês\n\nSem contrato: você cancela quando quiser.\n\nQuero colocar a {{empresa}} nesse plano e já deixar suas fotos atualizadas pra esse mês. Faço pra você?",
        U.scriptCtx({ empresa: "", contato: "" }));
      var ov = U.openModal(U.modalShell("Up-sell de manutenção — " + alvos.length + " cliente(s)",
        "Manda 1 por dia. Não em lista: personalize o nome antes de enviar.",
        '<div class="script-box">' + esc(texto) + '</div>' +
        '<hr class="hr"><div class="col" style="gap:6px">' +
        alvos.map(function (c) {
          return '<div class="row between" style="border-bottom:1px solid var(--hairline);padding:7px 0">' +
            '<span class="truncate" style="font-size:13.5px">' + esc(c.empresa) + ' <span class="tiny">' + esc(c.bairro || "") + '</span></span>' +
            '<span class="row"><button class="btn xs ghost" data-act="manut-wa" data-id="' + c.id + '">💬 Enviar</button>' +
            '<button class="btn xs green" data-act="manut-aceitou" data-id="' + c.id + '">Aceitou</button></span></div>';
        }).join("") + '</div>',
        '<button class="btn quiet" data-close>Fechar</button><button class="btn ghost" data-act="copiar-texto" data-sel=".script-box">⧉ Copiar texto</button>'));
      return ov;
    },
    "manut-wa": function (t) {
      var c = findCliente(t.getAttribute("data-id")), cfg = st().config;
      U.openWa(c.telefone, U.fillVars(document.querySelector(".script-box").textContent, U.scriptCtx({ empresa: c.empresa, contato: c.contato || "" })));
    },
    "manut-aceitou": function (t) {
      var c = findCliente(t.getAttribute("data-id"));
      S.pushUndo("manutenção aceita");
      c.manutencao = true;
      st().financeiro.unshift({ id: Z.uid("f"), clienteId: c.id, tipo: "manutencao", descricao: "Manutenção mensal — " + c.empresa, valor: st().config.manutMes, data: Z.todayISO(), mes: Z.monthKey(), status: "pago", metodo: "PIX", recorrente: true });
      criarTarefa({ titulo: "Renovar manutenção — " + c.empresa, data: Z.addDays(28), clienteId: c.id, cliente: c.empresa, tipo: "cobrar" });
      S.log("manutencao", c.empresa + " entrou na manutenção mensal (" + money(st().config.manutMes) + "/mês)", c.id);
      S.saveNow(); U.closeAllModals(); render();
      U.toast("MRR subiu " + money(st().config.manutMes) + "/mês 🚀", "ok");
    },

    /* financeiro */
    "novo-pagamento": function () { App.modalPagamento(); },
    "f-editar": function (t) { App.modalPagamento({ id: t.getAttribute("data-id") }); },
    "f-receber": function (t) {
      var f = findPag(t.getAttribute("data-id"));
      S.pushUndo("receber");
      f.status = "pago"; f.data = Z.todayISO(); f.mes = Z.monthKey(); f.metodo = f.metodo || "PIX";
      if (f.recorrente) {
        st().financeiro.unshift({ id: Z.uid("f"), clienteId: f.clienteId, tipo: f.tipo, descricao: f.descricao, valor: f.valor, data: Z.addDays(30), mes: Z.monthKey(Z.addDays(30)), status: "a_receber", recorrente: true });
      }
      S.log("financeiro", "Recebido " + money(f.valor) + " — " + f.descricao, f.id);
      S.saveNow(); render();
      U.toast("Recebido " + money(f.valor) + (f.recorrente ? " · próxima cobrança em 30 dias" : ""), "ok");
    },
    "f-del": function (t) {
      var id = t.getAttribute("data-id"), arr = st().financeiro, i = -1;
      arr.forEach(function (x, k) { if (x.id === id) i = k; });
      if (i < 0) return;
      var removed = arr[i];
      U.confirmBox("Apagar lançamento?", money(removed.valor) + " sai do faturamento.", function () {
        S.pushUndo("apagar lançamento"); arr.splice(i, 1); S.saveNow(); render();
        U.toast("Lançamento apagado.", "warn", 7000, { label: "Desfazer", fn: function () { arr.splice(i, 0, removed); S.saveNow(); render(); } });
      }, true);
    },
    "csv-financeiro": function () { App.exportCSV(); },
    periodo: function (t) { App.filters.fperiodo = t.getAttribute("data-val"); render(); },

    /* tarefas */
    "nova-tarefa": function () { App.modalTarefa(); },
    "tarefa-editar": function (t) { App.modalTarefa(t.getAttribute("data-id")); },
    "tarefas-tab": function (t) { App.filters.tq = t.getAttribute("data-tab"); render(); },
    "tarefa-check": function (t) {
      var ta = findTarefa(t.getAttribute("data-id"));
      S.pushUndo("concluir tarefa");
      ta.concluida = !ta.concluida;
      ta.concluidaEm = ta.concluida ? new Date().toISOString() : null;
      if (ta.concluida && ta.ciclo) {
        criarTarefa({ titulo: ta.titulo, data: Z.addDays(4), dealId: ta.dealId, prospectId: ta.prospectId, clienteId: ta.clienteId, cliente: ta.cliente, tipo: ta.tipo, ciclo: true, link: ta.link, notas: ta.notas });
        U.toast("Ciclo: próxima cobrança criada em 4 dias.", "ok");
      }
      if (ta.concluida && ta.prospectId) { var p = findProspect(ta.prospectId); if (p) p.ultimoContato = new Date().toISOString(); }
      S.saveNow(); render();
      return false;
    },
    "tarefa-del": function (t) {
      var id = t.getAttribute("data-id"), arr = st().tarefas, i = -1;
      arr.forEach(function (x, k) { if (x.id === id) i = k; });
      if (i < 0) return;
      var r = arr[i];
      S.pushUndo("apagar tarefa"); arr.splice(i, 1); S.saveNow(); render();
      U.toast("Tarefa apagada.", "warn", 6000, { label: "Desfazer", fn: function () { arr.splice(i, 0, r); S.saveNow(); render(); } });
    },
    "tarefa-wa": function (t) {
      var ta = findTarefa(t.getAttribute("data-id"));
      var alvo = ta.dealId ? findDeal(ta.dealId) : ta.prospectId ? findProspect(ta.prospectId) : null;
      var tel = (alvo && alvo.telefone) || "";
      var txt = U.fillVars("Oi {{contato}}! Passando aqui da {{empresa}} de novo 🙂\n\nConseguiu ver o que te mandei? Se fizer sentido, eu começo hoje e entrego em " + st().config.prazoEntrega + ".",
        U.scriptCtx({ empresa: (alvo && (alvo.empresa || alvo.nome)) || "seu site", contato: (alvo && alvo.contato) || "" }));
      if (!U.openWa(tel, txt)) U.copy(txt);
    },

    /* scripts */
    "ver-script": function (t) {
      var g = seg(t.getAttribute("data-seg")), tipo = t.getAttribute("data-tipo") || "script";
      var texto = U.fillVars(g[tipo] || g.script, U.scriptCtx({ empresa: "Barbearia Exemplo", contato: "Zé", bairro: "Capão Redondo", servico: (g.nome || "").split(" /")[0].toLowerCase() }));
      U.openModal(U.modalShell((g.emoji || "") + " " + g.nome + " — " + (tipo === "script" ? "primeiro contato" : tipo === "followup" ? "follow-up" : "fechamento"),
        "Modelo genérico. O script do prospect (botão 🧠) já vem com nome, bairro e telefone certos.",
        '<div class="card-title">Dor do segmento</div><p class="tiny" style="margin:-4px 0 10px">' + esc(g.dor) + '</p>' +
        '<div class="card-title">Gancho</div><p class="tiny" style="margin:-4px 0 12px">' + esc(g.gancho) + '</p>' +
        '<textarea class="script-box" style="min-height:280px;white-space:pre-wrap">' + esc(texto) + '</textarea>',
        '<button class="btn quiet" data-close>Fechar</button><button class="btn ghost" data-act="copiar-texto" data-sel=".script-box">⧉ Copiar</button>'), { wide: true });
    },
    "ver-objecao": function (t) { App.modalObjecao(t.getAttribute("data-q")); },
    "copiar-tudo": function () {
      var s = window.ZEIK_SEED;
      var out = "ZEIK DIGITAL — PLAYBOOK DE PROSPECÇÃO (Zona Sul)\n\n";
      s.segmentos.forEach(function (g) {
        out += "\n===== " + (g.emoji || "") + " " + g.nome + " =====\nDOR: " + g.dor + "\nGANCHO: " + g.gancho + "\n\n[1º CONTATO]\n" + g.script + "\n\n[FOLLOW-UP]\n" + g.followup + "\n\n[FECHAMENTO]\n" + g.fechamento + "\n";
      });
      out += "\n\n===== OBJEÇÕES =====\n";
      s.objecoes.forEach(function (o) { out += "\n" + o.q + "\n" + o.a + "\n"; });
      U.copy(out, "Playbook completo copiado — cole num documento do Google e guarda pra sempre.");
    },

    /* gerador */
    "gerar-site": function () { App.gerarSite(false); },
    "gerar-site-previa": function () { App.gerarSite(true); },
    "ver-modelo": function () { window.open("modelo-site.html", "_blank", "noopener"); },

    /* utils */
    "copiar-texto": function (t) {
      var txt = t.getAttribute("data-text");
      if (!txt) {
        var sel = t.getAttribute("data-sel");
        var el = t.closest(".modal") && t.closest(".modal").querySelector(sel);
        if (!el) return;
        txt = el.value !== undefined ? el.value : el.textContent;
      }
      U.copy(txt);
    },
    "edit-note": function () { }
  });

  function marcarContato(p, via) {
    if (!p) return;
    if (p._deal) {   // script aberto a partir de um card do Kanban
      var d = findDeal(p.id);
      if (d) {
        S.pushUndo("registrar contato");
        d.ultimoContato = new Date().toISOString(); d.atualizadoEm = d.ultimoContato;
        if (d.etapa === "lead") { d.etapa = "contatado"; (d.historico = d.historico || []).push({ etapa: "contatado", em: d.ultimoContato }); }
        S.log("contato", "Contato por " + via + " com " + d.empresa, d.id);
        S.saveNow(); render();
        App.modalFollowUp(d, "lead");
      }
      return;
    }
    S.pushUndo("registrar contato");
    p.status = "contato_feito"; p.ultimoContato = new Date().toISOString(); p.atualizadoEm = p.ultimoContato;
    S.log("contato", "Contato por " + via + " com " + p.nome, p.id);
    S.saveNow(); render();
    App.modalFollowUpProspect(p);
  }

  /* Filtro por input */
  App.onFilterInput = function () {
    document.querySelectorAll("[data-filter]").forEach(function (el) {
      var k = el.getAttribute("data-filter");
      var map = { search: "q", bairro: "bairro", segmento: "segmento", status: "status", prio: "prio", need: "need", ordem: "ordem", csearch: "cq", cstatus: "cstatus", tq: "tq", tordem: "ordemT" };
      var key = map[k]; if (!key) return;
      App.filters[key] = el.value;
    });
    render();
  };

  /* Seleção (select) também dispara onInput nos navegadores modernos */
  document.addEventListener("change", function (ev) {
    if (ev.target.matches("[data-filter]")) App.onFilterInput();
  });

  /* Tarefas que venceram: re-today automático quando o usuário abre o painel */
  App.autoAge = function () {
    var s = st(), mudou = false;
    s.tarefas.forEach(function (t) {
      if (t.concluida || !t.auto) return;
      if (Z.diasAteData(t.data) < 0) { t.data = Z.todayISO(); t.notas = (t.notas ? t.notas + " · " : "") + "empurrada automaticamente " + new Date().toLocaleDateString("pt-BR"); mudou = true; }
    });
    if (mudou) { S.saveNow(); U.toast("Tarefas atrasadas foram empurradas para hoje (você pediu a regra).", "ok", 4200); }
  };

  App.initAfter = function () {
    S = window.ZeikStore;
    App.autoAge();
    var last = st().config.ultimoBackupExport;
    var dias = Z.diasDesde(last);
    if (last == null || dias >= 7) {
      setTimeout(function () {
        U.toast(last == null ? "Primeira vez aqui? Exporte o backup (.json) e guarde no Drive — é o seu seguro." : "Backup não exportado há " + dias + " dias. 30 segundos e você fica protegido.", "warn", 9000,
          { label: "Exportar agora", fn: App.exportBackup });
      }, 1400);
    }
    /* atalho no rodapé */
    var foot = document.getElementById("sideFootExtra");
    if (foot) foot.innerHTML = '<button class="btn xs quiet block" data-act="snapshot-agora" style="margin-top:8px">📸 Snapshot agora</button>';
  };

  /* confete discreto ao fechar negócio (sem lib, canvas inline) */
  U.__celebrate = function () {
    var n = 26, html = "";
    for (var i = 0; i < n; i++) {
      var x = Math.random() * 100, delay = (Math.random() * 0.5).toFixed(2), c = ["#0071e3", "#34c759", "#ff9500", "#5856d6", "#af52de"][i % 5];
      html += '<span style="position:fixed;left:' + x + 'vw;top:-10px;width:7px;height:12px;background:' + c + ';border-radius:2px;z-index:400;pointer-events:none;animation:fall 2.6s ' + delay + 's linear forwards"></span>';
    }
    var stl = document.createElement("style");
    stl.textContent = "@keyframes fall{to{transform:translateY(105vh) rotate(540deg);opacity:.15}}";
    document.head.appendChild(stl);
    document.body.insertAdjacentHTML("beforeend", html);
    setTimeout(function () { document.querySelectorAll("[style*='fall']").forEach(function (e) { }); stl.remove(); }, 100);
    setTimeout(function () {
      document.querySelectorAll("body > span").forEach(function (el) { if (el.style.animation && el.style.animation.indexOf("fall") >= 0) el.remove(); });
    }, 3400);
  };
})();
