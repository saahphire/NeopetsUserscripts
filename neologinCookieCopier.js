// ==UserScript==
// @name         Neopets: NeoLogin Cookie Copier
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.1
// @description  Adds a cookie button to your username so you can copy your neologin cookie. Do NOT share it!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/neologinCookieCopier.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/neologinCookieCopier.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds a 🍪 cookie button next to the logout link in both the old and beta layouts. Clicking it opens a
    small dialog in which you can choose to copy the command, the full cookie, or only the value of neologin.
    Do NOT share these with anybody! Copying neologins should only be done when trying to login in a browser that can't
    use the NeoPass login.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getNeologin = () => document.cookie.split(';').find(c => c.trim().startsWith('neologin=')).trim();
 
const createButton = (callback, modal) => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = callback();
    if(modal) button.addEventListener('click', () => modal.close());
    else button.addEventListener('click', () => navigator.clipboard.writeText(callback()));
    return button;
}
 
const createModal = () => {
    const modal = document.createElement('dialog');
    document.body.appendChild(modal);
    modal.classList.add('saahphire-cookie-modal');
    const h2 = document.createElement('h2');
    h2.textContent = 'Neologin Copier';
    modal.appendChild(h2);
    const p = document.createElement('p');
    p.textContent = "Select the information you want to copy! If you're not sure what to do with all this, select the biggest one (the one that starts with document.cookie). Then, on your legacy browser (PaleMoon, Safari, SeaMonkey, etc), open the Console by right-clicking anywhere in a page and selecting Inspect Element, or by pressing F12 or Ctrl+Alt+I, and navigating to the Console tab. Paste the content you just copied to the bottom line where you can type and hit enter, then reload any Neopets page!";
    modal.appendChild(p);
    modal.appendChild(createButton(() => `document.cookie = '${getNeologin()};'`));
    modal.appendChild(createButton(() => getNeologin()));
    modal.appendChild(createButton(() => getNeologin().split('=')[1].split(';')[0]));
    const close = createButton(() => 'Close', modal);
    modal.appendChild(close);
    close.classList.add('saahphire-cookie-modal-close');
    return modal;
}
 
const createLink = (modal) => {
    const link = document.createElement('a');
    link.textContent = '🍪';
    link.href = '#';
    link.addEventListener('click', () => modal.showModal());
    link.classList.add('saahphire-cookie-link');
    return link;
}
 
(function() {
    'use strict';
    const modal = createModal();
    const link = createLink(modal);
    const prevLink = document.querySelector('.nav-signout-icon + h3') ?? document.getElementById('logout_link');
    prevLink?.insertAdjacentElement('afterEnd', link);
    document.head.insertAdjacentHTML('beforeend', `<style>
.saahphire-cookie-modal {
    width: 40%;
    justify-content: center;
    flex-direction: column;
    gap: 1em;
    & button {
        width: 100%;
        min-height: 3em;
        word-break: break-word;
        font-size: 0.75em;
    }
    & .saahphire-cookie-modal-close {
        margin: 3em;
        width: auto;
    }
    &[open] {
        display: flex;
    }
}
.saahphire-cookie-link {
    margin-left: 0.5em;
}
</style>`)
})();
