// ==UserScript==
// @name         Neopets: Guild Board URL Linkifier
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Turns written URLs to clickable links in the Guild Message Board
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/guildBoardURLLinkifier.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/guildBoardURLLinkifier.js
// @match        *://*.neopets.com/guilds/guild_board.phtml?id=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Inspired on this script: https://greasyfork.org/en/scripts/524570-sn0tspoon-neopets-url-linkifier
    ^ It works perfectly for the Neoboards, but doesn't do anything in guilds. This script fills that hole.

    I didn't want to copy their code, so I didn't even look at it. Meaning there's a chance our regexes catch different
    stuff. Mine shouldn't have false negatives, but false positives can happen. Like if someone.speaks.like.this, it'll
    get flagged as a link. I didn't want to include every possible domain extension because there's over a thousand.
    1760, I think? So anything over 2 letters is accepted. I didn't set a limit because .vermögensberatung exists so why
    bother. Anyway, I won't accept bug reports about this kind of false positive. They're a necessary evil if you want
    neoquest.guide to be linkified.

    Don't use this script if you're under 13. It linkifies URLs that aren't Neopets-approved.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const bannedTags = ['TR', 'A', 'SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'];

const replacements = [
    [/\b(https?:\/\/[^\s<]+)/gi, '<a href="$&">$&</a>'],
    [/(?<!https?:\/\/)(?<![^\s/])([a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:[a-z]{2,}))(?:\/[^\s<]*)?\b/gi, '<a href="https://$&">$&</a>'],
    [/\B\/~[\w#]+/gi, '<a href="https://neopets.com$&">$&</a>']
];

(function() {
    'use strict';
    let flagMultiple;
    document.querySelectorAll('[width="300"][bgcolor="white"]').forEach(post => {
        const nodesToReplace = [];
        const treeWalker = document.createTreeWalker(post, NodeFilter.SHOW_TEXT);
        while(treeWalker.nextNode()) {
            const tag = treeWalker.currentNode.parentElement.tagName;
            if (bannedTags.includes(tag)) {
                if(tag === 'A') flagMultiple = true;
                return;
            }
            if(replacements.some(replacement => treeWalker.currentNode.textContent.match(replacement[0])))
                nodesToReplace.push(treeWalker.currentNode);
        }
        for (const node of nodesToReplace) {
            const span = document.createElement('span');
            span.innerHTML = replacements.reduce((innerHTML, replacement) => innerHTML.replaceAll(...replacement), node.textContent);
            while(span.firstChild) node.parentNode.insertBefore(span.firstChild, node);
            node.remove();
            span.remove();
        }
    });
    if(flagMultiple) console.info('Hey! You seem to have two scripts that linkify your guild URLs! You only need one, so uninstall "Neopets: Guild Board URL Linkifier".');
})();
