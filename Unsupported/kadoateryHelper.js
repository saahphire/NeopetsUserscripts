// ==UserScript==
// @name         Neopets: Kadoatery Helper
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Highlights wearable items in Quick Stock. Optionally auto-selects "Closet".
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/Unsupported/kadoateryHelper.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/Unsupported/kadoateryHelper.js
// @match        *://*.neopets.com/games/kadoatery*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

// This script is still in development, but is taking a backseat to other scripts I'm writing.
// I've decided to post it regardless because it's been in this state for months.
// Most features work as far as I remember, but I haven't been able to test timekeeping fully yet.

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Condenses the Kadoatery view so you can see all Kads at once
        - Buttons show the Kadoatie's color, if you want that information
        - Hides all fed Kadoaties into an accordion below everything else
        - Adds an index number so you know its position before fed Kadoaties were hidden
        - Hides usernames
    - Adds a red border to the Kadoatery and a big warning if you've already fed a Kadoatie (and can't feed another yet)
    - Whenever there's a refresh, writes a post for the Kadoatery topic in the Site Games neoboard that you can copy
        - Allows you to keep NTO on or off for these posts
        - Separates the post into timekeeping and items, in case they don't fit in the same post
        - Automatically inserts a period in the middle of censored item names
        - Saves all information so you can exit the page or refresh without losing data
    - Allows you to click on an item's name to copy it
    - Allows you to click on a button to open a SW search for that item in a new tab. Note that this is slower than
      leaving a SW tab open and pasting the name on it.

        This doesn't support tracking minis alongside mains. At least not yet. It's a good amount of work that I honestly
    don't know if anyone wants me to do. If you want that, feel free to contact me!

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const leadingZero = n => (n < 10 ? '0' : '') + n;

// Thank you https://www.tumblr.com/neokka/90746738596 for the banned word list
const censored = ['rape', 'ass', 'cum', 'kill', 'weed', 'hole', 'nuts', 'semen', 'anal', 'meth', 'ball', 'base', 'tit'];

const insertAt = (str, position) => position === -1 ? str : `${str.slice(0, position + 1)}.${str.slice(position + 1)}`;

const copy = e => {
    const property = e.target.value ? 'value' : 'textContent';
    const value = e.target[property];
    navigator.clipboard.writeText(value);
    setTimeout(() => e.target[property] = value, 500);
    e.target[property] = '✔️ Copied!';
}

class Kadoatie {
    constructor(original, item, index) {
        this.color = original.getElementsByTagName('IMG')[0].src.match(/\/(\w+)_\w+.gif/)[1];
        this.feedLink = original.getElementsByTagName('A')[0].href;
        this.item = item;
        this.index = index + 1;
        this.div = document.createElement('div');
    }

    createAnchorButton(text, className, href, isNewTab = true) {
        const a = document.createElement('a');
        a.textContent = text;
        a.href = href;
        a.classList.add(className);
        if(isNewTab) a.target = '_blank';
        this.div.appendChild(a);
    }

    createCopiableText(text) {
        const p = document.createElement('p');
        p.textContent = text;
        p.addEventListener('click', copy);
        this.div.appendChild(p);
    }

    buildKad() {
        this.div.classList.add('saah-kh-kadoatie', `saah-kh-${this.color}`);
        this.createAnchorButton('Feed!', 'saah-kh-feed', this.feedLink, false);
        this.createCopiableText(this.item);
        this.createAnchorButton('SW', 'saah-kh-sw', `https://www.neopets.com/shops/wizard.phtml?string=${encodeURI(this.item).replaceAll('%20', '+')}`, false);
        this.div.insertAdjacentHTML('beforeEnd', `<p class="saah-kh-index">#${this.index}</p>`);
        return this.div;
    }
}

class Kadoatery {
    constructor(rf, items) {
        this.lastRF = rf.last;
        this.previousRF = rf.previous;
        this.items = items ?? this.getItems();
    }

