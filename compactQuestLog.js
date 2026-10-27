// ==UserScript==
// @name         Neopets: Compact Quest Log (adopted)
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  [Removes extra spaces and other elements from the quest log] ADOPTED. Removes completed Tutorial. Optionally removes Premium for non-Premium.
// @author       senerio, saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/compactQuestLog.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/compactQuestLog.js
// @match        *://*.neopets.com/questlog/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁
    senerio made a wonderful userscript making the Quest Log more compact. In October 26th, 2026, the Quest Log
    got an update breaking their userscript. Unfortunately the last time I saw them was seven months ago. I don't
    believe they will update their userscript, so I'm adopting it.
    
    senerio, if you see this and want me to take it down, feel free to open an issue / leave a GF review / NM me /
    email me (saahphire@gmail.com)

    Original post by senerio (deleted by moderators): https://www.reddit.com/r/neopets/comments/1av0w9e

    For obvious reasons most of the CSS is copied. I didn't reinvent the wheel. I only fixed what was broken.

    I tried to follow senerio's vision but I have 0 web design talent so it looks ugly anyway

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
*/

// Set to true if you want to hide Premium prizes for non-Premium users. Set to false if you want to show them.
const hidePremiumIfNotPremium = false;

const css = `<style>
  /* Hide elements */
  .questlog-header,
  .questlog-info,
  .ql-bonus-label,
  .ql-desc,
  .ql-dots,
  .ql-progress,
  .ql-quest-top {
    display: none !important;
  }

  /* Top */
  #QuestLogStreakRewards.ql-hidden {
    display: block !important;
  }

  .questlog-top {
    gap: unset;
  }

  /* Bonus images and rewards */
  .ql-bonus-img {
    width: 40px !important;
    height: 40px !important;
    flex-shrink: 0 !important;
    margin-right: 0.5em !important;
  }

  .ql-bonus-img img {
    width: 100% !important;
  }

  .ql-bonus-reward {
    flex-direction: row !important;
  }

  #QuestLogReroll {
    position: unset !important;
    margin: 0 10px !important;
  }

  .missed-day-button {
    padding-top: 0 !important;
    padding-bottom: 0 !important;
  }

  .ql-bonus-check {
    top: 0 !important;
    width: 100% !important;
  }

  /* Rewards */
  .questlog-quests,
  .questlog-body {
    gap: 0.2em !important;
  }

  .ql-reward-img img,
  .ql-reward-np {
    width: 40px !important;
    height: 40px !important;
    margin-top: 2px !important;
  }

  .ql-reward {
    gap: 0 !important;
    padding: 0 1em !important;
  }

  /* Details */
  .ql-quest-details {
    display: flex !important;
    flex-wrap: wrap-reverse !important;
    justify-content: space-between !important;
    align-items: start !important;
  }

  .ql-quest-details > div {
    padding: 0 0.5em !important;
  }

  .ql-quest-description {
    width: 100% !important;
  }

  .ql-tasks {
    flex: 4 4 70% !important;
    margin: unset !important;
  }

  .ql-quest-buttons {
    flex: 1 1 20% !important;
    margin-top: 0 !important;
    display: flex !important;
    justify-content: center !important;
  }

  .ql-claim {
    margin: 0 !important;
    align-self: center !important;
  }

  /* New code */
  .questlog-bonus-rewards {
    display: flex;
    justify-content: space-between;
  }
  .ql-bonus-progress {
    margin-bottom: 1em;
  }
  .questlog-bonus-rewards:has(.search-helper) .ql-streak:not(.premium) .ql-bonus-progress {
    margin-bottom: 2em;
  }
  .ql-reroll {
    position: relative !important;
    top: 0 !important;
    margin: 0 0.5em;
  }
  .ql-streak:not(.premium) .ql-bonus-progress {
    justify-content: right !important;
  }
  .ql-streak:not(.premium) .search-helper {
    position: absolute;
    bottom: -2em;
    left: 4em;
    width: 100%;
  }
  .questlog-container .ql-bonus .ql-streak.premium {
    &::before {
        content: none;
    }
    width: 185%;
    left: -85%;
    background: none;
    padding: 0;
    border: 0;
  }
  .questlog-container .ql-bonus .ql-streak.premium:has(.search-helper) {
    width: 145%;
    left: -45%;
  }
  .ql-streak.premium.preview {
    ${hidePremiumIfNotPremium ? 'display: none;' : ''}
  }
  .ql-streak-cta, .ql-streak-divider, .questlog-neopass-link, .questlog-tab.tab-1:not(:has(.ql-notif)) {
    display: none !important;
  }
  .ql-premium {
    display: flex;
  }
  .button-grid2__2020 {
    margin: auto;
  }
</style>`;

const observe = (observer) => observer.observe(document.getElementsByClassName('questlog-container')[0], {childList: true, subtree: true});

const wrapPremiumStreak = (parent, stop) => {
    const wrapper = document.createElement('div');
    wrapper.classList.add('ql-premium');
    while(parent.firstChild && parent.firstChild !== stop) wrapper.appendChild(parent.firstChild);
    wrapper.appendChild(stop);
    parent.appendChild(wrapper);
}

const breakdownPremiumStreaks = () => {
    const parent = document.querySelector('.premium .ql-bonus-progress:not(:has(.ql-premium))');
    if(!parent) return;
    const [firstStop, secondStop] = parent.getElementsByClassName('ql-bonus-reward');
    wrapPremiumStreak(parent, firstStop);
    wrapPremiumStreak(parent, secondStop);
}

const runJS = (observer) => {
    if(observer) observer.disconnect();
    breakdownPremiumStreaks();
    document.querySelectorAll('.ql-reroll-quest').forEach(button => button.textContent = 'Re-roll');
    document.querySelectorAll('.ql-claim:disabled').forEach(button => button.textContent = 'Claim');
    if(observer) observe(observer);
}

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    runJS();
    const observer = new MutationObserver(() => runJS(observer));
    observe(observer);
})();
