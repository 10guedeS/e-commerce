// checkout.js - lógica do checkout e integração ViaCEP
import { qs, ariaStatus, maskCEP, onlyDigits, formatCurrency } from './utils.js';

const VIA_CEP = (cep) => `https://viacep.com.br/ws/${cep}/json/`;

export const bindCheckout = (cart) => {
  const section = qs('#checkout');
  const form = qs('#checkout-form');
  const status = qs('#cep-status');
  const cepInput = qs('#cep');
  const rua = qs('#rua');
  const numero = qs('#numero');
  const bairro = qs('#bairro');
  const cidade = qs('#cidade');
  const uf = qs('#uf');

  // Render resumo
  const items = qs('#checkout-items');
  const total = qs('#checkout-total');
  const renderSummary = () => {
    items.innerHTML = '';
    for (const it of cart.toArray()) {
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span>${it.name} x ${it.qty}</span><strong>${formatCurrency(it.price * it.qty)}</strong>`;
      items.appendChild(row);
    }
    total.textContent = formatCurrency(cart.total());
  };
  renderSummary();

  // Máscara de CEP
  cepInput.addEventListener('input', () => {
    cepInput.value = maskCEP(cepInput.value);
    const digits = onlyDigits(cepInput.value);
    if (digits.length === 8) fetchCEP(digits).catch(() => {/* erros tratados em fetchCEP */});
  });

  async function fetchCEP(cep) {
    ariaStatus(status, 'Consultando CEP...');
    form.classList.add('is-loading');
    try {
      const res = await fetch(VIA_CEP(cep));
      if (!res.ok) throw new Error('Falha de rede');
      const data = await res.json();
      if (data.erro) {
        ariaStatus(status, 'CEP não encontrado. Preencha manualmente.');
        rua.value = ''; bairro.value = ''; cidade.value = ''; uf.value = '';
        numero.focus();
        return;
      }
      // Preencher campos
      rua.value = data.logradouro || '';
      bairro.value = data.bairro || '';
      cidade.value = data.localidade || '';
      uf.value = (data.uf || '').toUpperCase();
      ariaStatus(status, 'Endereço preenchido com sucesso. Informe o número.');
      // Acessibilidade: focar no número
      setTimeout(() => numero.focus(), 0);
    } catch (err) {
      ariaStatus(status, 'Não foi possível consultar o CEP. Verifique sua conexão e preencha manualmente.');
      // manter campos editáveis
    } finally {
      form.classList.remove('is-loading');
    }
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!onlyDigits(cepInput.value).match(/^\d{8}$/)) {
      ariaStatus(status, 'CEP inválido ou incompleto.');
      cepInput.focus();
      return;
    }
    if (!rua.value || !numero.value || !bairro.value || !cidade.value || !uf.value) {
      ariaStatus(status, 'Preencha todos os campos do endereço.');
      return;
    }
    // Sucesso (simulação)
    alert('Pedido realizado com sucesso!');
    cart.clear();
    renderSummary();
    section.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};