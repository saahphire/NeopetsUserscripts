// ==UserScript==
// @name         Neopets: Autosave Textboxes
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.1.0
// @description  Saves the contents of each textbox for you so you can retrieve it even if you accidentally exit the page
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/autosaveTextboxes.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/autosaveTextboxes.js
// @match        *://*.neopets.com/neopet_desc.phtml?edit_petname=*
// @match        *://*.neopets.com/editpage.phtml?pet_name=*
// @match        *://*.neopets.com/settings/profile*
// @match        *://*.neopets.com/neomessages.phtml?type=send*
// @match        *://*.neopets.com/neoboards/create_topic.phtml*
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @match        *://*.neopets.com/market.phtml?type=edit*
// @match        *://*.neopets.com/gallery/gallery_desc_edit.phtml*
// @match        *://*.neopets.com/gallery/handcrafted.phtml*
// @match        *://*.neopets.com/guilds/guild_board.phtml*&action=*
// @match        *://*.neopets.com/guilds/guild_admin_layout.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.deleteValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Watches every text box you write in
    - Keeps an autosave containing the last thing you wrote in a textbox before exiting a page
    - Adds a 📂 button to each text box in the website to load these autosaves into your current text box
    - Makes that button turn into a 🔙 button when pressed. It will then restore the last thing you wrote before loading
      the autosave. Your computer's undo button doesn't undo loading autosaves, so I had to make one.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const updateBox = (url, text) => text === '' ? GM.deleteValue(`${url}|temp`) : GM.setValue(`${url}|temp`, text);
const getLastBox = (url) => GM.getValue(url);

const saveBox = async (url) => {
    const temp = await GM.getValue(`${url}|temp`);
    if(!temp) return;
    GM.setValue(url, temp);
    GM.deleteValue(`${url}|temp`);
}

const getUrl = () => {
    const href = window.location.href;
    if(href.match(/\/guilds\/guild_board.phtml/)) return 'https://www.neopets.com/guilds/guild_board.phtml';
    if(href.match(/\/neoboards\/topic.phtml\?topic=\d+/)) return href.split('&')[0];
    if(href.match(/\/neomessages.phtml\?type=send.+recipient=\w+/)) return href.split('&')[0].concat(href.split('&').filter(h => h.startsWith('recipient')));
    if(href.match(/tradingpost.phtml/)) return 'tradingpost';
    return href;
}

const onTogglePressed = async (e, url, textContainer) => {
    const input = e.target;
    const label = input.nextElementSibling;
    const val = textContainer.tagName === 'BODY' ? 'innerHTML' : 'value';
    label.textContent = input.checked ? '🔙' : '📂';
    if(input.checked) {
        input.og = textContainer[val];
        textContainer[val] = await getLastBox(url);
    }
    else if(input.og || input.og === '') {
        textContainer[val] = input.og;
        input.og = null;
    }
}

const createInput = (url, textContainer) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.style.display = 'none';
    input.addEventListener('click', e => onTogglePressed(e, url, textContainer));
    input.id = 'saahphire-autosave-textboxes-toggle';
    return input;
}

const createLabel = () => {
    const label = document.createElement('label');
    label.textContent = '📂';
    label.style.fontSize = '24pt';
    label.style.display = 'block';
    label.style.textAlign = 'right';
    label.htmlFor = 'saahphire-autosave-textboxes-toggle';
    return label;
}

const createToggle = (url, textContainer) => {
    const label = createLabel();
    const input = createInput(url, textContainer);
    const sibling = textContainer.tagName === 'BODY' ? document.getElementById('Buttons1_message_body') : textContainer;
    sibling.insertAdjacentElement('beforebegin', input);
    input.insertAdjacentElement('afterend', label);
}

const onNeomailAndFirefox = (url, body) => {
    const observer = new MutationObserver(() => updateBox(url, body.innerHTML));
    observer.observe(body, {childList: true, subtree: true, characterData: true});
}

const textboxes = [
    'textarea#lookup_desc',
    'textarea[name="content"]',
    'textarea#lookup_desc',
    'textarea[name="message_body"]',
    '.topicCreateInput textarea',
    '.topicReplyInput textarea',
    'textarea[name="description"]',
    'textarea[name="handcrafted_theme"]',
    'textarea[name="message_text"]',
    'textarea[name="guild_welcome"]'
];

(function() {
    'use strict';
    const textarea = document.querySelector(textboxes.join(', '));
    const neomailFirefoxBody = document.querySelector('iframe#message_body')?.contentDocument.body;
    if(!textarea && !neomailFirefoxBody) return;
    const url = getUrl();
    saveBox(url);
    if(neomailFirefoxBody) onNeomailAndFirefox(url, neomailFirefoxBody);
    else textarea.addEventListener('input', e => updateBox(url, e.target.value));
    createToggle(url, textarea ?? neomailFirefoxBody);
})();
