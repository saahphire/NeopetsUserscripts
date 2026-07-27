// ==UserScript==
// @name         Neopets: Post Requirement Counter
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      2.0.0
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
    Update July 26th, 2026: Settings have been moved to a tab in the "Open Post Leaderboard" window. If you'd like to
    use the old variable-based settings, scroll all the way down to defaultSettings, change the values there, and never
    ever press "Save" in the settings tab. (allowed values for styles are case-sensitive 'and' or 'or')

    Yeah, I know. Wildly specific. I don't think anyone will use this, it's just here as a backup. What it does is:
    - Check each topic for a specific, case-insensitive, regex-allowed string and do nothing if it doesn't match
    - Read each post, ignoring the ones that aren't during the current month or within the provided date range
      (Note: You can add any integer to the date range. If you want to see posts between days -1 and 999, go ahead)
    - Check each post for the following things, IF you've set them up (otherwise they won't be required):
        - Contains one of or all of a list of images (stickers/smileys)
        - Contains one of or all of a list of Strings (case-insentive; regex accepted)
        - Was posted using one of a list of avatars. NOTE THAT once a topic is killed, avatars don't show, so ALL posts
          posted after the topic died will be rejected by the avatar rule.
    - Add the following information under each poster's active Neopet:
        - Whether that post meets the requirements 📖 or not 📘
        - The amount of posts meeting the requirements that poster has posted
        - A + and - sign so you can adjust that specific post's count (obviously clicking + on a post that's already
          flagged as meeting the requirements won't do anything, and the other way around too)
        - Whether that post can be added to the leaderboard 🏆 or not ✖️
        - The amount of posts added to the leaderboard for that person
        - A + and - sign so you can adjust that specific post's count
    - Remembers usernames even after a topic has been killed (has [username removed] for everyone)
    - Allows you to write and save an unknown user's username if the post was created after the last time you refreshed
      while the topic was alive, and the topic is now dead
    - Colors every valid and unknown post in red so you know which usernames you need to update. Good luck!
    - Add a button at the top of a topic to open a window with:
        - A list of users who posted valid posts for the Requirements tab
            - With a button to hide whoever didn't meet a minimum requirement (set to 1 to turn that off)
            - With a button to pseudo-randomly (Math.random) pick one of the people who met the minimum requirement
              https://www.random.org/randomness/
        - A list of users who are on the leaderboard (sent at least one valid post), ordered
        - A settings page
    - Add a line under a neomail's sender's name with their 📖 requirement count | 🏆 leaderboard count

    Notes: String matching is case insensitive, but "hello" won't match "𝓱𝓮𝓵𝓵𝓸" or "h e l l o". You can use regex for
    that if you want.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getSettings = () => GM.getValue('settings', defaultSettings);

const isValidTopic = (settings) => document.getElementsByTagName('h1')[0].textContent.match(new RegExp(settings.topicTitle, 'i'));

const hasAvatar = (post, arr) => {
    const avatar = post.getElementsByClassName('authorIcon')[0];
    if(!avatar) return false;
    const img = avatar.style.backgroundImage.match(/\("(.+)"/)[1];
    return arr.find(url => url.match(img));
}

const hasImage = (post, arr) => [...post.querySelectorAll('.boardPostMessage img')].some(img => arr.includes(img.src));

const hasAllImages = (post, arr) => {
    const images = [...post.querySelectorAll('.boardPostMessage img')].map(img => img.src);
    return arr.every(url => images.includes(url));
}

const hasString = (post, arr) => arr.some(str => post.getElementsByClassName('boardPostMessage')[0].textContent.match(new RegExp(str, 'i')));

const hasAllStrings = (post, arr) => {
    const text = post.getElementsByClassName('boardPostMessage')[0].textContent;
    return arr.every(str => text.match(new RegExp(str, 'i')));
}

const getTester = (typeName, settings) => {
    if(typeName.match('Avatar')) return hasAvatar;
    const isOr = settings[`${typeName}Style`] === 'or';
    if(typeName.match('Image')) return isOr ? hasImage : hasAllImages;
    return isOr ? hasString : hasAllStrings;
}

const fulfillsType = (post, typeName, settings) => {
    const arr = settings[typeName].split(typeName.match('String') ? '>' : ' ');
    const tester = getTester(typeName, settings);
    return tester(post, arr);
}

const fulfillsTests = (post, settings, category) => {
    const typesToTest = ['Strings', 'Images', 'Avatars'].filter(type => settings[`${category}${type}`].length);
    if(!typesToTest.length) return false;
    if(settings[`${category}Style`] === 'or') return typesToTest.some(type => fulfillsType(post, `${category}${type}`, settings));
    else return typesToTest.every(type => fulfillsType(post, `${category}${type}`, settings));
}

const isThisMonth = (post) => new Date().toLocaleDateString('en-GB', {month: 'short', year: 'numeric'}) === post.getElementsByClassName('boardPostDate')[0].textContent.match(/\w+ \d+/)[0];

const getAllSavedPosts = async () => Object.entries(await GM.getValue('users', {})).map(([username, user]) => Object.keys(user.posts).map(post => [post, username])).flat();

const create = (tagName, attributes, textContent, properties) => {
    const element = document.createElement(tagName);
    if(attributes) Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
    if(textContent !== undefined) element.textContent = textContent;
    Object.assign(element.style, properties);
    return element;
}

const getEmoji = (counterWentUp, counterName) => {
    if(counterName === 'required') return counterWentUp ? '📖' : '📘';
    else return counterWentUp ? '🏆' : '✖️';
}

const isValidDay = (post, settings) => {
    const day = parseInt(post.getElementsByClassName('boardPostDate')[0].textContent.match(/\d+/)[0]);
    return day >= parseInt(settings.firstValidDay) && day <= parseInt(settings.lastValidDay);
}

const isValidDate = (post, settings) => isThisMonth(post) && isValidDay(post, settings);

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
    const anchor = create('a', { href: '#' }, anchorText);
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        changeCount(counterInfo);
    });
    return anchor;
}

