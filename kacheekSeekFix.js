// ==UserScript==
// @name         Neopets: Kacheek Seek Fix
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
// @description  Fixes Kacheek Seek, adds a list of hiding spots for your convenience, and lets you play using your keyboard only
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/kacheekSeekFix.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/kacheekSeekFix.js
// @match        *://*.neopets.com/games/hidenseek/*
// @match        *://*.neopets.com/games/hidenseek.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds a list of links to each hiding place under the Kacheek Seek image
    - Fixes all locations that broke because of https, IF you play in a single tab (don't open hiding spots in new tabs)
    - Allows you to select hiding spots by pressing their respective number key (numbers row or NumPad)
      - Number 10 is 0
      - The Shift key adds 10 to the number you're pressing (Shift + 1 = 11)
    - Allows you to return to the hiding spot list by pressing any key in the numeric row or NumPad
    - Allows you to open the next challenge by pressing Shift in addition to any key in the numeric row or NumPad

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const onClick = async e => {
    e.preventDefault();
    const url = e.target.href;
    const page = await (await fetch(url.replace('http:', 'https:'))).text();
    document.head.innerHTML = page.match(/<head>([\s\S]+)<\/head>/)[1];
    document.body.innerHTML = page.match(/<body.+?>([\s\S]+)(?:<\/body>)?/)[1];
    document.addEventListener('keydown', e => {
        if(e.code.startsWith('Digit') || e.code.startsWith('Numpad')) document.getElementsByTagName('a')[0].click();
    })

}

const createLink = area => {
    const a = document.createElement('a');
    a.textContent = area.alt;
    a.href = area.href;
    if(!a.href.startsWith('https')) a.addEventListener('click', onClick);
    return a;
}

const addList = () => {
    const ol = document.createElement('ol');
    document.getElementsByTagName('map')[0].insertAdjacentElement('afterend', ol);
    document.querySelectorAll('area').forEach(area => {
        const li = document.createElement('li');
        ol.appendChild(li);
        li.appendChild(createLink(area));
    });
    const p = document.createElement('p');
    p.textContent = 'Press any number to select that option! Shift adds 10 (Shift + 1 = 11).';
    ol.insertAdjacentElement('afterend', p);
}

const onKeyDown = e => {
    if(e.shiftKey && e.code.endsWith(1)) {
        document.querySelector('ol li:nth-child(11) a').click();
        return;
    }
    for(let i = 1; i < 11; i++) {
        if(e.code.endsWith(i % 10)) {
            const index = e.shiftKey ? i + 10 : i;
            document.querySelector(`ol li:nth-child(${index}) a`).click();
        }
    }
}

const goToNextChallenge = (lastClicked) => {
    const lastClickedIndex = parseInt(lastClicked.getElementsByTagName('img')[0].src.match(/(\d+).gif/)[1]);
    const allChallenges = document.querySelectorAll('a[href="javascript:;"]:not(#lock_anchor)');
    const nextChallenge = allChallenges[(lastClickedIndex + 1) % allChallenges.length];
    nextChallenge.click();
    return nextChallenge;
}

const onChallengePage = () => {
    const p = document.createElement('p');
    document.querySelector('.content center b').insertAdjacentElement('afterend', p);
    p.textContent = 'Press any number key to open the last challenge you\'ve played. Press Shift in addition to a number key to play the challenge immediately after last one.';
    let lastClicked;
    document.querySelectorAll('a[href="javascript:;"]:not(#lock_anchor)').forEach(a => {
        a.addEventListener('click', () => lastClicked = a);
    });
    document.addEventListener('keydown', e => {
        if(!lastClicked || (!e.code.startsWith('Digit') && !e.code.startsWith('Numpad'))) return;
        if(e.shiftKey)
            lastClicked = goToNextChallenge(lastClicked);
        else
            lastClicked.click();
    })
}

(function() {
    'use strict';
    if(window.location.href.match(/hidenseek.phtml/)) onChallengePage();
    else {
        addList();
        document.addEventListener('keydown',onKeyDown);
    }
})();
