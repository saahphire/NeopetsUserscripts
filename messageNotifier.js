// ==UserScript==
// @name         Neopets: Message Notifier
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Shows a toast notification whenever there's a new message in your guild's board or subscribed neoboards topics
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
    - Shadow-refreshes any board topics you have subscribed to every time you open any Neopets page
    - Does that with a random time difference between  each refresh to emulate manual refreshing
    - Shows a toast notification whenever a new message is detected

    It's my personal recommendation that you don't subscribe to more than 3 topics. I can't guarantee the safety of your
    account.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const errors = [
    [`<font color=''><b>Sorry. That is an invalid guild id.<\\/b><\\/font>`, `Invalid guild ID. Have you changed guilds?`],
    [`<strong>Oops!<\\/strong>  This topic does not exist!  Bummer, eh\\? ;\\)		<\\/div>`, `Topic "{{title}}" no longer exists! It has been forgotten.`],
    [`<SPAN style="color:blue;">\\*\\*\\* THIS TOPIC HAS BEEN LOCKED! \\*\\*\\*<\\/SPAN>`, `Topic "{{title}}" has been locked (too many replies)! It has been forgotten. Click to visit it!`]
];

const waitAndAct = async (cb) => new Promise(resolve => setTimeout(async () => resolve(await cb()), Math.ceil(Math.random() * 1000)));

const notify = (text, title, url) => {
    const lastSpace = text.slice(0, 120).lastIndexOf(" ");
    const truncated = text.slice(0, lastSpace < 0 ? 120 : lastSpace);
    GM.notification({
        text: truncated.length === text.length ? text : `${truncated}...`, 
        title: title,
        onclick: () => window.open(url, "_blank")
    });
}

const findLastMessage = (text, lastKnownMessage, isGuild) => {
    const regex = new RegExp(isGuild ? 'valign.+?<br><br>(.+?)<\\/td>.+?message_id=(\\d+)' : '<div class="boardPostMessage" >\n(.+)<\\/div>\\s*<button.+regarding=(\\d+).+\\s+<\\/li>\\s+<div class="topicNavBottom">')
    const match = text.match(regex);
    if(!match || !match[2]) return false;
    const id = parseInt(match[2]);
    if(lastKnownMessage === id) return false;
    let message = match[1].replaceAll(/<(br|p)>/g, "\n").replaceAll(/<img.+?>/g, "🖼️").replaceAll(/<.+?>/g, "");
    message.match(/&#\d+;/g)?.forEach(ascii => {
        message = message.replaceAll(ascii, String.fromCharCode(parseInt(ascii.slice(2, -1))));
    });
    return {message, id};
}