const createPostCounter = (authorColumn, user, counterInfo) => {
    const wrapper = create('p', { class: 'saahphire-pr-count' }, getEmoji(user.posts[counterInfo.postId]?.[counterInfo.countName], counterInfo.countName));
    const counter = create('span', {}, user[counterInfo.countName]);
    wrapper.appendChild(counter);
    wrapper.appendChild(createChangeAnchor('+', {...counterInfo, counter, value: 1}));
    wrapper.appendChild(createChangeAnchor('-', {...counterInfo, counter, value: -1}));
    authorColumn.appendChild(wrapper);
}

const createPostCounters = (authorColumn, user, username, postId) => {
    createPostCounter(authorColumn, user, {username, postId, countName: 'required'});
    createPostCounter(authorColumn, user, {username, postId, countName: 'leaderboard'});
}

const savePostCounts = (user, postId, post, settings) => {
    if(user.posts[postId]) return user;
    user.posts[postId] = {};
    ['required', 'leaderboard'].forEach(category => {
        if(fulfillsTests(post, settings, category)) {
            user[category]++;
            user.posts[postId][category] = true;
        }
        else user.posts[postId][category] = false;
    });
    return user;
}

const countPost = (postId, post, users, username, settings) => {
    users[username] ??= {required: 0, leaderboard: 0, posts: {}};
    users[username] = savePostCounts(users[username], postId, post, settings);
    const authorColumn = post.getElementsByClassName('boardPostByline')[0];
    createPostCounters(authorColumn, users[username], username, postId);
    return users;
}

const updateUsername = async (button, postId, post, input) => {
    button.textContent = '✔️';
    setTimeout(() => button.textContent = '💾', 250);
    post.querySelectorAll('.saahphire-pr-count').forEach(counter => counter.remove());
    let users = await GM.getValue('users', {});
    const settings = await getSettings();
    if(button.dataset.lastUsername) {
        const postInfo = users[button.dataset.lastUsername].posts[postId];
        if(postInfo.required) users[button.dataset.lastUsername].required--;
        if(postInfo.leaderboard) users[button.dataset.lastUsername].leaderboard--;
        delete(users[button.dataset.lastUsername].posts[postId]);
    }
    if(input.value.length) {
        button.dataset.lastUsername = input.value;
        post.classList.remove('saahphire-pr-unknown');
        users = countPost(postId, post, users, input.value, settings);
    }
    else {
        button.removeAttribute('data-last-username');
        post.classList.add('saahphire-pr-unknown');
    }
    GM.setValue('users', users);
}

