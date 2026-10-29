// ==UserScript==
// @name         Neopets: Guild Link Safeguards
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Helps prevent you from activating Leave Guild and Delete This Message
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/guildLinkSafeguards.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/guildLinkSafeguards.js
// @match        *://*.neopets.com/guilds*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This configurable script tries to prevent you from clicking dangerous links that can do something you didn't want:
        - Leave Guild
        - Delete This Message (admins)

    Please note that because all settings are in variables, whenever this script is updated your settings will be
    restored to default.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const settings = {
    // Configurations pertaining to the admin-only link "Delete This Message". Set to true to activate a config. Set
    // everything to false to do absolutely nothing (other than fix the pop-up when you open in a new tab).
    deleteThisMessage: {
        // Completely remove every "Delete This Message" link. You'll have to deactivate this script to delete a message.
        remove: false,
        // Only show "Delete This Message" when you hover your mouse over the bottom right of a post.
        hide: true,
        // Replace "Delete This Message" with 🗑️.
        emoji: true,
        // Make the link red, even if it's an emoji.
        red: true,
        // The link will still be there, but won't do anything.
        disable: false
    },
    // Configurations pertaining to the "Leave Guild" link. Set to true to activate a config. Set everything to false
    // to do absolutely nothing (other than fix the pop-up when you open in a new tab).
    leaveGuild: {
        // Completely remove the "Leave Guild" link. You'll have to deactivate this script to leave the guild.
        remove: false,
        // Move "Leave Guild" to its own category, away from Options.
        category: true,
        // Replace "Leave Guild" with 🔚.
        emoji: true,
        // Make the link red, even if it's an emoji.
        red: true,
        // The link will still be there, but won't do anything.
        disable: false
    }
};

const changeCategory = () => {
    if(settings.leaveGuild.remove || !settings.leaveGuild.category) return;
    const parent = document.querySelector('[cellpadding="4"] tbody');
    const title = parent.firstChild.cloneNode(true);
    title.getElementsByTagName('b')[0].textContent = 'Danger Zone';
    parent.appendChild(title);
    parent.insertAdjacentHTML('beforeend', `<tr><td bgcolor="white" align="left" valign="top" class="content"><ul style="margin: 0 0 0 15px; padding: 0;"></ul></td></tr>`);
    title.nextElementSibling.getElementsByTagName('ul')[0].appendChild(document.querySelector('[onclick*="leave"]'));
}

const replaceDeleteWithEmoji = (parent) => {
    if(!settings.deleteThisMessage.emoji) return;
    const element = parent.getElementsByTagName('font')[0];
    element.textContent = '🗑️';
}

const replaceLeaveWithEmoji = () => {
    if(!settings.deleteThisMessage.emoji) return;
    document.querySelector('[onclick*="leave"] li').textContent = '🔚';
}

const linkCss = (config) => `
    ${config.remove || config.hide ? 'display: none;' : ''}
    ${config.red ? 'filter: brightness(0) saturate(100%) invert(14%) sepia(100%) saturate(6336%) hue-rotate(3deg) brightness(97%) contrast(120%);' : ''}
    ${config.disable ? 'pointer-events: none;' : ''}
`;

const css = `<style>
[onclick*="delete"] {
    ${linkCss(settings.deleteThisMessage)}
}
[onclick*="leave"] {
    ${linkCss(settings.leaveGuild)}
}
[align="right"]:has([onclick*="delete"]):hover [onclick*="delete"] {
    ${settings.deleteThisMessage.hide && !settings.deleteThisMessage.remove ? 'display: inline;' : ''}
}
</style>`;

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    changeCategory();
    replaceLeaveWithEmoji();
    document.querySelectorAll('[onclick*="delete"]').forEach(replaceDeleteWithEmoji);
})();
