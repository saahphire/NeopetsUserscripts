// ==UserScript==
// @name         Neopets: Notifications
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Shows a native browser notification whenever you get an alert/event, or random event
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/alertNotifications.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/alertNotifications.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.notification
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Checks your alerts in both the old and beta layouts
    - Shows a native browser notification whenever it detects an alert that might be new
    - Does the same for random events (can be toggled off in the first line of code)
    Please note that if you get two alerts with the same text back to back in the old layout, you won't get notified for
    the second one.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Change to false to turn random event notifications off
const notifyRandomEventsToo = true;
// Change to false to turn notifications off for TNT neomails
const notifyTNT = true;

const notify = (title, message, url = "https://www.neopets.com/allevents.phtml") => GM.notification({title: title, text: message, onclick: () => window.open(url, "_blank")});

const update = (data) => GM.setValue("last", {message: data?.message, id: data?.id});

const check = (oldMessage, oldId) => {
    const notif = document.querySelector(".eventIcon, #alerts li");
    if(!notif) return;
    const message = (notif.querySelector("p") ?? notif.childNodes[2])?.textContent.trim();
    const id = notif.querySelector(".alert-x")?.dataset.delid;
    console.log(`message: {${message}} | id: ${id} | old message: {${oldMessage}} | old id: ${oldId}`);
    if(!message || (message === oldMessage && oldId && id && oldId === id) || (message === oldMessage && (!oldId || !id)))
        return id ? {message: oldMessage, id: id} : {message: oldMessage};
    const title = notif.querySelector("b, h4").textContent;
    const url = notif.getElementsByTagName("a")[0].href;
    return {message, id, title, url};
}

const checkUpdateNotify = async () => {
    const oldValues = await GM.getValue("last", {});
    const newValue = check(oldValues.message, oldValues.id);
    update(newValue);
    if(newValue?.message && newValue.message !== oldValues.message && (notifyTNT || !newValue.message.contains("theneopetsteam"))) notify(newValue.title, newValue.message, newValue.url);
}

(function() {
    'use strict';
    checkUpdateNotify();
    if(notifyRandomEventsToo && document.querySelector(".randomEvent"))
      notify("Something has happened!", document.querySelector(".randomEvent .copy").textContent, window.location.href);
})();
