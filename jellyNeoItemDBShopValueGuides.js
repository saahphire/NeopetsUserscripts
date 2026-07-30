// ==UserScript==
// @name         JellyNeo: Use itemDB Prices on Shop Value Guides
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
// @description  Allows you to use JellyNeo's Shop Value Guides with itemDB prices instead of JellyNeo prices for better accuracy.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/jellyNeoItemDBShopValueGuides.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/jellyNeoItemDBShopValueGuides.js
// @match        *://*.jellyneo.net/*id=event_shops*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.jellyneo.net
// @license      Unlicense
// @grant        GM_xmlhttpRequest
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds itemDB prices (and NP/points) to every item in a JellyNeo Shop Value Guide.
    It also adds two new options to the "Sort By:" menu: "Current itemDB Price" and "itemDB NP per Points". They sort
    the results instantly instead of on submit. They aren't saved so they won't be persistent if you reload the page or
    submit, you'll have to select them again to sort by itemDB prices.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const itemName = (row) => row.querySelector('.mb-0 .no-link-icon').textContent;

const formatNP = (value) => `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} NP`;

const getPricePerNP = (itemData, tokenPrice) => itemData.price?.value ? Math.floor(itemData.price.value / tokenPrice) : '???';

const createPriceLink = (itemData) => {
    const a = document.createElement('a');
    a.href = `https://itemdb.com.br/item/${itemData.slug}`;
    a.textContent = itemData.price?.value ? formatNP(itemData.price.value) : '???';
    a.classList.add('itemdb-price', 'text-small');
    return a;
}

const createPricePerNP = (pricePerNP, perNPText) => {
    const p = document.createElement('p');
    p.textContent = `${formatNP(pricePerNP)}${perNPText}`;
    return p;
}

const fetchItems = (items) => new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
        method: 'POST',
        url: 'https://itemdb.com.br/api/v2/items/many',
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            type: 'name',
            data: items,
            intent: 'pricer'
        }),
        onload: (res) => res.status === 200 ? resolve(JSON.parse(res.responseText)): reject(res)
    });
});

const editRow = (row, itemDBData, perNPText) => {
    const itemData = itemDBData[itemName(row)];
    row.dataset.price = itemData.price?.value ?? '???';
    const jellyNeoPrice = row.getElementsByClassName('price-history-link')[0] ?? row.querySelector('.show-for-small + em');
    jellyNeoPrice.insertAdjacentElement('afterend', createPriceLink(itemData));
    const tokenPrice = parseInt(row.querySelector('.show-for-small + span').textContent.replace(',', ''));
    const pricePerNP = getPricePerNP(itemData, tokenPrice);
    row.dataset.pricePerNP = pricePerNP;
    row.querySelector('.columns:last-child > p').insertAdjacentElement('afterend', createPricePerNP(pricePerNP, perNPText));
}

const createSelectOption = (value, text) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = text;
    return option;
}

const sort = (rows, sortOrder, isByPrice) => {
    const orderMultiplier = sortOrder === 'asc' ? 1 : -1;
    const datasetAttribute = isByPrice ? 'price' : 'pricePerNP';
    const parent = rows[0].parentElement;
    rows
        .sort((a, b) => orderMultiplier * (parseInt(a.dataset[datasetAttribute]) - parseInt(b.dataset[datasetAttribute])))
        .forEach((row) => parent.appendChild(row));
}

const onSelectChange = (rows, sortBySelect, sortOrderSelect) => {
    const sortBy = sortBySelect.selectedOptions[0].value;
    const sortOrder = sortOrderSelect.selectedOptions[0].value;
    console.log(sortBy, sortOrder);
    if(sortBy === 'itemdb-price') sort(rows, sortOrder, true);
    else if(sortBy === 'itemdb-per-points') sort(rows, sortOrder);
}

const addSortingOptions = (rows) => {
    const sortBySelect = document.getElementById('psg-sort');
    const sortOrderSelect = document.getElementById('psg-sort-dir');

    sortBySelect.appendChild(createSelectOption('itemdb-price', 'Current itemDB Price'));
    sortBySelect.appendChild(createSelectOption('itemdb-per-points', 'itemDB NP per Points'));

    sortBySelect.addEventListener('change', () => onSelectChange(rows, sortBySelect, sortOrderSelect));
    sortOrderSelect.addEventListener('change', () => onSelectChange(rows, sortBySelect, sortOrderSelect));
}

const init = async () => {
    document.head.insertAdjacentHTML('beforeend', css);
    const perNPText = document.querySelector('.table-row .columns:last-child p').childNodes[1].textContent.match(/(?<=\d NP).+/)[0];
    
    const rows = [...document.getElementsByClassName('table-row')];
    const itemNames = rows.map(itemName);
    const itemDBData = await fetchItems(itemNames);
    rows.forEach(row => editRow(row, itemDBData, perNPText));
    addSortingOptions(rows);
}

const css = `<style>
.itemdb-price {
    display: flex;
    align-items: center;
    gap: 0.25em;

    &::after {
        content: "";
        width: 1.25em;
        height: 1.25em;
        display: inline-block;
        background: url(https://images.neopets.com/themes/h5/basic/images/v3/quickstock-icon.svg);
        background-size: 1.25em;
    }
}

.columns:last-child > p {
    margin: 0.25em 0;
}
</style>`;

(function() {
    'use strict';
    init();
})();
