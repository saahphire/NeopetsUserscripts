// ==UserScript==
// @name         Neopets: Post Requirement Counter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a counter to topics with a set string in their names, that counts posts including given images or strings as long as they're from the current month.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/postRequirementCounter.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/postRequirementCounter.js
// @match        *://*.neopets.com/neoboards/topic.phtml*
// @match        *://*.neopets.com/neomessages.phtml?type=read_message*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    Yeah, I know. Wildly specific. I don't think anyone will use this, it's just here as a backup. What it does is:
    - Count posts following "requirements" 📖:
        - In a topic that has a specific string in its title (case insensitive)
        - Posted during the current month
        - Posted within a date range (for example, from the 1st to the 25th, inclusive)
        - That has any of an array of images in it (smilies, but stickers would work too); AND
        - That includes any of an array of strings in it (note that those "fonts" that use symbols won't be seen, so
          "𝓱𝓮𝓵𝓵𝓸" will be ignored, but it's case insensitive, so "HELLO" and "hello" are both valid)
    - Count posts for a leaderboard 🏆:
        - In a topic that has a specific string in its title
        - Posted during the current month
        - Posted within a date range
        - That has any of an array of images OR any of an array of strings in it (or both)
    - Add the following information under each poster's active Neopet:
        - Whether that post meets the requirements 📖 or not 📘
        - The amount of posts meeting the requirements that poster has posted
        - A + and - sign so you can adjust that specific post's count (obviously clicking + on a post that's already
          flagged as meeting the requirements won't do anything, and the other way around too)
        - Whether that post can be added to the leaderboard 🏆 or not ✖️
        - The amount of posts added to the leaderboard for that person
        - A + and - sign so you can adjust that specific post's count
    - Add a button next to the breadcrumbs on top of the topic's page (if it has the specific string) to open the
      leaderboard, a list of all users who posted on that date range with the amount of posts added to the leaderboard
    - Add a line under a neomail's sender's name with their 📖 requirement count | 🏆 leaderboard count

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const settings = {
    topicTitle: 'whatever you write here HAS to be in the topic title',
    // The first day of the month in which people can post things that will be counted for requirements and the leaderboard
    firstValidDay: 1,
    // The last day of the month in which people can post things and be counted
    lastValidDay: 25,
    // The number of posts with required images/strings needed to meet your requirement (will change the emoji in neomail)
    requirementCount: 12,
    // A list of urls of images a post must have to meet a requirement. Only one url in the entire list needs to match.
    requiredImages: ['https://images.neopets.com/neoboards/smilies/flower.gif', 'https://images.neopets.com/neoboards/smilies/snowbunny.gif'],
    // A list of strings (words/phrases) a post must have to meet a requirement. Only one string needs to match, but if you also have required images, the post must have at least one image and one string to pass.
    requiredStrings: [],
    // A list of urls of images that will add a post to the leaderboard count. Only one url needs to match.
    leaderboardImages: [],
    // A list of strings that will add a post to the leaderboard count. Only one string needs to match. If you also have images, a post only needs either an image or a string.
    leaderboardStrings: []
}

const isValidTopic = () => document.getElementsByTagName('h1')[0].textContent.match(new RegExp(settings.topicTitle, 'i'));

const hasImage = (postContents, seekedImages) => {
    const images = [...postContents.getElementsByTagName('img')];
    return seekedImages.some(image => images.find(img => img.src === image));
}

const hasString = (postContents, seekedStrings) => seekedStrings.some(str => postContents.textContent.match(new RegExp(str, 'i')));

const hasRequirement = (contents) => (!settings.requiredImages.length || hasImage(contents, settings.requiredImages)) && (!settings.requiredStrings.length || hasString(contents, settings.requiredStrings));

const hasLeaderboardElement = (contents) => hasImage(contents, settings.leaderboardImages) || hasString(contents, settings.leaderboardStrings);

const isThisMonth = (post) => new Date(new Date().toLocaleDateString('en-GB', {month: 'short', year: 'numeric'}) === post.getElementsByClassName('boardPostDate')[0].textContent.match(/\w+ \d+/)[0]);

const isValidDay = (post) => {
    const day = parseInt(post.getElementsByClassName('boardPostDate')[0].textContent.match(/\d/)[0]);
    return day >= settings.firstValidDay && day <= settings.lastValidDay;
}

const newMonthCleanup = async () => {
    const currentMonth = new Date().toLocaleDateString('en-GB', {month: 'long'});
    const month = await GM.getValue('month');
    if(month !== currentMonth) {
        GM.setValue('users', {});
        GM.setValue('month', currentMonth);
    }
}

const changeCount = async (counterInfo) => {
    const users = await GM.getValue('users', {});
    const user = users[counterInfo.username];
    const bool = Boolean(counterInfo.value + 1);
    user.posts[counterInfo.postId] ??= {
        required: false,
        leaderboard: false
    };
    if(user.posts[counterInfo.postId][counterInfo.countName] === bool) return;
    user[counterInfo.countName] += counterInfo.value;
    user.posts[counterInfo.postId][counterInfo.countName] = bool;
    counterInfo.counter.textContent = parseInt(counterInfo.counter.textContent) + counterInfo.value;
    GM.setValue('users', users);
}

const createChangeAnchor = (anchorText, counterInfo) => {
    const anchor = document.createElement('a');
    anchor.textContent = anchorText;
    anchor.href = '#';
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        changeCount(counterInfo);
    });
    return anchor;
}

