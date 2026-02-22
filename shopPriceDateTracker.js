// ==UserScript==
// @name         Neopets: Shop Price Date Tracker
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Keeps track of the date when you last priced an item in your shop. Allows you to clear prices that have been set too long ago.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/shopPriceDateTracker.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/shopPriceDateTracker.js
// @match        *://*.neopets.com/market.phtml?*type=your*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// @grant        GM.listValues
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    I know "Neopets Usershop Item Price Date Tracker" already exists, but it isn't public and it uses localStorage
    instead of the GM API, which is cross-platform and syncable.

    This script does the following:
    - Remembers when you last edited an item's price
    - Adds a column to your shop stock with the dates
    - Allows you to click the column's header to sort by date
    - Adds the following to the bottom of the shop stock page:
        - A button allowing you to clear all saved data
        - A date picker
        - A button allowing you to set the price of every item in that page to 0 if it was priced before the picked date

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const itemIn = (array, index) => array[(array.length + index) % array.length];

const resetPrices = (dateThresholdTimestamp) => {
    const rows = document.querySelectorAll('[cellpadding="3"] tr:has(.saahphire-stock-date)');
    rows.forEach(row => {
        const priceDate = new Date(row.getElementsByClassName('.saahphire-stock-date')[0].dataset.timestamp);
        if(priceDate.getTime() < dateThresholdTimestamp)
            row.querySelector('[type="text"][name*="cost"]').value = 0;
    });
}

const createClearButton = () => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = 'Clear Date Storage';
    button.addEventListener('click', async () => {
        for (const key in await GM.listValues())
            GM.deleteValue(key);
    });
    return button;
}

const createDateInput = async () => {
    const input = document.createElement('input');
    input.type = 'datetime-local';
    input.value = await GM.getValue('_resetDate', new Date().toISOString().slice(0, -8));
    return input;
}

const updatePriceResetButton = (button, dateValue, isSetup = false) => {
    if(!dateValue.match(/^\d{4}-\d\d-\d\dT\d\d:\d\d$/)) return;
    if(!isSetup) GM.setValue('_resetDate', dateValue);
    button.textContent = `Reset Prices Set Before ${new Date(dateValue).toLocaleString()}`;
    button.role = 'button';
    button.addEventListener('click', () => {
        const threshold = new Date(button.previousElementSibling.value).getTime();
        document.querySelectorAll('[name="view"] + [cellpadding="3"] tr:has(.saahphire-stock-date)').forEach(row => {
            const timestamp = getTimestampFromRow(row);
            if(timestamp < threshold) row.querySelector('input[type="text"][name*="cost"]').value = 0;
        })
    });
}

const createPriceResetButton = (dateInput) => {
    const button = document.createElement('button');
    button.role = 'button';
    updatePriceResetButton(button, dateInput.value, true);
    dateInput.addEventListener('input', () => updatePriceResetButton(button, dateInput.value));
    button.addEventListener('click', () => resetPrices(new Date(dateInput.value).getTime()));
    return button;
}

const insertBottomElements = async () => {
    const div = document.createElement('div');
    document.querySelector('br[clear="all"]').insertAdjacentElement('afterend', div);
    div.appendChild(createClearButton());
    const dateInput = await createDateInput();
    div.appendChild(dateInput);
    div.appendChild(createPriceResetButton(dateInput));
    div.classList.add('saahphire-shop-date-controls');
    div.parentElement.insertAdjacentHTML('afterbegin', `<style>
.saahphire-shop-date-controls {
    display: flex;
    justify-content: center;
    margin-top: 0.5em;
    gap: 1em;
    position: relative;
    z-index: 11;
}
</style>`)
}

const onZeroValue = (cell, slug) => {
    GM.deleteValue(slug);
    cell.textContent = '---';
}

const addNewTimestamp = (dateCell, slug, isZero) => {
    if(isZero) onZeroValue(dateCell, slug);
    else {
        const date = new Date();
        GM.setValue(slug, date.getTime());
        dateCell.dataset.timestamp = date.getTime();
        dateCell.textContent = date.toLocaleString();
    }
}

const getInput = (cell) => cell.querySelector('input[type="text"]');

const initializeTimestamp = async (dateCell, slug, value, isLoad) => {
    if(value === '0') return onZeroValue(dateCell, slug);
    const timestamp = isLoad ? await GM.getValue(slug) : null;
    const date = timestamp ? new Date(timestamp) : new Date();
    dateCell.textContent = date.toLocaleString();
    dateCell.dataset.timestamp = timestamp ?? date.getTime();
    if(!timestamp) GM.setValue(slug, date.getTime());
}

const getSlug = (imageUrl) => itemIn(imageUrl.split('/'), -1).split('.')[0];

const fillDate = async (slug, valueCell) => {
    const valueInput = getInput(valueCell);
    const td = document.createElement('td');
    td.classList.add('saahphire-stock-date');
    valueCell.insertAdjacentElement('afterend', td);
    valueInput.dataset.initialPrice = valueInput.value;
    initializeTimestamp(td, slug, valueInput.value, true);
}

const updateTimestamp = (cell, slug) => {
    const input = getInput(cell);
    if(input.dataset.initialValue === input.value) return;
    input.dataset.initialValue = input.value; // Just in case a no-reload userscript exists
    addNewTimestamp(cell.parentElement.getElementsByClassName('saahphire-stock-date')[0], slug, input.value === '0');
}

const getTimestampFromRow = (row) => parseInt(row.getElementsByClassName('saahphire-stock-date')[0].dataset.timestamp ?? 0);

const createHeader = () => {
    const headers = document.querySelectorAll('[name="view"] + [cellpadding="3"] tr:first-child td');
    const header = document.createElement('td');
    header.textContent = '– Date';
    header.classList.add('saahphire-stock-date-header');
    document.head.insertAdjacentHTML('beforeend', `<style>
.saahphire-stock-date-header {
    font-weight: 600;
    text-align: center;
    background-color: #dddd77;
    cursor: pointer;
}
</style>`);
    [...headers].find(header => header.textContent.match(/Price/)).insertAdjacentElement('afterend', header);
    const directions = ['–', '⇈', '⇊'];
    let currentDirection = 0;
    header.addEventListener('click', () => {
        currentDirection = (currentDirection + 1) % 3;
        header.textContent = `${directions[currentDirection]} Date`;
        [...document.querySelectorAll('[name="view"] + [cellpadding="3"] tr:has(.saahphire-stock-date)')]
            .sort((a, b) => (getTimestampFromRow(a) - getTimestampFromRow(b)) * (currentDirection === 2 ? -1 : currentDirection))
            .forEach(row => headers[0].parentElement.insertAdjacentElement('afterend', row));
    });
}

const makeColumn = () => {
    const valueCells = document.querySelectorAll(`[name="view"] + [cellpadding="3"] td:has([type="text"][name*="cost"])`);
    const cellsAndSlugs = [...valueCells].slice(0, 30).map(cell => [cell, getSlug(cell.parentElement.querySelector('img[height="80"]').src)]);
    cellsAndSlugs.forEach(([cell, slug]) => fillDate(slug, cell));
    document.querySelector('[type="submit"][value="Update"]').addEventListener('click', () => {
        cellsAndSlugs.forEach(([cell, slug]) => updateTimestamp(cell, slug));
    });
    createHeader();
}

(function() {
    'use strict';
    insertBottomElements();
    makeColumn();
})();
