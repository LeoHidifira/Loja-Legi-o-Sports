/**
 * js/app.js
 * Entry point do frontend.
 * Importa e inicializa todos os módulos.
 */
import { initLoja }     from './loja.js';
import { initCheckout } from './checkout.js';
import './admin.js';
import { goView, toast } from './utils.js';

/* Expõe goView globalmente para uso inline no HTML */
window.goView    = goView;
window.initCheckout = initCheckout;

document.addEventListener('DOMContentLoaded', async () => {
  await initLoja();
});