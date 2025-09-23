'use strict';

// utilidades
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const byId = (id) => document.getElementById(id);

// estado
class CartItem {
  constructor(product, qty = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.qty = qty;
    this.image = product.images[0];
  }
}

// carrinho
class Cart {
  constructor() {
    this.items = [];
  }
  count() { return this.items.reduce((s, it) => s + it.qty, 0); }
  subtotal() { return this.items.reduce((s, it) => s + it.price * it.qty, 0); }
  add(product, qty = 1) {
    const found = this.items.find(i => i.id === product.id);
    if (found) found.qty += qty; else this.items.push(new CartItem(product, qty));
  }
  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
  }
  setQty(id, qty) {
    const it = this.items.find(i => i.id === id);
    if (!it) return;
    it.qty = Math.max(1, qty);
  }
  clear() { this.items = []; }
}

const cart = new Cart();

// seletores
const productsEl = byId('products');
const openCartBtn = byId('open-cart');
const cartAside = byId('cart');
const closeCartBtn = byId('close-cart');
const cartItemsEl = byId('cart-items');
const cartSubtotalEl = byId('cart-subtotal');

// catálogo
const searchEl = byId('search');
const filterCategoryEl = byId('filter-category');
const sortEl = byId('sort');

// modal
const productModal = byId('product-modal');
const modalTitle = byId('modal-title');
const modalDesc = byId('modal-desc');
const modalPrice = byId('modal-price');
const modalMainImg = byId('modal-main-img');
const modalThumbs = byId('modal-thumbs');
const modalAddCart = byId('modal-add-cart');

// checkout 
const checkoutSection = byId('checkout');
const goCheckoutBtn = byId('go-checkout');
const finalizarBtn = byId('finalizar');
const voltarBtn = byId('voltar');
const messagesEl = byId('messages');
const ruaEl = byId('rua');
const numeroEl = byId('numero');
const bairroEl = byId('bairro');
const cidadeEl = byId('cidade');
const ufEl = byId('uf');

// interações

function openCart() {
  cartAside?.classList.add('open');
  cartAside?.setAttribute('aria-hidden','false');
  renderCart();
}
function closeCart() {
  cartAside?.classList.remove('open');
  cartAside?.setAttribute('aria-hidden','true');
}

function onProductsClick(e) {
  const btn = e.target.closest('button');
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'add') {
    const product = {
      id: Number(btn.dataset.id),
      name: btn.dataset.name,
      price: Number(btn.dataset.price),
      images: [btn.dataset.image]
    };
    cart.add(product, 1);
    renderCart();
    return;
  }
  if (action === 'detalhes') {
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);
    const desc = btn.dataset.desc || '';
    const images = (btn.dataset.images || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    modalTitle.textContent = name;
    modalDesc.textContent = desc;
    modalPrice.textContent = brl(price);
    modalMainImg.src = images[0] || '';
    modalMainImg.alt = name;
    // mini-galeria
    modalThumbs.innerHTML = '';
    images.forEach((src, idx) => {
      const t = document.createElement('img');
      t.src = src;
      t.alt = `${name} miniatura ${idx + 1}`;
      t.style.width = '64px';
      t.style.height = '48px';
      t.style.objectFit = 'cover';
      t.style.border = '1px solid #e5e7eb';
      t.style.borderRadius = '6px';
      t.addEventListener('click', () => { modalMainImg.src = src; });
      modalThumbs.appendChild(t);
    });
    // modal: adicionar ao carrinho
    modalAddCart.dataset.id = btn.dataset.id;
    modalAddCart.dataset.name = name;
    modalAddCart.dataset.price = String(price);
    modalAddCart.dataset.image = images[0] || '';
    if (typeof productModal?.showModal === 'function') productModal.showModal();
    else productModal?.setAttribute('open', '');
  }
}

function onCartClick(e) {
  const target = e.target;
  if (target.matches('.remove')) {
    cart.remove(Number(target.dataset.id));
    renderCart();
    return;
  }
  if (target.matches('button[data-action="inc"]')) {
    const id = Number(target.dataset.id);
    const it = cart.items.find(i=>i.id===id);
    cart.setQty(id, (it?.qty||1)+1);
    renderCart();
    return;
  }
  if (target.matches('button[data-action="dec"]')) {
    const id = Number(target.dataset.id);
    const it = cart.items.find(i=>i.id===id);
    cart.setQty(id, Math.max(1, (it?.qty||1)-1));
    renderCart();
    return;
  }
}

