// ==UserScript==
// @name         Neopets: Bigger Text Areas
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Makes various text boxes a lot bigger
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/biggerTextAreas.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/biggerTextAreas.js
// @match        *://*.neopets.com/neopet_desc.phtml?edit_petname=*
// @match        *://*.neopets.com/editpage.phtml?pet_name=*
// @match        *://*.neopets.com/settings/profile*
// @match        *://*.neopets.com/settings/neoboards*
// @match        *://*.neopets.com/neomessages.phtml?type=send*
// @match        *://*.neopets.com/neoboards/create_topic.phtml*
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @match        *://*.neopets.com/market.phtml?type=edit*
// @match        *://*.neopets.com/gallery/gallery_desc_edit.phtml*
// @match        *://*.neopets.com/gallery/handcrafted.phtml*
// @match        *://*.neopets.com/guilds/guild_board.phtml*&action=*
// @match        *://*.neopets.com/guilds/guild_admin_layout.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    This script maximizes the area of the text boxes for the following:
    - Pet lookups
    - Pet pages
    - User lookups
    - Neoboards fonts
    - Neomails
    - Topic titles
    - Posts
    - Shop descriptions
    - Gallery descriptions
    - Gallery handcrafted themes
    - Guild layouts
    - Guild posts

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
*/

const onPetLookup = () => {
    [...document.querySelectorAll('table[width="450"] tr')].slice(0, 2).forEach(row => row.remove());
    const table = document.querySelector('table[width="450"]');
    table.insertAdjacentElement('afterEnd', document.getElementById("bxwrap"));
    table.insertAdjacentElement('afterEnd', document.querySelector('p[align="center"]'));
    table.style.paddingTop = 0;
    table.style.width = "100%";
    table.previousElementSibling.remove();
    table.previousElementSibling.remove();
    const pet = document.querySelector('td[width="200"]');
    document.querySelector('td[width="250"] center').insertAdjacentHTML('afterBegin', `<p><strong>Pet: </strong>${pet.textContent}</p>`);
    pet.remove();
    const textarea = table.getElementsByTagName("textarea")[0];
    textarea.style.width = "100%";
    textarea.style.height = "80vh";
}

const onPetPage = () => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    details.appendChild(summary);
    const firstP = document.querySelector('.content p');
    firstP.insertAdjacentElement('beforeBegin', details);
    summary.textContent = firstP.textContent;
    firstP.remove();
    details.appendChild(document.querySelector('.content ul'));
    details.appendChild(document.querySelector('.content p'));
    document.querySelector('.content p').remove();
    details.appendChild(document.querySelector('.content p'));
    document.querySelector('form table').remove();
    document.querySelector('.content textarea').style.width = "100%";
}

const onUserLookup = () => document.head.insertAdjacentHTML('beforeend', '<style>.settings-textarea{height:80vh;}</style>');

const onFont = () => document.head.insertAdjacentHTML('beforeend', '<style>.settings-textbox{grid-column: span 2}</style>');

const onNeomail = () => document.querySelector('[name="message_body"]').style.height = "50vh";

const onTopic = () => {
    document.querySelector('[name="message"]').style.height = "40vh";
    document.querySelector('[name="topic_title"]').style.width = '50vw';
}

const onPost = () => document.querySelector('[name="message"]').style.height = '40vh';

const onShop = () => {
    const tr = document.createElement('tr');
    const td = document.querySelector('[bgcolor="#ffffcc"]:has(textarea)');
    td.colSpan = '2';
    td.previousElementSibling.colSpan = '2';
    td.querySelector('textarea').style.width = '100%';
    td.querySelector('textarea').style.height = '80vh';
    td.querySelectorAll('a, font').forEach(el => el.remove());
    td.parentElement.insertAdjacentElement('afterend', tr);
    tr.appendChild(td);
}

const onHandcrafted = () => {
    const textarea = document.getElementsByName('handcrafted_theme')[0];
    textarea.style.display = 'block';
    textarea.style.width = '100%';
    textarea.style.height = '80vh';
}

const onGuildLayout = () => document.getElementsByName('guild_welcome')[0].style.width = '100%';

const onGuildBoard = () => {
    const textarea = document.getElementsByName('message_text')[0];
    textarea.style.width = '100%';
    textarea.style.height = '50vh';
}

const locator = [
    ['neopet_desc', onPetLookup],
    ['editpage', onPetPage],
    ['profile', onUserLookup],
    ['settings\\/neoboards', onFont],
    ['neomessages', onNeomail],
    ['create_topic', onTopic],
    ['topic=', onPost],
    ['market', onShop],
    ['gallery_desc_edit', onShop],
    ['handcrafted', onHandcrafted],
    ['guild_admin_layout', onGuildLayout],
    ['guild_board', onGuildBoard]
];

(function() {
    'use strict';
    locator.find(location => window.location.href.match(location[0]))[1]();
})();
