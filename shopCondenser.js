// ==UserScript==
// @name         Neopets: Shop Condenser
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Condenses your shop's view. Removes useless elements.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/shopCondenser.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/shopCondenser.js
// @match        *://*.neopets.com/market.phtml?*type=*
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
        - Land : Neopia Central (or whatever you chose)
        - Cleaner Code, Better Browsing and A Safer Neopia!
        - (please do not use rude words or IFRAMES!)
        - (it costs 150 NP to open a shop)
        - Items that cost 0 Neopoints...
        - Shopkeeper's picture and greeting in the stock page
        - Item descriptions
        - Note: shops are strictly a place for selling...
        - Please clear your Sales History regularly to save space on the Neopets servers! :)
        - Only purchases of 1000 NP or greater will be displayed here.
        - Need some extra security? Add a PIN for use in this area!
        - (max 999,999)
    - Changes:
        - Moves "Jump to" links to their own div
        - Makes item images smaller
        - Item quantity and removal are now the same column

    You may also like (use GreasyFork or GitHub for each, not both):
        - No Top Links (removes the cluster of redundant links on top of every old layour page)
            https://github.com/saahphire/NeopetsUserscripts/tree/main
            https://greasyfork.org/en/scripts/565351-neopets-no-top-links

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const jumpToLinks = [
    ['https://www.neopets.com/browseshop.phtml?owner=saahphire', 'Shop Front'],
    ['https://www.neopets.com/market.phtml?type=edit', 'Edit Shop'],
    ['https://www.neopets.com/market.phtml?type=your', 'Stock'],
    ['https://www.neopets.com/market.phtml?type=till', 'Till'],
    ['https://www.neopets.com/market.phtml?type=sales', 'Sales History'],
    ['https://www.neopets.com/quickstock.phtml', 'Quick Stock'],
    ['https://www.neopets.com/gallery/index.phtml', 'Gallery']
];

const remove = [
    'br + b + p:has(br)',
    'table table:has(.contentModule)',
    'center + p',
    'center:has([name="keeperimage"])',
    '.saahphire-stocked + b',
    'form + table:has(a[href="/pin_prefs.phtml"])',
    'font[size="1"]'
];

const shopLetters = [
    ['a', 'n', '0'],
    ['b', 'o', '1'],
    ['c', 'p', '2'],
    ['d', 'q', '3'],
    ['e', 'r', '4'],
    ['f', 's', '5'],
    ['g', 't', '6'],
    ['h', 'u', '7'],
    ['i', 'v', '8'],
    ['j', 'w', '9'],
    ['k', 'x', '_'],
    ['l', 'y'],
    ['m', 'z']
];

const usernameLetter = document.querySelector('.user a').textContent.charAt(0);
const swLetters = shopLetters.find(letterCluster => letterCluster.find(letter => letter === usernameLetter));

const buildJumpTo = () => {
    const ul = document.createElement('ul');
    ul.classList.add('saahphire-jump-to');
    ul.ariaLabel = 'Shop Navigation';
    document.querySelector('table table:has(.contentModule)').insertAdjacentElement('beforeBegin', ul);
    jumpToLinks.forEach(link => {
        const li = document.createElement('li');
        ul.appendChild(li);
        const a = document.createElement('a');
        li.appendChild(a);
        a.href = link[0];
        a.textContent = link[1];
    });
}

const buildStock = () => {
    const siblings = document.getElementsByName('subbyprev');
    if(!siblings.length) return;
    const bs = document.querySelectorAll('center:has([name="keeperimage"]) b');
    siblings.forEach(sibling => sibling.insertAdjacentHTML('afterend', `<p class="saahphire-stocked">Items Stocked: <strong>${bs[1].textContent}</strong> | Free Space: <strong>${bs[2].textContent}</strong>`));
}

const unanchorPage = () => {
    const currentPageStart = document.querySelector('input + b')?.textContent.match(/Viewing items (\d+)/)?.[1];
    if(!currentPageStart) return;
    ['.saahphire-jump-to ~ p a', 'form[action="process_market.phtml"] + center a'].forEach(anchorQuery => {
        const currentPageAnchor = [...document.querySelectorAll(anchorQuery)].find(a => a.textContent.startsWith(`[${currentPageStart}-`));
        currentPageAnchor.insertAdjacentHTML('afterend', `<span class="saahphire-page">${currentPageAnchor.textContent}</span>`);
        currentPageAnchor.remove();
    });
}

const moveStockInputs = form => {
    [...form.childNodes].filter(node => node.nodeType === 3).forEach(node => node.remove());
    const centerDiv = document.createElement('div');
    const rightDiv = document.createElement('div');
    const invisibleDiv = document.createElement('div');
    if(form.querySelector('input[value="Find"]')) {
        rightDiv.appendChild(document.getElementsByName('obj_name')[0]);
        rightDiv.appendChild(form.querySelector('input[value="Find"]'));
    }
    [...form.children].forEach(child => centerDiv.appendChild(child));
    [invisibleDiv, centerDiv, rightDiv].forEach(div => form.appendChild(div));
}