    getItems() {
        return [...document.querySelectorAll('div[align="center"] td strong:nth-of-type(2)')].map(item => item.textContent);
    }

    getKads(kadoatery) {
        document.querySelectorAll('div[align="center"] td').forEach((kad, index) => {
            const item = kad.querySelector('strong:nth-of-type(2)');
            if(!item) return;
            const kadoatie = new Kadoatie(kad, item.textContent, index);
            kadoatery.appendChild(kadoatie.buildKad());
        })
    }

    async save() {
        GM.setValue('rf', {last: this.lastRF, previous: this.previousRF});
        GM.setValue('items', this.items);
    }

    update() {
        GM.setValue('lastUpdate', this.lastRF);
        GM.setValue('lastTimestamp', new Date().getTime());
    }

    isNewRefresh(cachedKadoatery) {
        return this.items.some(item => !cachedKadoatery.items.find(it => item === it));
    }

    getPends() {
        const result = [];
        for (let i = 0; i < 8; i++) {
            const multiple = i * 7;
            const delta = this.lastRF.minutes + 35 + multiple;
            result.push(leadingZero(delta % 60));
        }
        return result;
    }

    async addNTO() {
        const label = document.createElement('label');
        label.htmlFor = 'saah-kh-nto';
        label.textContent = 'Not Taking Over?';
        const nto = document.createElement('input');
        nto.type = 'checkbox';
        nto.checked = await GM.getValue('nto', true);
        nto.id = 'saah-kh-nto';
        nto.addEventListener('click', () => {
            const timekeeping = document.getElementsByClassName('saah-kh-timekeeping')[0];
            if(nto.checked) {
                timekeeping.value += '\n\nNTO';
            } else {
                timekeeping.value = timekeeping.value.replace(/\s+NTO/, '');
            }
            GM.setValue('nto', nto.checked);
        });
        label.appendChild(nto);
        return label;
    }

    isMain() {
        return this.items.length > 9;
    }

    writeRF(isLast) {
        const nam = isLast ? 'Last' : 'Previous';
        const time = this[nam.toLocaleLowerCase() + 'RF'];
        if(!time) return '';
        return `${nam} RF @ :${leadingZero(time.minutes)}:${leadingZero(time.seconds)}`;
    }

    writeTimeKeepingPost() {
        const timekeeping = document.createElement('textarea');
        timekeeping.classList.add('saah-kh-timekeeping');
        timekeeping.value = `${this.writeRF(true)}
${this.previousRF ? this.writeRF(false) + '\n' : ''}
New ${this.isMain() ? 'main' : `mini (${this.items.length})`} @ :${leadingZero((this.lastRF.minutes + 28) % 60)}
Pends @ :${this.getPends().join(' :')}${document.getElementById('saah-kh-nto').checked ? '\n\nNTO' : ''}`;
        timekeeping.addEventListener('click', copy);
        return timekeeping;
    }

    writeItemListPost() {
        const itemList = document.createElement('textarea');
        itemList.value = this.items.map(item => censored.reduce((agg, curr) => insertAt(agg, agg.toLocaleLowerCase().indexOf(curr)), item)).join('\n');
        itemList.addEventListener('click', copy);
        return itemList;
    }

    async writePosts() {
        const content = document.getElementsByClassName('content')[0];
        content.appendChild(await this.addNTO());
        content.appendChild(this.writeTimeKeepingPost());
        content.appendChild(this.writeItemListPost());
    }

    buildKadoatery() {
        const content = document.getElementsByClassName('content')[0];
        const div = document.createElement('div');
        div.classList.add('saah-kh-kadoatery');
        content.prepend(div);
        content.insertAdjacentHTML('afterBegin', `<style>${css}</style>`);
        this.getKads(div);
    }
}

const isRecentUpdate = async () => {
    const timestamp = await GM.getValue('lastTimestamp');
    const now = new Date().getTime();
    return now - timestamp < 7 * 60 * 1000;
}

