// ==UserScript==
// @name         Neopets: Remove Tales of Dacardia and Faerie Fragments Spam
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Automatically deletes neomail about Tales of Dacardia and Faerie Fragments rewards
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/removeToDFFSpam.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/removeToDFFSpam.js
// @match        *://*.neopets.com/neomessages.phtml
// @match        *://*.neopets.com/neomessages.phtml?*folder=Inbox*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==
/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    This script does the following:
    1. Detects neomail about Tales of Dacardia and Faerie Fragments rewards
    2. Selects all fitting neomail once you open your inbox
    3. Deletes that neomail
    The page refreshes when that neomail is deleted. This only works on one page at a time.
    Use this with caution. If you're worried about the auto delete part, comment out the last line by adding //
    in front of it, like so: // sel.form.submit();
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
*/

(function() {
    'use strict';
    const filtered = [...document.querySelectorAll('table[align="center"] tr:not(:first-child):not(:last-child)')]
        .filter(tr => tr.querySelector("td:nth-child(3) b").innerText === "theneopetsteam" && tr.querySelector("td:nth-child(4)")?.innerText.endsWith("Reward Unlocked!"));
    if(filtered.length === 0) return;
    filtered.forEach(tr => {tr.querySelector("input[type='checkbox']").checked = true});
    const sel = document.querySelector("[name='action']");
    sel.selectedIndex = [...sel.options].findIndex(opt => opt.value == "Delete Messages");
    sel.form.submit();
})();