const removeDescriptions = () => {
    const column = [...document.querySelectorAll('[name="view"] + table > tbody > tr:first-child td')].findIndex(child => child.textContent === 'Description');
    document.querySelectorAll(`[name="view"] + table > tbody > tr td:nth-of-type(${column + 1})`).forEach(description => description.style.display = 'none');
}

const addMaxToRemove = () => {
    document.querySelectorAll('[name="view"] + table > tbody > tr').forEach(row => {
        const quantity = row.querySelector('td[width="50"]');
        if(!quantity) return;
        [...row.getElementsByTagName('option')].forEach(option => option.textContent += `/${quantity.textContent}`);
        row.querySelector('td[width="50"]').style.display = 'none';
    });
    [...document.querySelectorAll('[name="view"] + table > tbody > tr:first-child td')].find(td => td.textContent === 'Stock')?.remove();
    document.querySelector('[value="Update"]')?.addEventListener('click', () => document.querySelectorAll('[name="view"] + table > tbody > tr').forEach(row => [...row.getElementsByTagName('option')].forEach(option => option.textContent = option.value)));
}

const addPinToLastRow = () => {
    const parent = document.querySelector('[name="view"] + table > tbody > tr:last-child td');
    if(!parent) return;
    const div = document.createElement('div');
    parent.appendChild(div);
    const pinRow = document.querySelector('[name="view"] + table tr:has(table)');
    div.insertAdjacentHTML('beforeend', '<span class="saahphire-pin">Enter your <a href="https://www.neopets.com/pin_prefs.phtml">PIN</a>:</span>');
    div.appendChild(pinRow.querySelector('input'));
    pinRow.remove();
}

const css = `<style>
p, ul {
    margin: 0.25em;
}

#search-form, #ssw-tabs-1 {
    height: auto;
}

#search-form p {
    margin: 0;
}

#results_table tr:not(:first-child, :nth-child(2), :has(a[href*="owner=${swLetters.join('"], a[href*="owner=')}"])) {
    display: none;
}

.saahphire-jump-to {
    padding: 0;
    text-align: center;
}

.saahphire-jump-to li {
    display: inline;

    &:not(:last-child)::after {
        content: "|";
        margin: 0.25em;
        cursor: auto;
        pointer-events: none;
    }
}

.saahphire-stocked {
    text-align: center;
    display: inline;
    margin: 0 1em;
}

.saahphire-page {
    font-weight: 600;
    margin: 0.3em;
}

form[action="market.phtml"] {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;

    & div {
        text-align: center;

        &:last-child {
            text-align: right;
        }
    }
}

[name="view"] + table .search-helper, [name="view"] + table, [name="shopform"] table, textarea {
    width: 100%;
}

[name="view"] + table > tbody {
    display: grid;
    grid-template-columns: subgrid;
}

[name="view"] + table td {
    align-items: center;
    justify-content: center;
    display: flex;
    padding: 0.25em;
    flex-wrap: wrap;
    text-align: center;
    height: 100%;
    width: auto!important;
    background-color: transparent!important;
    box-sizing: border-box;
}

[name="view"] + table :not(.search-helper) img {
    width: 40px;
    height: 40px;
}

[name="view"] + table tr {
    display: grid;
    grid-template-columns: 3fr repeat(var(--columns), 1fr);
    padding: 0;
    background-color: #ffffcc;
}

[name="view"] + table tr:nth-child(2n) {
    background-color: white;
}

[name="view"] + table tr:is(:first-child, :last-child) {
    background-color: #dddd77;
    font-weight: 600;
}

[name="view"] + table td:first-child {
    justify-content: left;
    text-align: left;
}

[name="view"] + table tr:first-child td:first-child {
    text-align: center;
}

[name="view"] + table tr:last-child td {
    grid-column: 1 / -1;
}

[name="view"] + table tr:last-child td div {
    margin-left: auto;
}

br, tr:has(> td[bgcolor="#cccccc"]), .sf {
    display: none;
}
</style>`;

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    buildJumpTo();
    unanchorPage();
    buildStock();
    document.querySelectorAll('form[action="market.phtml"]').forEach(form => moveStockInputs(form));
    removeDescriptions();
    addMaxToRemove();
    document.querySelector('[name="view"] + table')?.style.setProperty('--columns', document.querySelectorAll('[name="view"] + table > tbody > tr:first-child td').length - 2);
    addPinToLastRow();
    document.querySelectorAll(remove.join(', ')).forEach(rm => rm.remove());
    [...document.querySelectorAll('b + p[align="center"]')].find(p => p.textContent.startsWith('Only purchases'))?.remove();
})();
