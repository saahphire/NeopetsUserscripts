// ==UserScript==
// @name         Dress to Impress: Export Shopping List to itemDB
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Allows you to export an outfit's Shopping List to a itemDB-readable "petpage" code
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/DTIExportShoppingListToItemDB.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/DTIExportShoppingListToItemDB.js
// @match        *://impress.openneo.net/items/sources/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    When opening an outfit's Shopping List (purple shopping bag icon next to the Save button), you'll now get a button
    that'll allow you to export it into a itemDB list. Just click the button and paste the code that was copied in the
    page that'll be opened.

    (Windows 11+: Press Win+V to view your Clipboard Manager, in case you had something important in your clipboard.)

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const createListItem = (row) => `<li class="dti-item">
<img class="dti-item-thumbnail" src="${row.getElementsByTagName('img')[0].src}" />
<span>${row.getElementsByClassName('item-name')[0].textContent}</span>
</li>`;

const getAllItems = () => [...document.querySelectorAll('tbody tr')].map(createListItem);

const copyAndExport = (event, text) => {
    navigator.clipboard.writeText(text);
    window.open('https://itemdb.com.br/lists/import/advanced');
    event.target.textContent = 'Copied!';
    setTimeout(() => event.target.textContent = 'Export to itemDB', 250);
}

(function() {
    'use strict';
    const exportedText = getAllItems().join('\n');
    const button = document.createElement('button');
    button.textContent = 'Export to itemDB';
    button.addEventListener('click', (e) => copyAndExport(e, exportedText));
    document.getElementsByTagName('h1')[0].insertAdjacentElement('afterend', button);
})();
