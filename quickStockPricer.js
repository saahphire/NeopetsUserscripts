// ==UserScript==
// @name         Neopets: Quick Stock Pricer
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.3.0
// @description  Adds itemDB prices to your Quick Stock page. Updated for the API changes and the new Quick Stock!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/quickStockPricer.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/quickStockPricer.js
// @match        *://*.neopets.com/quickstock.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @require      https://update.greasyfork.org/scripts/567036/1759045/itemDB%20Fetch%20Lib.js
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    The other Quick Stock Pricer isn't updated for itemDB's API changes yet, meaning it'll stop working soon.
    This script adds prices to a new line in each item name, sourced by itemDB. Please keep in mind you must open itemDB
    at least once every 24h (without logging in) or 14 days (logging in) in the same device you use this userscript in.
    This is due to their API policies, that have changed in March 2026.

    https://itemdb.com.br/contribute

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getItemName = (cell) => cell.childNodes[0].childNodes[0].textContent;

const addInfoToCell = (info) => {
    const p = document.createElement('p');
    p.textContent = `${info.price.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NP`;
    p.dataset.price = info.price.value;
    p.title = new Date(info.price.addedAt).toLocaleString();
    if(info.price.inflated) p.classList.add('saahphire-quickstockpricer-inflated');
    p.classList.add(`saahphire-quickstockpricer-${info.saleStatus.status}`);
    return p;
}

const css = `<style>
.saahphire-quickstockpricer-hts, .saahphire-quickstockpricer-ets, .saahphire-quickstockpricer-regular {
    margin: 0;
    &::after {
        font-weight: 600;
        font-size: 0.8em;
        margin-left: 1em;
    }
}
.saahphire-quickstockpricer-hts::after {
    content: "HTS";
    color: red;
}
.saahphire-quickstockpricer-ets::after {
    content: "ETS";
    color: green;
}
</style>`;

(async function() {
    'use strict';
    window.postMessage('Saahphire Quick Stock Pricer here');
    const cells = document.querySelectorAll('tr:not(:last-child) td.text-left:first-child');
    const names = [...cells].map(getItemName);
    if(!names.length) return;
    const response = await fetch(`https://itemdb.com.br/api/v1/items/many?name[]=${names.join('&name[]=')}`, {credentials: 'include'});
    const items = await response.json();
    cells.forEach(cell => cell.appendChild(addInfoToCell(items[getItemName(cell)])));
    document.head.insertAdjacentHTML('beforeend', css);
})();
