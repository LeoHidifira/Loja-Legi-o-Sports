/**
 * js/app.js
 * Entry point — inicializa a loja.
 * O usuário final vê apenas a loja.
 * Admin acessa pelo botão "Admin" no header → login → painel.
 */
import { initLoja }     from './loja.js';
import { initCheckout } from './checkout.js';
import './admin.js';
import { goView } from './utils.js';

window.goView       = goView;
window.initCheckout = initCheckout;

document.addEventListener('DOMContentLoaded', async () => {
  await initLoja();
});