// ==UserScript==
// @name         Neopets: Guild Message Notifier
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Shows a toast notification whenever there's a new message in your guild's board
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/guildMessageNotifier.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/guildMessageNotifier.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.notification
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Shadow-refreshes your guild's message board every time you open any Neopets page
    - Shows a toast notification whenever a new message is detected

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getGuildId = async () => {
    const match = window.location.href.match(/neopets.com\/guilds\/guild(?:_\w+)?.phtml\?id=([^&]+)/);
    if(match && match[1]) await GM.setValue("guildid", parseInt(match[1]));
}

const notify = (text, title = "New guild message!") => {
    const lastSpace = text.slice(0, 120).lastIndexOf(" ");
    const truncated = text.slice(0, lastSpace < 0 ? 120 : lastSpace);
    GM.notification({
        text: truncated.length === text.length ? text : `${truncated}...`, 
        title: title,
        onclick: () => window.open("https://www.neopets.com/guilds/guild_board.phtml", "_blank")
    });
}

const isNewMessage = async (id) => {
    const lastId = await GM.getValue("lastmessage");
    if(lastId === id) return false;
    GM.setValue("lastmessage", id);
    return true;
}

const findLastMessage = async (text) => {
    const match = text.match(/valign.+?<br><br>(.+?)<\/td>.+?message_id=(\d+)/);
    if(!match || !match[2]) return false;
    const id = parseInt(match[2]);
    if(!(await isNewMessage(id))) return false;
    let message = match[1].replaceAll(/<(br|p)>/g, "\n").replaceAll(/<img.+?>/g, "🖼️").replaceAll(/<.+?>/g, "");
    message.match(/&#\d+;/g).forEach(ascii => {
        message = message.replaceAll(ascii, String.fromCharCode(parseInt(ascii.slice(2, -1))));
    });
    return message;
}

const checkForMessages = async () => {
    const guildId = await GM.getValue("guildid");
    if(!guildId) return notify("Please open any page in your guild to enable the Guild Message Notifier!", "Error");
    const response = await (await fetch(`https://www.neopets.com/guilds/guild_board.phtml?id=${guildId}`, {
        method: "GET"
    })).text();
    if(response.match("Sorry. That is an invalid guild id")) return notify("Invalid guild ID. Have you changed guilds?", "Error");
    const messageBody = await findLastMessage(response);
    if(messageBody) notify(messageBody);
}

(async function() {
    'use strict';
    await getGuildId();
    checkForMessages();
})();
