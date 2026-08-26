// ==UserScript==
// @name         Neopets: Petlookups at Pound
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Directs you to a pet's petlookup when you click their name at the Adopt part of the Pound
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/petlookupsAtPound.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/petlookupsAtPound.js
// @match        *://*.neopets.com/pound/adopt.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    When you're adopting at the Pound, click a pet's name to open their petlookup in a new tab.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const addLink = (nameContainer, observer) => {
    if(observer) observer.disconnect();
    const petName = nameContainer.textContent;
    const a = document.createElement('a');
    a.href = `https://www.neopets.com/petlookup.phtml?pet=${petName}`;
    a.target = '_blank';
    a.textContent = petName;
    nameContainer.textContent = '';
    nameContainer.appendChild(a);
    if(observer) observer.observe(nameContainer, {characterData: true, childList: true});
}

(function() {
    'use strict';
    const nameContainers = document.querySelectorAll('#pet0_name, #pet1_name, #pet2_name');
    if(!nameContainers.length) return;
    nameContainers.forEach(container => {
        const observer = new MutationObserver(() => addLink(container, observer));
        observer.observe(container, {characterData: true, childList: true});
        addLink(container);
    });
})();
