import { HOWTO, CREDITS, SIGNOFF } from './data/extras'

export function initExtras() {
  document.querySelector('#howto')!.innerHTML = `<div class="how"><h2 class="hwt">How to use this</h2><ol class="hws">${HOWTO.map((h, i) => `<li style="--r:${i % 2 ? 1.4 : -1.4}deg"><span>${i + 1}</span><b>${h.t}</b><p>${h.p}</p></li>`).join('')}</ol></div>`
  document.querySelector('#credits')!.innerHTML = `<div class="cr"><h2>Credits</h2>${CREDITS.map((c) => `<p>${c}</p>`).join('')}<p class="sig">${SIGNOFF}</p></div>`
}
