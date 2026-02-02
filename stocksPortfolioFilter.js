// ==UserScript==
// @name         Neopets: Stocks Portfolio Filter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds links to quickly switch between pets while fishing
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/stocksPortfolioFilter.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/stocksPortfolioFilter.js
// @match        *://*.neopets.com/stockmarket.phtml?type=portfolio*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Finds all stocks at or above a certain change threshold (configurable)
    - Calculates change based on each share bundle instead of a company's average change
    - Shows the shares list table if any shares reach the threshold
    - Automatically inputs the amount of shares you own when the threshold is met
    - Moves all companies with sellable shares to the top
    - Adds a button to sell shares to the top of the page
    - Focuses that button so you only have to press "Enter"

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// The minimum value under "Change %" to allow selling of the stock. '.0' is optional.
const minimumChange = 100.0;

const isMinumumChange = element => parseFloat(element.textContent.match(/-?\d+\.?\d+/)[0]) >= minimumChange;

const travelUpParents = (element, depth) => (depth === 0) ? element : travelUpParents(element.parentElement, depth - 1);

const selectAllShares = row => row.getElementsByTagName('input')[0].value = row.querySelector('td:first-child').textContent.replace(',', '');

const activateSubmenu = (table, mainRow, sellRow) => {
    table.children[1].insertAdjacentElement('afterEnd', sellRow);
    table.children[1].insertAdjacentElement('afterEnd', mainRow);
    sellRow.style.display = 'revert';
    mainRow.children[0].children[0].src = 'https://images.neopets.com/stockmarket/disclosure_open.gif';
}

const addSubmitButton = table => {
    const input = document.createElement('input');
    input.type = 'submit';
    input.value = 'Sell Shares';
    input.style.display = 'block';
    input.style.margin = 'auto';
    table.parentElement.insertAdjacentElement('beforeBegin', input);
    input.focus();
}

const findSellableShares = table => {
    [...table.querySelectorAll('& > tr[bgcolor] + tr tr:not([bgcolor])')]
        .filter(row => isMinumumChange(row.getElementsByTagName('font')[0]))
        .forEach(row => {
            selectAllShares(row);
            const sellRow = travelUpParents(row, 4);
            const mainRow = sellRow.previousElementSibling;
            activateSubmenu(table, mainRow, sellRow);
        })
}

(function() {
    'use strict';
    const table = document.querySelector('table[border="1"][align="center"] > tbody');
    findSellableShares(table);
    document.getElementById('show_sell').style.display = 'block';
    addSubmitButton(table);
})();
