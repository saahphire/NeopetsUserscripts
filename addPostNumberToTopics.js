// ==UserScript==
// @name         Neopets: Add Post Number to Topics
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a post's number (starting at 1) to the right of its date. Adds its ID as a tooltip.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/addPostNumberToTopics.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/addPostNumberToTopics.js
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds a post's number (#1 is the first post in a topic, #2 is the second, etc) to the right of its date
    - Adds a post's UID as its number's tooltip (visible only on desktop hover)
    - Allows you to click on the number to copy it
    - Allows you to Shift-Click on the number to copy its UID

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeEnd', '<style>.boardPostNumber { float: right; } .boardPostDate { display: inline-block; }</style>');
    const previousPagePosts = (parseInt(document.getElementsByClassName('boardPageButton-active')[0].textContent) - 1) * 20;
    document.querySelectorAll('.boardPostDate').forEach((date, index) => {
        const postNumber = index + previousPagePosts + 1;
        const postUID = date.parentElement.querySelector('.reportButton-neoboards a').href.match(/regarding=(\d+)/)[1];
        const numberElement = document.createElement('h6');
        numberElement.classList.add('boardPostNumber', 'boardPostDate');
        numberElement.title = `UID ${postUID}`;
        numberElement.textContent = `#${postNumber}`;
        numberElement.addEventListener('click', e => navigator.clipboard.writeText(e.shiftKey ? postUID : postNumber));
        date.insertAdjacentElement('afterend', numberElement);
    });
})();
