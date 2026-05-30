// ==UserScript==
// @name         Neopets: Sorter for Safety Deposit Box
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
// @description  [UPDATED FOR NEW SDB] Adds type and itemDB price sorting options to the Safety Deposit Box's "Sort by" dropdown
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/sorterForSafetyDepositBox.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/sorterForSafetyDepositBox.js
// @match        *://*.neopets.com/safetydeposit.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @run-at       document-idle
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script allows you to sort your SDB by type (Food, Magic Item, etc) and itemDB price. You must install the
    "itemdb - Safety Deposit Box Pricer" script (v1.6.0+) to sort by price:
    https://itemdb.com.br/articles/userscripts

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getType = (el) => el.getElementsByClassName('sdb-item-meta')[0]?.textContent.trim();
const getPrice = (el) => parseInt(el.querySelector('.sdb-item-info a[target="_blank"]')?.textContent.replaceAll(/\D/g, ''));

const options = {
    'type_asc': {
        sorter: (a, b) => getType(a)?.localeCompare(getType(b)),
        text: 'Type (A-Z)'
    },
    'type_desc': {
        sorter: (a, b) => getType(b)?.localeCompare(getType(a)),
        text: 'Type (Z-A)'
    },
    'price_desc': {
        sorter: (a, b) => getPrice(b) - getPrice(a),
        text: 'Price (High-Low)'
    },
    'price_asc': {
        sorter: (a, b) => getPrice(a) - getPrice(b),
        text: 'Price (Low-High)'
    }
}

const onSelectChange = (e) => {
    const selectedOption = e.target.selectedOptions[0];
    if(!selectedOption.classList.contains('saahphire-sdb-sorter')) return;
    e.stopImmediatePropagation();
    const parent = document.querySelector('.sdb-table tbody');
    const rows = document.querySelectorAll('.sdb-row-odd, .sdb-row-even'); // Do they not know about nth-child??? I'm dying
    [...rows].sort(options[selectedOption.value].sorter).forEach(row => parent.appendChild(row));
}

const createOption = (id) => {
    const option = document.createElement('option');
    option.value = id;
    option.classList.add('saahphire-sdb-sorter');
    option.textContent = options[id].text;
    return option;
}

const addSelectOptions = () => {
    const select = document.getElementsByClassName('sdb-select')[2];
    select.addEventListener('change', onSelectChange, true);
    Object.keys(options).forEach(id => select.appendChild(createOption(id)));
}

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', `<style>
        #sdb-inner:not(:has(img[src="https://itemdb.com.br/logo_icon.svg"][width="20px"])) option[value*="price"] {
            display: none;
        }
    </style>`);
    addSelectOptions();
})();
