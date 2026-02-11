// ==UserScript==
// @name         Neopets: Smilies Helper
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a smiley/emoji/emoticon list with previews and search to neoboards, neomail, and guilds
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/smiliesHelper.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/smiliesHelper.js
// @match        *://*.neopets.com/neoboards/topic.phtml?topic=*
// @match        *://*.neopets.com/neoboards/create_topic.phtml?board=*
// @match        *://*.neopets.com/guilds/guild_board.phtml?id=*&action=*
// @match        *://*.neopets.com/neomessages.phtml?type=send*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds a little pop-up you can open by clicking the 😊 emoji on the top right of your screen. The pop-up
    features all Neopets smileys (except for *firecrackers*, which can't be used at the moment), with images and a
    search box that works with every keyword I could think of.

    It was inspired by Neoboards: Smilies, but that one only works on Neoboards and I chat a lot in my guild.
        (join Keepers of Neopia https://www.neopets.com/~dezys_baby)

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getAllSmilies = () => Object.values(smilies).reduce((agg, curr) => agg.concat(curr), []);

const updateRecentSmilie = async (smilie) => {
    const recentSmilies = (await GM.getValue('recent', [])).filter(s => s !== smilie.key).slice(0, 27);
    recentSmilies.unshift(smilie.key);
    GM.setValue('recent', recentSmilies);
    const recents = document.querySelector('#saahphire-smilies-tab-toggle-recents + .saahphire-smilies-category');
    [...recents.children].forEach(smilie => smilie.remove());
    fillRecentSmilies(recents);
}

const insertSmilieInText = async (smilie) => {
    const lastPosition = await GM.getValue('last-position', {area: 'body', position: 0});
    const query = lastPosition.area === 'body' ? 'textarea' : '[name="message_title"], [name="topic_title"], [name="subject"]';
    const element = document.querySelector(query);
    element.value = element.value.substring(0, lastPosition.position) + smilie.key + element.value.substring(lastPosition.position, element.value.length);
}

const createSmilie = (smilie) => {
    const img = document.createElement('img');
    img.src = smilie.src;
    img.title = smilie.key;
    img.classList.add('saahphire-smilie');
    img.addEventListener('click', () => {
        insertSmilieInText(smilie);
        updateRecentSmilie(smilie);
    });
    return img;
}

const onSearch = (e, searchBar, smiliesWithKeywords, searchResults) => {
    const searchKey = searchBar.value.toLowerCase();
    if(searchKey === '' || e.code === 'Escape') {
        searchBar.dataset.searching = false;
        searchBar.value = '';
        return;
    }
    searchBar.dataset.searching = true;
    [...searchResults.children].forEach(res => res.remove())
    smiliesWithKeywords.forEach(smilie => {
        if(!smilie[0].some(word => word.startsWith(searchKey))) return;
        searchResults.appendChild(createSmilie(smilie[1]));
    })
}

const addSearchBar = (popup) => {
    const smiliesWithKeywords = getAllSmilies().map(smilie => [smilie.keywords.concat([smilie.key.replace('*', '')]), smilie]);
    const searchBar = document.createElement('input');
    searchBar.type = 'search';
    popup.insertAdjacentHTML('beforeEnd', '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/><path fill="#2e96ff" d="M10.5 4a6.5 6.5 0 1 0 0 13a6.5 6.5 0 0 0 0-13M2 10.5a8.5 8.5 0 1 1 15.176 5.262l3.652 3.652a1 1 0 0 1-1.414 1.414l-3.652-3.652A8.5 8.5 0 0 1 2 10.5M9.5 7a1 1 0 0 1 1-1a4.5 4.5 0 0 1 4.5 4.5a1 1 0 1 1-2 0A2.5 2.5 0 0 0 10.5 8a1 1 0 0 1-1-1"/></g></svg>');
    popup.appendChild(searchBar);
    const searchResults = document.createElement('div');
    popup.appendChild(searchResults);
    searchResults.classList.add('saahphire-search-results');
    searchBar.addEventListener('keydown', (e) => onSearch(e, searchBar, smiliesWithKeywords, searchResults));
}

const fillRecentSmilies = async (parent) => {
    const recents = await GM.getValue('recent', []);
    const allSmilies = getAllSmilies();
    recents.forEach(smilieKey => {
        const foundSmilie = allSmilies.find(smilie => smilie.key === smilieKey);
        parent.appendChild(createSmilie(foundSmilie));
    });
}

const addCategoryTab = (category) => {
    const div = document.createElement('div');
    div.classList.add('saahphire-smilies-category');
    const h2 = document.createElement('h2');
    h2.textContent = categories[category] ?? 'Recents';
    div.appendChild(h2);
    if(category === 'recents') fillRecentSmilies(div);
    else smilies[category].forEach(smilie => div.appendChild(createSmilie(smilie)));
    return div;
}

const addCategoryTabIcon = (category) => {
    const label = document.createElement('label');
    label.classList.add('saahphire-smilies-tab-icon');
    if(category === 'recents') label.insertAdjacentHTML('beforeend', '<svg xmlns="http://www.w3.org/2000/svg" width="15px" height="15px" viewBox="0 0 24 24"><g fill="none"><path d="m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z"/><path fill="#2e96ff" d="M20.66 7c2.762 4.783 1.123 10.9-3.66 13.66c-4.123 2.38-9.233 1.491-12.335-1.86a1 1 0 0 1 1.468-1.358a8 8 0 1 0-2.06-6.524l1.281-.335c1.047-.273 1.818.97 1.108 1.787L4.21 14.957c-.568.652-1.665.43-1.892-.444A10 10 0 0 1 7 3.34C11.783.579 17.899 2.217 20.66 7M12 6a1 1 0 0 1 1 1v4.586l2.707 2.707a1 1 0 1 1-1.414 1.414l-3-3A1 1 0 0 1 11 12V7a1 1 0 0 1 1-1"/></g></svg>');
    else {
        const img = document.createElement('img');
        img.src = smilies[category][0].src;
        label.appendChild(img);
    }
    label.htmlFor = `saahphire-smilies-tab-toggle-${category}`;
    const li = document.createElement('li');
    li.appendChild(label);
    document.getElementsByClassName('saahphire-smilies-tab-icons')[0].appendChild(li);
}

const addCategoryTabToggle = (category) => {
    const toggle = document.createElement('input');
    toggle.type = 'radio';
    toggle.name = 'saahphire-smilies-tab-toggles';
    toggle.classList.add('saahphire-smilies-tab-toggle');
    toggle.id = `saahphire-smilies-tab-toggle-${category}`;
    return toggle;
}

const addCategoryTabButton = (category) => {
    addCategoryTabIcon(category);
    return addCategoryTabToggle(category);
}

const addCategories = (popup) => {
    const categoryKeys = Object.keys(categories);
    categoryKeys.unshift('recents');
    categoryKeys.forEach(category => {
        popup.appendChild(addCategoryTabButton(category));
        popup.appendChild(addCategoryTab(category));
    })
}

const addPopup = (label) => {
    const popup = document.createElement('div');
    label.insertAdjacentElement('afterend', popup);
    popup.classList.add('saahphire-smilies-popup');
    const icons = document.createElement('ul');
    icons.classList.add('saahphire-smilies-tab-icons');
    popup.appendChild(icons);
    addSearchBar(popup);
    addCategories(popup);
}

const addButton = () => {
    document.body.insertAdjacentHTML('beforeend',
    `<input type="checkbox" autocomplete="off" id="saahphire-smilies-toggle" style="display:none">
<label for="saahphire-smilies-toggle" class="saahphire-smilies-toggle"></label>`);
    return document.getElementsByClassName('saahphire-smilies-toggle')[0];
}

const saveFieldPosition = (field, fieldName) => GM.setValue('last-position', {area: fieldName, position: field.selectionEnd});

const watchField = (field, fieldName) => {
    if(!field) return;
    field.addEventListener('keydown', () => saveFieldPosition(field, fieldName));
    field.addEventListener('click', () => saveFieldPosition(field, fieldName));
}

const watchFields = () => {
    watchField(document.getElementsByTagName('textarea')[0], 'body');
    watchField(document.querySelector('[name="message_title"], [name="topic_title"], [name="subject"]'), 'title');
}

const init = () => {
    document.head.insertAdjacentHTML('beforeend', css);
    watchFields();
    addPopup(addButton());
}

const smilies = {
    standard: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/smiley.gif',
            key: ':)',
            keywords: ['happy', 'smile']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sad.gif',
            key: ':(',
            keywords: ['sad', 'frown']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/winking.gif',
            key: ';)',
            keywords: ['wink']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kisskiss.gif',
            key: ':*',
            keywords: ['blush', 'pink']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/grin.gif',
            key: ':D',
            keywords: ['smile', 'grin']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/vampire.gif',
            key: ':K',
            keywords: ['fangs', 'vampire']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/oh.gif',
            key: ':O',
            keywords: ['surprise', 'shock']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tongue.gif',
            key: ':P',
            keywords: ['tongue', 'bleh']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/angel.gif',
            key: '0:-)',
            keywords: ['angel', 'halo', 'innocent']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sunglasses.gif',
            key: 'B)',
            keywords: ['sunglasses', 'cool']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/angry.gif',
            key: '*angry*',
            keywords: ['angry', 'annoyed']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/clap.gif',
            key: '*clap*',
            keywords: ['clap']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/complain.gif',
            key: '*complain*',
            keywords: ['complain', 'argue']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cough.gif',
            key: '*cough*',
            keywords: ['cough', 'laugh']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cry.gif',
            key: '*cry*',
            keywords: ['cry', 'sob']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/facepalm.gif',
            key: '*facepalm*',
            keywords: ['facepalm']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lol.gif',
            key: '*lol*',
            keywords: ['laugh']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/unsure.gif',
            key: '*unsure*',
            keywords: ['unsure', 'hesitant']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/violin.gif',
            key: '*violin*',
            keywords: ['playing', 'music']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yarr.gif',
            key: '*yarr*',
            keywords: ['wink']
        }
    ],
    neopians: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/aaa.gif',
            key: '*aaa*',
            keywords: ['blumaroo']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/abigail.gif',
            key: '*abigail*',
            keywords: ['aisha']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/angrylawyerbot.gif',
            key: '*angrylawyerbot*',
            keywords: ['lawyerbot', 'robot']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/awakened.gif',
            key: '*awakened*',
            keywords: ['wocky', 'twin', 'obelisk', 'lanie', 'lillie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/boatswain.gif',
            key: '*boatswain*',
            keywords: ['lupe']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bree.gif',
            key: '*bree*',
            keywords: ['faerie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/brutes.gif',
            key: '*brutes*',
            keywords: ['skeith', 'obelisk', 'flint', 'commander']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/brynn.gif',
            key: '*brynn*',
            keywords: ['kougra', 'soldier', 'guard']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cabinboy.gif',
            key: '*cabinboy*',
            keywords: ['bruce']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/capn3legs.gif',
            key: '*capn3legs*',
            keywords: ['captain', 'capn', '3', 'three', 'legs', 'pirate', 'eyrie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/chadley.gif',
            key: '*chadley*',
            keywords: ['zafara']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/coltzan.gif',
            key: '*coltzan*',
            keywords: ['desert', 'lupe']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cook.gif',
            key: '*cook*',
            keywords: ['skeith']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/fyora.gif',
            key: '*fyora*',
            keywords: ['queen', 'faerie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/gunner.gif',
            key: '*gunner*',
            keywords: ['mynci']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/hanso.gif',
            key: '*hanso*',
            keywords: ['ixi']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/happiness.gif',
            key: '*happiness*',
            keywords: ['sloth', 'faerie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/illusen.gif',
            key: '*illusen*',
            keywords: ['faerie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jazan.gif',
            key: '*jazan*',
            keywords: ['kyrii', 'desert']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jhudora.gif',
            key: '*jhudora*',
            keywords: ['faerie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lawyerbot.gif',
            key: '*lawyerbot*',
            keywords: ['robot']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lulu.gif',
            key: '*lulu*',
            keywords: ['cybunny']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mate.gif',
            key: '*mate*',
            keywords: ['kacheek']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mipsy.gif',
            key: '*mipsy*',
            keywords: ['acara']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mrcoconut.gif',
            key: '*mrcoconut*',
            keywords: ['coconut', 'angry']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/nabile.gif',
            key: '*nabile*',
            keywords: ['ixi', 'perfect']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/nox.gif',
            key: '*nox*',
            keywords: ['chia', 'vampire']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/order.gif',
            key: '*order*',
            keywords: ['bori', 'obelisk', 'rasala']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/quartermaster.gif',
            key: '*quartermaster*',
            keywords: ['xweetok']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rigger.gif',
            key: '*rigger*',
            keywords: ['meerca']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rohane.gif',
            key: '*rohane*',
            keywords: ['blumaroo']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rower.gif',
            key: '*rower*',
            keywords: ['krawk']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/seekers.gif',
            key: '*seekers*',
            keywords: ['gnorbu', 'obelisk', 'professor', 'lambert']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/shopwiz.gif',
            key: '*shopwiz*',
            keywords: ['wizard', 'shop']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sloth.gif',
            key: '*sloth*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/snowager.gif',
            key: '*snowager*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/swabbie.gif',
            key: '*swabbie*',
            keywords: ['blumaroo']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sway.gif',
            key: '*sway*',
            keywords: ['lenny', 'obelisk', 'duches']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/talinia.gif',
            key: '*talinia*',
            keywords: ['eyrie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/techomaster.gif',
            key: '*techomaster*',
            keywords: ['techo', 'master', 'academy']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/thieves.gif',
            key: '*thieves*',
            keywords: ['guild', 'gelert', 'kanrik', 'obelisk']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/turmaculus.gif',
            key: '*turmaculus*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/velm.gif',
            key: '*velm*',
            keywords: ['techo']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/wizard.gif',
            key: '*wizard*',
            keywords: ['shop']
        }
    ],
    neopets: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/acara.gif',
            key: '*acara*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/aisha.gif',
            key: '*aisha*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/blumaroo.gif',
            key: '*blumaroo*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bori.gif',
            key: '*bori*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bruce.gif',
            key: '*bruce*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/buzz.gif',
            key: '*buzz*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/chia.gif',
            key: '*chia*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/chomby.gif',
            key: '*chomby*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cybunny.gif',
            key: '*cybunny*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/draik.gif',
            key: '*draik*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/elephante.gif',
            key: '*elephante*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/eyrie.gif',
            key: '*eyrie*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/flotsam.gif',
            key: '*flotsam*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/gelert.gif',
            key: '*gelert*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/gnorbu.gif',
            key: '*gnorbu*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/grarrl.gif',
            key: '*grarrl*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/grundo.gif',
            key: '*grundo*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/hissi.gif',
            key: '*hissi*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/ixi.gif',
            key: '*ixi*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jetsam.gif',
            key: '*jetsam*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jubjub.gif',
            key: '*jubjub*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kacheek.gif',
            key: '*kacheek*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kau.gif',
            key: '*kau*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kiko.gif',
            key: '*kiko*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/koi.gif',
            key: '*koi*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/korbat.gif',
            key: '*korbat*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kougra.gif',
            key: '*kougra*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/krawk.gif',
            key: '*krawk*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kyrii.gif',
            key: '*kyrii*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lenny.gif',
            key: '*lenny*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lupe.gif',
            key: '*lupe*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lutari.gif',
            key: '*lutari*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/meerca.gif',
            key: '*meerca*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/moehog.gif',
            key: '*moehog*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mynci.gif',
            key: '*mynci*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/nimmo.gif',
            key: '*nimmo*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/ogrin.gif',
            key: '*ogrin*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/peophin.gif',
            key: '*peophin*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/poogle.gif',
            key: '*poogle*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/pteri.gif',
            key: '*pteri*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/quiggle.gif',
            key: '*quiggle*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/ruki.gif',
            key: '*ruki*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/scorchio.gif',
            key: '*scorchio*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/shoyru.gif',
            key: '*shoyru*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/skeith.gif',
            key: '*skeith*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/techo.gif',
            key: '*techo*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tonu.gif',
            key: '*tonu*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tuskaninny.gif',
            key: '*tuskaninny*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/uni.gif',
            key: '*uni*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/usul.gif',
            key: '*usul*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/vandagyre.gif',
            key: '*vandagyre*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/wocky.gif',
            key: '*wocky*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/xweetok.gif',
            key: '*xweetok*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yurble.gif',
            key: '*yurble*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/zafara.gif',
            key: '*zafara*',
            keywords: []
        }
    ],
    petpets: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/weewoo.gif',
            key: '*weewoo*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/angelpuss.gif',
            key: '*angelpuss*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/feepit.gif',
            key: '*feepit*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jimmi.gif',
            key: '*jimmi*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jinjah.gif',
            key: '*jinjah*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kadoatery.gif',
            key: '*kadoatery*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kadoatie.gif',
            key: '*kadoatie*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/larnikin.gif',
            key: '*larnikin*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/meepit.gif',
            key: '*meepit*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/meowclops.gif',
            key: '*meowclops*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mootix.gif',
            key: '*mootix*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/niptor.gif',
            key: '*niptor*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/noil.gif',
            key: '*noil*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/pinchit.gif',
            key: '*pinchit*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/plumpy.gif',
            key: '*plumpy*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/purplebug.gif',
            key: '*purplebug*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/slorg.gif',
            key: '*slorg*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/snowbunny.gif',
            key: '*snowbunny*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/spyder.gif',
            key: '*spyder*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/swipe.gif',
            key: '*swipe*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/warf.gif',
            key: '*warf*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/woogy.gif',
            key: '*woogy*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yooyu.gif',
            key: '*yooyu*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/zomutt.gif',
            key: '*zomutt*',
            keywords: []
        }
    ],
    items: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/bacon.gif',
            key: '*bacon*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/battleduck.gif',
            key: '*battleduck*',
            keywords: ['battle', 'duck']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bgc.gif',
            key: '*bgc*',
            keywords: ['grarrl', 'bony', 'club']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/baf.gif',
            key: '*baf*',
            keywords: ['bottled', 'faerie', 'air']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bdf.gif',
            key: '*bdf*',
            keywords: ['bottled', 'faerie', 'dark']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bef.gif',
            key: '*bef*',
            keywords: ['bottled', 'faerie', 'earth']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bff.gif',
            key: '*bff*',
            keywords: ['bottled', 'faerie', 'fire']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/blf.gif',
            key: '*blf*',
            keywords: ['bottled', 'faerie', 'light']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bwf.gif',
            key: '*bwf*',
            keywords: ['bottled', 'faerie', 'water']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/blurf.gif',
            key: '*blurf*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/book.gif',
            key: '*book*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/codestone.gif',
            key: '*codestone*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cookie.gif',
            key: '*cookie*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cupcake.gif',
            key: '*cupcake*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dbd.gif',
            key: '*dbd*',
            keywords: ['battle', 'duck']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dubloon.gif',
            key: '*dubloon*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/icecream.gif',
            key: '*icecream*',
            keywords: ['ice', 'cream', 'food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jelly.gif',
            key: '*jelly*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mspp.gif',
            key: '*mspp*',
            keywords: ['poogle']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/omelette.gif',
            key: '*omelette*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/babypb.gif',
            key: '*babypb*',
            keywords: ['baby', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dariganpb.gif',
            key: '*dariganpb*',
            keywords: ['darigan', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/eventidepb.gif',
            key: '*eventidepb*',
            keywords: ['eventide', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/eventidepppb.gif',
            key: '*eventidepppb*',
            keywords: ['eventide', 'paintbrush', 'petpet']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/faeriepb.gif',
            key: '*faeriepb*',
            keywords: ['faerie', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/islandpb.gif',
            key: '*islandpb*',
            keywords: ['island', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/maractitepb.gif',
            key: '*maractitepb*',
            keywords: ['maractite', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/piratepb.gif',
            key: '*piratepb*',
            keywords: ['pirate', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/woodlandpb.gif',
            key: '*woodlandpb*',
            keywords: ['woodland', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/wraithpb.gif',
            key: '*wraithpb*',
            keywords: ['wraith', 'paintbrush']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/pie.gif',
            key: '*pie*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/popcorn.gif',
            key: '*popcorn*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bluesand.gif',
            key: '*bluesand*',
            keywords: ['blue', 'sand']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/greensand.gif',
            key: '*greensand*',
            keywords: ['green', 'sand']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/pinksand.gif',
            key: '*pinksand*',
            keywords: ['pink', 'sand']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/orangesand.gif',
            key: '*orangesand*',
            keywords: ['orange', 'sand']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/scroll.gif',
            key: '*scroll*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sock.gif',
            key: '*sock*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/starberry.gif',
            key: '*starberry*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/stonepie.gif',
            key: '*stonepie*',
            keywords: ['food', 'stone', 'pie']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/suap.gif',
            key: '*suap*',
            keywords: ['pea']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tigerfruit.gif',
            key: '*tigerfruit*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/twirlyfruit.gif',
            key: '*twirlyfruit*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/ummagine.gif',
            key: '*ummagine*',
            keywords: ['food']
        }
    ],
    cup: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/altador.gif',
            key: '*altador*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/brightvale.gif',
            key: '*brightvale*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dacardia.gif',
            key: '*dacardia*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/darigan.gif',
            key: '*darigan*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/faerieland.gif',
            key: '*faerieland*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/haunted.gif',
            key: '*haunted*',
            keywords: ['woods', 'hauntedwoods']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kikolake.gif',
            key: '*kikolake*',
            keywords: ['lake']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/krawkisland.gif',
            key: '*krawkisland*',
            keywords: ['island']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kreludor.gif',
            key: '*kreludor*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/lostdesert.gif',
            key: '*lostdesert*',
            keywords: ['desert', 'lost']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/maraqua.gif',
            key: '*maraqua*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/meridell.gif',
            key: '*meridell*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mystery.gif',
            key: '*mystery*',
            keywords: ['island', 'mysteryisland']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/moltara.gif',
            key: '*moltara*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rooisland.gif',
            key: '*rooisland*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/shenkuu.gif',
            key: '*shenkuu*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/terror.gif',
            key: '*terror*',
            keywords: ['mountain', 'terrormountain']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tyrannia.gif',
            key: '*tyrannia*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/virtupets.gif',
            key: '*virtupets*',
            keywords: ['station']
        }
    ],
    bd: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/air.gif',
            key: '*air*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dark.gif',
            key: '*dark*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/earth.gif',
            key: '*earth*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/fire.gif',
            key: '*fire*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/light.gif',
            key: '*light*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/physical.gif',
            key: '*physical*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/water.gif',
            key: '*water*',
            keywords: []
        }
    ],
    celebration: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/bauble.gif',
            key: '*bauble*',
            keywords: ['christmas']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/candycane.gif',
            key: '*candycane*',
            keywords: ['christmas', 'winter']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/holly.gif',
            key: '*holly*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/mistletoe.gif',
            key: '*mistletoe*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rednose.gif',
            key: '*rednose*',
            keywords: ['nose', 'red']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/santa.gif',
            key: '*santa*',
            keywords: ['hat', 'christmas']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/snowflake.gif',
            key: '*snowflake*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/snowman.gif',
            key: '*snowman*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/xmastree.gif',
            key: '*xmastree*',
            keywords: ['christmas', 'tree']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/present.gif',
            key: '*present*',
            keywords: ['gift']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/bballoon.gif',
            key: '*bballoon*',
            keywords: ['blue', 'balloon']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/gballoon.gif',
            key: '*gballoon*',
            keywords: ['green', 'balloon']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rballoon.gif',
            key: '*rballoon*',
            keywords: ['red', 'balloon']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yballoon.gif',
            key: '*yballoon*',
            keywords: ['yellow', 'balloon']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cake.gif',
            key: '*cake*',
            keywords: ['birthday']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/aishadow.gif',
            key: '*aishadow*',
            keywords: ['aisha', 'cat', 'shadow']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/candle.gif',
            key: '*candle*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/creepyspyder.gif',
            key: '*creepyspyder*',
            keywords: ['spyder', 'spider']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/eekeek.gif',
            key: '*eekeek*',
            keywords: ['korbat', 'shadow']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/fence.gif',
            key: '*fence*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/ghost.gif',
            key: '*ghost*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jackolantern.gif',
            key: '*jackolantern*',
            keywords: ['jack', 'lantern', 'halloween', 'pumpkin']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/pumpkin.gif',
            key: '*pumpkin*',
            keywords: ['halloween']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tombstone.gif',
            key: '*tombstone*',
            keywords: ['rip']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/web.gif',
            key: '*web*',
            keywords: ['spider']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/witchhat.gif',
            key: '*witch*',
            keywords: ['hat']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/roses.gif',
            key: '*roses*',
            keywords: ['flower']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/flower.gif',
            key: '*flower*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/heart.gif',
            key: '*heart*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/jellykacheek.gif',
            key: '*jellykacheek*',
            keywords: ['jelly', 'kacheek', 'jellyneo']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/brownleaf.gif',
            key: '*brownleaf*',
            keywords: ['leaf', 'brown']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/leafleft.gif',
            key: '*leafleft*',
            keywords: ['leaf']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/leafright.gif',
            key: '*leafright*',
            keywords: ['leaf']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/redleaf.gif',
            key: '*redleaf*',
            keywords: ['leaf', 'red']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yellowleaf.gif',
            key: '*yellowleaf*',
            keywords: ['yellow', 'leaf']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/luckydraik.gif',
            key: '*luckydraik*',
            keywords: ['lucky', 'draik']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/angrynegg.gif',
            key: '*angrynegg*',
            keywords: ['angry', 'negg', 'bite']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/festivalnegg.gif',
            key: '*festivalnegg*',
            keywords: ['negg', 'easter', 'festival']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/fishnegg.gif',
            key: '*fishnegg*',
            keywords: ['fish', 'negg']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/happynegg.gif',
            key: '*happynegg*',
            keywords: ['happy', 'negg']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/negg.gif',
            key: '*negg*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/paperlantern.gif',
            key: '*paperlantern*',
            keywords: ['paper', 'lantern']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/rainbow.gif',
            key: '*rainbow*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/shamrock.gif',
            key: '*shamrock*',
            keywords: ['clover']
        }
    ],
    misc: [
        {
            src: 'https://images.neopets.com/neoboards/smilies/moneybag.gif',
            key: '*moneybag*',
            keywords: ['money', 'bag', 'np']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/0.o.0.gif',
            key: '*0.o.0*',
            keywords: ['mutant', 'eyes']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/carrot.gif',
            key: '*carrot*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/catfish.gif',
            key: '*catfish*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/cloud.gif',
            key: '*cloud*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/coffee.gif',
            key: '*coffee*',
            keywords: ['food']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/dung.gif',
            key: '*dung*',
            keywords: ['poo', 'poop', 'shit']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/genie.gif',
            key: '*genie*',
            keywords: ['lamp']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/indubitably.gif',
            key: '*indubitably*',
            keywords: ['mustache', 'monocle', 'dapper']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kqdoor.gif',
            key: '*kqdoor*',
            keywords: ['keyquest', 'door', 'lock']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/kqkey.gif',
            key: '*kqkey*',
            keywords: ['keyquest', 'key']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/map.gif',
            key: '*map*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/monocle.gif',
            key: '*monocle*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/moon.gif',
            key: '*moon*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/raincloud.gif',
            key: '*raincloud*',
            keywords: ['rain']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/star.gif',
            key: '*star*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/sun.gif',
            key: '*sun*',
            keywords: []
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tea.gif',
            key: '*tea*',
            keywords: ['cup', 'teacup']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/tophat.gif',
            key: '*tophat*',
            keywords: ['hat']
        },
        {
            src: 'https://images.neopets.com/neoboards/smilies/yarn.gif',
            key: '*yarn*',
            keywords: []
        }
    ]
}

const categories = {
    standard: 'Standard',
    neopians: 'Famous Neopians',
    neopets: 'Neopets',
    petpets: 'Petpets and Petpetpets',
    items: 'Items',
    cup: 'Altador Cup',
    bd: 'Battledome',
    celebration: 'Celebration',
    misc: 'Miscellaneous'
}

const css = `<style>
:root {
    --saahphire-smilies-border: 1px solid #2e96ff;
}

.saahphire-smilies-toggle {
    display: flex;
    position: fixed;
    top: 0.5rem;
    right: 0.5rem;
    cursor: pointer;
    border-radius: 50%;
    width: 2em;
    height: 2em;
    justify-content: center;
    align-items: center;
    background-image: linear-gradient(
        45deg,
        hsl(211deg 100% 89%) 0%,
        hsl(211deg 100% 87%) 8%,
        hsl(211deg 100% 84%) 17%,
        hsl(211deg 100% 82%) 25%,
        hsl(211deg 100% 79%) 33%,
        hsl(211deg 100% 77%) 42%,
        hsl(211deg 100% 74%) 50%,
        hsl(211deg 100% 72%) 58%,
        hsl(211deg 100% 69%) 67%,
        hsl(211deg 100% 66%) 75%,
        hsl(210deg 100% 63%) 83%,
        hsl(209deg 100% 59%) 92%,
        hsl(206deg 100% 50%) 100%
    );
    transform: rotateZ(0);
    transition: transform 0.2s ease-in-out;
    border: var(--saahphire-smilies-border);

    &::before {
        content: "";
        width: 1.5em;
        height: 1.5em;
        background-repeat: no-repeat;
        background-size: 100% 100%;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='m12.594 23.258l-.012.002l-.071.035l-.02.004l-.014-.004l-.071-.036q-.016-.004-.024.006l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.016-.018m.264-.113l-.014.002l-.184.093l-.01.01l-.003.011l.018.43l.005.012l.008.008l.201.092q.019.005.029-.008l.004-.014l-.034-.614q-.005-.019-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.003-.011l.018-.43l-.003-.012l-.01-.01z'/%3E%3Cpath fill='%23ffffff' d='M12 4a8 8 0 1 0 0 16a8 8 0 0 0 0-16M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m6.5-2c-.195 0-.444.124-.606.448a1 1 0 0 1-1.788-.896C6.542 8.68 7.413 8 8.5 8s1.957.68 2.394 1.552a1 1 0 0 1-1.788.896C8.944 10.124 8.696 10 8.5 10m7 0c-.195 0-.444.124-.606.448a1 1 0 1 1-1.788-.896C13.543 8.68 14.413 8 15.5 8s1.957.68 2.394 1.552a1 1 0 0 1-1.788.896c-.162-.324-.41-.448-.606-.448m-6.896 4.338a1 1 0 0 1 1.412-.088c.53.468 1.223.75 1.984.75s1.455-.282 1.984-.75a1 1 0 1 1 1.324 1.5A4.98 4.98 0 0 1 12 17a4.98 4.98 0 0 1-3.308-1.25a1 1 0 0 1-.088-1.412'/%3E%3C/g%3E%3C/svg%3E");
        transform: rotateZ(0);
        transition: transform 0.2s ease-in-out, background-image 0.2s ease-in-out;
        display: block;
    }
}

#saahphire-smilies-toggle:checked + .saahphire-smilies-toggle {
    transform: rotateZ(180deg);
    transition: transform 0.2s ease-in-out;

    &::before {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z'/%3E%3Cpath fill='%23ffffff' d='m12 14.122l5.303 5.303a1.5 1.5 0 0 0 2.122-2.122L14.12 12l5.304-5.303a1.5 1.5 0 1 0-2.122-2.121L12 9.879L6.697 4.576a1.5 1.5 0 1 0-2.122 2.12L9.88 12l-5.304 5.304a1.5 1.5 0 1 0 2.122 2.12z'/%3E%3C/g%3E%3C/svg%3E");
        transform: rotateZ(180deg);
        transition: transform 0.2s ease-in-out, background-image 0.2s ease-in-out;
    }
}

#navtop__2020 ~ .saahphire-smilies-toggle {
    top: 84px;
}

.saahphire-smilies-popup {
    font-size: 9pt;
    position: fixed;
    top: calc(1rem + 2em);
    right: 0.5rem;
    width: 20em;
    height: 315px;
    background: white;
    border-radius: 10px;
    padding: 1em;
    border: var(--saahphire-smilies-border);
    z-index: 1;
    transform: translateY(calc(-1 * (100% + 1rem + 2em + 83px)));
    opacity: 0;
    transition: 0.5s cubic-bezier(.49,-0.4,.52,1.4);
    transition-property: transform, opacity;
    display: flex;
    flex-direction: column;
}

#saahphire-smilies-toggle:checked ~ .saahphire-smilies-popup {
    transform: translateY(0);
    opacity: 1;
}

#navtop__2020 ~ .saahphire-smilies-popup {
    top: calc(1rem + 2em + 84px);
}

.saahphire-smilies-popup input[type="search"] {
    margin: 0 1em;
    border: var(--saahphire-smilies-border);
    border-radius: 4px;
    padding-left: 1.3em;
    outline-color: #2e96ff;
}

.saahphire-smilies-category, .saahphire-search-results {
    display: grid;
    opacity: 0;
    position: absolute;
    grid-template-columns: repeat(7, 1fr);
    justify-items: center;
    align-items: center;
    box-sizing: border-box;
    border-top: 0;
    border-radius: 0 0 10px 10px;
    overflow: clip;
    z-index: -1;
}

.saahphire-smilies-tab-icons + svg {
    position: relative;
    left: 1.3em;
    top: 1.3em;
}

[data-searching="true"] ~ .saahphire-search-results, .saahphire-smilies-tab-toggle:checked + .saahphire-smilies-category {
    opacity: 1;
    position: relative;
    transition: opacity 0.5s ease-in-out;
    z-index: 1;
}

.saahphire-smilies-popup input[type="radio"], [data-searching="true"] ~ .saahphire-search-results ~ .saahphire-smilies-category {
    display: none;
}

.saahphire-smilies-category h2 {
    grid-column: span 7;
    color: #2e96ff;
}

.saahphire-smilies-category img {
    cursor: pointer;
}

.saahphire-smilies-tab-icons {
    list-style: none;
    display: flex;
    margin: 0;
    padding: 0;
    justify-content: space-around;
    align-items: end;
}

.saahphire-smilies-tab-icon {
    display: inline-flex;
    cursor: pointer;
    border: var(--saahphire-smilies-border);
    border-radius: 5px 5px 0 0;
    border-bottom: 0;
    height: 24px;
    width: 20px;
    justify-content: center;
}

.saahphire-smilies-tab-icon :is(img, svg) {
    align-self: center;
}

@keyframes change-category {
    0% {
        .saahphire-smilies-category {
            opacity: 1;
            transform: scaleY(100%);
        }
    }
    50% {
        .saahphire-smilies-category {
            opacity: 0;
            transform: scaleY(0);
        }
    }
    100% {
        .saahphire-smilies-category {
            opacity: 1;
            transform: scaleY(100%);
        }
    }
}
</style>`;

(function() {
    'use strict';
    init();
})();
