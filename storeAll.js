// ==UserScript==
// @name         Neopets: Store All
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
// @description  Selects closet (for wearables) or deposit for every item in your quick stock. Focuses on the submit button so you only have to press enter.
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
    - Selects "Discard" for every item that you consider too cheap
    - Selects "Closet" for every wearable item in your quickstock
    - Selects "Deposit" for all other items
    - Focuses the submit button so all you have to do is press Enter

    It doesn't conflict with my other script, Highlight Wearables in Quick Stock. As always, click twice on a radio
    button to cancel the item's placement.

    Discard only works if you also have my Quick Stock Pricer script installed (choose one source):
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
affect each other. All operations after SDB will be ignored, because every item can go to the
SDB and no item will be left for the other operations. You may remove words from the list to
disable them. CASE SENSITIVE. Must be in lowercase!
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•
*/
const order = ['discard', 'closet', 'shed', 'sdb'];

const discard = (item) => {
    const price = item.querySelector('[data-price]')?.dataset.price;
    if(!price || parseInt(price) > priceDiscardCutoff) return false;
    return item.querySelector('input[value="discard"]').checked = true;
}

const store = (item, storageName) => {
    const radio = item.querySelector(`input[value="${storageName}"]`);
    return radio && (radio.checked = true);
}

const closet = (item) => store(item, 'closet');

const shed = (item) => store(item, 'storage_shed');

const sdb = (item) => store(item, 'deposit');

const operations = { discard, closet, shed, sdb };

const sort = (items) => {
    items.forEach(item => order.find(operation => operations[operation](item)));
    document.querySelector('[name="quickstock"] input[type="submit"]').focus();
}

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
