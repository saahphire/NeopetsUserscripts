// ==UserScript==
// @name         Neopets: Imposter Apple Retriever
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a quickstock iframe and a button to retrieve an Imposter Apple from your Safety Deposit Box to the Apple Bobbing main page
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/imposterAppleRetriever.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/imposterAppleRetriever.js
// @match        *://*.neopets.com/halloween/applebobbing.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds an iframe to the top of the Apple Bobbing page so you can store everything in your inventory without moving
    - Adds a button under the iframe to reload it
    - Adds a button under the iframe that retrieves an Imposter Apple from your SDB
        - If you don't have one, nothing happens. You won't get an error. Make sure you own one before using the script.

    You do need to save your PIN to const pin if you have it on for retrieving items from your SDB.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const pin = '0000';

const onAppleButtonClick = (button) => {
    button.textContent = 'Loading...';
    button.disabled = true;
    fetch(`https://www.neopets.com/process_safetydeposit.phtml?offset=0&remove_one_object=52754&obj_name=Imposter+Apple(special)&category=0&pin=${pin}`)
        .then(() => button.textContent = 'Imposter Apple in Inventory!')
        .catch(rej => {
            button.textContent = 'Error! Try again?';
            console.error(rej);
        })
        .finally(() => button.disabled = false);
}

const createAppleButton = () => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = 'Get Imposter Apple From SDB';
    button.addEventListener('click', () => onAppleButtonClick(button));
    return button;
}

const createReloadButton = (iframe) => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = 'Reload Quick Stock';
    button.addEventListener('click', () => iframe.contentWindow.location.reload());
    return button;
}

const createButtonContainer = (reloadButton, appleButton) => {
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'saahphire-apple-button-container';
    buttonContainer.appendChild(reloadButton);
    buttonContainer.appendChild(appleButton);
    buttonContainer.style.display = 'flex';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.gap = '1em';
    return buttonContainer;
}

const createIframe = () => {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://www.neopets.com/quickstock.phtml';
    iframe.style.width = '100%';
    iframe.style.height = '300px';
    return iframe;
}

const init = () => {
    const iframe = createIframe();
    document.getElementsByClassName('hf_bob_desc')[0].insertAdjacentElement('afterend', iframe);
    const reloadButton = createReloadButton(iframe);
    const appleButton = createAppleButton();
    const buttonContainer = createButtonContainer(reloadButton, appleButton);
    iframe.insertAdjacentElement('afterend', buttonContainer);
}

(function() {
    'use strict';
    init();
})();
