// utils.js - funções auxiliares
export const qs = (sel, ctx = document) => ctx.querySelector(sel);
export const qsa = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
export const el = (tag, props = {}, children = []) => {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of children) {
    if (typeof child === 'string') node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export const saveLS = (key, data) => localStorage.setItem(key, JSON.stringify(data));
export const readLS = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};

export const maskCEP = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.replace(/(\d{5})(\d{0,3})/, (m, a, b) => (b ? `${a}-${b}` : a));
};
export const onlyDigits = (value) => value.replace(/\D/g, '');

export const ariaStatus = (container, msg) => { container.textContent = msg; };

export const debounce = (fn, ms = 250) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};
