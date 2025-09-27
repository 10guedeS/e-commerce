'use strict';
// integra dialog do carrinho e checkout

(function () {
  const btnOpenCart = document.getElementById('btn-open-cart');
  const cartDialog = document.getElementById('cart-dialog');
  const btnGoCheckout = document.getElementById('btn-go-checkout');

  const checkoutSection = document.getElementById('checkout');
  const checkoutItemsEl = document.getElementById('checkout-items');
  const checkoutTotalEl = document.getElementById('checkout-total');

  function openCartDialog() {
    if (!cartDialog) return;
    if (typeof updateCartUI === 'function') updateCartUI();
    if (typeof cartDialog.showModal === 'function') cartDialog.showModal();
    else cartDialog.setAttribute('open', '');
  }

  function closeCartDialog() {
    if (!cartDialog) return;
    cartDialog.close?.();
    cartDialog.removeAttribute('open');
  }

  function renderCheckoutSummary() {
    if (!checkoutItemsEl || !checkoutTotalEl) return;
    checkoutItemsEl.innerHTML = '';
    cart.items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'summary__item';
      row.innerHTML = `
        <img src="${item.image}" alt="${item.name}" style="width:56px;height:56px;object-fit:cover;border-radius:8px;flex:0 0 56px;" />
        <div class="info">
          <div class="title">${item.name}</div>
          <div class="muted">Qtd: ${item.qty} • ${brl(item.price)}</div>
        </div>
        <strong>${brl(item.price * item.qty)}</strong>
      `;
      checkoutItemsEl.appendChild(row);
    });
    checkoutTotalEl.textContent = brl(cart.subtotal());
  }

  function goToCheckout(e) {
    if (e) e.preventDefault();
    if (!checkoutSection) return;
    if (cart.items.length === 0) {
      alert('Seu carrinho está vazio.');
      return;
    }
    closeCartDialog();
    checkoutSection.hidden = false;
    renderCheckoutSummary();
    window.scrollTo({ top: checkoutSection.offsetTop, behavior: 'smooth' });
  }

  function bindEvents() {
    btnOpenCart?.addEventListener('click', openCartDialog);
    btnGoCheckout?.addEventListener('click', goToCheckout);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindEvents);
  } else {
    bindEvents();
  }

  // sinaliza que o app carregou
  try { window.__appBooted = true; } catch (_) {}
})();
