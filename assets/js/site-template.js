/* ==========================================================================
   ZEIK DIGITAL — Gerador de site do cliente
   Arquivo: assets/js/site-template.js
   Gera um HTML completo, auto-contido (CSS inline, zero dependências), no
   mesmo estilo Apple do painel. Usado pelo "Gerador de Site" do CRM:
   o arquivo baixado é o que o cliente recebe (e pode hospedar em qualquer
   lugar). Inclui SEO local + dados estruturados (JSON-LD) + botão flutuante
   de WhatsApp — os mesmos argumentos usados na proposta.
   ========================================================================== */

(function () {
  "use strict";

  var CONTEUDO = {
    barbearia: {
      kicker: "Barbearia", heroTitle: "Corte na régua, barba no detalhe",
      heroSub: "Agende pelo WhatsApp e chegue na hora. Sem fila, sem espera, sem chatice.",
      servicos: [["Corte masculino", "Máquina, tesoura ou degradê, no seu estilo."], ["Barba completa", "Toalha quente, navalha e acabamento."], ["Corte + barba", "O combo que resolve a semana."], ["Pezinho / acabamento", "Retoque rápido pra manter o estilo."]],
      depo: [["Melhor degradê da região e ainda agenda pelo zap. Recomendo demais.", "Lucas M."], ["Cheguei na hora marcada, fui atendido na hora. Virei cliente fiel.", "Diego R."], ["Corte impecável e preço justo do bairro. Não troco por nada.", "Anderson P."]],
      emoji: "💈"
    },
    salao: {
      kicker: "Salão de Beleza", heroTitle: "Seu cabelo novo, no coração do bairro",
      heroSub: "Corte, cor, progressiva e unhas em um lugar só. Agende e chegue linda.",
      servicos: [["Corte e escova", "Modelo que combina com o seu rosto e sua rotina."], ["Coloração e mechas", "Loiro, morena iluminada, tonalização."], ["Progressiva e botox capilar", "Reduz volume e facilita o dia a dia."], ["Manicure e pedicure", "Esmaltação, alongamento e blindagem."]],
      depo: [["Fiz a mecha e ficou exatamente como eu queria. Atendimento maravilhoso!", "Juliana S."], ["Melhor salão da região, preço justo e horário que respeita.", "Fernanda A."], ["Saí de lá renovada. Já marquei o próximo!", "Camila R."]],
      emoji: "💇‍♀️"
    },
    estetica: {
      kicker: "Estética", heroTitle: "Autoestima também é cuidado",
      heroSub: "Protocolos faciais e corporais com profissionais experientes e ambiente reservado.",
      servicos: [["Limpeza de pele profunda", "Extração, máscara e alta frequência."], ["Drenagem linfática", "Reduz inchaço e retenção de líquido."], ["Massagem modeladora", "Ativa circulação e auxilia na definição."], ["Depilação a laser / cera", "Pacotes com condição especial."]],
      depo: [["Minha pele nunca esteve tão boa. Profissionais atenciosas.", "Patrícia L."], ["Ambiente limpo, organizado e sem enrolação no agendamento.", "Sônia M."], ["Fiz o pacote de drenagem e senti resultado na terceira sessão.", "Renata C."]],
      emoji: "✨"
    },
    odonto: {
      kicker: "Odontologia", heroTitle: "Sorriso saudável sem sair da Zona Sul",
      heroSub: "Clínica completa: avaliação, limpeza, aparelho, implante e clareamento.",
      servicos: [["Clareamento", "Sessão única ou caseiro, com supervisão."], ["Aparelho ortodôntico", "Convencional e estético, com parcelamento."], ["Implante dentário", "Reabilitação com planejamento digital."], ["Limpeza e prevenção", "Profilaxia e orientação de escovação."]],
      depo: [["Coloquei aparelho e o atendimento é nota 10. Recomendo!", "Marcos V."], ["Cheguei com dor de dente e fui atendido no mesmo dia.", "Elaine T."], ["Clínica limpa, pontual e sem empurra-empurra de orçamento.", "Roberto N."]],
      emoji: "🦷"
    },
    pet: {
      kicker: "Pet Shop", heroTitle: "Seu pet bem cuidado, pertinho de casa",
      heroSub: "Banho e tosa, veterinário, rações e acessórios. Agende ou peça entrega.",
      servicos: [["Banho e tosa", "Hidratante, medicinal e tosa na tesoura."], ["Consultas e vacinas", "Clínica com atendimento humanizado."], ["Rações e petiscos", "Todas as marcas, com entrega no bairro."], ["Táxi dog", "Busca e leva seu pet com segurança."]],
      depo: [["Meu gato sempre volta cheiroso e sem estresse. Confio de olhos fechados.", "Bianca F."], ["Entrega de ração rápida e preço melhor que loja de shopping.", "Thiago S."], ["Atendimento 24h salvou meu cachorro num susto de madrugada.", "Adriana P."]],
      emoji: "🐾"
    },
    auto: {
      kicker: "Mecânica", heroTitle: "Confiança debaixo do capô",
      heroSub: "Diagnóstico honesto, orçamento antes de mexer e serviço no prazo combinado.",
      servicos: [["Elétrica e injeção", "Bateria, alternador, scanner e correção."], ["Suspensão e freios", "Pastilha, disco, amortecedor e alinhamento."], ["Troca de óleo e filtros", "Peças de procedência e nota fiscal."], ["Socorro / guincho", "Atendimento na região em horário comercial."]],
      depo: [["Orçaram antes de fazer e não teve surpresa na conta. Voltarei.", "Wagner J."], ["Resolveram em uma tarde o que outra oficina não achou em dois dias.", "Marcos A."], ["Honestidade rara em oficina. Já indiquei pra família toda.", "Cleber S."]],
      emoji: "🔧"
    },
    constru: {
      kicker: "Material de Construção", heroTitle: "Obra sem enrolação: preço, prazo e entrega",
      heroSub: "Mande a lista de material pelo WhatsApp e receba o orçamento com entrega no dia.",
      servicos: [["Cimento, areia e brita", "Descarga com horário marcado."], ["Tintas e acabamentos", "Suvinil, Coral e demão única."], ["Hidráulico e elétrico", "Fios, disjuntores, tubos e conexões."], ["Ferramentas e EPIs", "Locação e venda, com garantia."]],
      depo: [["Pediram 8h, 9h30 o caminhão tava na obra. Excelente.", "Edson (pedreiro)"], ["Preço justo e o dono conhece o material de verdade.", "Rogério B."], ["Comprei a reforma inteira aqui e não precisei voltar duas vezes.", "Simone L."]],
      emoji: "🧱"
    },
    food: {
      kicker: "Delivery", heroTitle: "Quentinho, na sua porta, sem taxa de aplicativo",
      heroSub: "Peça direto no WhatsApp: cardápio atualizado, preço justo e entrega rápida no bairro.",
      servicos: [["Mais pedido da casa", "O carro-chefe que fez a fama do lugar."], ["Combo pra família", "Serve 3 a 4 pessoas e cabe no bolso."], ["Bebidas e sobremesas", "Gelada, refri de 2L e docinho final."], ["Encomendas", "Festas e eventos com prazo combinado."]],
      depo: [["Chegou quente e antes do prazo. Virou programa de sexta aqui em casa.", "Pamela R."], ["Sem taxa de app fez toda a diferença no fim do mês.", "Gustavo M."], ["Atendimento no zap é rápido e educado. Peça sem medo.", "Tatiane S."]],
      emoji: "🍕"
    },
    academia: {
      kicker: "Academia", heroTitle: "Treina perto de casa, no horário que dá",
      heroSub: "Musculação, funcional e aulas coletivas. Primeira aula é experimental e grátis.",
      servicos: [["Musculação", "Aparelhos novos e orientação de professor."], ["Funcional e circuito", "Queima calórica em 45 minutos."], ["Aulas coletivas", "Ritmo, luta, abdominal e alongamento."], ["Planos flexíveis", "Mensal, trimestral e sem taxa de matrícula."]],
      depo: [["Nunca faltou aparelho e o professor corrige de verdade.", "Juninho C."], ["Horário das 5h salvou minha rotina. Recomendo demais.", "Priscila D."], ["Ambiente respeitoso, sem 'gracinha' — isso fez eu voltar.", "Aline N."]],
      emoji: "🏋️"
    },
    servicos: {
      kicker: "Serviços", heroTitle: "Serviço bem feito, no prazo e com orçamento claro",
      heroSub: "Atendemos a Zona Sul. Manda foto do serviço que você recebe o orçamento pelo WhatsApp.",
      servicos: [["Orçamento sem compromisso", "Foto + medidas = preço na hora."], ["Execução no prazo", "Data combinada é data cumprida."], ["Garantia de serviço", "Retocamos sem custo o que precisar."], ["Atendimento na região", "Rápido para urgências no bairro."]],
      depo: [["Fez o portão em 4 dias como prometeu. Serviço limpo.", "Anderson P."], ["Mandei foto, recebi preço justo, não teve enrolação.", "Renata M."], ["Já é o terceiro serviço que faço com eles. Recomendo.", "Carlos E."]],
      emoji: "🛠️"
    },
    varejo: {
      kicker: "Loja", heroTitle: "O bairro inteiro encontra você aqui",
      heroSub: "Vitrine online, preços atualizados e pedido rápido pelo WhatsApp com entrega.",
      servicos: [["Produtos em destaque", "Novidades da semana sempre no ar."], ["Reserva e entrega", "Separamos seu pedido na loja ou na sua casa."], ["Credionário e parcelado", "Facilitamos pra quem é cliente da região."], ["Atendimento por WhatsApp", "Dúvida de produto? É só mandar mensagem."]],
      depo: [["Vi o produto no site, reservei e peguei na hora do almoço.", "Silvana T."], ["Loja de bairro com preço de loja grande.", "Márcio F."], ["Sempre tem o que eu procuro e o dono conhece tudo.", "Eliane G."]],
      emoji: "🛍️"
    },
    escola: {
      kicker: "Cursos", heroTitle: "Sua vaga, sua habilitação, seu próximo passo",
      heroSub: "Turmas abertas na Zona Sul. Simulado e matrícula on-line pelo WhatsApp.",
      servicos: [["Turmas e horários", "Manhã, tarde e noite, de segunda a sábado."], ["Material incluso", "Apostila e simulados on-line."], ["Parcelamento facilitado", "Cartão, boleto ou credionário."], ["Aulas práticas", "Instrutores experientes e carro novo."]],
      depo: [["Passei de primeira! Material ótimo e professor paciente.", "Joyce A."], ["Marquei aula pelo zap no domingo e segunda já estava na sala.", "Willian R."], ["Preço honesto e sem taxa escondida. Recomendo.", "Daniela S."]],
      emoji: "🎓"
    },
    generico: {
      kicker: "Bem-vindo", heroTitle: "Qualidade de bairro, padrão de gente grande",
      heroSub: "Conheça nossos serviços, veja os preços e fale com a gente pelo WhatsApp em segundos.",
      servicos: [["Nosso serviço", "Feito com capricho e material de primeira."], ["Atendimento", "Quem fala com você é quem faz o serviço."], ["Preço justo", "Orçamento claro, sem surpresa na entrega."], ["Região", "Fácil acesso e estacionamento na porta."]],
      depo: [["Atendimento nota 10, recomendo de olhos fechados.", "Cliente do bairro"], ["Serviço no prazo e preço combinado. Voltarei.", "Cliente antigo"], ["Melhor da região, sem exagero.", "Cliente satisfeita"]],
      emoji: "⭐"
    }
  };

  function e(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function gerar(d) {
    d = d || {};
    var c = CONTEUDO[d.segmento] || CONTEUDO.generico;
    var empresa = d.empresa || "Sua Empresa";
    var bairro = d.bairro || "Zona Sul de São Paulo";
    var tel = String(d.telefone || "").replace(/\D/g, "");
    var wa = d.whatsapp || (tel.length >= 10 ? "55" + tel : "");
    var telFmt = d.telefoneFmt || "";
    var servicos = (d.servicos && d.servicos.length ? d.servicos : c.servicos);
    var depo = (d.depoimentos && d.depoimentos.length ? d.depoimentos : c.depo);
    var descricao = e(d.descricao || (c.heroSub + " Estamos no " + (d.endereco ? d.endereco : bairro) + ". Fale com a gente pelo WhatsApp."));

    var serv = servicos.map(function (s) {
      return '<article class="card"><div class="ico">' + c.emoji + '</div><h3>' + e(s[0]) + '</h3><p>' + e(s[1] || "") + '</p></article>';
    }).join("\n");

    var deps = depo.map(function (s) {
      return '<figure class="card quote"><blockquote>“' + e(s[0]) + '”</blockquote><figcaption>' + e(s[1]) + ' · <span>Google</span></figcaption></figure>';
    }).join("\n");

    return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n' +
'<meta charset="utf-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
'<title>' + e(empresa) + ' — ' + e(c.kicker) + ' em ' + e(bairro) + '</title>\n' +
'<meta name="description" content="' + descricao + '">\n' +
'<meta name="theme-color" content="#f5f5f7">\n' +
'<meta property="og:type" content="business.business">\n' +
'<meta property="og:title" content="' + e(empresa) + ' — ' + e(c.kicker) + '">\n' +
'<meta property="og:description" content="' + descricao + '">\n' +
'<link rel="canonical" href="' + e(d.url || "#") + '">\n' +
'<script type="application/ld+json">' + JSON.stringify({
      "@context": "https://schema.org", "@type": "LocalBusiness",
      name: empresa, description: c.heroSub, telephone: telFmt || tel,
      address: { "@type": "PostalAddress", streetAddress: d.endereco || "", addressLocality: bairro, addressRegion: "SP", addressCountry: "BR" },
      priceRange: "$$", "@id": "#negocio"
    }) + '</script>\n' +
'<style>\n' + CSS + '\n</style>\n</head>\n<body>\n' +
'<header class="top"><div class="wrap nav">\n' +
'  <a class="logo" href="#topo"><span class="mark">' + e(c.emoji) + '</span><b>' + e(empresa) + '</b></a>\n' +
'  <nav class="links"><a href="#servicos">Serviços</a><a href="#sobre">Sobre</a><a href="#contato">Contato</a></nav>\n' +
'  <a class="btn" href="https://wa.me/' + e(wa) + '?text=' + encodeURIComponent("Olá! Vim pelo site da " + empresa + " e quero agendar/atender.") + '" target="_blank" rel="noopener">Agendar</a>\n' +
'</div></header>\n\n' +
'<main id="topo">\n<section class="hero"><div class="wrap">\n' +
'  <p class="kicker">' + e(c.emoji) + ' ' + e(c.kicker) + ' · ' + e(bairro) + '</p>\n' +
'  <h1>' + e(d.titulo || c.heroTitle) + '</h1>\n' +
'  <p class="lead">' + e(d.subtitulo || c.heroSub) + '</p>\n' +
'  <div class="cta">\n' +
'    <a class="btn big" href="https://wa.me/' + e(wa) + '?text=' + encodeURIComponent("Olá! Vim pelo site e quero falar com a " + empresa + ".") + '" target="_blank" rel="noopener">Chamar no WhatsApp</a>\n' +
(telFmt ? '    <a class="btn ghost big" href="tel:+55' + e(tel) + '">Ligar ' + e(telFmt) + '</a>\n' : '') +
'  </div>\n' +
'  <ul class="trust"><li>✔ Atendimento no bairro</li><li>✔ Orçamento sem compromisso</li><li>✔ ' + e(d.anosAtuacao ? d.anosAtuacao + ' anos de tradição' : 'Cliente que volta') + '</li></ul>\n' +
'</div></section>\n\n' +
'<section id="servicos" class="section"><div class="wrap">\n' +
'  <h2>Serviços e preços</h2><p class="sub">O que a ' + e(empresa) + ' faz — e você pode reservar agora mesmo.</p>\n' +
'  <div class="grid">' + serv + '</div>\n' +
'  <p class="note">Preços e disponibilidade mudam na semana. Chame no WhatsApp e confirme o seu.</p>\n' +
'</div></section>\n\n' +
'<section id="sobre" class="section alt"><div class="wrap split">\n' +
'  <div>\n    <h2>Sobre a ' + e(empresa) + '</h2>\n' +
'  <p class="lead">' + e(d.sobre || ("No bairro desde sempre, a " + empresa + " atende com hora marcada e aquele cuidado de quem conhece o cliente pelo nome. Estamos na " + (d.endereco || bairro) + ", pertinho de você.")) + '</p>\n' +
'  <ul class="checks"><li>Equipe própria, sem terceirizado</li><li>Ambiente limpo e acessível</li><li>Pagamento no PIX, cartão e dinheiro</li></ul>\n' +
'  </div>\n' +
'  <aside class="card panel">\n    <h3>Fale com a gente</h3>\n' +
(telFmt ? '    <p><b>WhatsApp / Telefone</b><br>' + e(telFmt) + '</p>\n' : '') +
'    <p><b>Endereço</b><br>' + e(d.endereco || bairro) + '</p>\n' +
'    <p><b>Horário</b><br>' + e(d.horarios || "Seg a Sáb — consulte horários") + '</p>\n' +
'    <a class="btn block" href="https://wa.me/' + e(wa) + '?text=' + encodeURIComponent("Olá! Vim pelo site da " + empresa + ".") + '" target="_blank" rel="noopener">Chamar no WhatsApp</a>\n' +
'  </aside>\n</div></section>\n\n' +
'<section class="section"><div class="wrap">\n' +
'  <h2>O que dizem os clientes</h2><p class="sub">Avaliações reais de quem já foi atendido.</p>\n' +
'  <div class="grid three">' + deps + '</div>\n' +
'</div></section>\n\n' +
'<section id="contato" class="section cta-final"><div class="wrap center">\n' +
'  <h2>Pronto pra ' + (d.verboAgendar || "agendar") + '?</h2>\n' +
'  <p class="lead">Chame no WhatsApp — respondemos rápido, e o horário é seu.</p>\n' +
'  <a class="btn big" href="https://wa.me/' + e(wa) + '?text=' + encodeURIComponent("Olá! Vim pelo site da " + empresa + " e quero " + (d.verboAgendar || "agendar") + ".") + '" target="_blank" rel="noopener">Falar agora no WhatsApp</a>\n' +
'</div></section>\n</main>\n\n' +
'<footer class="foot"><div class="wrap row">\n' +
'  <span>© ' + new Date().getFullYear() + ' ' + e(empresa) + ' · ' + e(bairro) + '</span>\n' +
'  <a href="https://wa.me/5511990147836?text=' + encodeURIComponent("Vi o site da " + empresa + " e quero um assim para meu negócio.") + '" target="_blank" rel="noopener">Site criado por Zeik Digital · (11) 99014-7836</a>\n' +
'</div></footer>\n\n' +
'<a class="wa-float" href="https://wa.me/' + e(wa) + '?text=' + encodeURIComponent("Olá! Vim pelo site da " + empresa + ".") + '" target="_blank" rel="noopener" aria-label="WhatsApp">\n' +
'  <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden="true"><path fill="#fff" d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.4 1.7 6.3L3 29l6.9-1.8c1.8 1 3.9 1.6 6.1 1.6 7.2 0 13-5.8 13-13S23.2 3 16 3zm0 23.5c-2 0-3.9-.5-5.5-1.5l-.4-.2-4 1 1.1-3.9-.3-.4A10.4 10.4 0 1 1 16 26.5zm5.8-7.7c-.3-.2-1.9-.9-2.2-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7 0a8.5 8.5 0 0 1-2.5-1.6 9.4 9.4 0 0 1-1.7-2.2c-.2-.3 0-.5.1-.7l.5-.6.4-.6v-.6c0-.2-.7-1.7-.9-2.3s-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4A3.6 3.6 0 0 0 8.6 13c0 1.5 1.1 3 1.2 3.2s2.1 3.4 5.2 4.7c2.6 1.1 3.1.9 3.7.8s1.9-.8 2.1-1.5.3-1.4.2-1.5-.3-.3-.6-.4z"/></svg>\n' +
'</a>\n</body></html>';
  }

  var CSS = [
    ":root{--bg:#f5f5f7;--txt:#1d1d1f;--txt2:#6e6e73;--blue:#0071e3;--blue2:#0077ed;--card:rgba(255,255,255,.72);--line:rgba(0,0,0,.08);--sh:0 4px 20px rgba(0,0,0,.06)}",
    "@media (prefers-color-scheme:dark){:root{--bg:#000;--txt:#f5f5f7;--txt2:#a1a1a6;--card:rgba(28,28,30,.72);--line:rgba(255,255,255,.1);--sh:0 4px 20px rgba(0,0,0,.4)}}",
    "*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Text','Helvetica Neue',Arial,sans-serif;color:var(--txt);background:var(--bg);-webkit-font-smoothing:antialiased;line-height:1.5}",
    "body::before{content:'';position:fixed;inset:-15% -10% auto;height:60vh;pointer-events:none;background:radial-gradient(60% 60% at 25% 0,rgba(0,113,227,.18),transparent 70%),radial-gradient(50% 50% at 75% 0,rgba(88,86,214,.16),transparent 70%);z-index:0}",
    ".wrap{width:100%;max-width:1080px;margin:0 auto;padding:0 22px;position:relative;z-index:1}",
    ".top{position:sticky;top:0;z-index:20;background:var(--card);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);border-bottom:1px solid var(--line)}",
    ".nav{display:flex;align-items:center;gap:16px;height:60px}",
    ".logo{display:flex;align-items:center;gap:9px;font-weight:600;letter-spacing:-.02em;color:var(--txt);text-decoration:none;font-size:17px}",
    ".mark{width:30px;height:30px;border-radius:9px;display:grid;place-items:center;background:linear-gradient(135deg,var(--blue),#5856d6);font-size:15px}",
    ".links{margin-left:auto;display:flex;gap:22px}.links a{color:var(--txt2);font-size:14px;text-decoration:none;transition:.2s cubic-bezier(.4,0,.2,1)}.links a:hover{color:var(--txt)}",
    ".btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:var(--blue);color:#fff;border:0;border-radius:980px;padding:9px 18px;font-size:14.5px;font-weight:500;text-decoration:none;cursor:pointer;transition:.2s cubic-bezier(.4,0,.2,1);white-space:nowrap}",
    ".btn:hover{background:var(--blue2);transform:translateY(-1px)}.btn:active{transform:scale(.98)}.btn.big{padding:13px 26px;font-size:16px}.btn.ghost{background:transparent;color:var(--blue);border:1px solid var(--line)}.btn.block{width:100%}",
    ".hero{padding:78px 0 62px;text-align:center}",
    ".kicker{color:var(--blue);font-size:13px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;margin:0 0 14px}",
    ".hero h1{font-size:clamp(34px,6.2vw,62px);line-height:1.05;letter-spacing:-.03em;margin:0 0 16px;font-weight:700}",
    ".lead{color:var(--txt2);font-size:clamp(16px,2.2vw,20px);margin:0 auto 26px;max-width:640px}",
    ".cta{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}",
    ".trust{list-style:none;display:flex;gap:22px;justify-content:center;flex-wrap:wrap;padding:0;margin:30px 0 0;color:var(--txt2);font-size:13.5px}",
    ".section{padding:64px 0}.section.alt{background:rgba(0,0,0,.02)}@media(prefers-color-scheme:dark){.section.alt{background:rgba(255,255,255,.03)}}",
    ".section h2{font-size:clamp(24px,3.6vw,34px);letter-spacing:-.025em;margin:0 0 8px;font-weight:700}",
    ".sub{color:var(--txt2);margin:0 0 26px;font-size:16px}.note{color:var(--txt2);font-size:13px;margin-top:18px}",
    ".grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:16px}.grid.three{grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}",
    ".card{background:var(--card);-webkit-backdrop-filter:blur(30px) saturate(180%);backdrop-filter:blur(30px) saturate(180%);border:1px solid var(--line);border-radius:18px;box-shadow:var(--sh);padding:22px;transition:.25s cubic-bezier(.4,0,.2,1)}",
    ".card:hover{transform:translateY(-3px);box-shadow:0 14px 40px rgba(0,0,0,.12)}",
    ".card .ico{width:34px;height:34px;border-radius:10px;background:rgba(0,113,227,.12);color:var(--blue);display:grid;place-items:center;font-size:14px;margin-bottom:12px}",
    ".card h3{margin:0 0 6px;font-size:18px;letter-spacing:-.02em}.card p{margin:0;color:var(--txt2);font-size:14.5px}",
    ".quote blockquote{margin:0 0 10px;font-size:16px;line-height:1.5}.quote figcaption{color:var(--txt2);font-size:13px}.quote figcaption span{color:var(--blue)}",
    ".split{display:grid;grid-template-columns:1.4fr 1fr;gap:34px;align-items:center}.checks{list-style:none;padding:0;margin:18px 0 0;color:var(--txt2)}.checks li{padding:7px 0;border-bottom:1px solid var(--line)}",
    ".panel h3{margin:0 0 12px;font-size:19px}.panel p{margin:0 0 12px;font-size:14.5px;color:var(--txt2)}.panel p b{display:block;color:var(--txt);font-size:12.5px;text-transform:uppercase;letter-spacing:.03em}",
    ".cta-final{background:linear-gradient(135deg,rgba(0,113,227,.10),rgba(88,86,214,.10));border-radius:26px;text-align:center;padding:52px 22px;margin-bottom:40px}.center{text-align:center}.center .lead{margin-bottom:22px}",
    ".foot{border-top:1px solid var(--line);padding:22px 0;color:var(--txt2);font-size:13px}.row{display:flex;gap:14px;justify-content:space-between;flex-wrap:wrap}.foot a{color:var(--txt2);text-decoration:none}.foot a:hover{color:var(--blue)}",
    ".wa-float{position:fixed;right:18px;bottom:18px;width:56px;height:56px;border-radius:50%;background:#25d366;display:grid;place-items:center;box-shadow:0 8px 26px rgba(37,211,102,.45);z-index:60;transition:.2s cubic-bezier(.4,0,.2,1)}",
    ".wa-float:hover{transform:scale(1.06)}.wa-float:active{transform:scale(.96)}",
    "@media(max-width:720px){.links{display:none}.hero{padding:52px 0 40px}.split{grid-template-columns:1fr}.section{padding:46px 0}.btn.big{width:100%}.cta{flex-direction:column}}"
  ].join("\n");

  window.ZeikSite = {
    gerar: gerar,
    conteudos: CONTEUDO,
    baixar: function (filename, html) {
      var blob = new Blob([html], { type: "text/html;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a); a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 800);
    }
  };
})();
