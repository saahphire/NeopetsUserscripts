// ==UserScript==
// @name         Neopets: Instant Trudy's Surprise
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  I don't have time to wait three years until Trudy's surprise finishes spinning and gives a random set of slots that don't even mean anything. Neither do you!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/instantTrudysSurprise.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/instantTrudysSurprise.js
// @match        *://*.neopets.com/trudys_surprise.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds a button to the top of Trudy's Surprise that you can press to instantly get its prizes
    - Disables the button once you've received your prize
    - Doesn't add the button if you've already played that day

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/
const AJAX_URL = 'https://www.neopets.com/trudydaily/ajax/claimprize.php';

const post = (url, action) => {
    const formData = new FormData();
    formData.append('action', action);
    if(action === 'getslotstate') formData.append('key', '');
    return fetch(url, {
        method: 'POST',
        headers: {contentType: 'application/x-www-form-urlencoded;'},
        body: formData
    });
}

const treatNeopoints = prizes => {
    const np = prizes.find(prize => prize.url === '');
    if(np) {
        np.url = 'https://images.neopets.com/dailyslots/bagofneopoints.gif';
        np.name = np.value + ' Neopoints';
    }
    return prizes;
}

const instantTrudy = async () => {

    const json = await post(AJAX_URL, 'beginroll');
    const res = await json.json();
    if(res.error != '') {
        document.getElementsByClassName('saahphire-instant-trudy')[0].textContent = `Error: ${res.error}`;
        return;
    }
    const prizes = treatNeopoints(res.prizes);
    ShowDailyPrizes(prizes, res.badLuck ? 'badLuck' : 'new');
    post(AJAX_URL, 'prizeclaimed');
    document.getElementById('npanchor').textContent = Intl.NumberFormat().format(res.adjustedNp);
    document.getElementsByClassName('saahphire-instant-trudy')[0].disabled = true;
}

const addButton = () => {
    const button = document.createElement('button');
    button.classList.add('button-default__2020', 'button-yellow__2020', 'saahphire-instant-trudy');
    button.role = 'button';
    button.textContent = 'Instant Roll';
    button.addEventListener('click', instantTrudy);
    document.getElementById('trudyContainer').insertAdjacentElement('beforebegin', button);
    return button;
}


(async function() {
    'use strict';
    if(document.querySelector('#trudyContainer iframe').contentWindow.slt_check_trudy === 1) addButton();
})();
