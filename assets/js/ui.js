/* ==========================================================================
   ZEIK DIGITAL — UI base (modais, toasts, cópia, atalhos, lock, PWA, boot)
   Arquivo: assets/js/ui.js
   ========================================================================== */
(function () {
  "use strict";

  var S = null; // preenchido no boot = window.ZeikStore
  var modalStack = [];
  var toastTimer = null;

  function esc(s) { return Z.esc(s); }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms || 180); };
  }

  /* ------------------------------- TOASTS ------------------------------ */
  function toast(msg, kind, ms, action) {
    var box = document.getElementById("toasts");
    if (!box) { box = document.createElement("div"); box.id = "toasts"; box.className = "toasts"; document.body.appendChild(box); }
    var t = document.createElement("div");
    t.className = "toast" + (kind ? " " + kind : "");
    t.innerHTML = '<span>' + esc(msg) + '</span>';
    if (action && action.label) {
      var b = document.createElement("button");
      b.textContent = action.label;
      b.addEventListener("click", function () { t.remove(); action.fn && action.fn(); });
      t.appendChild(b);
    }
    box.appendChild(t);
    var life = ms || 3200;
    setTimeout(function () {
      t.style.transition = "opacity .25s var(--ease), transform .25s var(--ease)";
      t.style.opacity = "0"; t.style.transform = "translateY(6px)";
      setTimeout(function () { t.remove(); }, 260);
    }, life);
    return t;
  }

  /* ------------------------------- MODAL ------------------------------- */
  function openModal(html, opts) {
    opts = opts || {};
    var ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = '<div class="modal' + (opts.wide ? " wide" : "") + '" role="dialog" aria-modal="true">' + html + '</div>';
    document.body.appendChild(ov);
    document.body.style.overflow = "hidden";
    ov.addEventListener("mousedown", function (ev) { if (ev.target === ov) closeModal(ov); });
    ov.addEventListener("click", function (ev) {
      if (ev.target === ov || (ev.target.closest && ev.target.closest("[data-close]"))) closeModal(ov);
    });
    modalStack.push(ov);
    var first = ov.querySelector("input:not([type=hidden]), select, textarea");
    if (first && !opts.noFocus) setTimeout(function () { try { first.focus(); } catch (e) {} }, 60);
    if (opts.onMount) opts.onMount(ov);
    return ov;
  }
  function closeModal(ov) {
    ov = ov || modalStack[modalStack.length - 1];
    if (!ov) return;
    ov.style.opacity = "0";
    var idx = modalStack.indexOf(ov);
    if (idx > -1) modalStack.splice(idx, 1);
    setTimeout(function () {
      ov.remove();
      if (!modalStack.length) document.body.style.overflow = "";
    }, 130);
  }
  function closeAllModals() { while (modalStack.length) closeModal(modalStack.pop()); }

  function modalShell(title, sub, body, footer) {
    return '<div class="modal-head"><div class="grow"><h2>' + esc(title) + '</h2>' +
      (sub ? '<p class="tiny" style="margin:3px 0 0">' + sub + '</p>' : '') +
      '</div><button class="x" data-close aria-label="Fechar">✕</button></div>' +
      '<div class="modal-body">' + body + '</div>' +
      (footer ? '<div class="modal-foot">' + footer + '</div>' : '');
  }

  function confirmBox(title, msg, onYes, danger) {
    var ov = openModal(modalShell(title, "", '<p style="margin:0;color:var(--text-2)">' + msg + '</p>',
      '<button class="btn quiet" data-close>Cancelar</button>' +
      '<button class="btn ' + (danger ? "red" : "") + '" data-yes>' + (danger ? "Apagar" : "Confirmar") + '</button>'));
    ov.querySelector("[data-yes]").addEventListener("click", function () { closeModal(ov); onYes && onYes(); });
  }

  /* --------------------------- AÇÕES RÁPIDAS --------------------------- */
  function copy(text, msg) {
    var done = function () { toast(msg || "Copiado — cola no WhatsApp do cliente", "ok"); };
    if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext !== false) {
      navigator.clipboard.writeText(text).then(done, function () { legacy(); });
    } else legacy();
    function legacy() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px";
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      ta.remove();
      ok ? done() : toast("Não consegui copiar sozinho: selecione o texto e use Ctrl+C", "err", 5000);
    }
  }
  function waLink(telefone, texto) {
    var n = Z.toWa(telefone);
    if (!n) { toast("Esse cadastro ainda não tem telefone. Complete no lápis ✏️", "warn"); return null; }
    return "https://wa.me/" + n + (texto ? "?text=" + encodeURIComponent(texto) : "");
  }
  function openWa(telefone, texto) {
    var url = waLink(telefone, texto);
    if (!url) return false;
    window.open(url, "_blank", "noopener");
    return true;
  }
  function openTel(telefone) {
    var d = Z.onlyDigits(telefone);
    if (!d) { toast("Sem telefone nesse cadastro.", "warn"); return false; }
    location.href = "tel:+55" + (d.length === 11 || d.length === 10 ? d : "11" + d);
    return true;
  }
  function openMaps(q) {
    window.open("https://www.google.com/maps/search/" + encodeURIComponent(q) + "/data", "_blank", "noopener");
    window.open("https://www.google.com/maps/search/" + encodeURIComponent(q), "_blank", "noopener");
  }
  function google(q) { window.open("https://www.google.com/search?q=" + encodeURIComponent(q), "_blank", "noopener"); }
  function download(name, content, mime) {
    var blob = content instanceof Blob ? content : new Blob([content], { type: (mime || "text/plain") + ";charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 600);
    toast("Arquivo baixado: " + name, "ok");
  }

  /* ------------------------- variáveis dos scripts --------------------- */
  function fillVars(tpl, ctx) {
    return String(tpl || "").replace(/\{\{\s*(\w+)\s*\}\}/g, function (_, k) {
      var v = ctx[k];
      if (v === undefined || v === null || v === "") {
        // valores de config quando não vieram no contexto
        v = (S && S.state.config[k] !== undefined) ? S.state.config[k] : "";
      }
      return typeof v === "number" ? (k.indexOf("preco") === 0 || k === "manut" || k === "manutMes" ? Z.fmtBRL(v) : v) : v;
    });
  }
  function scriptCtx(extra) {
    var cfg = S.state.config;
    return Object.assign({
      empresa: "sua empresa",
      contato: "chefe",
      bairro: cfg.cidade || "Zona Sul",
      segmento: "seu serviço",
      servico: "esse serviço",
      preco: cfg.precoSite,
      precoMin: cfg.precoSiteMin,
      precoMax: cfg.precoSiteMax,
      manut: cfg.manutMes,
      prazo: cfg.prazoEntrega,
      nomeZeik: cfg.responsavel || "Zeik Digital",
      telZeik: cfg.whatsappDisplay,
      instagramZeik: "@" + (cfg.instagram || "zeikdigital")
    }, extra || {});
  }
  function segById(id) {
    var seed = window.ZEIK_SEED || { segmentos: [] };
    for (var i = 0; i < seed.segmentos.length; i++) if (seed.segmentos[i].id === id) return seed.segmentos[i];
    return seed.segmentos[seed.segmentos.length - 1];
  }

  /* ------------------------------ NAVEGAÇÃO ---------------------------- */
  var routes = ["dashboard", "prospeccao", "pipeline", "clientes", "financeiro", "tarefas", "scripts", "gerador", "config"];
  function currentView() {
    var h = (location.hash || "").replace(/^#\/?/, "").split("?")[0];
    return routes.indexOf(h) >= 0 ? h : "dashboard";
  }
  var _navSuppressed = false;
  function go(view) {
    var target = "#/" + view;
    if (location.hash !== target) {
      _navSuppressed = true;
      location.hash = target;
      setTimeout(function () { _navSuppressed = false; }, 0);
    }
    render();
  }

  /* ---------------------------- LOCK (PIN) ----------------------------- */
  function showLock() {
    var el = document.getElementById("lockScreen");
    if (el) { el.classList.remove("hidden"); document.getElementById("app").setAttribute("aria-hidden", "true"); return; }
    var d = document.createElement("div");
    d.id = "lockScreen"; d.className = "lock";
    d.innerHTML = '<div class="card lock-card"><div class="brand-logo" style="width:46px;height:46px;font-size:22px">Z</div>' +
      '<div><h2 style="margin-bottom:2px">Zeik Digital</h2><p class="tiny" style="margin:0">Painel protegido. Digite seu PIN de 4 a 8 dígitos.</p></div>' +
      '<form id="lockForm" autocomplete="off"><input type="password" inputmode="numeric" id="lockPin" placeholder="••••" maxlength="8" aria-label="PIN">' +
      '<button class="btn block" style="margin-top:10px" type="submit">Entrar</button></form>' +
      '<p class="tiny" id="lockMsg" style="min-height:16px;margin:0"></p></div>';
    document.body.appendChild(d);
    document.getElementById("app").setAttribute("aria-hidden", "true");
    document.getElementById("app").style.filter = "blur(14px)";
    var form = document.getElementById("lockForm");
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var pin = document.getElementById("lockPin").value;
      S.lockCheck(pin).then(function (r) {
        var msg = document.getElementById("lockMsg");
        if (r === true) {
          d.remove();
          document.getElementById("app").removeAttribute("aria-hidden");
          document.getElementById("app").style.filter = "";
          msg.textContent = "";
          toast("Bem-vindo de volta 👋", "ok");
        } else if (r && r.wait) {
          msg.textContent = "Muitas tentativas. Espere " + r.wait + "s e tente de novo.";
        } else {
          msg.textContent = "PIN errado. " + (r && r.left != null ? "Tentativas restantes: " + r.left : "");
          document.getElementById("lockPin").select();
        }
      });
    });
    setTimeout(function () { document.getElementById("lockPin").focus(); }, 100);
  }

  /* -------------------------------- PWA -------------------------------- */
  function registerPWA() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol === "file:") return;
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("sw.js").catch(function () { /* silencioso: painel funciona sem SW */ });
    });
  }

  /* ------------------------------- BOOT -------------------------------- */
  var booted = false;
  function boot() {
    if (booted) return; booted = true;
    S = window.ZeikStore;
    S.init(window.ZEIK_SEED);

    if (S.lastError) toast(S.lastError, "warn", 6000);
    if (!S.storageOK()) toast("Armazenamento local bloqueado neste navegador — use sem salvar ou saia do modo privado.", "err", 9000);

    var lock = S.lockGet();
    if (lock && lock.hash) { showLock(); }

    window.addEventListener("hashchange", function () { if (!_navSuppressed) render(); });
    document.addEventListener("click", onClick);
    document.addEventListener("input", onInput);
    document.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", function (e) {
      // salva imediatamente caso o usuário feche rápido depois de digitar
      try { S.saveNow(); } catch (err) {}
    });
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "hidden") { try { S.saveNow(); } catch (e) {} }
      else if (window.App && App.refreshBadges) App.refreshBadges();
    });

    registerPWA();
    render();
    if (window.App && App.initAfter) App.initAfter();
  }

  /* Delegação central de cliques */
  function onClick(ev) {
    var t = ev.target.closest("[data-act]");
    if (!t) { if (document.body.classList.contains("nav-open") && !ev.target.closest("#sidebar")) document.body.classList.remove("nav-open"); return; }
    var act = t.getAttribute("data-act");
    if (act === "nav") {
      ev.preventDefault();
      document.body.classList.remove("nav-open");
      go(t.getAttribute("data-view"));
      return;
    }
    if (act === "toggle-nav") { document.body.classList.toggle("nav-open"); document.getElementById("scrim").classList.toggle("hidden"); return; }
    if (act === "fechar-nav") { document.body.classList.remove("nav-open"); document.getElementById("scrim").classList.add("hidden"); return; }
    if (act === "close") { closeModal(); return; }
    if (window.App && App.handlers && App.handlers[act]) {
      App.handlers[act](t, ev);
      ev.preventDefault();
    }
  }
  var onInputDebounced = debounce(function () { if (window.App && App.onFilterInput) App.onFilterInput(); }, 220);
  function onInput(ev) {
    var t = ev.target;
    if (t.matches("[data-filter]")) onInputDebounced();
    if (t.matches("[data-autosave]")) {
      var path = t.getAttribute("data-autosave");
      S.pushUndo("editar campo");
      setByPath(S.state, path, t.type === "checkbox" ? t.checked : (t.type === "number" ? Number(t.value) || 0 : t.value));
      S.save();
    }
  }
  function onKey(ev) {
    if (ev.key === "Escape" && modalStack.length) { closeModal(); return; }
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "k") { ev.preventDefault(); var s = document.querySelector("[data-filter=search]"); if (s) { go("prospeccao"); setTimeout(function () { document.querySelector("[data-filter=search]").focus(); }, 120); } }
    if ((ev.metaKey || ev.ctrlKey) && ev.key.toLowerCase() === "s") { ev.preventDefault(); S.saveNow(); toast("Painel salvo ✔", "ok"); }
    if ((ev.metaKey || ev.ctrlKey) && ev.altKey && ev.key.toLowerCase() === "z") { ev.preventDefault(); if (S.undo()) { render(); toast("Alteração desfeita", "ok"); } }
  }
  function setByPath(obj, path, val) {
    var keys = path.split("."); var last = keys.pop(); var cur = obj;
    for (var i = 0; i < keys.length; i++) { if (!cur[keys[i]]) cur[keys[i]] = {}; cur = cur[keys[i]]; }
    cur[last] = val;
  }

  function render() {
    if (window.App && App.render) App.render();
  }

  window.ZeikUI = {
    toast: toast, openModal: openModal, closeModal: closeModal, closeAllModals: closeAllModals,
    modalShell: modalShell, confirmBox: confirmBox,
    copy: copy, openWa: openWa, openTel: openTel, waLink: waLink, openMaps: openMaps, google: google,
    download: download, fillVars: fillVars, scriptCtx: scriptCtx, segById: segById,
    esc: esc, debounce: debounce, render: render, go: go, currentView: currentView,
    showLock: showLock, get store() { return S; }, boot: boot,
    setDirty: function (v) { dirty = v; }, isDirty: function () { return dirty; }
  };
  window.App = window.App || {};
  var dirty = false;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
