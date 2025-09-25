'use strict';
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

// elementos ui
const cartCountEl = document.getElementById('cart-count');
const cartItemsEl = document.getElementById('cart-items');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartTotalEl = document.getElementById('cart-total');

// atualiza ui
function updateCartUI() {
  cartCountEl.textContent = cart.count();
  cartSubtotalEl.textContent = `R$ ${cart.subtotal().toFixed(2)}`;
  cartTotalEl.textContent = `R$ ${cart.subtotal().toFixed(2)}`;

  cartItemsEl.innerHTML = '';
  cart.items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}">
      <div>
        <strong>${item.name}</strong>
        <div class="price">R$ ${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="qty">
        <input type="number" min="1" value="${item.qty}">
        <button class="icon-btn remove">✕</button>
      </div>
    `;

    // atualizar quantidade
    div.querySelector('input').addEventListener('change', e => {
      cart.setQty(item.id, parseInt(e.target.value));
      updateCartUI();
    });

    // remover item
    div.querySelector('.remove').addEventListener('click', () => {
      cart.remove(item.id);
      updateCartUI();
    });

    cartItemsEl.appendChild(div);
  });
}