const colorPostIfUnknown = async (postId, post, savedPosts) => {
    const settings = await getSettings();
    const metRequirement = fulfillsTests(post, settings, 'required');
    const goesToLeaderboard = fulfillsTests(post, settings, 'leaderboard');
    if(!metRequirement && !goesToLeaderboard) return;
    const foundPost = savedPosts.find(post => post[0] === postId);
    if(!foundPost) post.classList.add('saahphire-pr-unknown');
    const authorColumn = post.getElementsByClassName('boardPostByline')[0];
    const div = create('div');
    authorColumn.prepend(div);
    const input = create('input', { type: 'text', placeholder: 'Username' });
    div.appendChild(input);
    const button = create('button', {}, '💾');
    button.addEventListener('click', () => updateUsername(button, postId, post, input));
    div.appendChild(button);
    if(foundPost) {
        input.value = foundPost[1];
        countPost(postId, post, await GM.getValue('users', {}), input.value, settings);
        button.dataset.lastUsername = input.value;
    }
}

const parsePosts = async (users) => {
    const page = document.getElementsByClassName('boardPageButton-active')[0]?.textContent ?? '1';
    const topicId = window.location.href.match(/topic=(\d+)/)[1];
    const livingTopic = document.getElementsByClassName('postAuthor').length;
    const savedPosts = await getAllSavedPosts();
    const posts = document.querySelectorAll('#boardTopic li');
    const settings = await getSettings();
    for(let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postId = `${topicId}-${page}-${i}`;
        if(!livingTopic) colorPostIfUnknown(postId, post, savedPosts);
        else if(isValidDate(post, settings)) users = countPost(postId, post, users, post.getElementsByClassName('postAuthorName')[0].textContent, settings);
    }
    GM.setValue('users', users);
    return users;
}

const unmetEntryClass = (entry, listType, requirementCount) => listType === 'required' && entry[1].required < requirementCount ? {'class': 'unmet-requirements'} : undefined;

const createListItem = (entry, listType, list, requirementCount) => list.appendChild(create('li', unmetEntryClass(entry, listType, requirementCount), `${entry[0]}: ${entry[1][listType]}`));

const createRequirementsToggle = async () => {
    const input = create('input', { type: 'checkbox' });
    input.checked = await GM.getValue('unmet', false);
    input.addEventListener('click', () => GM.setValue('unmet', input.checked));
    const label = create('label', { 'class': 'saahphire-pr-toggle' }, 'Toggle unmet requirements');
    label.appendChild(input);
    return label;
}

const populateRequirementsTab = async (users, modal) => {
    modal.appendChild(await createRequirementsToggle());
    const requirementCount = (await getSettings()).requirementCount ?? 0;
    const list = create('ul');
    modal.appendChild(list);
    Object.entries(users).filter(user => user[1].required && user[1].required > 0).forEach(entry => createListItem(entry, 'required', list, requirementCount));
    const button = create('button', {}, 'Pick Random');
    modal.appendChild(button);
    const validChildren = [...list.children].filter(child => !child.classList.contains('unmet-requirements'));
    button.addEventListener('click', () => {
        if(!validChildren.length) return window.alert('No users have met the requirements!');
        validChildren.forEach(child => child.classList.remove('saahphire-pr-chosen'));
        validChildren[Math.floor(Math.random() * validChildren.length)].classList.add('saahphire-pr-chosen');
    });
}

const populateLeaderboardTab = (users, modal) => {
    const list = create('ol');
    modal.appendChild(list);
    Object.entries(users).filter(user => user[1].leaderboard && user[1].leaderboard > 0).sort((a, b) => b[1].leaderboard - a[1].leaderboard).forEach(entry => createListItem(entry, 'leaderboard', list));
}

const saveSettings = (form, button) => {
    button.textContent = 'Saved!';
    setTimeout(() => button.textContent = 'Save', 500);
    const settings = {};
    form.querySelectorAll('label :is(input, select)').forEach(input => {
        const settingName = input.id.slice(19);
        if(inputs[settingName]) settings[settingName] = input.value;
    });
    GM.setValue('settings', settings);
}

const clearUsers = async (e) => {
    if(!window.confirm('Are you sure you want to clear all counts?')) return;
    e.target.textContent = 'Clearing...';
    await GM.setValue('users', {});
    e.target.textContent = 'Cleared! Refreshing...';
    setTimeout(() => window.location.reload(), 250);
}

