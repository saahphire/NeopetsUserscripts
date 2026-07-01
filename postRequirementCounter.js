// ==UserScript==
// @name         Neopets: Post Requirement Counter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.4.0
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
    - Remembers usernames even after a topic has been killed (has [username removed] for everyone)
    - Allows you to write and save an unknown user's username if the post was created after the last time you refreshed
      while the topic was alive, and the topic is now dead
    - Colors every valid and unknown post in red so you know which usernames you need to update. Good luck!

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const settings = {
    topicTitle: 'keepers of neopia',
    // The first day of the month in which people can post things that will be counted for requirements and the leaderboard
    firstValidDay: 1,
    // The last day of the month in which people can post things and be counted
    lastValidDay: 25,
    // The number of posts with required images/strings needed to meet your requirement (will change the emoji in neomail)
    requirementCount: 25,
    // A list of urls of images a post must have to meet a requirement. Only one url in the entire list needs to match.
    requiredImages: ['https://images.neopets.com/neoboards/smilies/flower.gif'],
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

const isThisMonth = (post) => new Date().toLocaleDateString('en-GB', {month: 'short', year: 'numeric'}) === post.getElementsByClassName('boardPostDate')[0].textContent.match(/\w+ \d+/)[0];

const getAllSavedPosts = async () => Object.entries(await GM.getValue('users', {})).map(([username, user]) => Object.keys(user.posts).map(post => [post, username])).flat();

const create = (tagName, attributes, properties) => {
    const element = document.createElement(tagName);
    if(attributes) Object.entries(attributes).filter(attr => attr[0] !== 'textContent').forEach(([key, value]) => element.setAttribute(key, value));
    if(attributes?.textContent) element.textContent = attributes.textContent;
    Object.assign(element.style, properties);
    return element;
}

const getEmoji = (counterWentUp, counterName) => {
    if(counterName === 'required') return counterWentUp ? '📖' : '📘';
    else return counterWentUp ? '🏆' : '✖️';
}

const isValidDay = (post) => {
    const day = parseInt(post.getElementsByClassName('boardPostDate')[0].textContent.match(/\d/)[0]);
    return day >= settings.firstValidDay && day <= settings.lastValidDay;
}

const isValidDate = (post) => isThisMonth(post) && isValidDay(post);

const newMonthCleanup = async () => {
    const currentMonth = new Date().toLocaleDateString('en-GB', {month: 'long'});
    const month = await GM.getValue('month');
    if(month !== currentMonth) {
        await GM.setValue('users', {});
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
    const anchor = create('a', { textContent: anchorText, href: '#' });
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        changeCount(counterInfo);
    });
    return anchor;
}

const createPostCounter = (authorColumn, user, counterInfo) => {
    const wrapper = create('p', { class: 'saahphire-post-requirements-count', textContent: getEmoji(user.posts[counterInfo.postId][counterInfo.countName], counterInfo.countName) });
    const counter = create('span', { textContent: user[counterInfo.countName] });
    wrapper.appendChild(counter);
    wrapper.appendChild(createChangeAnchor('+', {...counterInfo, counter, value: 1}));
    wrapper.appendChild(createChangeAnchor('-', {...counterInfo, counter, value: -1}));
    authorColumn.appendChild(wrapper);
}

const createPostCounters = (authorColumn, user, username, postId) => {
    createPostCounter(authorColumn, user, {username, postId, countName: 'required'});
    createPostCounter(authorColumn, user, {username, postId, countName: 'leaderboard'});
}

const savePostCounts = (user, postId, metRequirement, goesToLeaderboard) => {
    if(user.posts[postId]) return;
    if(metRequirement) user.required++;
    if(goesToLeaderboard) user.leaderboard++;
    user.posts[postId] = {
        required: Boolean(metRequirement),
        leaderboard: Boolean(goesToLeaderboard)
    };
}

const countPost = (postId, post, users, username) => {
    users[username] ??= {required: 0, leaderboard: 0, posts: {}};
    const user = users[username];
    const contents = post.getElementsByClassName('boardPostMessage')[0];
    savePostCounts(user, postId, hasRequirement(contents), hasLeaderboardElement(contents));
    const authorColumn = post.getElementsByClassName('boardPostByline')[0];
    createPostCounters(authorColumn, user, username, postId);
    return users;
}