const createPostCounter = (authorColumn, emoji, count, counterInfo) => {
    const wrapper = document.createElement('p');
    wrapper.style.display = 'flex';
    wrapper.style.gap = '0.5em';
    wrapper.textContent = emoji;
    const counter = document.createElement('span');
    counter.textContent = count;
    wrapper.appendChild(counter);
    wrapper.appendChild(createChangeAnchor('+', {...counterInfo, counter, value: 1}));
    wrapper.appendChild(createChangeAnchor('-', {...counterInfo, counter, value: -1}));
    authorColumn.appendChild(wrapper);
}

const parsePosts = async (users) => {
    const page = document.getElementsByClassName('boardPageButton-active')[0]?.textContent ?? '1';
    const topicId = window.location.href.match(/topic=(\d+)/)[1];
    document.querySelectorAll('#boardTopic li').forEach((post, number) => {
        if(!isThisMonth(post)) return;
        if(!isValidDay(post)) return;
        const id = `${topicId}-${page}-${number}`;
        const username = post.getElementsByClassName('postAuthorName')[0].textContent;
        users[username] ??= {required: 0, leaderboard: 0, posts: {}};
        const user = users[username];
        const contents = post.getElementsByClassName('boardPostMessage')[0];
        const metRequirement = hasRequirement(contents);
        const goesToLeaderboard = hasLeaderboardElement(contents);
        if(!user.posts[id]) {
            if(metRequirement) user.required++;
            if(goesToLeaderboard) user.leaderboard++;
            user.posts[id] = {
                required: Boolean(metRequirement),
                leaderboard: Boolean(goesToLeaderboard)
            };
        }
        const counterInfo = {username, postId: id};
        const authorColumn = post.getElementsByClassName('boardPostByline')[0];
        createPostCounter(authorColumn, metRequirement ? '📖' : '📘', user.required, {...counterInfo, countName: 'required'});
        createPostCounter(authorColumn, goesToLeaderboard ? '🏆' : '✖️', user.leaderboard, {...counterInfo, countName: 'leaderboard'});
    });
    GM.setValue('users', users);
    return users;
}

const createLeaderboard = (users) => {
    const modal = document.createElement('dialog');
    modal.id = 'saahphire-post-requirement-leadeboard';
    const ul = document.createElement('ul');
    ul.style.textAlign = 'left';
    modal.appendChild(ul);
    Object.entries(users).sort((a, b) => b[1].leaderboard - a[1].leaderboard).forEach(([username, {leaderboard}]) => {
        const li = document.createElement('li');
        li.textContent = `${username}: ${leaderboard}`;
        ul.appendChild(li);
    });
    const buttonClose = document.createElement('button');
    buttonClose.command = 'close';
    buttonClose.setAttribute('commandfor', modal.id);
    buttonClose.textContent = 'Close';
    modal.appendChild(buttonClose);
    document.body.appendChild(modal);
    const button = document.createElement('button');
    button.classList.add('replyTopicButton-top');
    button.textContent = 'Open Post Leaderboard';
    button.command = 'show-modal';
    button.setAttribute('commandfor', 'saahphire-post-requirement-leadeboard');
    document.getElementsByClassName('breadcrumbs')[0].insertAdjacentElement('afterend', button);
}

const decorateUsername = (users) => {
    const username = document.querySelector('[cellpadding="6"] .medText a b');
    const user = users[username.textContent];
    if(!user) return;
    username.parentElement.parentElement.insertAdjacentHTML('beforeend', `<p style="margin:0">${user.required >= settings.requirementCount ? '📖' : '📘'} ${user.required} | 🏆 ${user.leaderboard}</p>`);
}

const init = async () => {
    await newMonthCleanup();
    const users = await GM.getValue('users', {});
    if(window.location.href.match(/neopets.com\/neoboards/) && isValidTopic()) {
        const updatedUsers = await parsePosts(users);
        createLeaderboard(updatedUsers);
    }
    if(window.location.href.match(/=read_message/)) decorateUsername(users);
}

(function() {
    'use strict';
    init();
})();