const getLastPageHtml = (html) => {
    const match = html.match(/next=(\d+)" class='boardPageButton'>\d+<\/a><a href="[^"]+" class='boardPageButton'>Next/);
    if(match) return parseInt(match[1]);
    if(html.match(/boardPageButton-active'>\d+<\/span><\/div>/)) return parseInt(window.location.href.match(/&next=(\d+)/)[1]);
    return 1;
}

const checkForNewLastPage = (html, data) => {
    if(!data.page) return;
    const lastPage = html.match("Resetting reply count... please stand by...<br><br><a href") ? 1 : getLastPageHtml(html);
    if(lastPage !== data.page) {
        updateTopic("page", data.topicId, lastPage);
        data.page = lastPage;
        return data;
    }
    return;
}

const checkforMessagesInUrl = async (url, data, attempted = false) => {
    console.log(`Fetching contents of ${data.title ?? 'guild board'}... The last known message's id was ${data.last}`);
    const response = await (await fetch(url, {method: "GET"})).text();
    for (const error of errors)
        if(response.match(error[0])) return notify(error[1].replace("{{title}}", data.title), "Error", url);
    const updatedData = checkForNewLastPage(response, data);
    if(updatedData) {
        if(attempted) throw new Error(`Tried retrieving the last page too many times!\n\nCurrent data is ${JSON.stringify(data)}\n\nUpdated data was ${JSON.stringify(updatedData)}`);
        return waitAndAct(() => checkforMessagesInUrl(url.replace(/next=\d+/, `next=${updatedData.page}`), updatedData, true));
    }
    const {message, id} = findLastMessage(response, data.last, data.title === undefined);
    if(!id) {
        console.log(`No new messages in ${data.title ?? 'guild board'}`);
        return true;
    }
    data.title ? updateTopic("last", data.topicId, id) : GM.setValue("lastguildmessage", id);
    notify(message, data.title ?? "New guild message!", url);
    return true;
}

const checkForMessages = async () => {
    const guildId = await GM.getValue("guildid");
    if(guildId) checkforMessagesInUrl(`https://www.neopets.com/guilds/guild_board.phtml?id=${guildId}`, {last: await GM.getValue("lastguildmessage")});
    const topics = await GM.getValue("topics", {});
    for (const [topicId, topicData] of Object.entries(topics)) {
        topicData.topicId = topicId;
        const url = `https://www.neopets.com/neoboards/topic.phtml?topic=${topicId}&next=${topicData.page}`;
        await waitAndAct(() => checkforMessagesInUrl(url, topicData));
    }
}

const getLastPageDom = () => {
    const lastButton = document.querySelector(".boardPageButton:nth-last-child(2)");
    if(!lastButton) return 1;
    return parseInt(lastButton.href.match(/next=(\d+)/)[1]);
}

const updateTopic = async (field, topicId, value) => {
    const topics = await GM.getValue("topics", {});
    topics[topicId][field] = value;
    GM.setValue("topics", topics);    
}

const registerGuild = () => {
    GM.setValue("guildid", parseInt(window.location.href.match(/\?id=([^&]+)/)[1]));
}

const registerTopic = async (topic) => {
    console.log(4);
    const topics = await GM.getValue("topics", {});
    topics[topic] = {
        page: getLastPageDom(),
        title: document.getElementsByTagName("h1")[0].textContent.replace("Topic:", "").trim()
    };
    GM.setValue("topics", topics);
}

const unregisterGuild = () => GM.setValue("guildid", null);

const unregisterTopic = async (topic) => {
    const topics = await GM.getValue("topics", {});
    delete topics[topic];
    GM.setValue("topics", topics);
}

const isSubscribedToGuild = async () => (await GM.getValue("guildid")) === parseInt(window.location.href.match(/id=(\d+)/)[1]);

const isSubscribedToTopic = async (topicId) => (await GM.getValue("topics", {}))[topicId];

const isSubscribed = async (topicId) => topicId ? isSubscribedToTopic(topicId) : isSubscribedToGuild();

const createLabel = async (parent, topicId) => {
    const label = document.createElement("label");
    label.classList.add("subscribe-toggle");
    label.htmlFor = "subscribe-toggle";
    label.textContent = (await isSubscribed(topicId)) ? "Unsubscribe From Messages" : "Subscribe To Messages";
    parent.appendChild(label);
}

const onCheckboxChange = (e, topicId) => {
    if(!e.target.checked) {
        e.target.nextElementSibling.textContent = "Unsubscribe From Messages";
        topicId ? unregisterTopic(topicId) : unregisterGuild();
    }
    else {
        e.target.nextElementSibling.textContent = "Subscribe To Messages";
        topicId ? registerTopic(topicId) : registerGuild();
    }
}

const createCheckbox = async (parent, topicId) => {
    parent.insertAdjacentHTML('beforeEnd', `<input type="checkbox" class="subscribe-toggle-hidden" id="subscribe-toggle"${(await isSubscribed(topicId)) ? ' checked' : ''}>`);
    document.getElementById('subscribe-toggle').addEventListener("change", (e) => onCheckboxChange(e, topicId));
}

const addGuildButton = () => {
    const row = document.querySelector("td[colspan='3'][align='center']");
    row.insertAdjacentElement('beforeEnd', row.children[1].cloneNode(true));
    createCheckbox(row);
    createLabel(row);
}

const addTopicButton = () => {
    const topicId = parseInt(window.location.href.match(/topic.phtml\?topic=(\d+)/)[1]);
    const parent = document.createElement("div");
    document.querySelector('a[href="#bottom"]').insertAdjacentElement("afterEnd", parent);
    createCheckbox(parent, topicId);
    createLabel(parent, topicId);
}

(async function() {
    'use strict';
    if(window.location.href.match(/guild_board.phtml\?id=\d+/)) addGuildButton();
    else if(window.location.href.match(/topic.phtml\?topic=\d+/)) addTopicButton();
    checkForMessages();
})();
