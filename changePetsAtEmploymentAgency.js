// ==UserScript==
// @name         Neopets: Change Pets at Employment Agency
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a link to the Faerieland Employment Agency's navigation to swap to a specific pet
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/changePetsAtEmploymentAgency.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/changePetsAtEmploymentAgency.js
// @match        *://*.neopets.com/faerieland/employ/employment.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Set your preferred job pet at const pet = 'PetNameHere' (case insensitive).
    Next to "Rankings" in the link-based nav that shows in every Employment Agency page, you'll have one of two links:
    - "Change to [pet]" if your active pet isn't the one you set
    - "Change back to [pet]" to switch back to the pet you were using when you clicked "Change to [pet]"
    Neither link will show up if your preferred pet is active, without having clicked "Change to [pet]".

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

/*
⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚫⚪⚫⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
*/

const pet = 'PetNameHere';

/*
⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚫⚪⚫⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚪⚪⚪⚪⚪⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚪⚪⚪⚪⚪⚪⚪⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚪⚪⚪⚫⚫⚫⚫⚫⚫
⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫⚫
*/

const getActivePet = () => document.getElementsByClassName('sidebarHeader')[0].textContent.trim()

const changePet = (targetPet) => fetch(`https://www.neopets.com/process_changepet.phtml?new_active_pet=${targetPet}`);

const linkCallback = (targetPet, activePet, link) => {
    link.textContent = 'Changing...';
    GM.setValue('original-pet', activePet === pet ? null : activePet);
    changePet(targetPet).then(() => window.location.reload());
}

const makeLink = (targetPet, activePet) => {
    const a = document.createElement('a');
    a.href = "#";
    a.addEventListener('click', () => linkCallback(targetPet, activePet, a));
    a.textContent = `Change ${activePet === pet ? 'back ' : ''}to ${targetPet}`;
    const parent = document.querySelector('a[href="employment.phtml?type=ranks"]').parentElement;
    parent.appendChild(document.createTextNode(' | '));
    parent.appendChild(a);
}

const init = async () => {
    if(pet === 'PetNameHere') return; // set your preferred pet before using this!
    const activePet = getActivePet();
    const originalPet = await GM.getValue('original-pet');
    if(activePet !== pet) makeLink(pet, activePet);
    else if(originalPet) makeLink(originalPet, activePet);
}

(function() {
    'use strict';
    init();
})();
