// main.js - ponto de entrada do app
import { qs } from './utils.js';
import { Cart, renderCart, bindCartEvents } from './cart.js';
import { PRODUCTS, renderCatalog, bindCatalogControls } from './catalog.js';
import { openProductModal, bindModalEvents } from './modal.js';
import { bindCheckout } from './checkout.js';

// Inicialização
const cart = new Cart();

// Re-render sempre que o carrinho mudar
cart.onChange = () => {
  renderCart(cart);
  // Atualizar resumo do checkout se estiver aberto
  if (!document.querySelector('#checkout').hidden) {
    // Rebind simples para atualizar totals via bindCheckout internamente
    // (como o bindCheckout monta o resumo com base no estado atual do carrinho, chamá-lo novamente é suficiente)
    bindCheckout(cart);
  }
};

// Render inicial
renderCatalog();
renderCart(cart);

// Controles do catálogo
bindCatalogControls({
  onAdd: (product) => { cart.add(product, 1); },
  onDetails: (product) => openProductModal(product, (p) => cart.add(p, 1))
});

// Modal
bindModalEvents();

// Carrinho
bindCartEvents(cart);

// Checkout
bindCheckout(cart);

// Abertura do carrinho ao pressionar Alt+C (acessibilidade)
window.addEventListener('keydown', (e) => {
  if (e.altKey && (e.key === 'c' || e.key === 'C')) {
    qs('#cart-dialog').showModal();
  }
});
