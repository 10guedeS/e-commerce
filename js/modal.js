'use strict';

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
  
}
