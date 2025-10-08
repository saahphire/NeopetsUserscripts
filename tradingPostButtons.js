// ==UserScript==
// @name         Neopets: Trading Post NM & Other Trades Buttons
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a button to neomail a Trading Post user and another to see their other trades
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/tradingPostButtons.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/tradingPostButtons.js
// @match        *://*.neopets.com/island/tradingpost.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    This script adds two buttons to the right of every username in the Trading Post
    1. A button to see the user's other trades
    2. A button to neomail the user
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
*/

const buttons = [
    {
        urlPrefix: 'https://www.neopets.com/neomessages.phtml?type=send&recipient=',
        image: 'https://images.neopets.com/themes/h5/basic/images/v3/neomail-icon.svg',
        alt: 'Neomail user'
    },
    {
        urlPrefix: 'https://www.neopets.com/island/tradingpost.phtml?type=browse&criteria=owner&search_string=',
        image: 'https://images.neopets.com/themes/h5/basic/images/tradingpost-icon.png',
        alt: 'Other trades by user'
    }
];

(function() {
    'use strict';
    document.querySelectorAll("table[align='left'] td:first-child b + a").forEach(usernameAnchor => {
        const username = usernameAnchor.textContent;
        buttons.forEach(button => {
            const a = document.createElement("a");
            a.href = button.urlPrefix + username;
            usernameAnchor.insertAdjacentElement("afterEnd", a);
            const img = document.createElement("img");
            img.src = button.image;
            img.title = img.alt = button.alt;
            img.style.width = img.style.height = "1em";
            img.style.marginLeft = "0.5em";
            a.appendChild(img);
        })
    })
})();
