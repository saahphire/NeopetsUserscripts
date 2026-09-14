// ==UserScript==
// @name         Neopets: NeoLogin Cookie Copier
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
// @description  DOES NOT WORK ANYMORE but I have a guide for the new (manual) way if you need it
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/Unsupported/neologinCookieCopier.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/Unsupported/neologinCookieCopier.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script DOES NOT work anymore. Working is impossible. TNT changed the site so grabbing your cookies through
    JavaScript is impossible. This is now preserved in case anyone wants to see the code. It no longer does anything.

    If you need your Neopets neologin cookie, please follow these instructions:
    - Open your cookies in DevTools. Every browser has its own way, but you can find that on Google. It's usually like:
        - Press F12 or Shift+Esc (Opera GX has F12 set as the panic button, if you press it don't panic and just press
          it a second time)
        - Open Storage, or Application, or something that looks like it has data inside, or just go searching each tab
        - Find the Cookies dropdown menu or section or whatever has "Cookies" written in it
    - Open your https://www.neopets.com/ cookies
    - neologin is right there! Double click on the value and copy it
    - Now you have something like: saahphire%2Bhf87u90bht0h347tghbf9083w4ht (keysmash, not my actual cookie lol)
    - Replace it here:
document.cookie += "neologin=REPLACECOOKIEVALUEHERE"
    - Copy exactly the line above this one (after replacing the cookie value)
    - Paste it in the Console part of your target browser's DevTools
    - Success! You're logged in!
    - Never ever share your neologin cookie. Ever. No matter what. Blur it out, replace it with a keysmash, but don't
      share it.
    
    If you want to know how the change happened, neologin has been changed to a HttpOnly cookie. Here you go:
    https://dev.to/mohsenfallahnjd/understanding-httponly-cookies-in-depth-10oc
    As for the why, it's way more secure. Userscripts can't steal your login information as easily anymore.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

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
/*
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
*/
