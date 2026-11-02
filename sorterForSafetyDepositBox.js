// ==UserScript==
// @name         Neopets: Sorter for Safety Deposit Box
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.1
// @description  [UPDATED FOR NEW NEW SDB] Adds type and itemDB price sorting options to the Safety Deposit Box's "Sort by" dropdown
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
    "itemdb - Safety Deposit Box Pricer" script (v2.1.1+) to sort by price:
    https://itemdb.com.br/articles/userscripts

    Updated for October 2026's SDB update

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getType = (el) => el.getElementsByClassName('sdb-item-meta')[0]?.textContent.trim();
const getPrice = (el) => parseInt(el.querySelector('img[src="https://itemdb.com.br/logo_icon.svg"] + div a')?.textContent.replaceAll(/\D/g, ''));

const options = {
    'type': {
        sorter: (a, b) => getType(a)?.localeCompare(getType(b)),
        text: 'Type',
        asc: 'A-Z',
        desc: 'Z-A'
    },
    'price': {
        sorter: (a, b) => getPrice(a) - getPrice(b),
        text: 'Price',
        asc: 'Low–High',
        desc: 'High-Low'
    }
}

const sortOrder = (a, b, asc) => asc ? [a, b] : [b, a];

const onSelectChange = (e) => {
    const [sort, order] = document.querySelectorAll('.sdb-sort-panel-row .sdb-select');
    const selectedOption = sort.selectedOptions[0];
    if(!selectedOption.classList.contains('saahphire-sdb-sorter')) return;
    e.stopImmediatePropagation();
    const opt = options[selectedOption.value];
    const isAscending = order.selectedOptions[0].value === 'asc';
    const parent = document.querySelector('.sdb-table tbody');
    const rows = document.querySelectorAll('.sdb-row-odd, .sdb-row-even'); // Do they not know about nth-child??? I'm dying
    const sorter = opt.sorter;
    [...rows].sort((a, b) => sorter(...sortOrder(a, b, isAscending))).forEach(row => parent.appendChild(row));
    document.querySelector('.sdb-sort-btn-prefix + span').textContent = `${opt.text} (${isAscending ? opt.asc : opt.desc})`;
}

const createOption = (id) => {
    const option = document.createElement('option');
    option.value = id;
    option.classList.add('saahphire-sdb-sorter');
    option.textContent = options[id].text;
    return option;
}

const addSelectOptions = () => {
    const selects = document.querySelectorAll('.sdb-sort-panel-row .sdb-select');
    if(!selects.length) return;
    selects.forEach(select => select.addEventListener('change', onSelectChange, true));
    Object.keys(options).forEach(id => selects[0].appendChild(createOption(id)));
}

const watchSortWrap = () => {
    const wrap = document.getElementsByClassName('sdb-sort-wrap')[0];
    const observer = new MutationObserver(addSelectOptions);
    observer.observe(wrap, {childList: true});
}

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', `<style>
        #sdb-inner:not(:has(img[src="https://itemdb.com.br/logo_icon.svg"][width="20px"])) option[value*="price"] {
            display: none;
        }
    </style>`);
    watchSortWrap();
})();