const updateUsername = async (button, postId, post, input) => {
    button.textContent = '✔️';
    setTimeout(() => button.textContent = '💾', 250);
    post.querySelectorAll('.saahphire-post-requirements-count').forEach(counter => counter.remove());
    let users = await GM.getValue('users', {});
    if(button.dataset.lastUsername) {
        const postInfo = users[button.dataset.lastUsername].posts[postId];
        if(postInfo.required) users[button.dataset.lastUsername].required--;
        if(postInfo.leaderboard) users[button.dataset.lastUsername].leaderboard--;
        delete(users[button.dataset.lastUsername].posts[postId]);
    }
    if(input.value.length) {
        button.dataset.lastUsername = input.value;
        post.classList.remove('saahphire-post-requirements-unknown');
        users = countPost(postId, post, users, input.value);
    }
    else {
        button.removeAttribute('data-last-username');
        post.classList.add('saahphire-post-requirements-unknown');
    }
    GM.setValue('users', users);
}

const colorPostIfUnknown = async (postId, post, savedPosts) => {
    const contents = post.getElementsByClassName('boardPostMessage')[0];
    const metRequirement = hasRequirement(contents);
    const goesToLeaderboard = hasLeaderboardElement(contents);
    if(!metRequirement && !goesToLeaderboard) return;
    const foundPost = savedPosts.find(post => post[0] === postId);
    if(!foundPost) post.classList.add('saahphire-post-requirements-unknown');
    const authorColumn = post.getElementsByClassName('boardPostByline')[0];
    const div = create('div');
    authorColumn.prepend(div);
    const input = create('input', { type: 'text', placeholder: 'Username' });
    div.appendChild(input);
    const button = create('button', { textContent: '💾' });
    button.addEventListener('click', () => updateUsername(button, postId, post, input));
    div.appendChild(button);
    if(foundPost) {
        input.value = foundPost[1];
        countPost(postId, post, await GM.getValue('users', {}), input.value);
        button.dataset.lastUsername = input.value;
    }
}

const parsePosts = async (users) => {
    const page = document.getElementsByClassName('boardPageButton-active')[0]?.textContent ?? '1';
    const topicId = window.location.href.match(/topic=(\d+)/)[1];
    const livingTopic = document.getElementsByClassName('postAuthor').length;
    const savedPosts = await getAllSavedPosts();
    document.querySelectorAll('#boardTopic li').forEach(async (post, number) => {
        const postId = `${topicId}-${page}-${number}`;
        if(!livingTopic) colorPostIfUnknown(postId, post, savedPosts);
        else if(isValidDate(post)) users = countPost(postId, post, users, post.getElementsByClassName('postAuthorName')[0].textContent);
    });
    GM.setValue('users', users);
    return users;
}

const unmetEntryClass = (entry, listType) => listType === 'required' && entry[1].required < settings.requirementCount ? {'class': 'unmet-requirements'} : undefined;

const createListItem = (entry, listType, list) => list.appendChild(create('li', Object.assign({ textContent: `${entry[0]}: ${entry[1][listType]}` }, unmetEntryClass(entry, listType) )));

const createRequirementsToggle = async () => {
    const input = create('input', { type: 'checkbox' });
    input.checked = await GM.getValue('unmet', false);
    input.addEventListener('click', () => GM.setValue('unmet', input.checked));
    const label = create('label', { textContent: 'Toggle unmet requirements' });
    label.appendChild(input);
    return label;
}