const retrieveCachedKadoatery = async (minutes, seconds) => {
    const rf = await GM.getValue('rf', {last: {minutes, seconds}});
    const items = await GM.getValue('items', []);
    return new Kadoatery(rf, items);
}

const createNewKadoatery = async (minutes, seconds) => {
    const isRecent = await isRecentUpdate();
    const previousRF = isRecent ? await GM.getValue('lastUpdate', {minutes, seconds}) : null;
    return new Kadoatery({last: {minutes, seconds}, previous: previousRF});
}

const getLatestKadoatery = async (nst) => {
    const [minutes, seconds] = nst.match(/\d+:(\d+):(\d+) .m NST/).slice(1).map(t => parseInt(t));
    const cache = await retrieveCachedKadoatery(minutes, seconds);
    const current = await createNewKadoatery(minutes, seconds);
    const isNew = current.isNewRefresh(cache);
    if(isNew) current.save();
    const trueKadoatery = isNew ? current : cache;
    current.update();
    current.buildKadoatery();
    trueKadoatery.writePosts();
    if(current.items.length === 0) document.getElementsByClassName('content')[0].insertAdjacentHTML('afterBegin', '<p>All Kadoaties have been fed!</p>');
}

const hideOldKadoatery = () => {
    const oldKadoatery = document.querySelector('.content > div:last-child');
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Original Kadoatery';
    details.appendChild(summary);
    oldKadoatery.insertAdjacentElement('afterEnd', details);
    details.appendChild(oldKadoatery);
}

const maybeAddBorder = () => {
    const username = document.querySelector('.user a').textContent;
    if(![...document.querySelectorAll('.content a strong')].find(un => un.textContent === username)) return;
    const content = document.getElementById('content');
    content.style.border = '5px solid red';
    const p = document.createElement('p');
    p.classList.add('saah-kh-warning');
    p.textContent = 'You can\'t feed yet!';
    content.prepend(p);
}

