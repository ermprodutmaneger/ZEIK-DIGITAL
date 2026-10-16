// ===== VALOROSA STREET WEAR - MAIN APPLICATION =====
// Carrega configuracoes
let cart = JSON.parse(localStorage.getItem('valorosa_cart') || '[]');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
  // Inicializar Mercado Pago
  initMercadoPago();
  
  // Renderizar produtos
  renderProducts();
  
  // Renderizar carrinho
  renderCart();
  
  // Setup event listeners
  setupEventListeners();
  
  // Iniciar countdown
  startCountdown();
});

// ===== PRODUCT RENDERING =====
function renderProducts(filter = 'all') {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  const filtered = CONFIG.products.filter(p => {
    if (filter === 'all') return true;
    return p.color === filter;
  });

  grid.innerHTML = filtered.map(p => `
    <div class="product-card group bg-[${CONFIG.theme.bgCard}] rounded-[20px] overflow-hidden border border-${CONFIG.theme.border} hover:border-white/20 transition">
      <div class="relative aspect-[4/5] overflow-hidden bg-[#0f0f0f]">
        <img src="${p.img}" alt="${p.name}" class="product-img w-full h-full object-cover">
        <div class="absolute top-3 left-3 flex gap-2">
          <span class="bg-white text-black text-[10px] font-bold tracking-widest px-3 py-1 rounded-full">${p.badge}</span>
        </div>
        <div class="absolute top-3 right-3 bg-black/70 glass text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full border border-white/10">${p.fabric}</div>
        <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-12">
          <div class="flex items-center gap-2 text-[11px]">
            <span class="bg-[#25D366] text-black px-2 py-[2px] rounded font-bold">PRONTA ENTREGA</span>
            <span class="text-white/70">• Frete 24h SP</span>
          </div>
        </div>
      </div>
      <div class="p-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="font-bebas text-[22px] tracking-[0.05em] leading-[0.9]">${p.name}</div>
            <div class="text-[11px] opacity-60 tracking-wide mt-1">${p.desc}</div>
          </div>
          <div class="text-right">
            <div class="text-[11px] line-through opacity-40">R$${CONFIG.oldPrice.toFixed(2).replace('.', ',')}</div>
            <div class="font-bebas text-[22px] leading-none">R$${CONFIG.productPrice.toFixed(2).replace('.', ',')}</div>
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          ${CONFIG.sizes.map(s => `<button onclick="selectSize(this)" data-size="${s}" class="size-btn w-9 h-9 rounded-full border border-white/15 text-[11px] font-bold hover:bg-white hover:text-black transition">${s}</button>`).join('')}
        </div>
        <div class="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <button onclick="addToCart(${p.id})" class="bg-white text-black h-[44px] rounded-full font-bold text-[12px] tracking-[0.12em] hover:bg-white/90 transition flex items-center justify-center gap-2">
            <span>ADICIONAR</span><span class="opacity-60">• R$${CONFIG.productPrice.toFixed(2).replace('.', ',')}</span>
          </button>
          <button onclick="buyNow(${p.id})" class="w-[44px] h-[44px] rounded-full bg-[#25D366] text-black flex items-center justify-center hover:bg-[#20bd5a] transition" title="Comprar no WhatsApp">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.05 4.91A9.91 9.91 0 0 0 12 0C6.48 0 2 4.48 2 10c0 1.76.46 3.41 1.26 4.85L2 22l7.32-1.92A9.93 9.93 0 0 0 12 20c5.52 0 10-4.48 10-10 0-2.67-1.04-5.18-2.95-7.09z"/></svg>
          </button>
        </div>
        <div class="mt-3 text-[10px] tracking-[0.1em] opacity-50 text-center">3x de R$33,30 sem juros • Troca grátis 30 dias</div>
      </div>
    </div>
  `).join('');
}

// ===== SIZE SELECTOR =====
function selectSize(btn) {
  const group = btn.parentElement;
  group.querySelectorAll('.size-btn').forEach(b => {
    b.classList.remove('bg-white', 'text-black', 'border-white');
    b.classList.add('border-white/15');
  });
  btn.classList.add('bg-white', 'text-black', 'border-white');
  btn.classList.remove('border-white/15');
}

