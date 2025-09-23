'use strict';


// ======= Utilidades =======
const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const byId = (id) => document.getElementById(id);

// ======= Estado =======
class CartItem {
  constructor(product, qty = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.qty = qty;
    this.image = product.images[0];
  }
}

// Carrinho 
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

// ======= Seletores =======
const productsEl = byId('products');
const openCartBtn = byId('open-cart');
const cartAside = byId('cart');
const closeCartBtn = byId('close-cart');
const cartItemsEl = byId('cart-items');
const cartSubtotalEl = byId('cart-subtotal');

// Controles de catálogo
const searchEl = byId('search');
const filterCategoryEl = byId('filter-category');
const sortEl = byId('sort');

// Modal de detalhes
const productModal = byId('product-modal');
const modalTitle = byId('modal-title');
const modalDesc = byId('modal-desc');
const modalPrice = byId('modal-price');
const modalMainImg = byId('modal-main-img');
const modalThumbs = byId('modal-thumbs');
const modalAddCart = byId('modal-add-cart');

// ======= Interações =======

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
  const btn = e.target.closest('button[data-action="add"]');
  if (!btn) return;
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
    // Preenche modal com dados do botão
    const name = btn.dataset.name;
    const price = Number(btn.dataset.price);
    const desc = btn.dataset.desc  '';
    const images = (btn.dataset.images  '').split(',').map(s => s.trim()).filter(Boolean);
    modalTitle.textContent = name;
    modalDesc.textContent = desc;
    modalPrice.textContent = brl(price);
    modalMainImg.src = images[0]  '';
    modalMainImg.alt = name;
    // Mini-galeria
    modalThumbs.innerHTML = '';
    images.forEach((src, idx) => {
      const t = document.createElement('img');
      t.src = src; t.alt = ${name} miniatura ${idx+1};
      t.style.width = '64px'; t.style.height = '48px'; t.style.objectFit = 'cover'; t.style.border = '1px solid #e5e7eb'; t.style.borderRadius = '6px';
      t.addEventListener('click', () => { modalMainImg.src = src; });
      modalThumbs.appendChild(t);
    });
    // Guardar produto atual no botão de adicionar do modal
    modalAddCart.dataset.id = btn.dataset.id;
    modalAddCart.dataset.name = name;
    modalAddCart.dataset.price = String(price);
    modalAddCart.dataset.image = images[0]  '';
    if (typeof productModal?.showModal === 'function') productModal.showModal();
    else productModal?.setAttribute('open', '');
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

// ======= Inicialização =======
function initEvents() {
  productsEl?.addEventListener('click', onProductsClick);

  openCartBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);
  cartItemsEl?.addEventListener('click', onCartClick);
  cartItemsEl?.addEventListener('change', onCartChange);
}

function init() {
  renderCart();
  updateCartBadge();
  initEvents();
}

document.addEventListener('DOMContentLoaded', init);