const populateModal = async (modal, users, isLeaderboard) => {
    const className = isLeaderboard ? 'saahphire-post-requirements-leaderboard' : 'saahphire-post-requirements-requirements';
    const leaderboardLabel = create('label', { textContent: `Switch to ${isLeaderboard ? 'Requirements' : 'Leaderboard'}`, 'for': 'saahphire-post-requirements-switch', 'class': className });
    modal.appendChild(leaderboardLabel);
    const h3 = create('h3', { textContent: isLeaderboard ? 'Leaderboard' : 'Requirements', 'class': className });
    modal.appendChild(h3);
    const list = create(isLeaderboard ? 'ol' : 'ul', { 'class': className });
    modal.appendChild(list);
    if(isLeaderboard) {
        Object.entries(users).sort((a, b) => b[1].leaderboard - a[1].leaderboard).forEach(entry => createListItem(entry, 'leaderboard', list));
    }
    else {
        h3.insertAdjacentElement('afterend', await createRequirementsToggle());
        Object.entries(users).filter(user => user[1].required && user[1].required > 0).forEach(entry => createListItem(entry, 'required', list));
        const button = create('button', { textContent: 'Pick Random' });
        modal.appendChild(button);
        button.addEventListener('click', () => {
            [...list.children].forEach(child => child.classList.remove('saahphire-post-requirements-chosen'));
            list.children[Math.floor(Math.random() * list.children.length)].classList.add('saahphire-post-requirements-chosen');
        });
    }
}

const createLeaderboard = async (users) => {
    const modal = create('dialog', { id: 'saahphire-post-requirement-modal' });
    const input = create('input', { type: 'checkbox', id: 'saahphire-post-requirements-switch' });
    input.checked = await GM.getValue('modalIsRequirements', false);
    input.addEventListener('click', () => GM.setValue('modalIsRequirements', input.checked));
    modal.appendChild(input);
    populateModal(modal, users, true);
    populateModal(modal, users);
    const buttonClose = create('button', { command: 'close', 'commandfor': modal.id, textContent: 'Close' });
    modal.appendChild(buttonClose);
    document.body.appendChild(modal);
    const button = create('button', { 'class': 'replyTopicButton-top', command: 'show-modal', commandFor: 'saahphire-post-requirement-modal', textContent: 'Open Post Leaderboard' });
    document.getElementsByClassName('breadcrumbs')[0].insertAdjacentElement('afterend', button);
}

const decorateUsername = (users) => {
    const username = document.querySelector('[cellpadding="6"] .medText a b');
    const user = users[username.textContent];
    if(!user) return;
    username.parentElement.parentElement.insertAdjacentHTML('beforeend', `<p style="margin:0">${user.required >= settings.requirementCount ? '📖' : '📘'} ${user.required} | 🏆 ${user.leaderboard}</p>`);
}

const init = async () => {
    document.head.insertAdjacentHTML('beforeend', css);
    await newMonthCleanup();
    const users = await GM.getValue('users', {});
    if(window.location.href.match(/neopets.com\/neoboards/) && isValidTopic()) {
        const updatedUsers = await parsePosts(users);
        createLeaderboard(updatedUsers);
    }
    if(window.location.href.match(/=read_message/)) decorateUsername(users);
}

const css = `<style>
.saahphire-post-requirements-unknown, .saahphire-post-requirements-unknown div {
    background-color: lightcoral!important;
}
.saahphire-post-requirements-count {
    display: flex;
    gap: 0.5em;
}

#saahphire-post-requirement-modal {
    text-align: center;
    
    input {
        display: none;

        & ~ .saahphire-post-requirements-leaderboard, &:checked ~ .saahphire-post-requirements-requirements {
            display: block;
        }

        & ~ .saahphire-post-requirements-requirements, &:checked ~ .saahphire-post-requirements-leaderboard {
            display: none;
        }
    }

    label, button {
        background-color: #110721;
        display: inline-block;
        border-radius: 5px;
        padding: 5px 7px;
        margin: 3px;
        font-size: 12pt;
        line-height: 12pt;
        vertical-align: middle;
        color: #fff;
        font-family: "Palanquin", 'Arial Bold', sans-serif;
        text-align: center;
        cursor: pointer;
    }

    ol, ul {
        text-align: left;
    }

    .saahphire-post-requirements-chosen {
        font-weight: bold;
        color: teal;
    }

    .unmet-requirements {
        display: none;
    }

    h3 + label:has(input:checked) ~ ul .unmet-requirements {
        display: list-item;
    }
}
</style>`;

(function() {
    'use strict';
    init();
})();
