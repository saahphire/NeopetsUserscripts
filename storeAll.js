// ==UserScript==
// @name         Neopets: Store All
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.3.0
// @description  Selects closet (for wearables) or deposit for every item in your quick stock. Updated for new Quick Stock.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/storeAll.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/storeAll.js
// @match        *://*.neopets.com/quickstock.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @run-at       document-idle
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Selects "Discard" for every item that you consider too cheap*
    - Selects "Closet" for every wearable item in your quickstock
    - Selects "Shed" for every item that can go to your NeoHome shed
    - Selects "Chamber" for every item that can go to your Chamber
    - Selects "Deposit" for all other items

    * Discard only works if you also have my Quick Stock Pricer script installed (choose one source):
    https://github.com/saahphire/NeopetsUserscripts/blob/main/quickStockPricer.js
    https://greasyfork.org/en/scripts/568260-neopets-quick-stock-pricer

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

/* 
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
The maximum itemDB value an item must have to be discarded. Inclusive.
25 means an item worth 25 or less is discarded. 0 means this feature is disabled.
This only works if you have my Quick Stock Pricer script installed. It's harmless if you don't.
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
*/
const priceDiscardCutoff = 25;

/* 
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
The order in which operations should be decided. If discard is before closet, an item with low
value will be discarded even if it's wearable. If closet is before discard, an item with low
value will be sent to your Closet instead of discarded if it's wearable. Shed and closet don't
affect each other. All operations after Deposit will be ignored, because every item can go to
the deposit and no item will be left for the other operations. You may remove words from the
list to disable them. CASE SENSITIVE. Must be in lowercase! You can replace 'discard' with
'donate' if you want. They'll work the same way regarding price cutoff.
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
*/
const order = ['discard', 'closet', 'shed', 'chamber', 'deposit'];

/* 
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
Your exceptions list. These operations will always be performed upon these items, no matter
what order you've chosen. You can also add the operations "stock" (add to shop stock) and
"gallery" here. For example, if you want all Imposter Apples to go to your SDB despite being a
junk item, and all Platinum Nerkmids to go to your shop, you'll have something like this:
const exceptions = {
    'Imposter Apple': 'deposit',
    'Platinum Nerkmid': 'stock'
}
You can have multiple items with the same operation, but each item can only appear once.
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
*/
const exceptions = {
    'Item Name': 'operation',
    'Item 2': 'operation'
}

const fire = (item, inputName) => {
    if(!inputName) return false;
    const input = item.querySelector(`input[value="${inputName}"]`);
    if(!input) return false;
    const event = new Event('change', { bubbles: true });
    input.checked = true;
    input.dispatchEvent(event);
    return true;
}

const discard = (item) => {
    const price = item.querySelector('[data-price]')?.dataset.price;
    return price && parseInt(price) <= priceDiscardCutoff;
}

const select = (item, operation) => ((operation === 'discard' || operation === 'donate') && !discard(item)) ? false : fire(item, operation);

const sort = (items) => items.forEach(item => fire(item, exceptions[item.getElementsByTagName('span')[0].textContent]) || order.find(operation => select(item, operation)));

const watch = (items) => {
    const observer = new MutationObserver(() => {
        if(!items[0].querySelector('[data-price]')) return;
        sort(items);
        observer.disconnect();
    });
    observer.observe(items[0], {childList: true, subtree: true});
}

(function() {
    'use strict';
    const items = document.querySelectorAll('[name="quickstock"] tr:has(td:nth-child(3) input):not(:has(b))');
    if(items.length === 0) return;
    window.addEventListener('message', e => {
        if(e.data === 'Saahphire Quick Stock Pricer here') watch(items);
    });
    sort(items);
})();
