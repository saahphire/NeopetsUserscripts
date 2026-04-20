// ==UserScript==
// @name         Neopets: Battleground of the Obelisk Boon Reminder
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a button that shows all boons and descriptions for a faction. Adds descriptions for boons when your faction wins.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/battlegroundOfTheObeliskBoonReminder.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/battlegroundOfTheObeliskBoonReminder.js
// @match        *://*.neopets.com/prehistoric/battleground/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds a "BOONS" button under each faction at the join screen. Click it to see a list of boons that
    faction can offer. It also adds descriptions to each boon after your faction wins.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getFaction = (li) => li.getElementsByClassName('buttonJoin')[0].id.slice(4);

const createModal = (faction) => {
    const dialog = document.createElement('dialog');
    dialog.id = `saahphire-boons-modal-${faction}`;
    dialog.classList.add('saahphire-boons-modal');
    factions[faction].forEach(boon => {
        const strong = document.createElement('strong');
        strong.textContent = `${boon}: `;
        const p = document.createElement('p');
        p.textContent = boons[boon];
        p.insertAdjacentElement('afterbegin', strong);
        dialog.appendChild(p);
    });
    const buttonClose = document.createElement('button');
    buttonClose.command = 'close';
    buttonClose.setAttribute('commandfor', dialog.id);
    buttonClose.textContent = 'Close';
    dialog.appendChild(buttonClose);
    document.body.appendChild(dialog);
}

const addButton = (faction, li) => {
    const button = document.createElement('button');
    button.textContent = 'Boons';
    button.command = 'show-modal';
    button.setAttribute('commandfor', `saahphire-boons-modal-${faction}`);
    button.classList.add('buttonJoin', 'saahphire-boons-button', faction);
    li.querySelector('a:has(.buttonJoin)').insertAdjacentElement('afterend', button);
}

const addPerkSelectionDescription = (li) => {
    const perk = li.querySelector('b');
    perk.insertAdjacentHTML('afterend', `<p>${boons[perk.textContent]}</p>`);
}

const init = () => {
    if(!document.getElementById('chooseFactionLabel') && !document.getElementById('choosePerkLabel')) return;
    document.head.insertAdjacentHTML('beforeend', css);
    document.querySelectorAll('#cinematics li').forEach(li => {
        const faction = getFaction(li);
        addButton(faction, li);
        createModal(faction);
    });
    document.querySelectorAll('.perks li').forEach(addPerkSelectionDescription);
}

const factions = {
    awakened: ['Random'],
    brutes: ['Doppelgänger', 'Equip ALL THE THINGS', 'GRRRAAAAHHHHHH', 'Right Round Round Round', 'Scratch Master'],
    wizards: ['Cartogriphication', 'Doctor who?', 'Doppelgänger', 'Double Bubble', 'Refreshed Quest Request'],
    seekers: ['Bank Bribery', 'Book Smarts', 'Doctor who?', 'Right Round Round Round', 'Strength of Mind'],
    sway: ['Bank Bribery', 'Black Market Goods', 'Cheaper by the Dozen', 'Refreshed Quest Request', 'That Millionaire Feeling'],
    thieves: ['Cheaper by the Dozen', 'Doppelgänger', 'Five-Finger Discount', 'LOL AVIES', 'Scratch Master']
}

const boons = {
    'Bank Bribery': 'Increases your interest rate at the bank by 3%',
    'Black Market Goods': 'Shows and highlights exclusive items in shops',
    'Book Smarts': 'Receive 2-4 intelligence points when reading books',
    'Cartogriphication': 'Know the right path in Faerie Carverns',
    'Cheaper by the Dozen': 'Change minimum value of stocks you buy to 10 NP',
    'Doctor who?': 'Healing Springs fully heals pets in addition to original action',
    'Doppelgänger': 'Chance to reuse one-use items in the Battledome',
    'Double Bubble': 'Healing Potions, Morphing Potions, and Meridell Potions have a chance to refill',
    'Equip ALL THE THINGS': 'Equip one extra weapon per pet',
    'Five-Finger Discount': '10% discount on shops (except user shops)',
    'GRRRAAAAHHHHHH': 'Deal 10% more damage in the Battledome',
    'LOL AVIES': "Pilfer another person's avatar while boon is active",
    'Random': 'Five random boons will be selected once the week is over.',
    'Refreshed Quest Request': 'Reroll faerie quests you receive once',
    'Right Round Round Round': 'Spin wheels one additional time before waiting between spins',
    'Scratch Master': 'Buy one additional stractchcard before waiting between purchases',
    'Strength of Mind': 'May use the move "Mind Blast" while the boon is active',
    'That Millionaire Feeling': 'Broken. Do not pick.'
}