const css = `
.content > label {
    width: calc(100% - 165px);
    display: inline-block;
    text-align: center;
}

.content > textarea {
    width: calc(49% - 83px);
    height: 10em;
}

.saah-kh-warning {
    color: maroon;
    font-size: 3em;
    text-align: center;
}

.saah-kh-kadoatery {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1em;
    align-items: center;
}

.saah-kh-kadoatie {
    text-align: center;
    padding: 1em;
}

.saah-kh-kadoatie p {
    margin: 0.25em 0;
}

.saah-kh-kadoatie a, .saah-kh-kadoatie a:link, .saah-kh-kadoatie a:visited {
    display: inline-block;
    border: 1px solid black;
    border-radius: 1em;
    color: black;
}

.saah-kh-feed {
    padding: 1.5em;
}

.saah-kh-sw {
    padding: 0.5em;
}

.saah-kh-island a  {
    background: linear-gradient(50deg, hsl(45deg 81% 36%) 0%, hsl(45deg 69% 40%) 8%, hsl(45deg 59% 45%) 17%, hsl(45deg 50% 49%) 25%, hsl(45deg 50% 54%) 33%, hsl(45deg 51% 59%) 42%, hsl(45deg 52% 64%) 50%, hsl(45deg 53% 70%) 58%, hsl(45deg 53% 75%) 67%, hsl(45deg 54% 81%) 75%, hsl(45deg 55% 87%) 83%, hsl(45deg 56% 94%) 92%, hsl(0deg 0% 100%) 100% )
}

.saah-kh-rainbow a {
    background: linear-gradient(50deg, #c8beff 0%, #dea8f8 10%, #a8deff 30%, #bdfacd 42%, #f3fabd 58%, #fae3bd 70%, #f8acab 95%, #feaad4 100%)
}

.saah-kh-spotted a {
    background: linear-gradient(50deg, hsl(45deg 87% 67%) 0%, hsl(45deg 72% 63%) 8%, hsl(45deg 61% 59%) 17%, hsl(45deg 52% 54%) 25%, hsl(45deg 44% 50%) 33%, hsl(45deg 44% 46%) 42%, hsl(45deg 45% 42%) 50%, hsl(45deg 46% 37%) 58%, hsl(45deg 46% 33%) 67%, hsl(45deg 47% 29%) 75%, hsl(45deg 47% 25%) 83%, hsl(45deg 48% 21%) 92%, hsl(45deg 48% 17%) 100% )
}

.saah-kh-blue a {
    background: linear-gradient(50deg, hsl(218deg 62% 42%) 0%, hsl(218deg 58% 44%) 8%, hsl(218deg 55% 47%) 17%, hsl(218deg 52% 49%) 25%, hsl(218deg 51% 51%) 33%, hsl(219deg 52% 53%) 42%, hsl(219deg 54% 56%) 50%, hsl(219deg 56% 58%) 58%, hsl(219deg 57% 61%) 67%, hsl(219deg 59% 63%) 75%, hsl(220deg 62% 66%) 83%, hsl(220deg 64% 68%) 92%, hsl(220deg 67% 71%) 100% )
}

.saah-kh-yellow a {
    background: linear-gradient(50deg, hsl(60deg 99% 33%) 0%, hsl(60deg 86% 37%) 8%, hsl(60deg 75% 41%) 17%, hsl(60deg 65% 45%) 25%, hsl(60deg 56% 49%) 33%, hsl(60deg 56% 54%) 42%, hsl(60deg 58% 58%) 50%, hsl(60deg 60% 63%) 58%, hsl(60deg 63% 69%) 67%, hsl(60deg 66% 74%) 75%, hsl(60deg 71% 79%) 83%, hsl(60deg 78% 85%) 92%, hsl(60deg 96% 91%) 100% )
}

.saah-kh-pink a {
    background: linear-gradient(50deg, hsl(329deg 82% 58%) 0%, hsl(329deg 83% 61%) 8%, hsl(329deg 83% 63%) 17%, hsl(329deg 84% 66%) 25%, hsl(329deg 84% 68%) 33%, hsl(329deg 85% 71%) 42%, hsl(330deg 86% 73%) 50%, hsl(330deg 87% 76%) 58%, hsl(330deg 88% 79%) 67%, hsl(330deg 90% 81%) 75%, hsl(330deg 92% 84%) 83%, hsl(330deg 95% 87%) 92%, hsl(331deg 100% 90%) 100% )
}

.saah-kh-white a {
    background: linear-gradient(50deg, hsl(212deg 38% 70%) 0%, hsl(212deg 39% 72%) 8%, hsl(212deg 39% 75%) 17%, hsl(212deg 39% 77%) 25%, hsl(212deg 40% 80%) 33%, hsl(212deg 40% 82%) 42%, hsl(212deg 41% 84%) 50%, hsl(212deg 41% 87%) 58%, hsl(212deg 42% 89%) 67%, hsl(212deg 42% 92%) 75%, hsl(212deg 42% 95%) 83%, hsl(212deg 43% 97%) 92%, hsl(0deg 0% 100%) 100% )
}

.saah-kh-green a {
    background: linear-gradient(50deg, hsl(90deg 47% 24%) 0%, hsl(90deg 43% 27%) 8%, hsl(90deg 41% 31%) 17%, hsl(90deg 39% 34%) 25%, hsl(90deg 37% 37%) 33%, hsl(89deg 35% 40%) 42%, hsl(89deg 34% 44%) 50%, hsl(89deg 33% 47%) 58%, hsl(89deg 32% 50%) 67%, hsl(89deg 36% 54%) 75%, hsl(89deg 40% 57%) 83%, hsl(89deg 45% 61%) 92%, hsl(89deg 51% 65%) 100%);
}
`

const init = () => {
    const nst = document.getElementById('nst').textContent;
    hideOldKadoatery();
    getLatestKadoatery(nst);
    maybeAddBorder();
}

(function() {
    'use strict';
    init();
})();
