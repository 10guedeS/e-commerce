// catalog.js - renderização, filtros, ordenação do catálogo
import { qs, qsa, el, formatCurrency, debounce } from './utils.js';

// Mock de produtos (poderia vir de uma API futuramente)
export const PRODUCTS = [
  {
    id: 'cam-01',
    name: 'Câmera DSLR Profissional',
    category: 'Fotografia',
    price: 1899.99,
    stock: 0,
    description: 'Câmera DSLR de 24MP com lente 18-55mm, gravação 4K, estabilização óptica.',
    images: [
      './assets/img-camiseta.jpeg', // usando imagens de exemplo do repositório
      './assets/img-tenis.jpg',
      './assets/img-fone.webp',
      './assets/img-mochila.webp'
    ],
    badges: ['Fora de estoque']
  },
  {
    id: 'fone-01',
    name: 'Fone Bluetooth Premium',
    category: 'Acessórios',
    price: 399.99,
    stock: 25,
    description: 'Fone over-ear sem fio com cancelamento ativo de ruído e bateria de longa duração.',
    images: ['./assets/img-fone.webp', './assets/img-tenis.jpg', './assets/img-mochila.webp'],
    badges: ['Acessórios']
  },
  {
    id: 'note-01',
    name: 'Notebook Gamer Ultra',
    category: 'Informática',
    price: 4299.9,
    stock: 10,
    description: 'Notebook gamer com placa RTX, Intel i7, 16GB RAM e SSD NVMe.',
    images: ['./assets/img-mochila.webp', './assets/img-fone.webp'],
    badges: ['Informática']
  },
  {
    id: 'phone-01',
    name: 'Smartphone Galaxy Pro',
    category: 'Eletrônicos',
    price: 2499.9,
    stock: 15,
    description: 'Smartphone com câmera de 108MP, tela AMOLED de 6.7 polegadas.',
    images: ['./assets/img-tenis.jpg', './assets/img-fone.webp'],
    badges: ['Eletrônicos']
  },
  {
    id: 'watch-01',
    name: 'Smartwatch Fitness Pro',
    category: 'Eletrônicos',
    price: 699.9,
    stock: 20,
    description: 'Monitoramento cardíaco, GPS integrado e até 7 dias de bateria.',
    images: ['./assets/img-mochila.webp', './assets/img-fone.webp'],
    badges: ['Eletrônicos']
  },
  {
    id: 'tablet-01',
    name: 'Tablet Design Pro',
    category: 'Informática',
    price: 1899.0,
    stock: 12,
    description: 'Tela de 11" com alta taxa de atualização e caneta stylus.',
    images: ['./assets/img-tenis.jpg', './assets/img-mochila.webp'],
    badges: ['Informática']
  },
  {
    id: 'cam-02',
    name: 'Câmera Mirrorless Compacta',
    category: 'Fotografia',
    price: 3299.0,
    stock: 5,
    description: 'Sensor APS-C, foco rápido, perfeita para vídeos e vlogs.',
    images: ['./assets/img-camiseta.jpeg', './assets/img-fone.webp'],
    badges: ['Fotografia']
  },
  {
    id: 'acc-01',
    name: 'Mochila para Notebook 15"',
    category: 'Acessórios',
    price: 149.9,
    stock: 40,
    description: 'Mochila leve com compartimento acolchoado e porta USB.',
    images: ['./assets/img-mochila.webp', './assets/img-tenis.jpg'],
    badges: ['Acessórios']
  },
  {
    id: 'acc-02',
    name: 'Camiseta Tech Dry',
    category: 'Acessórios',
    price: 79.9,
    stock: 60,
    description: 'Tecido dry-fit respirável, ideal para o dia a dia e academia.',
    images: ['./assets/img-camiseta.jpeg', './assets/img-tenis.jpg'],
    badges: ['Acessórios']
  }
];

export const state = {
  term: '',
  category: 'all',
  sort: 'name'
};

export const getFiltered = () => {
  const term = state.term.toLowerCase();
  let list = PRODUCTS.filter(p =>
    (state.category === 'all' || p.category === state.category) &&
    (p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term))
  );
  if (state.sort === 'price') list.sort((a,b) => a.price - b.price);
  else list.sort((a,b) => a.name.localeCompare(b.name));
  return list;
};

const productCard = (p) => {
  const unavailable = p.stock === 0;
  return el('article', { className: 'card', 'data-id': p.id }, [
    el('div', { className: 'card__media' }, [
      el('img', { src: p.images[0], alt: p.name }),
      p.badges?.[0] ? el('span', { className: 'badge', textContent: p.badges[0] }) : null
    ]),
    el('div', { className: 'card__body' }, [
      el('small', { className: 'muted', textContent: p.category }),
      el('h3', { className: 'card__title', textContent: p.name }),
      el('p', { className: 'card__desc', textContent: p.description }),
    ]),
    el('div', { className: 'card__footer' }, [
      el('strong', { className: 'price', textContent: formatCurrency(p.price) }),
      el('div', {}, [
        el('button', { className: 'btn btn--ghost', 'data-details': p.id }, ['Detalhes']),
        el('button', { className: 'btn btn--primary', 'data-add': p.id, disabled: unavailable }, [unavailable ? 'Indisponível' : 'Comprar'])
      ])
    ])
  ]);
};

export const renderCatalog = () => {
  const grid = qs('#products-grid');
  const list = getFiltered();
  grid.innerHTML = '';
  for (const p of list) grid.appendChild(productCard(p));
  qs('#result-count').textContent = `${list.length} produtos encontrados`;
};

export const bindCatalogControls = ({ onAdd, onDetails }) => {
  // Busca
  const search = qs('#search-input');
  search.addEventListener('input', debounce(() => { state.term = search.value; renderCatalog(); }, 250));

  // Chips de categoria
  qs('.chips').addEventListener('click', (e) => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    qsa('.chip').forEach(c => c.classList.remove('is-active'));
    btn.classList.add('is-active');
    state.category = btn.dataset.category;
    renderCatalog();
  });

  // Ordenação
  const select = qs('#sort-select');
  select.addEventListener('change', () => { state.sort = select.value; renderCatalog(); });

  // Delegação para ações do card
  qs('#products-grid').addEventListener('click', (e) => {
    const add = e.target.closest('button[data-add]');
    const det = e.target.closest('button[data-details]');
    if (add) onAdd?.(PRODUCTS.find(p => p.id === add.dataset.add));
    if (det) onDetails?.(PRODUCTS.find(p => p.id === det.dataset.details));
  });
};
