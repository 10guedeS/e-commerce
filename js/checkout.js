'use strict';

// elementos
const formEl = document.getElementById('checkout-form');
const cepEl = document.getElementById('cep');
const ruaEl = document.getElementById('rua');
const numeroEl = document.getElementById('numero');
const bairroEl = document.getElementById('bairro');
const cidadeEl = document.getElementById('cidade');
const ufEl = document.getElementById('uf');
const statusEl = document.getElementById('cep-status');
const checkoutSection = document.getElementById('checkout');
const checkoutItemsEl = document.getElementById('checkout-items');
const checkoutTotalEl = document.getElementById('checkout-total');
const submitBtn = document.querySelector('#checkout-form button[type="submit"]');
const successDialog = document.getElementById('success-dialog');

function setStatus(message, type = 'info') {
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.className = `aria-status ${type}`;
}

function onlyDigits(str) {
  return (str || '').replace(/\D+/g, '');
}

function maskCEP(value) {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function fillAddress({ logradouro, bairro, localidade, uf }) {
  if (ruaEl) ruaEl.value = logradouro || '';
  if (bairroEl) bairroEl.value = bairro || '';
  if (cidadeEl) cidadeEl.value = localidade || '';
  if (ufEl) ufEl.value = uf || '';
}

function clearAddress() {
  if (ruaEl) ruaEl.value = '';
  if (bairroEl) bairroEl.value = '';
  if (cidadeEl) cidadeEl.value = '';
  if (ufEl) ufEl.value = '';
}

async function fetchViaCEP(cepDigits) {
  const url = `https://viacep.com.br/ws/${cepDigits}/json/`;
  setStatus('Consultando CEP...', 'info');
  try {
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    if (data?.erro) {
      setStatus('CEP não encontrado. Preencha manualmente.', 'warning');
      clearAddress();
      if (ruaEl) ruaEl.focus();
      return;
    }
    fillAddress(data);
    setStatus('Endereço preenchido com sucesso. Informe o número.', 'success');
    if (numeroEl) numeroEl.focus();
  } catch (err) {
    console.error('[ViaCEP] Falha: ', err);
    setStatus('Falha ao consultar CEP. Verifique sua conexão e preencha manualmente.', 'error');
  }
}

function onCepInput(e) {
  const masked = maskCEP(e.target.value);
  if (e.target.value !== masked) e.target.value = masked;
  const digits = onlyDigits(masked);
  if (digits.length === 8) {
    fetchViaCEP(digits);
  } else if (digits.length < 8) {
    setStatus('Digite 8 dígitos para buscar no ViaCEP', 'info');
  }
}

function validateForm() {
  if (cart.items.length === 0) {
    alert('Seu carrinho está vazio.');
    return false;
  }
  const missing = [];
  if (!ruaEl?.value) missing.push('Rua');
  if (!numeroEl?.value) missing.push('Número');
  if (!cidadeEl?.value) missing.push('Cidade');
  if (!ufEl?.value) missing.push('UF');
  if (missing.length) {
    setStatus(`Preencha: ${missing.join(', ')}.`, 'error');
    (numeroEl?.value ? ruaEl : numeroEl)?.focus();
    return false;
  }
  return true;
}

function onSubmit(e) {
  e.preventDefault();
  if (!validateForm()) return;
  setStatus('Compra finalizada! Obrigado.', 'success');
  cart.clear();
  if (typeof updateCartUI === 'function') updateCartUI();
  try { submitBtn && (submitBtn.disabled = true); } catch (_) {}
  if (successDialog) {
    const onClose = () => {
      clearCheckoutUI();
      try { submitBtn && (submitBtn.disabled = false); } catch (_) {}
      successDialog.removeEventListener('close', onClose);
    };
    successDialog.addEventListener('close', onClose);
    if (typeof successDialog.showModal === 'function') successDialog.showModal();
    else successDialog.setAttribute('open', '');
  } else {
    alert('Compra finalizada com sucesso!');
    clearCheckoutUI();
    try { submitBtn && (submitBtn.disabled = false); } catch (_) {}
  }
}

function bindCheckout() {
  cepEl?.addEventListener('input', onCepInput);
  formEl?.addEventListener('submit', onSubmit);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bindCheckout);
} else {
  bindCheckout();
}

function clearCheckoutUI() {
  try {
    formEl?.reset();
  } catch (_) {}
  clearAddress();
  if (cepEl) cepEl.value = '';
  setStatus('', 'info');
  if (checkoutItemsEl) checkoutItemsEl.innerHTML = '';
  if (checkoutTotalEl) checkoutTotalEl.textContent = 'R$ 0,00';
  if (checkoutSection) checkoutSection.hidden = true;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
