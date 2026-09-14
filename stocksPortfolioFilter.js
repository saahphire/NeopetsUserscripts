// ==UserScript==
// @name         Neopets: Stocks Portfolio Filter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
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
    Update: The script now allows you to set a minimum price (like the usual 60). To filter by **change %**, set
    minimumChange to the desired value (anything but 0). To filter by **price**, set minimumChange to 0 and minimumPrice
    to your desired price threshold. If minimumChange is not 0, minimumPrice will be ignored.

    This script does the following:
    - Finds all stocks at or above a certain change or price threshold (configurable)
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
// Set to 0 if you want to use a minimum price instead.
const minimumChange = 100.0;

// The minimum price of each stock to allow selling of the stock.
const minimumPrice = 60;

const isMinumumChange = row => parseFloat(row.getElementsByTagName('font')[0].textContent.match(/-?\d+\.?\d+/)[0]) >= minimumChange;

const isMinimumPrice = (row, columnIndex) => parseInt(row.getElementsByTagName('td')[columnIndex].textContent) >= minimumPrice;

const travelUpParents = (element, depth) => (depth === 0) ? element : travelUpParents(element.parentElement, depth - 1);

const selectAllShares = row => row.getElementsByTagName('input')[0].value = row.querySelector('td:first-child').textContent.replace(',', '');

const findPriceColumnIndex = table => {
    const columnNames = [...table.querySelectorAll('tr:nth-child(2) td')];
    const normalIndex =  columnNames.findIndex(columnName => columnName.textContent === 'Current Price');
    // I don't know if any script renames it to just "Price", but just to be safe...
    return normalIndex > -1 ? normalIndex : columnNames.findIndex(columnName => columnName.textContent === 'Price');
}

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
    const columnIndex = findPriceColumnIndex(table);
    const isMinimum = minimumChange ? isMinumumChange : isMinimumPrice;
    [...table.querySelectorAll('& > tr[bgcolor] + tr tr:not([bgcolor])')]
        .filter(row => isMinimum(row, columnIndex))
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