const css = `<style>
.saahphire-boons-button {
    position: relative;
    border: 0;
    margin: 13px;
    font-size: 0;

    &::after {
        content: "";
        display: inline-block;
        position: absolute;
        background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHgAAAAaCAYAAAB8WJiDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFfUlEQVRoge2ZQWgTSxjHf/uulUr1IQqFQMAVL6FaPOnFNVIvXoTA0mshD1lPWiy+R3KJfQiP9WQqfSTgQaREeQheUhoqHuKl9rAeKxsQPBhBq5Ccv3fI7LibJu9p1WQt+cPAzuw333w7//lmZ77PEBFG2Lv4ZdgGjPBjMSJ4j2NEcBcMw5j4Svm0Kl/Vb2AQkdgU4BKwBkiorAHZHrLjwALgK7kPwDIw1UP2LFAJ6XwR1ql0LQFimqYAi6o9AdxSNnwItWeVDnEcRxzHCfpNDHsOd3z7sA3oImLN8zwJw/M8cV03IPpSmJBSqSTNZlNERFqtllSrVbEsSxOkZBcty5J6va51+r4f6FwGpoCFUqmk9QAfVN9blUpFPM/T7cCS67ri+37Ezo6vDH8O406wnuhueJ4XeEkCWOwn12q1xLZtUbvBhGma0mq1espWq9WA5Mi4uVxOgEx3OyCVSqWnrrgSHOt/cD6f5/nz5wCkUilu3rwJsGCa5u+2bQPQaDS4cuUK5XIZgLGxMW7cuAFwGchev36dsbExAMrlMvl8nkajAcDMzAyO42SBxuvXr/W4p0+fBkh322OaJplMBoB2u83t27c5d+4chmEA3P3uE/A9MOwVFi708Bi6tm1AcrmcrqutNgssV6tV3a626hfBVtpsNoXO/3rOsiwtF3ix4zgRj1T9I/aEZUqlkgCLQHLY8/ZfJdYerFDb2NiINCQSCf2svLEB1Or1um6fnZ0FmE4mkwC8ffsWoCEi5fX19c3Ai8+cOQOd7TgC1T+C9+/f6+fJyUmAX0WksZuPGhR+BoKTajIDMjePHz+uXxaLRUSkBmyGCZ6cnCTYxgHUIqmp6uarV6+AzpZuWdaOK87FixehszNorKys8O7dO+Dz9m4Yxvy3fuCPRKwJdhyHarWanZmZAeDevXsA2/v27dshKyKN9fV1XT9y5AgHDx7sp7rx5s0bXQkvmACHDh3Cdd1kd/v9+/f1cz6fxzTNvwzDSHTLxQWxJvjOnTsE5JbLZQqFwkAOMqurqwCk0zvOWVy7dq328uVLoLMIgoPfIOzaDWJN8OrqKu12G4C5uTlc1708iHHVTkEqleLUqVPdr+9mMhltVyaTwbbty4ZhXBqEbV+LWBN84cIFTp48qa81V69exbKsnW5FJ8RomuaXqp4YHx/v+3JlZYXAS1OpVOSdiPyztbX158LCZ6cNXctih1gTDLC1tfXb48ePdX12dpbwqdq2bQzDmAamz58/r9s3NjYoFou6rv6z06o6fezYMf0uLBfg0aNHfW0SkT+KxWItvAgsy0obhrHjnz1sxJ5gYPvjx4+Rhk+fPunno0ePAiSB6RMnTuh2FbhoBKfew4cPB3IA6cAzg5P5gQMHImMUCgXdtw8e1mo1XVELaETwLpBWkSUAHjx4wPLysq6Hok5ZdbWh3W5TKBS2gYfPnj0DIJlMYlnWtGEY867r6v5Pnz4FeBi+Wyv8/eTJkx3GBNkjYGr//v3f4fN+MIYdaQkXekSOwvV6vS50skKRqFWpVIrEiMNRpnDUyvd9yeVykQSFim/3iqBF+gbtQfYoPF44QRG3MnQDIsZ8WbLhLDBlWVbPJILv+0E6cFzpXOqXIFBJhcVeBKu+lXAWCpDubJeIDpfqDFacytANiBgDWdd1xfM8XarVqjiOE0kXKtlF27a1N4p04spqEcyF5BLdJDebzYDcpe5xg5i1as/kcjmdGuwm2PO8iJ44lqEb0ItkRWZQloF0H9l5wHccJ0gO9Ev4J4Aly7KCxeID833GjbwD5tSOIMBSV4J/DcgMe87+qxjqI35qqENPQ/4n8K+uMUnpxK6/ZSyATRHZ3q2eQWFPEDxCf/wM16QRvgEjgvc4/gXqU2pSN6U4SgAAAABJRU5ErkJggg==");
        top: 0;
        left: 0;
        width: 120px;
        height: 26px;
    }

    &:hover {
        background-position-y: -26px;
    }
    
    &.thieves {
        background-position-x: 0;
    }

    &.wizards {
        background-position-x: -120px;
    }

    &.brutes {
        background-position-x: -240px;
    }

    &.seekers {
        background-position-x: -360px;
    }

    &.sway {
        background-position-x: -480px;
    }

    &.awakened {
        background-position-x: -600px;
    }
}

.saahphire-boons-modal {
    text-align: left;
}
</style>`;

(function() {
    'use strict';
    init();
})();
