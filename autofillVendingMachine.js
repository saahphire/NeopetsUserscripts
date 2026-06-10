// ==UserScript==
// @name         Neopets: Autofill Vending Machine
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Autofills your choices when using Nerkmids by optimizing NP earned, and makes "Play Again!" send you to the choice screen
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/autofillVendingMachine.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/autofillVendingMachine.js
// @match        *://*.neopets.com/vending2.phtml*
// @match        *://*.neopets.com/vending3.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does NOT fill the Vending Machine with random choices. That's a terrible idea!
    It's known that the small button and button presses don't do anything. However, you should push the third big button
    and pull the lever six times to maximize how much NP you're awarded.
    This script autofills the Vending Machine form with:
    - The first Nerkmid in your inventory
    - Large button 3 (gives more NP)
    - Left Green small button (doesn't do anything)
    - 1 button press (doesn't do anything)
    - 6 lever pulls (gives more NP)

    Source: https://www.reddit.com/r/neopets/comments/wc2d6v/alien_aisha_vending_machine_odds/

    It also makes the "Play Again!" button send you to the screen with choices instead of the useless first screen.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const choices = {
    nerkmid_id: 1,
    large_button: 3,
    small_button: 1,
    button_presses: 1,
    lever_pulls: 7
};

const whenSelectingChoices = () => {
    for (const [selectName, index] of Object.entries(choices))
        document.getElementsByName(selectName)[0].selectedIndex = index;
}

(function() {
    'use strict';
    const playAgainForm = document.querySelector('form[action="vending.phtml"]');
    if(document.getElementsByName('nerkmid_id')[0]) whenSelectingChoices();
    else if(playAgainForm) playAgainForm.action = 'vending2.phtml';
})();
