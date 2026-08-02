// ==UserScript==
// @name         Neopets: Copy Guild Members
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a button to the guild member page that allows you to copy their usernames
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/copyGuildMembers.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/copyGuildMembers.js
// @match        *://*.neopets.com/guilds/guild_members.phtml?id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This is very simple. In nameFormat, write the way each name should be in your list.
    Substitutions:
    \' = '
    \n = line break
    {{username}} = each username
    
    Example:
    <a href="https://www.neopets.com/randomfriend.phtml?user={{username}}&place=99999">{{username}}\'s profile</a>\n
    becomes:
    <a href="https://www.neopets.com/randomfriend.phtml?user=user1&place=99999">user1's profile</a>
    <a href="https://www.neopets.com/randomfriend.phtml?user=user2&place=99999">user2's profile</a>
    and so on.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const nameFormat = '- {{username}}\n';

const writeNames = () => [...document.querySelectorAll('a [face="arial"] b')].map(username => nameFormat.replaceAll('{{username}}', username.textContent)).join('');

const restoreButtonText = (button) => button.textContent = 'Copy Usernames';

const addButton = () => {
    const button = document.createElement('button');
    button.style.display = 'block';
    restoreButtonText(button);
    button.addEventListener('click', () => {
        navigator.clipboard.writeText(writeNames());
        button.textContent = 'Copied!';
        setTimeout(() => restoreButtonText(button), 350);
    });
    document.querySelector('[align="center"]:has([face="arial"])').appendChild(button);
}

(function() {
    'use strict';
    addButton();
})();
