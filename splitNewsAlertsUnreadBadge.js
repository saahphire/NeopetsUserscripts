// ==UserScript==
// @name         Neopets: Split News/Alerts Unread Badges
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Splits the unread notification badge in the beta layout into two, one for news and one for alerts.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/splitNewsAlertsUnreadBadge.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/splitNewsAlertsUnreadBadge.js
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
    - Removes the default news+alerts notification badge
    - Adds a yellow notification badge on the left of the notification icon for unread news
    - Marks news as read when you click/tap their notification
    - Adds a red notification badge on the right for unread alerts

    If you only care about alerts, check out this userscript instead:
    https://update.greasyfork.org/scripts/527400/Alert%20Notification%20Fix.user.js

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const getReadNews = () => GM.getValue('read-news', []);
const wasRead = async (id) => (await getReadNews()).find(readId => readId === id);
const markRead = async (id) => GM.setValue('read-news', (await getReadNews()).concat([id]));
const updatePossibleRead = async (idList) => GM.setValue('read-news', (await getReadNews()).filter(id => idList.find(possibleId => possibleId === id)));

const getRequestBody = () => {
    const formData = new FormData();
    formData.append('action', 'lazyloadnews');
    formData.append('page', 0);
    formData.append('itemsPerPage', 10);
    formData.append('latestNewsId', 0);
    formData.append('lastViewedNewsID', 0);
    return formData;
}

const loadNews = async () => {
    const response = await fetch('https://www.neopets.com/np-templates/ajax/notifications.php', {
        method: 'POST',
        body: getRequestBody()
    });
    if(response.status !== 200) return console.error(`Couldn't load news: ${response.statusText}`);
    const result = await response.json();
    return result.newNewsItems.map(item => item.match(/id=(\d+)/)[1]);
}

const getUnreadNewsQuantity = async () => {
    const newIds = await loadNews();
    updatePossibleRead(newIds);
    const read = await getReadNews();
    return newIds.filter(id => !read.find(readId => readId === id)).length;
}

const getUnreadAlertsQuantity = () => document.querySelectorAll('#alerts li').length;

const createUnreadBadge = (options) => {
    const badge = document.createElement('div');
    badge.classList.add('nav-notif-dot__2020');
    if(options.direction) {
        badge.style[options.direction] = '-5px';
        badge.style[options.direction === 'left' ? 'right' : 'left'] = 'auto';
    }
    if(options.color) badge.style.backgroundColor = options.color;
    badge.ariaLabel = options.label;
    badge.textContent = options.content;
    if(options.content === 0) badge.style.display = 'none';
    options.sibling.insertAdjacentElement('afterend', badge);
    return badge;
}

const unreadNewsOptions = async (sibling) => {
    return {
        sibling,
        direction: 'left',
        color: '#ffcc00',
        content: await getUnreadNewsQuantity(),
        label: 'Unread News'
    }
}

const unreadAlertsOptions = (sibling) => {
    return {
        sibling,
        content: getUnreadAlertsQuantity(),
        label: 'Unread Alerts'
    }
}

const watchNews = (unreadNewsBadge) => {
    const newsList = document.getElementById('newsList');
    const observer = new MutationObserver(() => {
        const newsItems = newsList.querySelectorAll('li');
        if(newsItems.length === 0) return;
        newsItems.forEach(async item => {
            const id = item.getElementsByTagName('a')[0].href.match(/id=(\d+)/)[1];
            if(await wasRead(id)) return;
            item.style.border = '1px solid #fc0';
            item.addEventListener('click', () => {
                item.style.border = '';
                markRead(id);
                unreadNewsBadge.textContent = parseInt(unreadNewsBadge.textContent) - 1;
                if(unreadNewsBadge.textContent === '0') unreadNewsBadge.style.display = 'none';
            });
        })
    });
    observer.observe(newsList, {childList: true});
}

(async function() {
    'use strict';
    const originalBadge = document.getElementById('NavAlertsNotif');
    if(!originalBadge) return;
    const unreadNewsBadge = createUnreadBadge(await unreadNewsOptions(originalBadge));
    const unreadAlertsBadge = createUnreadBadge(unreadAlertsOptions(unreadNewsBadge));
    document.querySelectorAll('.alert-x').forEach(alert => alert.addEventListener('click', () => {
        unreadAlertsBadge.textContent = parseInt(unreadAlertsBadge.textContent) - 1;
        if(unreadAlertsBadge.textContent === '0') unreadAlertsBadge.style.display = 'none';
    }))
    originalBadge.remove();
    watchNews(unreadNewsBadge);
})();
