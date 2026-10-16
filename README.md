# VALOROSA STREET WEAR - Loja Online

Loja completa de streetwear premium com integração Mercado Pago pronta para deploy no Cloudflare Pages.

## 📦 Estrutura do Projeto

```
ZEIK-DIGITAL/
├── index.html              # Pagina principal da loja
├── confirmacao.html        # Pagina de confirmacao de pedido
├── _redirects              # Redirecionamentos para Cloudflare Pages
├── assets/
│   ├── css/
│   │   └── valorosa.css    # Estilos personalizados
│   └── js/
│       ├── config.js       # CONFIGURACOES PRINCIPAIS (edite aqui!)
│       ├── app.js          # Logica principal da loja
│       └── mercado-pago.js # Integracao com Mercado Pago
└── public/
    └── valorosa/           # Imagens dos produtos
        ├── logo.png
        ├── camisa1.png
        ├── camisa2.png
        └── ...
```

## ⚡ Quick Start

### 1. Configurar Mercado Pago

**Edite o arquivo `assets/js/config.js` e substitua as chaves:**

```javascript
mercadoPago: {
  publicKey: "APP_USR-XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",  // SUA PUBLIC KEY
  accessToken: "APP_USR-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // SEU ACCESS TOKEN
  webhookUrl: "https://sua-loja.pages.dev/api/webhook"  // SUA URL DO CLOUDFLARE
}
```

**Como conseguir as chaves:**
1. Acesse: https://developers.mercadopago.com.br/pt-br/docs/credenciais
2. Crie uma conta de desenvolvedor (se ainda nao tiver)
3. Crie uma aplicacao
4. Copie a PUBLIC KEY e ACCESS TOKEN
5. Cole no config.js

### 2. Personalizar Produtos

No mesmo arquivo `assets/js/config.js`, edite a lista de produtos:

```javascript
products: [
  {id:1, name:"NOME", desc:"Descricao", img:"public/valorosa/NOME.png", badge:"BADGE", color:"preta", fabric:"Algodão Premium"},
  // Adicione ou edite seus produtos
]
```

### 3. Adicionar Suas Imagens

Coloque suas imagens de camisetas em `public/valorosa/` e atualize os caminhos no config.js.

## 🚀 Deploy no Cloudflare Pages

### Passo 1: Criar Repositorio no GitHub

1. Va em: https://github.com/new
2. Crie um novo repositorio
3. Suba os arquivos:
   ```bash
   git add .
   git commit -m "Loja Valorosa Street Wear"
   git push origin main
   ```

### Passo 2: Deploy no Cloudflare Pages

1. Acesse: https://dash.cloudflare.com/
2. Clique em "Workers & Pages" > "Create application" > "Pages"
3. Conecte seu repositorio do GitHub
4. Selecione o projeto
5. Configuracoes:
   - Project name: `valorosa-street-wear`
   - Production branch: `main`
   - Build command: **Deixe vazio** (nao precisa de build)
   - Build output directory: **Deixe vazio**
6. Clique em "Save and Deploy"

### Passo 3: Configurar Dominio (Opcional)

1. No Cloudflare Pages, va em "Custom domains"
2. Adicione seu dominio (ex: valorosa.com.br)
3. Siga as instrucoes para configurar o DNS

## 🔧 Configuracoes Importantes

### Configurar Webhook do Mercado Pago

1. Acesse: https://developers.mercadopago.com.br/pt-br/docs/notificacoes/webhooks
2. Crie um webhook com a URL: `https://sua-loja.pages.dev/api/webhook`
3. Selecione os eventos:
   - `payment`
   - `merchant_order`
4. Salve

### Configurar URL no config.js

Atualize a URL do site e webhook:

```javascript
siteUrl: "https://sua-loja.pages.dev",
webhookUrl: "https://sua-loja.pages.dev/api/webhook"
```

## 🛒 Funcionalidades

- ✅ Carrinho de compras
- ✅ Combos (3 por R$259,90)
- ✅ Checkout via Mercado Pago
- ✅ Checkout via WhatsApp
- ✅ Filtros por cor (Preta/Branca/Todas)
- ✅ Seletor de tamanho
- ✅ Countdown timer
- ✅ Prova social
- ✅ Design responsivo
- ✅ Pagina de confirmacao

## 📝 API do Mercado Pago (Backend)