const populateSettingsTab = (settings, modal) => {
    const clearLabel = create('label', { 'class': 'saahphire-pr-clear' }, 'Changes won\'t be retroactive. Clear saved counts?');
    modal.appendChild(clearLabel);
    const clearButton = create('button', {}, 'Clear');
    clearLabel.appendChild(clearButton);
    clearButton.addEventListener('click', clearUsers);
    const form = create('form', { 'class': 'saahphire-pr-settings' });
    modal.appendChild(form);
    Object.entries(inputs).forEach(([inputName, inputInstruction]) => {
        const id = `saahphire-pr-input-${inputName}`;
        const label = create('label', {}, inputInstruction.label);
        if(inputInstruction.type === 'select') {
            const select = create('select', { id });
            inputInstruction.options.forEach(opt => select.appendChild(create('option', { value: opt }, opt)));
            select.value = settings[inputName];
            label.appendChild(select);
        } else {
            const input = create('input', { id, type: inputInstruction.type, placeholder: inputInstruction.placeholder, value: settings[inputName] });
            label.appendChild(input);
        }
        form.appendChild(label);
        const desc = create('label', { 'for': id, 'class': 'saahphire-pr-desc' }, inputInstruction.desc);
        form.appendChild(desc);
    });
    const button = create('button', { type: 'button' }, 'Save');
    button.addEventListener('click', () => saveSettings(form, button));
    form.appendChild(button);
}

const switchTabs = async (tab, tabContainer) => {
    [...tabContainer.children].forEach(child => child.remove());
    const h3 = create('h3', {}, tab);
    tabContainer.appendChild(h3);
    if(tab === 'Settings') return populateSettingsTab(await getSettings(), tabContainer);
    const users = await GM.getValue('users', {});
    if(tab === 'Requirements') populateRequirementsTab(users, tabContainer);
    else populateLeaderboardTab(users, tabContainer);
}

const createTabSwitches = (defaultTab, tabContainer) => {
    const switches = create('div', { 'class': 'saahphire-pr-switches' });
    ['Requirements', 'Leaderboard', 'Settings'].forEach(tab => {
        const label = create('label', {}, tab);
        switches.appendChild(label);
        const input = create('input', { type: 'checkbox' });
        label.appendChild(input);
        input.addEventListener('click', () => {
            switchTabs(tab, tabContainer);
            GM.setValue('default-tab', tab);
            switches.querySelectorAll('input').forEach(inpt => inpt.disabled = false);
            input.disabled = true;
        });
        if(defaultTab === tab) input.disabled = true;
    });
    return switches;
}

const createModal = async () => {
    const modal = create('dialog', { id: 'saahphire-pr-modal' });
    const tabContainer = create('div');
    const defaultTab = await GM.getValue('default-tab', 'Leaderboard');
    modal.appendChild(createTabSwitches(defaultTab, tabContainer));
    modal.appendChild(tabContainer);
    await switchTabs(defaultTab, tabContainer);
    const buttonClose = create('button', { command: 'close', 'commandfor': modal.id }, 'Close');
    modal.appendChild(buttonClose);
    document.body.appendChild(modal);
    const button = create('button', { 'class': 'replyTopicButton-top', command: 'show-modal', commandFor: 'saahphire-pr-modal' }, 'Open Post Leaderboard');
    document.getElementsByClassName('breadcrumbs')[0].insertAdjacentElement('afterend', button);
}

const decorateUsername = (users, requirementCount) => {
    const username = document.querySelector('[cellpadding="6"] .medText a b');
    const user = users[username.textContent];
    if(!user) return;
    username.parentElement.parentElement.insertAdjacentHTML('beforeend', `<p style="margin:0">${user.required >= requirementCount ? '📖' : '📘'} ${user.required} | 🏆 ${user.leaderboard}</p>`);
}

const init = async () => {
        console.log(5);
    document.head.insertAdjacentHTML('beforeend', css);
        console.log(6);
    await newMonthCleanup();
    const users = await GM.getValue('users', {});
    if(window.location.href.match(/neopets.com\/neoboards\/topic.phtml\?/)) {
        const updatedUsers = isValidTopic(await getSettings()) ? await parsePosts(users) : users;
        createModal(updatedUsers);
    }
    if(window.location.href.match(/=read_message/)) decorateUsername(users, (await getSettings()).requirementCount ?? 0);
}

const css = `<style>
.saahphire-pr-unknown, .saahphire-pr-unknown div {
    background-color: lightcoral!important;
}
.saahphire-pr-count {
    display: flex;
    gap: 0.5em;
}

#saahphire-pr-modal {
    text-align: center;
    
    input[type="checkbox"] {
        display: none;
    }

    & > label, .saahphire-pr-switches label, .saahphire-pr-toggle, button {
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

    .saahphire-pr-chosen {
        font-weight: bold;
        color: teal;
    }

    .unmet-requirements {
        display: none;
    }

    h3 + label:has(input:checked) ~ ul .unmet-requirements {
        display: list-item;
    }

    &:has(.saahphire-pr-settings) {
        width: 75%;
    }

    .saahphire-pr-settings {
        display: grid;
        grid-template-columns: subgrid;
        text-align: left;

        label:has(input, select) {
            display: grid;
            grid-template-columns: 1fr 1fr;
            align-items: end;
            margin: 0 5px;
            & + label {
                font-size: 0.75em;
                margin: 0 5px 0.5rem;
            }
        }
    }
}
</style>`;

