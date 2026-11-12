// ==UserScript==
// @name         Neopets: Nicknames and Notes
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds buttons so you can give users nicknames and write notes about them. They'll be viewable in guilds, neomail, and topics.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/nicknamesAndNotes.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/nicknamesAndNotes.js
// @match        *://*.neopets.com/guilds*
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @match        *://*.neopets.com/neomessages.phtml?type=read_message*
// @match        *://*.neopets.com/neomessages.phtml?type=send*reply*
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
    Next to each person's username, you now have:
    - A button 🗣️ to edit that person's nickname. It'll show up under their username.
    - A button 📝 to open that person's notes
    - Their set nickname, if any

    Available in:
    - Guild chats
    - Neoboard topics
    - Neomail (read and reply)

    Leave nicknames/notes empty to delete them.

    The buttons might wrap with very long usernames in guilds. There's nothing I can do, there isn't enough space.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getAllUsernameElements = () => document.querySelectorAll('a[href*="randomfriend"]:has(b), a[href*="userlookup"]:has(b), a:has(.postAuthorName)');

const create = (tagName, attributes, textContent) => {
  const element = document.createElement(tagName);
  if(attributes) Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if(textContent) element.textContent = textContent;
  return element;
}

const getNicknameElement = (usernameElement) => usernameElement.parentElement.getElementsByClassName('saahphire-nan-nickname')[0] ?? usernameElement.parentElement.getElementsByClassName('saahphire-nan-btn')[1].insertAdjacentElement('afterend', create('p', { 'class': 'saahphire-nan-nickname' }));

const updateNicknameElement = async (usernameElement) => {
    const username = usernameElement.textContent;
    const nickname = await GM.getValue(`nickname-${username}`);
    const nicknameElement = getNicknameElement(usernameElement);
    if(nickname) nicknameElement.textContent = nickname;
    else nicknameElement.remove();
}

const updateData = async (e, username, data, type) => {
    data.length ? await GM.setValue(`${type}-${username}`, data) : await GM.deleteValue(`${type}-${username}`);
    if(type === 'nickname') getAllUsernameElements().forEach(updateNicknameElement);
    e.target.textContent = '✔️ Saved!';
    setTimeout(() => e.target.textContent = '💾 Save', 500);
}

const createModal = (username, data, type) => {
    const modal = create('dialog', { id: `saahphire-nan-${type}-${username}-modal`, 'class': `saahphire-nan-modal` });
    const label = create('label', { 'for': `saahphire-nan-${type}-${username}` }, `${type.charAt(0).toUpperCase()}${type.slice(1)} for ${username}:`);
    modal.appendChild(label);
    const textBox = create(type === 'notes' ? 'textarea' : 'input', { type: 'text', id: `saahphire-nan-${type}-${username}` });
    if(data) textBox.value = data;
    modal.appendChild(textBox);
    const buttonSave = create('button', { type: 'button' }, '💾 Save');
    buttonSave.addEventListener('click', (e) => updateData(e, username, textBox.value, type));
    modal.appendChild(buttonSave);
    const buttonClose = create('button', { type: 'button' }, '✖️ Close');
    modal.appendChild(buttonClose);
    buttonClose.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
    modal.showModal();
}

const createButton = (username, icon, listener) => {
    const button = create('button', {'class': 'saahphire-nan-btn', type: 'button'}, icon);
    username.insertAdjacentElement('afterend', button);
    button.addEventListener('click', () => listener(username));
    return button;
}

const init = () => {
    document.head.insertAdjacentHTML('beforeend', css);
    getAllUsernameElements().forEach((username) => {
        getAllUsernameElements().forEach(updateNicknameElement);
        createButton(username, '📝', async (username) => createModal(username.textContent, await GM.getValue(`notes-${username.textContent}`), 'notes'));
        createButton(username, '🗣️', (username) => createModal(username.textContent, getNicknameElement(username)?.textContent, 'nickname'));
    });
}

const css = `<style>
.saahphire-nan-btn {
    appearance: none;
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
}

.saahphire-nan-modal {
    display: grid;
    padding: 1em;
    gap: 0.5em 1em;
    grid-template-columns: 1fr 1fr;

    label, input, textarea {
        grid-column: span 2;
    }

    textarea {
        width: 25em;
        height: 10em;
    }
}

.saahphire-nan-nickname {
    margin: 0;

    & + font br:first-child {
        display: none;
    }
}

.medText > .saahphire-nan-nickname {
    display: inline;
}

.postAuthorName {
    display: inline;
}
</style>`;

(function() {
    'use strict';
    init();
})();