// ===== CART FUNCTIONS =====
function addToCart(id, size = 'M') {
  const prod = CONFIG.products.find(p => p.id === id);
  
  // Try to find selected size in that card
  const card = event?.target?.closest('.product-card');
  let selectedSize = size;
  if (card) {
    const sel = card.querySelector('.size-btn.bg-white');
    if (sel) selectedSize = sel.dataset.size;
  }
  
  const existing = cart.find(c => c.id === id && c.size === selectedSize);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ 
      id, 
      name: prod.name, 
      price: CONFIG.productPrice, 
      img: prod.img, 
      size: selectedSize, 
      qty: 1 
    });
  }
  
  saveCart();
  renderCart();
  showToast(`${prod.name} (${selectedSize}) adicionada!`);
}

function buyNow(id) {
  addToCart(id);
  openCartDrawer();
}

function addCombo(qty) {
  cart = [];
  if (qty === 2) {
    cart.push({ id: 1, name: "VALOROSA CROWN", price: CONFIG.productPrice, img: CONFIG.products[0].img, size: 'M', qty: 1 });
    cart.push({ id: 2, name: "CONCRETE JUNGLE", price: CONFIG.productPrice, img: CONFIG.products[1].img, size: 'M', qty: 1 });
  } else {
    cart.push({ id: 1, name: "VALOROSA CROWN", price: CONFIG.productPrice, img: CONFIG.products[0].img, size: 'M', qty: 1 });
    cart.push({ id: 2, name: "CONCRETE JUNGLE", price: CONFIG.productPrice, img: CONFIG.products[1].img, size: 'M', qty: 1 });
    cart.push({ id: 3, name: "NO LIMITS", price: CONFIG.productPrice, img: CONFIG.products[2].img, size: 'M', qty: 1 });
  }
  saveCart();
  renderCart();
  openCartDrawer();
  showToast(`Combo ${qty} adicionado! Economize no checkout`);
}

