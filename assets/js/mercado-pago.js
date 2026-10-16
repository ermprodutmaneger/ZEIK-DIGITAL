// ===== MERCADO PAGO INTEGRATION =====
// Este arquivo lida com a integracao do Mercado Pago
// Voce so precisa preencher as chaves no config.js

// Funcao para inicializar o Mercado Pago
function initMercadoPago() {
  // Verifica se as chaves estao configuradas
  if (!CONFIG.mercadoPago.publicKey || CONFIG.mercadoPago.publicKey === "APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX") {
    console.warn("ATENCAO: Chaves do Mercado Pago nao configuradas!");
    console.warn("Edite o arquivo assets/js/config.js e substitua as chaves");
    return false;
  }

  // Carrega o SDK do Mercado Pago
  const script = document.createElement('script');
  script.src = 'https://sdk.mercadopago.com/js/v2';
  script.onload = function() {
    window.MercadoPago.setPublishableKey(CONFIG.mercadoPago.publicKey);
    console.log("Mercado Pago SDK carregado!");
  };
  script.onerror = function() {
    console.error("Falha ao carregar Mercado Pago SDK");
  };
  document.head.appendChild(script);

  return true;
}

// Funcao para criar preferencia de pagamento
async function createPreference(cartItems, customerData) {
  try {
    const response = await fetch('/api/create-preference', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: cartItems,
        customer: customerData,
        // As chaves serao validadas no backend
      }),
    });

    const data = await response.json();
    
    if (data.id) {
      return data.id; // Retorna o preference_id
    } else {
      throw new Error(data.error || 'Falha ao criar preferencia');
    }
  } catch (error) {
    console.error('Erro ao criar preferencia:', error);
    throw error;
  }
}

// Funcao para abrir checkout do Mercado Pago
function openMercadoPagoCheckout(preferenceId) {
  if (!window.MercadoPago) {
    alert('Mercado Pago nao carregado. Tente novamente.');
    return;
  }

  window.MercadoPago.checkout({
    preference: {
      id: preferenceId
    },
    autoOpen: true,
    theme: {
      elementsColor: CONFIG.theme.primary,
      headerColor: CONFIG.theme.bgDark,
    },
    // Callback para quando o pagamento for concluido
    success: function(payment) {
      // Salvar pedido no localStorage
      saveOrder(payment);
      // Redirecionar para pagina de confirmacao
      window.location.href = '/confirmacao.html?order=' + payment.id;
    },
    // Callback para quando o checkout for fechado
    exit: function() {
      // O usuario fechou o checkout sem concluir
      console.log('Checkout fechado');
    }
  });
}

// Funcao para salvar pedido
function saveOrder(payment) {
  const order = {
    id: payment.id,
    date: new Date().toISOString(),
    items: cart,
    total: window._cartTotal || cart.reduce((a, c) => a + c.price * c.qty, 0),
    paymentStatus: payment.status,
    paymentId: payment.id,
    customer: payment.payer ? payment.payer.email : null
  };
  
  localStorage.setItem('valorosa_last_order', JSON.stringify(order));
  
  // Limpar carrinho
  cart = [];
  saveCart();
  renderCart();
}

// Funcao para processar pagamento com Mercado Pago (frontend)
// Esta funcao sera chamada quando o usuario clicar em "Pagar com Mercado Pago"
async function processMercadoPagoPayment() {
  if (!CONFIG.mercadoPago.publicKey || CONFIG.mercadoPago.publicKey.includes('XXXX')) {
    alert('Configuracoes do Mercado Pago nao estao completas.\n\nEdite o arquivo assets/js/config.js e substitua as chaves.');
    return;
  }

  if (cart.length === 0) {
    alert('Seu carrinho esta vazio!');
    return;
  }

  showLoading();

  try {
    // Calcular total
    const total = window._cartTotal || cart.reduce((a, c) => a + c.price * c.qty, 0);
    
    // Preparar itens para o Mercado Pago
    const mpItems = cart.map(item => ({
      title: item.name,
      quantity: item.qty,
      unit_price: item.price,
      currency_id: CONFIG.mercadoPago.currency
    }));

    // Criar preferencia
    const preferenceId = await createPreference(mpItems, {
      name: document.getElementById('customerName')?.value || 'Cliente',
      email: document.getElementById('customerEmail')?.value || '',
      cpf: document.getElementById('customerCpf')?.value || ''
    });

    // Abrir checkout
    openMercadoPagoCheckout(preferenceId);

  } catch (error) {
    console.error('Erro no pagamento:', error);
    alert('Ocorreu um erro ao processar o pagamento. Tente novamente.');
  } finally {
    hideLoading();
  }
}

// Funcao para mostrar loading
function showLoading() {
  const btn = document.getElementById('checkoutBtn');
  if (btn) {
    btn.innerHTML = '<span class="loader"></span> Processando...';
    btn.disabled = true;
  }
}

// Funcao para esconder loading
function hideLoading() {
  const btn = document.getElementById('checkoutBtn');
  if (btn) {
    btn.innerHTML = 'FINALIZAR COMPRA';
    btn.disabled = false;
  }
}
