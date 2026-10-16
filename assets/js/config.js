// ===== VALOROSA STREET WEAR - CONFIGURACOES =====
// Aqui voce edita as configuracoes principais da loja

const CONFIG = {
  // === NOME E MARCA ===
  brandName: "VALOROSA",
  brandSubtitle: "STREET WEAR",
  brandLogo: "public/valorosa/logo.png",
  
  // === PRECOS ===
  productPrice: 99.90,        // Preco unitario
  oldPrice: 199.90,           // Preco anterior (para mostrar desconto)
  
  // === COMBO OFERTAS ===
  combo2Price: 179.90,        // Preco para 2 camisetas
  combo3Price: 259.90,        // Preco para 3 camisetas (3 por 1 na pratica)
  combo3FreeShipping: true,   // Frete gratis no combo 3
  
  // === WHATSAPP ===
  whatsappNumber: "5511990147835",  // Numero com DDI (55) e DDD
  whatsappMessage: "Ol%C3%A1%20VALOROSA%20!%20Quero%20conhecer%20a%20cole%C3%A7%C3%A3o%20por%20R%2499%2C90",
  
  // === MERCADO PAGO ===
  // ATENCAO: Voce precisa preencher estas chaves!
  // Como conseguir: https://developers.mercadopago.com.br/pt-br/docs/credenciais
  mercadoPago: {
    publicKey: "APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",  // Substitua pelo sua PUBLIC KEY
    accessToken: "APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Substitua pelo seu ACCESS TOKEN
    
    // Configuracoes do checkout
    currency: "BRL",
    country: "BR",
    
    // Para teste, use:
    // publicKey: "APP_USR-12345678-1234-1234-1234-123456789012"
    // accessToken: "APP_USR-12345678901234567890123456789012-1234567890"
    // Em producao, use suas chaves reais
    
    // URL para notificacoes (webhook)
    // Voce precisara configurar no painel do Mercado Pago
    webhookUrl: "https://sua-loja.pages.dev/api/webhook"  // Mude para sua URL
  },
  
  // === PRODUTOS ===
  // Cada produto tem: id, name, desc, img, badge, color, fabric
  products: [
    {id:1,name:"VALOROSA CROWN",desc:"Algodão Premium • Oversized • Coroa bordada",img:"public/valorosa/camisa1.png",badge:"MAIS VENDIDA",color:"preta",fabric:"Algodão Premium 100%"},
    {id:2,name:"CONCRETE JUNGLE",desc:"Linho Top • Oversized • Skyline urbano",img:"public/valorosa/camisa2.png",badge:"LANÇAMENTO",color:"branca",fabric:"Linho Top + Algodão"},
    {id:3,name:"NO LIMITS",desc:"Algodão Premium • Oversized • Smoke graphic",img:"public/valorosa/camisa3.png",badge:"-50% HOJE",color:"preta",fabric:"Algodão Premium 100%"},
    {id:4,name:"FAITH OVER FEAR",desc:"Linho Top • Off-White • Rose & skeleton",img:"public/valorosa/camisa4.png",badge:"EXCLUSIVA",color:"branca",fabric:"Linho Top Premium"},
    {id:5,name:"MONEY TALKS",desc:"Algodão Premium • Oversized • Dollar vintage",img:"public/valorosa/camisa5.png",badge:"MAIS VENDIDA",color:"preta",fabric:"Algodão Premium 100%"},
    {id:6,name:"LOST ANGELS",desc:"Algodão Premium • Oversized • Angel wings",img:"public/valorosa/camisa6.png",badge:"RESTAM 7",color:"branca",fabric:"Algodão Premium 100%"},
    {id:7,name:"SYSTEM ERROR",desc:"Algodão Premium • Glitch futurista",img:"public/valorosa/camisa7.png",badge:"LANÇAMENTO",color:"preta",fabric:"Algodão Premium 100%"},
    {id:8,name:"STREETS DON'T LIE",desc:"Linho Top • Bege • Back print",img:"public/valorosa/camisa8.png",badge:"LINHO TOP",color:"branca",fabric:"Linho Top + Algodão"},
    {id:9,name:"URBAN GHOST",desc:"Algodão Premium • Ghost face • Rua",img:"public/valorosa/camisa9.png",badge:"EXCLUSIVA",color:"preta",fabric:"Algodão Premium 100%"},
    {id:10,name:"BLACK LABEL",desc:"Algodão Premium • Barcode • Minimal",img:"public/valorosa/camisa2.png",badge:"PREMIUM",color:"branca",fabric:"Algodão Premium 100%"},
    {id:11,name:"FUTURE VINTAGE",desc:"Linho Top • Retro Sun • Praia",img:"public/valorosa/camisa4.png",badge:"LINHO TOP",color:"preta",fabric:"Linho Top Premium"},
    {id:12,name:"ORIGINALS 2026",desc:"Algodão Premium • Est. 2026 • Classic",img:"public/valorosa/camisa1.png",badge:"ORIGINALS",color:"branca",fabric:"Algodão Premium 100%"},
  ],
  
  // === TAMANHOS DISPONIVEIS ===
  sizes: ['P', 'M', 'G', 'GG'],
  
  // === FRETE ===
  freeShippingThreshold: 200,  // Frete gratis acima de R$200
  shippingMessage: "Frete Grátis acima de R$200 para todo Brasil",
  
  // === BENEFICIOS ===
  benefits: [
    {icon: "✓", title: "ALGODÃO PREMIUM", desc: "Fio 30.1 penteado"},
    {icon: "↻", title: "TROCA GRÁTIS", desc: "30 dias sem burocracia"},
    {icon: "⚡", title: "ENVIO 24H", desc: "SP capital e região"},
    {icon: "★", title: "4.9/5 ESTRELAS", desc: "2.847 avaliações reais"},
  ],
  
  // === AVALIACOES (PROVA SOCIAL) ===
  reviews: [
    {stars: 5, text: "Qualidade absurda! Algodão grosso, estampa não desbota nem lavando. Já levei 3 e vou levar mais. Valorosa é top!", name: "Marcos P.", location: "São Paulo, SP", bought: "Comprou 3"},
    {stars: 5, text: "O oversized é perfeito, corte de grife. Paguei R$99,90 numa que vale R$200 fácil. Chegou em 2 dias.", name: "Julia R.", location: "Campinas, SP", bought: "Comprou 2"},
    {stars: 5, text: "Atendimento no WhatsApp em 2 min e já gerei o link. Melhor custo benefício de streetwear que já vi.", name: "Diego S.", location: "Rio, RJ", bought: "Comprou 3"},
  ],
  
  // === STATS ===
  totalReviews: 2847,
  rating: 4.9,
  totalCustomers: 12000,
  exchangeDays: 30,
  
  // === COUNTDOWN TIMER ===
  countdownHours: 2,
  countdownMinutes: 47,
  countdownSeconds: 19,
  countdownMessage: "OFERTA EXPIRA EM",
  
  // === URLS ===
  siteUrl: "https://valorosa.pages.dev",  // Mude para sua URL do Cloudflare Pages
  
  // === COR TEMA ===
  theme: {
    bgDark: "#0a0a0a",
    bgCard: "#151515",
    bgInput: "#1a1a1a",
    border: "rgba(255,255,255,0.1)",
    text: "white",
    textMuted: "rgba(255,255,255,0.6)",
    primary: "#25D366",  // Verde WhatsApp
    primaryDark: "#20bd5a",
    accent: "#FF3B30",   // Vermelho para ofertas
  }
};

// Export para usar em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