function onCartChange(e) {
  if (e.target.matches('input[type="number"][data-id]')) {
    const id = Number(e.target.dataset.id);
    const qty = Number(e.target.value) || 1;
    cart.setQty(id, qty);
    renderCart();
  }
}

// catálogo: busca/filtro/ordem
function filterAndSort() {
  if (!productsEl) return;
  const q = (searchEl?.value || '').toLowerCase().trim();
  const cat = filterCategoryEl?.value || '';
  const cards = Array.from(productsEl.querySelectorAll('article.card'));
  const visible = [];
  cards.forEach(card => {
    const name = (card.dataset.name || '').toLowerCase();
    const category = card.dataset.category || '';
    const match = (!q || name.includes(q)) && (!cat || category === cat);
    card.style.display = match ? '' : 'none';
    if (match) visible.push(card);
  });
  const sortVal = sortEl?.value;
  if (sortVal) {
    visible.sort((a, b) => {
      const ap = parseFloat(a.dataset.price || '0');
      const bp = parseFloat(b.dataset.price || '0');
      const an = (a.dataset.name || '').toLowerCase();
      const bn = (b.dataset.name || '').toLowerCase();
      if (sortVal === 'price_asc') return ap - bp;
      if (sortVal === 'price_desc') return bp - ap;
      if (sortVal === 'name_asc') return an.localeCompare(bn);
      if (sortVal === 'name_desc') return bn.localeCompare(an);
      return 0;
    });
    
    visible.forEach(card => productsEl.appendChild(card));
  }
}

// checkout 
function setMessage(msg, type = 'info') {
  if (!messagesEl) return;
  messagesEl.textContent = msg;
  messagesEl.className = `messages ${type}`;
}

function finalizarCompra() {
  if (cart.items.length === 0) {
    setMessage('Seu carrinho está vazio.', 'warning');
    return;
  }
  if (!ruaEl?.value || !numeroEl?.value || !cidadeEl?.value || !ufEl?.value) {
    setMessage('Preencha rua, número, cidade e UF.', 'error');
    return;
  }
  setMessage('Compra finalizada! Obrigado.', 'success');
  cart.clear();
  renderCart();
}

function goToCheckout() {
  if (!checkoutSection) return;
  checkoutSection.hidden = false;
  closeCart();
  window.scrollTo({ top: checkoutSection.offsetTop, behavior: 'smooth' });
}

function backToCatalog() {
  if (!checkoutSection) return;
  checkoutSection.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateCartBadge() {
  if (openCartBtn) openCartBtn.textContent = `Carrinho (${cart.count()})`;
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  cart.items.forEach(it => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    li.innerHTML = `
      <img src="${it.image}" alt="${it.name}" />
      <div class="info">
        <strong>${it.name}</strong>
        <span>${brl(it.price)}</span>
        <div class="qty">
          <button data-id="${it.id}" data-action="dec" aria-label="Diminuir quantidade">-</button>
          <input type="number" min="1" value="${it.qty}" data-id="${it.id}" aria-label="Quantidade" />
          <button data-id="${it.id}" data-action="inc" aria-label="Aumentar quantidade">+</button>
        </div>
      </div>
      <button class="remove" data-id="${it.id}" aria-label="Remover do carrinho">×</button>`;
    cartItemsEl.appendChild(li);
  });
  cartSubtotalEl.textContent = brl(cart.subtotal());
  updateCartBadge();
}

// inicialização
function initEvents() {
  productsEl?.addEventListener('click', onProductsClick);
  // catálogo
  searchEl?.addEventListener('input', filterAndSort);
  filterCategoryEl?.addEventListener('change', filterAndSort);
  sortEl?.addEventListener('change', filterAndSort);
  // carrinho
  openCartBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);
  cartItemsEl?.addEventListener('click', onCartClick);
  cartItemsEl?.addEventListener('change', onCartChange);
  // modal
  document.addEventListener('click', (e) => {
    if (e.target.matches('#product-modal .close')) productModal?.close?.();
  });
  modalAddCart?.addEventListener('click', () => {
    const product = {
      id: Number(modalAddCart.dataset.id),
      name: modalAddCart.dataset.name,
      price: Number(modalAddCart.dataset.price),
      images: [modalAddCart.dataset.image]
    };
    cart.add(product, 1);
    renderCart();
  });
  // checkout
  goCheckoutBtn?.addEventListener('click', goToCheckout);
  finalizarBtn?.addEventListener('click', finalizarCompra);
  voltarBtn?.addEventListener('click', backToCatalog);
}

function init() {
  renderCart();
  updateCartBadge();
  filterAndSort();
  initEvents();
}

document.addEventListener('DOMContentLoaded', init);