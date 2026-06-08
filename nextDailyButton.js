// ==UserScript==
// @name         Neopets: Next Daily Button
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.2
// @description  Given a list of URLs, adds a button in a page to the next item on the list
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/nextDailyButton.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/nextDailyButton.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Add URLs to the urls list, in the order you'd like to visit them. Once you visit one of the pages on the list you
    made, a button will be present, directing you to the next item on the list. So if you have Meteor, then Coltzan, a
    button directing you to Coltzan will be on the Meteor page.
    
    Some dailies have a different URL for starting and finishing them. In that case, add the last URL right after the
    first URL, and then you can continue adding dailies. (You don't need to do that if the difference is after a ?)
    Example: [
        'https://www.neopets.com/worlds/geraptiku/tomb.phtml',
        'https://www.neopets.com/worlds/geraptiku/process_tomb.phtml',
        'https://www.neopets.com/jelly/jelly.phtml'
    ]

    The script adds 'https://www.neopets.com/' to the start of an item unless it starts with 'http'. So you don't need
    to include that part unless the URL does NOT start with 'https://www.neopets.com/'.
    Example: [
        'prehistoric/omelette.phtml',
        'lab2.phtml',
        'https://ncmall.neopets.com/games/giveaway/process_giveaway.phtml'
    ]

    You can add a URL multiple times if you want to visit it more than once.

    All URLs must be between single or double quotes, and separated from each other by commas.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Set loop to true if you'd like the last page on your list to link to the first page.
const loop = false;

// Available colors (case-sensitive): yellow, blue, green, red, purple, pink, valentine. (pink = bubblegum, valentine = flamingo)
const buttonColor = 'purple';

const urls = [
    'questlog',
    'hospital/volunteer.phtml',
    'dome/barracks.phtml',
    'dome/arena.phtml',
    'halloween/applebobbing.phtml',
    'halloween/haunted_woods_hunt.phtml',
    'https://ncmall.neopets.com/games/giveaway/process_giveaway.phtml',
    'nf.phtml',
    'shop_of_offers.phtml?slorg_payout=yes',
    'pirates/anchormanagement.phtml',
    'desert/shrine.phtml',
    'pirates/forgottenshore.phtml',
    'desert/fruit/index.phtml',
    'medieval/grumpyking.phtml',
    'jelly/jelly.phtml',
    'lab2.phtml',
    'process_lab2.phtml',
    'petpetlab.phtml',
    'moon/meteor.phtml?getclose=1',
    'prehistoric/omelette.phtml',
    'market.phtml?type=till',
    'faerieland/tdmbgpop.phtml',
    'halloween/strtest/index.phtml',
    'island/tombola.phtml',
    'island/tombola2.phtml',
    'trudys_surprise.phtml',
    'medieval/wiseking.phtml',
    'altador/council.phtml',
    'worlds/geraptiku/tomb.phtml',
    'worlds/geraptiku/process_tomb.phtml',
    'halloween/gravedanger',
    'worlds/kiko/kpop',
    'halloween/coconutshy.phtml',
    'games/game.phtml?game_id=805&size=regular&quality=high&play=true',
    'water/fishing.phtml',
    'hospital/volunteer.phtml',
    'faerieland/springs.phtml',
    'questlog',
    'quickstock.phtml',
    'stockmarket.phtml?type=list&search=%&bargain=true',
    'bank.phtml'
];

const urlEssence = (url) => url.replaceAll(/https?:\/\/(www.)?neopets.com\/|\?.+|\/$/g, '');

const nextIndex = (index) => loop ? (index + 1) % urls.length : index + 1;

const isCurrentIndex = (currentUrlEssence, index) => index !== -1 && urls[index] && currentUrlEssence === urlEssence(urls[index]);

const getCurrentUrlIndex = async (currentUrl) => {
    const currentUrlEssence = urlEssence(currentUrl);
    const lastIndex = await GM.getValue('last-url', 0);
    if(isCurrentIndex(currentUrlEssence, lastIndex)) return lastIndex;
    const predictedIndex = nextIndex(lastIndex);
    if(isCurrentIndex(currentUrlEssence, predictedIndex)) return predictedIndex;
    return urls.findIndex((url) => urlEssence(url) === currentUrlEssence);
}

const createButton = (url) => {
    const button = document.createElement('a');
    button.href = url.startsWith('http') ? url : `https://www.neopets.com/${url}`;
    button.classList.add('button-default__2020', 'btn-single__2020', `button-${buttonColor}__2020`, 'saahphire-next-daily-button');
    button.textContent = 'Go to next page';
    return button;
}

const addButton = (url) => (document.querySelector('.content, .container') ?? document.body).insertAdjacentElement('beforeend', createButton(url));

(async function() {
    'use strict';
    const currentIndex = await getCurrentUrlIndex(window.location.href);
    if(currentIndex === -1) return;
    GM.setValue('last-url', currentIndex);
    const nextDaily = urls[nextIndex(currentIndex)];
    if(!nextDaily) return;
    if(!document.getElementById('navtop__2020'))
        document.head.insertAdjacentHTML('beforeend', '<link href="//images.neopets.com/themes/h5/common/template.css?d=20260507" rel="stylesheet" type="text/css">');
    addButton(nextDaily);
    new MutationObserver(() => {
        if(!document.getElementsByClassName('saahphire-next-daily-button').length)
            addButton(nextDaily);
    }).observe(document.body, { childList: true, subtree: true });
})();
