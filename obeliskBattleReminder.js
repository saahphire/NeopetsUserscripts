// ==UserScript==
// @name         Neopets: Obelisk Battle Reminder
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds a huge red banner to every single page (while Obelisk battles are underway, IF you signed up) until you complete 10 battles
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/obeliskBattleReminder.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/obeliskBattleReminder.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Verifies that you've actually signed up for the Obelisk battle, by:
        - Seeing the "signed up and awaiting battle" screen in https://www.neopets.com/prehistoric/battleground/ once you
          visit it
        - Seeing a results table in https://www.neopets.com/prehistoric/battleground/ once you visit it
        - Seeing that you're battling an Obelisk opponent, since they only show up if you signed up
    - Keeps track of how many times you've won against Obelisk opponents, by either:
        - Increasing the count by 1 whenever you win against a valid opponent; or
        - Reading the table in https://www.neopets.com/prehistoric/battleground/ once you visit it
    - Adds a bright red banner to the bottom of every Neopets page if you haven't won enough times, telling you how
      many wins are left, AS LONG AS you have signed up and the battle is in full swing

    If you install this script mid-battle, I recommend visiting https://www.neopets.com/prehistoric/battleground/ to
    update the win count and sign-up status. If you're in a BD guild, don't forget to change minimumWins to the number
    they require! The default value is 10 (minimum amount to get a boon)

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

// Change this value to the number of times you want to fight (and win) against Obelisk opponents
const minimumWins = 10;

const obeliskChallengers = [215, 216, 217, 218, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 241, 242, 243, 244, 245, 246];

const getChallengerId = () => parseInt(document.querySelector('#logcont + script').textContent.match(/npcId: '(\d+)/)[1]);

const staleSignUp = async () => (Date.now() - new Date(await GM.getValue('timestamp', 0))) > 7 * 24 * 60 * 60 * 1000;

const onVictory = async () => {
    const battlesDone = (await GM.getValue('battles', 0)) + 1;
    GM.setValue('battles', battlesDone);
    const banner = document.getElementsByClassName('saahphire-obelisk-battle-reminder')[0];
    if(!banner) return;
    banner.children[1].textContent = banner.children[1].textContent.replace(/\d+/, 10 - battlesDone);
    if(battlesDone === minimumWins) banner.remove();
}

const nstDate = (localDate = new Date()) => new Date(new Intl.DateTimeFormat('sv-SE', { timeZone: 'America/Los_Angeles', dateStyle: 'short', timeStyle: 'medium' }).format(localDate));

const resetBattles = () => {
    GM.setValue('battles', 0);
    GM.setValue('signed-up', false);
    GM.setValue('timestamp', 0);
}

const closestBattleThursday = (date) => {
    const thursday = new Date(date);
    thursday.setDate(thursday.getDate() + ((4 - thursday.getDay() - 7) % 7));
    const controlThursday = new Date(thursday);
    controlThursday.setFullYear(2026, 0, 22);
    if((controlThursday.getTime() - thursday.getTime()) % 1209600000 !== 0) thursday.setDate(thursday.getDate() + 7);
    return thursday;
}

const isBattlePeriod = () => {
    const date = nstDate();
    const weekday = date.getDay();
    if(weekday !== 0 && weekday < 4) return false;
    const thursday = closestBattleThursday(date);
    if(thursday.getTime() > date.getTime()) return false;
    return true;
}

const watchForVictory = (mutationRecord) => {
    const newNode = mutationRecord[0]?.addedNodes[0];
    if(!newNode?.classList.contains('end_game')) return;
    if(!newNode.children[0].classList.contains('victory')) return;
    onVictory();
}

const onBattleDome = (signedUp) => {
    const playground = document.getElementById('playground');
    if(!playground) return;
    if(!obeliskChallengers.includes(getChallengerId())) return;
    // In case someone installed after sign ups but during battle period
    if(!signedUp) onSignUp(signedUp);
    watchForVictory(playground);
    const observer = new MutationObserver(watchForVictory);
    observer.observe(playground, {childList: true});
}

const onSignUp = (signedUp) => {
    if(signedUp) return true;
    GM.setValue('signed-up', true);
    GM.setValue('timestamp', Date.now());
    return true;
}

const onFightTables = (signedUp) => {
    // In case someone installed after sign ups but during battle period
    if(!signedUp) onSignUp(signedUp);
    const wins = [...document.querySelectorAll('.waveBlock div:first-child')]
        .map(cell => parseInt(cell.textContent))
        .reduce((total, cell) => total + cell, 0);
    return GM.setValue('battles', wins);
}

const watchObeliskSelection = (signedUp, observer) => {
    const button = document.getElementById('obeliskPopupJoinButton');
    if(!button) return;
    button.addEventListener('click', () => {
        onSignUp(signedUp);
        observer.disconnect();
    });
}

const onObelisk = async (signedUp) => {
    if(document.getElementsByClassName('waveChallengerName').length) await onFightTables(signedUp);
    // check if signed up but waiting
    else if(document.getElementById('bannerLabel')) return onSignUp(signedUp);
    else if(document.getElementById('cboxContent')) {
        const observer = new MutationObserver(() => watchObeliskSelection(signedUp, observer));
        observer.observe(document.getElementById('cboxContent'), {childList: true});
    }
    return signedUp;
}

const addBanner = (battles) => {
    const sibling = document.querySelector('#navtop__2020, #header');
    if(!sibling) return; // Probably not a fully working Neopets page (pure query results, petpages, etc)
    const div = document.createElement('div');
    div.classList.add('saahphire-obelisk-battle-reminder');
    document.body.insertAdjacentElement('beforeend', div);
    div.insertAdjacentHTML('afterbegin', `<style>
        body {
            margin-bottom: 2.5rem;
        }
        
        .saahphire-obelisk-battle-reminder {
            position: fixed;
            bottom: 0;
            width: 100%;
            padding: 0.5em 0;
            background: red;
            color: white;
            font-size: 1.5rem;
            font-weight: 600;
            font-family: Cafeteria, Verdana, sans-serif;
            text-align: center;
            z-index: 11;

            a{
                &:link, &:visited {
                color: #fff;
                text-decoration: none;
                }

                &:hover {
                    color: #FFF0CD;
                }
            }
        }
    </style>`);
    const a = document.createElement('a');
    a.textContent = `Obelisk Battles Left: ${minimumWins - battles}`;
    a.href = 'https://www.neopets.com/dome/fight.phtml';
    div.appendChild(a);
}

(async function() {
    'use strict';
    let signedUp = await GM.getValue('signed-up', false);
    if(await staleSignUp()) resetBattles();
    if(window.location.href.match(/prehistoric\/battleground/)) signedUp = await onObelisk(signedUp);
    if(!isBattlePeriod() || !signedUp) return;
    if(window.location.href.match(/arena\.phtml/)) onBattleDome(signedUp);
    const battles = await GM.getValue('battles', 0);
    if(battles < minimumWins) addBanner(battles);
})();
