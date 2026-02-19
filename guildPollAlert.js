// ==UserScript==
// @name         Neopets: Guild Poll Alert
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Sends a native browser notification whenever you load a page in your guild and there's a new poll in it
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/guildPollAlert.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/guildPollAlert.js
// @match        *://*.neopets.com/guilds/guild.phtml?id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Keeps track of your guild's active poll whenever you visit it
    - Sends you a notification whenever the poll is different from the last one (description or options)

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const isArrayEqual = (firstArray, secondArray) => {
    if(firstArray.length !== secondArray.length) return false;
    if(firstArray.some(item => !secondArray.find(secondItem => secondItem === item))) return false;
    if(secondArray.some(secondItem => !firstArray.find(item => item === secondItem))) return false;
    return true;
}

const getCurrentPoll = () => {
    const desc = document.querySelector('tr:has(.content) + tr font[size="1"]')?.textContent;
    const options = [...document.querySelectorAll('td[valign="middle"] font[size="1"]')].map(font => font.textContent);
    return {desc, options};
}

(async function() {
    'use strict';
    const currentPoll = getCurrentPoll();
    const oldPoll = await GM.getValue('poll', {options: []});
    if(currentPoll.desc !== oldPoll.desc || !isArrayEqual(currentPoll.options, oldPoll.options)) {
        GM.setValue('poll', currentPoll);
        GM.notification({
            text: currentPoll.desc, 
            title: 'New Guild Poll!', 
            image: document.querySelector('img[width="100"][height="100"]').src
        });
    }
})();
