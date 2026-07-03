// ==UserScript==
// @name         Neopets: Shop Condenser
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
// @description  Condenses your shop's view. Removes useless elements.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/shopCondenser.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/shopCondenser.js
// @match        *://*.neopets.com/market.phtml?*type=*
// @match        *://*.neopets.com/browseshop.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @run-at       document-idle
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Removes:
        - The big image at the top
        - The Marketplace is where you can...
        - Shopkeeper's picture and greeting in the stock page
        - Item descriptions
        - Please clear your Sales History regularly to save space on the Neopets servers! :)
        - Only purchases of 1000 NP or greater will be displayed here.
        - Jump to:
        - Empty space between items and footer
    - Changes:
        - Your Price (max 999,999) => Price
        - Renames "Jump to:" links so the buttons will be smaller
        - Makes item images smaller
        - Everything beneath the Stock table is now one single footer row

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/
const jumpToStrings = {
    'Browse Shops': 'Browse',
    'Create/Edit Your Shop': 'Edit',
    'Shop Stock': 'Stock',
    'Shop Till': 'Till',
    'Sales History': 'Sales',
    'Safety Deposit Box': 'SDB',
    'Item Gallery': 'Gallery'
}

const css = `<style>
h1,
#mkt-instructions,
#navsub-buffer__2020,
.mkt-banner,
.mkt-subnav__label,
.bsp-subnav__label,
.mkt-page:has(.market-your-search__input) > b,
.mkt-page:has(.market-your-search__input) :is(p, center, td:nth-child(2), th:nth-child(2)),
.mkt-page:has(table[align="center"]) p,
.mkt-page:has(table[align="center"]) > b,
.market-your-item__meta {
    display: none!important;
}

.market-your-item__name:hover ~ .market-your-item__meta {
    display: block;
}

.market-your-item__img {
    width: 24px!important;
    height: 24px!important;
}

.text-left {
    padding: 4px!important;
}

.market-your-headerbar {
    gap: 1em;
}

.market-your-pin-row {
    margin: 0!important;
}

.market-your-submit-row {
    justify-content: space-between!important;
    padding: 4px!important;
}
</style>`;

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    document.querySelectorAll('.mkt-subnav a, .bsp-subnav a').forEach(a => {
        const newString = jumpToStrings[a.textContent];
        if(newString) a.textContent = newString;
    });
    document.querySelector('.mkt-page:has(.market-your-search__input)')?.childNodes[4].remove();
    document.getElementsByClassName('market-your-headerbar')[0]?.append(document.getElementsByClassName('shop-feed-meta')[0]);
    const submit = document.getElementsByClassName('market-your-submit-row')[0];
    if(submit) {
        submit.prepend(document.getElementsByClassName('shop-feed-meta')[1]);
        const pinRow = document.getElementsByClassName('market-your-pin-row')[0];
        if(pinRow) submit.appendChild(pinRow);
    }
    if(!document.getElementsByClassName('market-your-metarow')[0].children.length) document.getElementsByClassName('market-your-toolbar--foot')[0].remove();
    const price = document.getElementsByClassName('market-your__col-cost')[0];
    if(price) price.textContent = 'Price';
})();
