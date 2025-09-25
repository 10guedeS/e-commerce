'use strict';
// catalogo

const CATALOG = [
  {
    id: '1',
    name: 'Fone Bluetooth Premium',
    category: 'Acessórios',
    price: 399.90,
    desc: 'Fone over-ear sem fio com cancelamento ativo de ruído e bateria de longa duração.',
    images: ['./assets/fonepremium.jpeg']
  },
  {
    id: '2',
    name: 'Mouse Gamer RGB',
    category: 'Informática',
    price: 149.90,
    desc: 'Mouse ergonômico com 7 botões programáveis e iluminação RGB.',
    images: ['./assets/mouse.png']
  },
  {
    id: '3',
    name: 'Teclado Mecânico TKL',
    category: 'Informática',
    price: 299.90,
    desc: 'Teclado mecânico com switches táteis e layout compacto TKL.',
    images: ['./assets/teclado.jpg']
  },
  {
    id: '4',
    name: 'Câmera Mirrorless Compacta',
    category: 'Fotografia',
    price: 399.00,
    desc: 'Sensor APS-C, foco rápido, perfeita para vídeos e vlogs.',
    images: ['./assets/camera.jpg']
  },
  {
    id: '5',
    name: 'Tripé Leve para Câmeras',
    category: 'Fotografia',
    price: 119.90,
    desc: 'Tripé dobrável de alumínio com altura regulável e bolsa para transporte.',
    images: ['./assets/tripé.webp']
  },
  {
    id: '6',
    name: 'Power Bank 20.000mAh',
    category: 'Acessórios',
    price: 179.90,
    desc: 'Carregador portátil com duas portas USB e carregamento rápido.',
    images: ['./assets/powerb.jpg']
  },
  {
    id: '7',
    name: 'Fone In-Ear com Microfone',
    category: 'Acessórios',
    price: 89.90,
    desc: 'Fones intra-auriculares leves com microfone e controle de volume.',
    images: ['./assets/foneblue.jpg']
  },
  {
    id: '8',
    name: 'Speaker Bluetooth Portátil',
    category: 'Eletrônicos',
    price: 219.90,
    desc: 'Caixa de som portátil com som estéreo e resistência à água.',
    images: ['./assets/speaker.jpg']
  },
  {
    id: '9',
    name: 'Luminária de Mesa LED',
    category: 'Eletrônicos',
    price: 79.90,
    desc: 'Luminária com ajuste de intensidade e temperatura de cor.',
    images: ['./assets/luminaria.png']
  },
  {
    id: '10',
    name: 'Carregador USB-C 25W',
    category: 'Eletrônicos',
    price: 99.90,
    desc: 'Carregador rápido compatível com smartphones e tablets.',
    images: ['./assets/carregador.jpg']
  },
  {
    id: '11',
    name: 'Webcam Full HD',
    category: 'Informática',
    price: 189.90,
    desc: 'Webcam 1080p com microfone embutido e correção automática de luz.',
    images: ['./assets/webcam.jpg']
  },
  {
    id: '12',
    name: 'Smartwatch Fit',
    category: 'Eletrônicos',
    price: 349.90,
    desc: 'Relógio inteligente com monitoramento de atividades e notificações.',
    images: ['./assets/smartwatch.jpg']
  }
];

// helpers
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const fmt = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const debounce = (fn, ms = 200) => {
  let t;
  return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};

// elementos do DOM (espera que existam no HTML)
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const chipsContainer = document.querySelector('.chips');
const resultCountEl = document.getElementById('result-count');

if (!productsGrid) {
  console.warn('[catalog] #products-grid não encontrado');
}

// cria card
function createCard(p) {
  const card = document.createElement('article');
  card.className = 'card';
  card.dataset.id = p.id;
  card.dataset.name = p.name;
  card.dataset.price = p.price;
  card.dataset.category = p.category;
  card.dataset.desc = p.desc || '';
  card.dataset.images = (p.images || []).join(',');

  card.innerHTML = `
    <div class="card__media">
      <img src="${p.images?.[0] || ''}" alt="${p.name}">
      <span class="badge">${p.category}</span>
    </div>
    <div class="card__body">
      <small class="muted">${p.category}</small>
      <h3 class="card__title">${p.name}</h3>
      <p class="card__desc">${p.desc}</p>
    </div>
    <div class="card__footer">
      <strong class="price">${fmt(p.price)}</strong>
      <div class="actions">
        <button type="button" class="btn btn--ghost" data-detail="${p.id}" aria-label="Ver detalhes de ${p.name}">Detalhes</button>
        <button type="button" class="btn-add btn btn--primary" data-add="${p.id}" aria-label="Adicionar ${p.name} ao carrinho">Comprar</button>
      </div>
    </div>
  `;
  return card;
}

// renderiza grid
function renderCatalog() {
  if (!productsGrid) return;
  productsGrid.innerHTML = '';
  for (const p of CATALOG) {
    productsGrid.appendChild(createCard(p));
  }
  filterAndSort(); // aplica estado inicial de filtro/ordem
}

