// cart.js - lógica do carrinho
import { formatCurrency, saveLS, readLS, el, qs } from './utils.js';

export class CartItem {
  constructor(product, qty = 1) {
    this.id = product.id;
    this.name = product.name;
    this.price = product.price;
    this.image = product.image;
    this.qty = qty;
  }
}

export class Cart {
  #items = new Map();
  #key = 'cart:v1';

  constructor() {
    const data = readLS(this.#key, []);
    for (const it of data) this.#items.set(it.id, Object.assign(new CartItem(it, it.qty), it));
  }

  toArray() { return Array.from(this.#items.values()); }
  count() { return this.toArray().reduce((a, i) => a + i.qty, 0); }
  subtotal() { return this.toArray().reduce((a, i) => a + i.price * i.qty, 0); }
  total() { return this.subtotal(); }

  add(product, qty = 1) {
    const it = this.#items.get(product.id);
    if (it) it.qty += qty; else this.#items.set(product.id, new CartItem(product, qty));
    this.#persist();
  }

  update(id, qty) {
    const it = this.#items.get(id);
    if (!it) return;
    it.qty = Math.max(1, qty|0);
    this.#persist();
  }

  remove(id) {
    this.#items.delete(id);
    this.#persist();
  }

  clear() { this.#items.clear(); this.#persist(); }

  #persist() { saveLS(this.#key, this.toArray()); this.onChange?.(this); }
}

// Renderização do carrinho no dialog
export const renderCart = (cart) => {
  const cont = qs('#cart-items');
  cont.innerHTML = '';
  for (const item of cart.toArray()) {
    const row = el('div', { className: 'cart-item' }, [
      el('img', { alt: item.name, src: item.image }),
      el('div', {}, [
        el('strong', { textContent: item.name }),
        el('div', { className: 'muted', textContent: formatCurrency(item.price) }),
        el('div', { className: 'qty' }, [
          el('label', { className: 'sr-only', htmlFor: `qty-${item.id}`, textContent: 'Quantidade' }),
          el('input', { id: `qty-${item.id}`, type: 'number', min: 1, value: item.qty, 'data-id': item.id })
        ])
      ]),
      el('button', { className: 'icon-btn', 'data-remove': item.id, title: 'Remover' }, ['🗑️'])
    ]);
    cont.appendChild(row);
  }
  qs('#cart-subtotal').textContent = formatCurrency(cart.subtotal());
  qs('#cart-total').textContent = formatCurrency(cart.total());
  qs('#cart-count').textContent = cart.count();
};

export const bindCartEvents = (cart) => {
  const dialog = qs('#cart-dialog');

  // Abrir/fechar
  qs('#btn-open-cart').addEventListener('click', () => dialog.showModal());

  // Delegação de eventos para quantidade e remover
  qs('#cart-items').addEventListener('input', (e) => {
    const input = e.target.closest('input[type="number"]');
    if (!input) return;
    const id = input.getAttribute('data-id');
    const qty = parseInt(input.value || '1', 10);
    cart.update(id, qty);
    renderCart(cart);
  });

  qs('#cart-items').addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-remove]');
    if (!btn) return;
    cart.remove(btn.getAttribute('data-remove'));
    renderCart(cart);
  });

  // Ir para checkout
  qs('#btn-go-checkout').addEventListener('click', () => {
    document.querySelector('#checkout').hidden = false;
    dialog.close();
    window.scrollTo({ top: document.querySelector('#checkout').offsetTop - 20, behavior: 'smooth' });
  });
};