const inputs = {
    topicTitle: {
        label: 'Topic title',
        desc: "A case-insensitive string that must be in the topic's title. Leave empty to work across ALL topics. Regex accepted.",
        type: 'text',
        placeholder: "Name of your guild"
    },
    firstValidDay: {
        label: 'First valid day',
        desc: "The first day (inclusive) of a month during which posts can be counted.",
        type: 'number',
        placeholder: 1
    },
    lastValidDay: {
        label: 'Last valid day',
        desc: "The last day (inclusive) of a month during which posts can be counted.",
        type: 'number',
        placeholder: 31
    },
    requirementCount: {
        label: 'Requirement count',
        desc: "The number of posts fulfilling all requirements a person must have to be considered as having met requirements",
        type: 'number',
        placeholder: 5
    },
    requiredtStyle: {
        label: 'Requirement style',
        desc: "Whether all types (images, strings, avatars) of requirements should be met (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    requiredImagesStyle: {
        label: 'Required image style',
        desc: "Whether all images should be in the post (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    requiredImages: {
        label: 'Required images',
        desc: "A series of images (delimited by spaces) that should be in a post to count as requirement (smileys or stickers)",
        type: 'text',
        placeholder: 'https://images.neopets.com/neoboards/smilies/nabile.gif https://images.neopets.com/neoboards/smilies/earth.gif'
    },
    requiredStringsStyle: {
        label: 'Required string style',
        desc: "Whether all strings should be in the post (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    requiredStrings: {
        label: 'Required strings',
        desc: "A series of strings (case-insensitive, delimited by >) that should be in a post to count as requirement.",
        type: 'text',
        placeholder: 'hello>world'
    },
    requiredAvatars: {
        label: 'Required avatars',
        desc: "A series of avatars (delimited by spaces) someone must post with to count as requirement (only one needs to match)",
        type: 'text',
        placeholder: 'https://images.neopets.com/neoboards/avatars/nabile.gif https://images.neopets.com/neoboards/avatars/symol.gif'
    },
    leaderboardStyle: {
        label: 'Leaderboard style',
        desc: "Whether all types (images, strings, avatars) of leaderboard requirements should be met (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    leaderboardImagesStyle: {
        label: 'Leaderboard image style',
        desc: "Whether all images should be in the post (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    leaderboardImages: {
        label: 'Leaderboard images',
        desc: "A series of images (delimited by spaces) that should be in a post to count as requirement (smileys or stickers)",
        type: 'text',
        placeholder: 'https://images.neopets.com/neoboards/smilies/nabile.gif https://images.neopets.com/neoboards/smilies/earth.gif'
    },
    leaderboardStringsStyle: {
        label: 'Leaderboard string style',
        desc: "Whether all strings should be in the post (and), or only one (or)",
        type: 'select',
        options: ['and', 'or']
    },
    leaderboardStrings: {
        label: 'Leaderboard strings',
        desc: "A series of strings (case-insensitive, delimited by >) that should be in a post to count as requirement.",
        type: 'text',
        placeholder: 'hello>world'
    },
    leaderboardAvatars: {
        label: 'Leaderboard avatars',
        desc: "A series of avatars (delimited by spaces) someone must post with to count as requirement (only one needs to match)",
        type: 'text',
        placeholder: 'https://images.neopets.com/neoboards/avatars/nabile.gif https://images.neopets.com/neoboards/avatars/symol.gif'
    },
};

const defaultSettings = {
    topicTitle: 'guild',
    firstValidDay: 1,
    lastValidDay: 30,
    requirementCount: 5,
    requiredtStyle: 'and',
    requiredImagesStyle: 'or',
    requiredImages: [],
    requiredStringsStyle: 'or',
    requiredStrings: [],
    requiredAvatars: [],
    leaderboardStyle: 'or',
    leaderboardImagesStyle: 'or',
    leaderboardImages: [],
    leaderboardStringsStyle: 'or',
    leaderboardStrings: [],
    leaderboardAvatars: []
};

(function() {
    'use strict';
    init();
})();
