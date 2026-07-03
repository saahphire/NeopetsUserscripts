// ==UserScript==
// @name         Neopets: Shop Auto SSW
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Searches for an item in SSW as soon as you select its price textbox if the price is 0
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/shopAutoSSW.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/shopAutoSSW.js
// @match        *://*.neopets.com/market.phtml?*type=your*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @require      https://update.greasyfork.org/scripts/567035/1759343/Neopets%3A%20Shop%20Wizard%20Anchor%20Creator.js
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script automatically searches for an item using the Super Shop Wizard if you've focused on the texbox used to
    set its price in the Stock page of your shop, as long as the current price is 0. It also allows you to use Tab to
    navigate between prices without stopping by removal menus first (set navigateByTabs to true)

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const navigateByTab = true;

const searchByInput = (event) => {
    if(event.target.value !== '0') return;
    const row = event.target.parentElement.parentElement;
    const itemName = row.getElementsByTagName('b')[0].textContent;
    openOldSsw(itemName, document.getElementsByClassName('sswdrop')[0]);
    document.getElementById('button-search').click();
}

(function() {
    'use strict';
    const inputs = document.querySelectorAll('[name*="cost"][type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', searchByInput)
        if(navigateByTab) input.tabIndex = 1;
    });
})();
