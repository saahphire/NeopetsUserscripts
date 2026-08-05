// ==UserScript==
// @name         Neopets: Auto-Censor Filtered Words
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.1
// @description  Adds a period to every filtered word you try to type. uncle => u.ncle
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/autoCensorFilteredWords.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/autoCensorFilteredWords.js
// @match        *://*.neopets.com/guilds/guild_board.phtml*action=*
// @match        *://*.neopets.com/neomessages.phtml*type=send*
// @match        *://*.neopets.com/editpage.phtml*
// @match        *://*.neopets.com/neopet_desc.phtml*
// @match        *://*.neopets.com/market.phtml*type=edit*
// @match        *://*.neopets.com/gallery/gallery_desc_edit.phtml
// @match        *://*.neopets.com/settings*
// @match        *://*.neopets.com/neoboards/topic.phtml*
// @match        *://*.neopets.com/neoboards/create_topic.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Whenever you're typing something (or paste into your text area) and accidentally write a filtered word, this adds a
    period to the start of the word so it won't be filtered. Please don't abuse it, this is meant to stop you from
    losing your progress when writing something innocuous like grapes. Every single word on the censoring list can be
    found inside another innocent word, except for uncle but it's ridiculous that we aren't allowed to mention uncles.

    Anyway, write document and it'll become doc.ument and so forth.

    Please note that the script will also censor words inside of links. You wouldn't be able to use the uncensored link
    anyway. But it'll silently break links.

    You can't really escape from it, either. I'm not sure why you would want to, but removing the period won't have any
    effect. It'll be added back as soon as you remove it. If you need it off, turn the script off in your extension and
    refresh the page.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const areas = '#lookup_desc, #message_body, [name="content"], [name="description"], [name="message"], [name="message_text"], [name="message_title"], [name="subject"], [name="topic_title"]';

const regexp = /uncle|kill|balls|cum|rape|crack|weed|semen|boob/gi;

const listenToTyping = (e) => {
    let cursor = e.target.selectionStart;
    const replacement = e.target.value.replaceAll(regexp, (match, position) => {
        if(position <  cursor) cursor++;
        return `${match[0]}.${match.slice(1)}`;
    });
    if(e.target.value !== replacement) e.target.value = replacement;
    e.target.setSelectionRange(cursor, cursor);
}

const attachCensorers = () => {
    document.querySelectorAll(areas).forEach(textarea => {
        textarea.addEventListener('input', listenToTyping)
        textarea.addEventListener('paste', listenToTyping)
    });
}

const onSettingsPage = () => {
    const observer = new MutationObserver(attachCensorers);
    observer.observe(document.getElementsByClassName('settings-container')[0], {childList: true, subtree: true});
}

(function() {
    'use strict';
    if(window.location.href.match('/settings/')) onSettingsPage();
    attachCensorers();
})();