// filtro e ordenação
function filterAndSort() {
  if (!productsGrid) return;

  const term = (searchInput?.value || '').toLowerCase().trim();
  const activeChip = document.querySelector('.chips .chip.is-active');
  const activeCategory = activeChip ? activeChip.dataset.category : '';
  const categoryFilter = (activeCategory === 'all') ? '' : (activeCategory || '');

  const cards = Array.from(productsGrid.querySelectorAll('article.card'));
  const visible = [];

  for (const card of cards) {
    const name = (card.dataset.name || '').toLowerCase();
    const desc = (card.dataset.desc || '').toLowerCase();
    const category = card.dataset.category || '';

    const matchesTerm = !term || name.includes(term) || (desc && desc.includes(term));
    const matchesCategory = !categoryFilter || category === categoryFilter;

    if (matchesTerm && matchesCategory) {
      card.style.display = '';
      visible.push(card);
    } else {
      card.style.display = 'none';
    }
  }

  // ordenação
  const sortVal = sortSelect?.value;
  if (sortVal && visible.length > 1) {
    visible.sort((a, b) => {
      const ap = parseFloat(a.dataset.price || '0');
      const bp = parseFloat(b.dataset.price || '0');
      const an = (a.dataset.name || '').toLowerCase();
      const bn = (b.dataset.name || '').toLowerCase();
      if (sortVal === 'price') return ap - bp;
      if (sortVal === 'name') return an.localeCompare(bn);
      return 0;
    });
    visible.forEach(card => productsGrid.appendChild(card));
  }

  if (resultCountEl) resultCountEl.textContent = `${visible.length} produto(s) encontrado(s)`;
}

// ações do grid
function bindGridActions() {
  if (!productsGrid) return;

  productsGrid.addEventListener('click', (e) => {
    // botão detalhes
    const detailBtn = e.target.closest('[data-detail]');
    if (detailBtn) {
      const id = String(detailBtn.dataset.detail);
      const product = CATALOG.find(p => String(p.id) === id);
      if (product) openProductDialog(product);
      return;
    }

    const addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      const id = String(addBtn.dataset.add);
      const product = CATALOG.find(p => String(p.id) === id);
      if (product) {
        if (typeof cart !== 'undefined' && typeof cart.add === 'function') {
          cart.add(product, 1);
          if (typeof updateCartUI === 'function') updateCartUI();
          else console.debug('[catalog] updateCartUI() não encontrada, verifique cart.js');

          // feedback
          const oldText = addBtn.textContent;
          addBtn.textContent = 'Adicionado!';
          addBtn.disabled = true;
          setTimeout(() => {
            addBtn.textContent = oldText;
            addBtn.disabled = false;
          }, 2000);
        } else {
          console.warn('[catalog] objeto cart não disponível');
        }
      }
      return; // impede propagação para abertura de modal
    }

    // abrir modal ao clicar no card (fora de botões)
    const cardEl = e.target.closest('article.card');
    if (cardEl && !e.target.closest('button')) {
      const id = String(cardEl.dataset.id);
      const product = CATALOG.find(p => String(p.id) === id);
      if (product) openProductDialog(product);
    }
  });
}

// modal de detalhes do produto
const productDialog = document.getElementById('product-dialog');
const pdImage = document.getElementById('pd-image');
const pdThumbs = document.getElementById('pd-thumbs');
const pdCategory = document.getElementById('pd-category');
const pdName = document.getElementById('pd-name');
const pdDesc = document.getElementById('pd-desc');
const pdPrice = document.getElementById('pd-price');
const pdAdd = document.getElementById('pd-add');

function openProductDialog(product) {
  if (!productDialog) return;
  // preenche infos
  pdCategory.textContent = product.category || '';
  pdName.textContent = product.name || '';
  pdDesc.textContent = product.desc || '';
  pdPrice.textContent = fmt(product.price || 0);

  // imagem principal
  const images = product.images && product.images.length ? product.images : [''];
  if (pdImage) {
    pdImage.src = images[0] || '';
    pdImage.alt = product.name || 'Imagem do produto';
  }

  // botão adicionar ao carrinho do modal
  if (pdAdd) {
    pdAdd.onclick = () => {
      if (typeof cart !== 'undefined' && typeof cart.add === 'function') {
        cart.add(product, 1);
        if (typeof updateCartUI === 'function') updateCartUI();
        // feedback rápido
        const old = pdAdd.textContent;
        pdAdd.textContent = '✅ Adicionado!';
        pdAdd.disabled = true;
        setTimeout(() => { pdAdd.textContent = old; pdAdd.disabled = false; }, 1200);
      }
    };
  }

  // abre modal
  if (typeof productDialog.showModal === 'function') productDialog.showModal();
  else productDialog.setAttribute('open', '');
}

// controles externos: busca, sort e chips
function bindControls() {
  if (searchInput) searchInput.addEventListener('input', debounce(filterAndSort, 180));
  if (sortSelect) sortSelect.addEventListener('change', filterAndSort);

  const chips = document.querySelectorAll('.chips .chip');
  if (chips && chips.length) {
    chips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        chips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
        filterAndSort();
      });
    });
  }
}

// init
function initCatalog() {
  renderCatalog();
  bindGridActions();
  bindControls();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCatalog);
} else {
  initCatalog();
}
