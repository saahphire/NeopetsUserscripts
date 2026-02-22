// ==UserScript==
// @name         Neopets: Copy Post Info
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.1
// @description  Adds a button to copy a NeoBoard post's timestamp, username, page, and maybe post number
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/copyPostInfo.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/copyPostInfo.js
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds a button under a post, left of the Report button, that copies information in this format:
    Timestamp	Username	Page	Post Number*
    They're separated by \tabs so you can paste it into Google Sheets or Excel and each will be in one horizontal cell.

    * Post number is only copied if you also have my userscript Add Post Number To Topics installed.
      (I could have @required it, but that'd add a post number to each post, and you might not want that)
      Use GreasyFork OR GitHub, not both:
      https://github.com/saahphire/NeopetsUserscripts/blob/main/addPostNumberToTopics.js
      https://greasyfork.org/en/scripts/565060-neopets-add-post-number-to-topics

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const buttonColor = '#e587e2';

const copyInfo = (button, li) => {
    const timestamp = li.getElementsByClassName('boardPostDate')[0].textContent.trim();
    const username = li.getElementsByClassName('postAuthorName')[0].textContent;
    const page = document.getElementsByClassName('boardPageButton-active')[0]?.textContent ?? 1;
    const post = li.getElementsByClassName('boardPostNumber')[0]?.textContent.replace('#', '');
    navigator.clipboard.writeText(`${timestamp}\t${username}\t${page}${post ? '\t' + post : ''}`);
    button.textContent = '✔️';
}

const addButtonToPost = post => {
    const button = document.createElement('button');
    button.role = 'button';
    button.textContent = 'Copy Info';
    button.classList.add('saahphire-copy-post-info-button');
    button.addEventListener('click', () => copyInfo(button, post));
    post.getElementsByClassName('reportButton-neoboards')[0].insertAdjacentElement('beforebegin', button);
}

const css = `<style>
.saahphire-copy-post-info-button {
    display: inline-block;
    float: left;
    margin-top: 5px;
    border: 1px solid ${buttonColor};
    font-family: "Palanquin", 'Arial Bold', sans-serif;
    font-size: 9pt;
    line-height: 9pt;
    padding: 5px 10px;
    box-sizing: border-box;
    color: ${buttonColor};
    background-color: #fff;
    border-radius: 10px;
    cursor: pointer;
    &:hover {
        background-color: ${buttonColor};
        color: white;
    }
}
</style>`;

(function() {
    'use strict';
    document.querySelectorAll('li:has(.boardPostByLine)').forEach(addButtonToPost);
    document.head.insertAdjacentHTML('beforeend', css);
})();
