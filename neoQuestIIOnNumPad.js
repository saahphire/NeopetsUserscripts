// ==UserScript==
// @name         Neopets: NeoQuest II on NumPad
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Use NumPad for movement in NeoQuest II
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/neoQuestIIOnNumPad.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/neoQuestIIOnNumPad.js
// @match        *://*.neopets.com/games/nq2/nq2.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This is a simple alternative mapping of the NeoQuest 2 Helper script. It allows you to use the NumPad to perform
    various actions:
        - Numpad1 to Numpad9, except Numpad5: Move in that direction
        - Numpad5: Move right, then quickly left (to farm enemies)
        - Numpad *: Open inventory
        - Numpad -: Switch to Normal exploration
        - Numpad +: Switch to Hunting exploration
        - Numpad thousands separator (, or . depending on keyboard): Refresh without redoing last action

    I highly recommend you install NeoQuest 2 Helper and add "Numpad5" to const defaultActionKeys. So it could look like:
    const defaultActionKeys = ["KeyA", "KeyF", "Space", "Numpad5"];

    NeoQuest 2 Helper:
    https://neoquest.guide/userscripts/neoquest2.user.js

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const mapKeys = () => document.addEventListener('keydown', e => {
    switch(e.code) {
        case 'NumpadMultiply':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=inv';
            break;
        case 'NumpadSubtract':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=travel&mode=1';
            break;
        case 'Numpad7':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=5';
            break;
        case 'Numpad8':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=1';
            break;
        case 'Numpad9':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=7';
            break;
        case 'NumpadAdd':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=travel&mode=2';
            break;
        case 'Numpad4':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=3';
            break;
        case 'Numpad5':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=4';
            setTimeout(()=>{location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=3';}, 200);
            break;
        case 'Numpad6':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=4';
            break;
        case 'NumpadComma':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml';
            break;
        case 'Numpad1':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=6';
            break;
        case 'Numpad2':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=2';
            break;
        case 'Numpad3':
            location.href = 'https://www.neopets.com/games/nq2/nq2.phtml?act=move&dir=8';
            break;
    }
});

(function() {
    'use strict';
    if(document.getElementsByName('navmap').length > 0) mapKeys();
})();