Para o Mercado Pago funcionar 100%, voce precisa criar um endpoint de backend.

### Opcao 1: Cloudflare Workers (Recomendado)

Crie um arquivo `functions/api/create-preference.js`:

```javascript
// functions/api/create-preference.js
export async function onRequestPost(context) {
  const { request } = context;
  const { items, customer } = await request.json();
  
  // Aqui voce precisa implementar a chamada para API do Mercado Pago
  // Usando o accessToken do config
  
  const preference = {
    items: items,
    payer: {
      name: customer.name,
      email: customer.email,
    },
    back_urls: {
      success: `${CONFIG.siteUrl}/confirmacao.html`,
      failure: `${CONFIG.siteUrl}/index.html`,
      pending: `${CONFIG.siteUrl}/index.html`,
    },
    auto_return: "approved",
  };
  
  // Chamar API do Mercado Pago
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CONFIG.mercadoPago.accessToken}`,
    },
    body: JSON.stringify(preference),
  });
  
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
}
```

### Opcao 2: Vercel Serverless Functions

Crie `api/create-preference.js`:

```javascript
// api/create-preference.js
import { CONFIG } from '../assets/js/config.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { items, customer } = req.body;
  
  const preference = {
    items: items.map(item => ({
      title: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      currency_id: CONFIG.mercadoPago.currency,
    })),
    payer: {
      name: customer.name,
      email: customer.email,
    },
    back_urls: {
      success: `${CONFIG.siteUrl}/confirmacao.html`,
      failure: `${CONFIG.siteUrl}/index.html`,
      pending: `${CONFIG.siteUrl}/index.html`,
    },
    auto_return: "approved",
  };
  
  try {
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.mercadoPago.accessToken}`,
      },
      body: JSON.stringify(preference),
    });
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

## 🎯 Testando o Mercado Pago

1. Preencha as chaves no config.js
2. Adicione itens ao carrinho
3. Clique em "PAGAR COM MERCADO PAGO"
4. Preencha seus dados
5. Voce sera redirecionado para o checkout do Mercado Pago

**Para testar em desenvolvimento:**
- Use as chaves de **teste** do Mercado Pago
- O Mercado Pago tem modo sandbox para testes

## 📊 Customizacoes Adicionais

### Mudar Cores do Tema

No `assets/js/config.js`:

```javascript
theme: {
  bgDark: "#0a0a0a",      // Cor de fundo escuro
  bgCard: "#151515",      // Cor dos cards
  bgInput: "#1a1a1a",      // Cor dos inputs
  border: "rgba(255,255,255,0.1)",  // Cor das bordas
  text: "white",           // Cor do texto
  textMuted: "rgba(255,255,255,0.6)", // Texto secundario
  primary: "#25D366",     // Cor principal (verde WhatsApp)
  primaryDark: "#20bd5a",  // Cor principal escura
  accent: "#FF3B30",       // Cor de destaque (vermelho)
}
```

### Mudar Precos

```javascript
productPrice: 99.90,    // Preco unitario
oldPrice: 199.90,       // Preco anterior
combo2Price: 179.90,    // Preco combo 2
combo3Price: 259.90,    // Preco combo 3
```

### Mudar WhatsApp

```javascript
whatsappNumber: "5511990147835",
whatsappMessage: "Ol%C3%A1%20VALOROSA%20!%20...",
```

## 🔐 Seguranca

1. **Nunca exponha seu accessToken no frontend em producao**
2. Use variaveis de ambiente para as chaves
3. Para Cloudflare Pages, use:
   ```bash
   # No terminal antes de deploy
   export MERCADO_PAGO_PUBLIC_KEY="sua-public-key"
   export MERCADO_PAGO_ACCESS_TOKEN="seu-access-token"
   ```
4. No config.js:
   ```javascript
   publicKey: process.env.MERCADO_PAGO_PUBLIC_KEY || "...",
   accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || "...",
   ```

## 📚 Recursos Uteis

- [Documentacao Mercado Pago](https://developers.mercadopago.com.br/pt-br/docs)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

## 🙏 Suporte

Se precisar de ajuda:
- Configuracao do Mercado Pago
- Deploy no Cloudflare Pages
- Customizacao do design
- Adicao de novas funcionalidades

Basta me chamar que eu te ajudo! 🚀

---

**Criado por:** Arena.ai
**Versao:** 1.0.0
**Data:** 2026-10-16
