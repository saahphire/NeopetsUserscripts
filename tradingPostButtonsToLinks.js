// ==UserScript==
// @name         Neopets: Trading Post Buttons to Links
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Transforms the "Make an Offer" and link copy buttons in the Trading Post into links so you can right-click them
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/tradingPostButtonsToLinks.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/tradingPostButtonsToLinks.js
// @match        *://*.neopets.com/island/tradingpost.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Changes the "Clear" button to something less clickable. You can reverse that by setting changeClearButton to false.
    - Converts the following buttons into links:
        - Copy link to lot
        - Make an Offer
        - View Offers
        - Report
        - Your Trades
        - Browse Lots
        - Offers You Have Made
    - The "copy link" button still copies if you click it, instead of navigating to the link. Dragging and right-clicking
      work as expected for a link.
    - Does NOT convert "Instant Buy" into a link. That's impossible.
    - Does NOT convert "Create a New Trade" into a link. Instead, hover over the Inventory buttons to see a new "Create
      a New Trade" button that is a link. I'm not going to watch the page forever for changes.
    - If you "View Details", the buttons in that pop-up are still buttons. It was extra work that I didn't know if anyone
      would even want me to do.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const changeClearButton = true;

const links = {
    lot: [
        {
            // Copy link
            url: id => `https//www.neopets.com/island/tradingpost.phtml?type=browse&criteria=id&search_string=${id}`,
            query: '.mt-auto img'
        },
        {
            // Make an Offer
            url: id => `${window.location.href.split('#/')[0]}#/?type=makeoffer&lot_id=${id}`,
            query: '.button-classic-primary'
        },
        {
            // Report
            url: () => 'https://www.neopets.com/settings/privacy/report/',
            query: '.icon-container + .flex + img'
        },
        {
            // View Offers
            url: id => `https://www.neopets.com/island/tradingpost.phtml#/?type=offers-lot&lot_id=${id}`,
            query: '.flex:not(:has(.button-classic-primary)) .button-classic-default'
        }
    ],
    global: [
        {
            // Your Trades
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=view',
            query: 'button.relative .item-label'
        },
        {
            // Browse Lots (top left)
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=browse',
            query: 'button.relative:nth-of-type(2) .item-label'
        },
        {
            // Browse Lots (empty page)
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=browse',
            query: '.text-museo + .relative .tp-border-frame-btn'
        },
        {
            // Offers You Have Made
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=offer-made',
            query: 'button.relative:last-of-type .item-label'
        },
        {
            // Create a New Trade (top left)
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=view',
            query: '.tp-border-frame-btn'
        },
        {
            // Create a New Trade (empty page)
            url: 'https://www.neopets.com/island/tradingpost.phtml#/?type=view',
            query: '.text-cafeteria + .relative .tp-border-frame-btn'
        }
    ]
}

const addLink = (url, button) => {
    if(!button) return;
    const link = document.createElement('a');
    link.href = url;
    link.onclick = e => e.preventDefault();
    link.style.textDecoration = 'none';
    button.parentElement.appendChild(link);
    link.appendChild(button);
}

const init = observer => {
    if(!document.querySelector('.tp-border-frame') && !document.querySelector('.tp-border-frame-btn')) return;
    observer.disconnect();
    document.querySelectorAll('.tp-border-frame').forEach(lot => {
        const id = lot.querySelector('.text-cafeteria').textContent.match(/\d+/)[0];
        links.lot.forEach(link => addLink(link.url(id), lot.querySelector(link.query), id));
    });
    links.global.forEach(link => addLink(link.url, document.querySelector(link.query)));
    if(changeClearButton) document.querySelector('.button-classic-cancel').parentElement.insertAdjacentHTML('afterBegin', `<style>
        .button-classic-cancel {
            background: none;
            box-shadow: none;
            &::before {
                content: '❌';
            }
            & p {
                display: none;
            }
        }
    </style>`);
}

(function() {
    'use strict';
    const observer = new MutationObserver(() => init(observer));
    observer.observe(document.getElementsByClassName('tp-main-content')[0], {childList: true});
})();
