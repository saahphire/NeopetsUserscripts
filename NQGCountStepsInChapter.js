// ==UserScript==
// @name         NeoQuest.Guide: Count Steps in Chapter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Counts how many steps are in each NeoQuest II chapter of the guide. Counts done/total steps. Also counts total in the sidebar.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/NQGCountStepsInChapter.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/NQGCountStepsInChapter.js
// @match        *://neoquest.guide/nq2/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Look at each NeoQuest II guide's chapter header to see a new (X/Y steps) next to it. The count of completed steps
    will update as you tick them. There's also a X/Y steps in the sidebar, counting how many steps in the whole guide
    exist and how many you have completed.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const count = () => {
    const children = document.getElementById('content').children;
    const headers = [];
    [...children].forEach(child => {
        if(child.tagName === 'H2') headers.push({header: child, steps: 0, done: 0});
        if(headers.length) {
            headers[headers.length - 1].steps += child.querySelectorAll('input[type="checkbox"]').length;
            headers[headers.length - 1].done += child.querySelectorAll('input[type="checkbox"]:checked').length
        }
    });
    return headers;
}

const print = () => {
    const headers = count();
    let totalDone = 0;
    let totalCount = 0;
    headers.forEach(header => {
        let span = header.header.getElementsByTagName('span')[0];
        if(!span) {
            span = document.createElement('span');
            span.classList.add('saahphire-counter');
            header.header.appendChild(span);
        }
        span.textContent = ` (${header.done}/${header.steps} steps)`;
        totalCount += header.steps;
        totalDone += header.done;
    });
    let totalSibling = document.querySelector('#tableofcontents + div');
    if(totalSibling.nextElementSibling?.tagName !== 'H2') totalSibling.insertAdjacentElement('afterend', document.createElement('h2'));
    document.querySelector('#tableofcontents ~ h2').textContent = `${totalDone}/${totalCount} steps`;
}

(function() {
    'use strict';
    print();
    document.querySelectorAll('input[type="checkbox"]').forEach(input => input.addEventListener('click', () => print()));
})();