function saveCart() {
  localStorage.setItem('valorosa_cart', JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const count = cart.reduce((a, c) => a + c.qty, 0);
  const countEl = document.getElementById('cartCount');
  if (countEl) countEl.innerText = count;
}

function renderCart() {
  const count = cart.reduce((a, c) => a + c.qty, 0);
  
  const countEl = document.getElementById('cartDrawerCount');
  if (countEl) countEl.innerText = count;
  
  const container = document.getElementById('cartItems');
  const empty = document.getElementById('emptyCart');
  const summary = document.getElementById('cartSummary');
  
  if (count === 0) {
    if (empty) empty.classList.remove('hidden');
    if (summary) summary.classList.add('hidden');
    return;
  }
  
  if (empty) empty.classList.add('hidden');
  if (summary) summary.classList.remove('hidden');
  
  if (container) {
    container.innerHTML = cart.map((item, i) => `
      <div class="flex gap-4 bg-[${CONFIG.theme.bgInput}] rounded-[16px] p-3 border border-white/5">
        <img src="${item.img}" class="w-[72px] h-[88px] object-cover rounded-[10px] bg-black">
        <div class="flex-1">
          <div class="font-bebas text-[16px] tracking-wide">${item.name}</div>
          <div class="text-[11px] opacity-60">Tam: ${item.size} • Algodão Premium • R$${CONFIG.productPrice.toFixed(2).replace('.', ',')}</div>
          <div class="mt-2 flex items-center gap-3">
            <div class="flex items-center gap-2 border border-white/10 rounded-full px-2 h-[28px]">
              <button onclick="changeQty(${i}, -1)" class="w-5 h-5 flex items-center justify-center">-</button>
              <span class="text-[12px] font-bold w-4 text-center">${item.qty}</span>
              <button onclick="changeQty(${i}, 1)" class="w-5 h-5 flex items-center justify-center">+</button>
            </div>
            <button onclick="removeItem(${i})" class="text-[11px] opacity-50 hover:opacity-100">Remover</button>
          </div>
        </div>
        <div class="font-bebas text-[16px]">R$${(item.price * item.qty).toFixed(2).replace('.', ',')}</div>
      </div>
    `).join('');
  }

  // Calculate pricing
  calculateCartTotals();
}

function calculateCartTotals() {
  let subtotal = cart.reduce((a, c) => a + c.price * c.qty, 0);
  let total = subtotal;
  let discount = 0;
  let comboMsg = "";
  const count = cart.reduce((a, c) => a + c.qty, 0);

  // Apply combo pricing
  if (count === 2) {
    total = CONFIG.combo2Price;
    discount = subtotal - total;
    comboMsg = "🔥 COMBO 2 ATIVADO — Você economizou R$" + discount.toFixed(2).replace('.', ',') + "!";
  } else if (count >= 3) {
    // First 3 for combo price, additional items at special price
    const setsOf3 = Math.floor(count / 3);
    const remaining = count % 3;
    
    if (setsOf3 > 0) {
      total = setsOf3 * CONFIG.combo3Price;
      if (remaining > 0) {
        // Additional items at R$79.90 each
        total += remaining * 79.90;
      }
    }
    
    discount = subtotal - total;
    comboMsg = `🔥 COMBO 3 ATIVADO — Leve 3 por R$${CONFIG.combo3Price.toFixed(2).replace('.', ',')}! Você economizou R$${discount.toFixed(2).replace('.', ',')}`;
    if (CONFIG.combo3FreeShipping) {
      comboMsg += " + Frete Grátis!";
    }
  }

  // Update DOM
  const subtotalEl = document.getElementById('subtotal');
  const discountEl = document.getElementById('discount');
  const totalEl = document.getElementById('total');
  const comboMsgEl = document.getElementById('comboMsg');

  if (subtotalEl) subtotalEl.innerText = `R$$${subtotal.toFixed(2).replace('.', ',')}`;
  if (discountEl) discountEl.innerText = `-R$$${discount.toFixed(2).replace('.', ',')}`;
  if (totalEl) totalEl.innerText = `R$$${total.toFixed(2).replace('.', ',')}`;
  if (comboMsgEl) {
    if (discount > 0) {
      comboMsgEl.innerText = comboMsg;
      comboMsgEl.classList.remove('hidden');
    } else {
      comboMsgEl.classList.add('hidden');
    }
  }

  // Save for checkout
  window._cartTotal = total;
}

function changeQty(i, delta) {
  cart[i].qty += delta;
  if (cart[i].qty <= 0) cart.splice(i, 1);
  saveCart();
  renderCart();
}

function removeItem(i) {
  cart.splice(i, 1);
  saveCart();
  renderCart();
}

// ===== CHECKOUT FUNCTIONS =====
function checkoutWhatsApp() {
  if (cart.length === 0) return;
  
  const total = window._cartTotal || cart.reduce((a, c) => a + c.price * c.qty, 0);
  const count = cart.reduce((a, c) => a + c.qty, 0);
  
  let msg = `Olá VALOROSA STREET WEAR! 🔥\n\nQuero finalizar meu pedido:\n\n`;
  
  cart.forEach(item => {
    msg += `• ${item.name} | Tam: ${item.size} | Qtd: ${item.qty} | R$${(item.price * item.qty).toFixed(2).replace('.', ',')}\n`;
  });
  
  msg += `\n`;
  if (count === 2) msg += `✅ Combo 2 por R$${CONFIG.combo2Price.toFixed(2).replace('.', ',')} ativado (economia de R$${(CONFIG.productPrice * 2 - CONFIG.combo2Price).toFixed(2).replace('.', ',')})\n`;
  if (count >= 3) msg += `✅ Combo 3 por R$${CONFIG.combo3Price.toFixed(2).replace('.', ',')} ativado + Frete Grátis!\n`;
  
  msg += `\nTotal: R$${total.toFixed(2).replace('.', ',')}\n`;
  msg += `Pagamento: PIX / Cartão até 3x sem juros\n`;
  msg += `Envio: 24h SP / 2-4 dias resto BR\n\n`;
  msg += `Meu nome: \nMeu CEP: \n\nPode me enviar o link de pagamento?`;

  const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

// Funcao para checkout com Mercado Pago
async function checkoutMercadoPago() {
  // Verifica se o Mercado Pago esta configurado
  if (!CONFIG.mercadoPago.publicKey || CONFIG.mercadoPago.publicKey.includes('XXXX')) {
    alert('ATENÇÃO: As chaves do Mercado Pago não estão configuradas!\n\nEdite o arquivo assets/js/config.js e substitua as chaves com suas credenciais.');
    return;
  }

  if (cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  // Mostrar modal para coleta de dados do cliente
  openCustomerModal();
}

// ===== MODAL FUNCTIONS =====
function openCustomerModal() {
  const modal = document.getElementById('customerModal');
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCustomerModal() {
  const modal = document.getElementById('customerModal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function submitCustomerData() {
  const name = document.getElementById('customerName').value;
  const email = document.getElementById('customerEmail').value;
  const cpf = document.getElementById('customerCpf').value;
  const phone = document.getElementById('customerPhone').value;
  const cep = document.getElementById('customerCep').value;

  if (!name || !email) {
    alert('Por favor, preencha nome e e-mail!');
    return;
  }

  // Salvar dados do cliente
  localStorage.setItem('valorosa_customer', JSON.stringify({ name, email, cpf, phone, cep }));
  
  // Processar pagamento
  processMercadoPagoPayment();
  
  // Fechar modal
  closeCustomerModal();
}

// ===== UTILITY FUNCTIONS =====
function showToast(msg) {
  const t = document.getElementById('toast');
  const msgEl = document.getElementById('toastMsg');
  
  if (t && msgEl) {
    msgEl.innerText = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  if (drawer) {
    drawer.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

function scrollToColecao() {
  const section = document.getElementById('colecao');
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

function startCountdown() {
  let time = CONFIG.countdownHours * 3600 + CONFIG.countdownMinutes * 60 + CONFIG.countdownSeconds;
  
  setInterval(() => {
    time--;
    if (time < 0) time = CONFIG.countdownHours * 3600 + CONFIG.countdownMinutes * 60 + CONFIG.countdownSeconds;
    
    const h = String(Math.floor(time / 3600)).padStart(2, '0');
    const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
    const s = String(time % 60).padStart(2, '0');
    
    const el = document.getElementById('countdown');
    if (el) el.innerText = `${h}:${m}:${s}`;
  }, 1000);
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Cart button
  const cartBtn = document.getElementById('cartBtn');
  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  
  // Close cart drawer
  const closeCart = document.getElementById('closeCart');
  if (closeCart) closeCart.addEventListener('click', closeCartDrawer);
  
  // Cart overlay
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartOverlay) cartOverlay.addEventListener('click', closeCartDrawer);
  
  // WhatsApp checkout button
  const whatsappBtn = document.getElementById('whatsappCheckoutBtn');
  if (whatsappBtn) whatsappBtn.addEventListener('click', checkoutWhatsApp);
  
  // Mercado Pago checkout button
  const mpBtn = document.getElementById('mercadoPagoCheckoutBtn');
  if (mpBtn) mpBtn.addEventListener('click', checkoutMercadoPago);
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active', 'bg-white', 'text-black', 'border-white');
        b.classList.add('border-white/20');
      });
      btn.classList.add('active', 'bg-white', 'text-black', 'border-white');
      btn.classList.remove('border-white/20');
      renderProducts(btn.dataset.filter);
    });
  });
  
  // Modal close button
  const modalClose = document.getElementById('modalClose');
  if (modalClose) modalClose.addEventListener('click', closeCustomerModal);
  
  // Modal overlay
  const modalOverlay = document.getElementById('modalOverlay');
  if (modalOverlay) modalOverlay.addEventListener('click', closeCustomerModal);
  
  // Customer form submit
  const customerForm = document.getElementById('customerForm');
  if (customerForm) {
    customerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      submitCustomerData();
    });
  }
  
  // Load customer data from localStorage
  const savedCustomer = localStorage.getItem('valorosa_customer');
  if (savedCustomer) {
    const customer = JSON.parse(savedCustomer);
    const nameInput = document.getElementById('customerName');
    const emailInput = document.getElementById('customerEmail');
    const cpfInput = document.getElementById('customerCpf');
    const phoneInput = document.getElementById('customerPhone');
    const cepInput = document.getElementById('customerCep');
    
    if (nameInput) nameInput.value = customer.name || '';
    if (emailInput) emailInput.value = customer.email || '';
    if (cpfInput) cpfInput.value = customer.cpf || '';
    if (phoneInput) phoneInput.value = customer.phone || '';
    if (cepInput) cepInput.value = customer.cep || '';
  }
}
