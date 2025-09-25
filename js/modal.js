// modal.js - modal de detalhes do produto com mini-galeria
import { el, qs, qsa, formatCurrency } from './utils.js';

let currentProduct = null;
let addHandler = null;

const galleryView = (images) => {
  const main = el('div', { className: 'gallery__main' }, [
    el('img', { src: images[0], alt: 'Imagem principal do produto', id: 'gal-main' })
  ]);
  const thumbs = el('div', { className: 'gallery__thumbs' });
  images.forEach((src, i) => thumbs.appendChild(el('img', {
    src,
    alt: `Miniatura ${i+1}`,
    'data-src': src
  })));
  thumbs.addEventListener('click', (e) => {
    const img = e.target.closest('img[data-src]');
    if (!img) return;
    qs('#gal-main').src = img.dataset.src;
  });
  return el('div', { className: 'gallery' }, [main, thumbs]);
};

const detailsView = (p) => el('div', { className: 'details' }, [
  el('h3', { textContent: p.name }),
  el('div', { className: 'muted', textContent: p.category }),
  el('p', { textContent: p.description }),
  el('strong', { className: 'price', textContent: formatCurrency(p.price) })
]);

export const openProductModal = (product, onAdd) => {
  currentProduct = product;
  addHandler = onAdd;
  const body = qs('#modal-body');
  body.innerHTML = '';
  body.appendChild(galleryView(product.images));
  body.appendChild(detailsView(product));
  const dialog = qs('#product-modal');
  dialog.showModal();
};

export const bindModalEvents = () => {
  const dialog = qs('#product-modal');
  qs('#modal-add-to-cart').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentProduct && addHandler) {
      addHandler(currentProduct);
      dialog.close();
    }
  });
};
