// ==UserScript==
// @name         Neopets: Daily Quest Links
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.6.0
// @description  Adds links to quickly complete daily quests. Updated Oct 2026!
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/dailyQuestLinks.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/dailyQuestLinks.js
// @match        *://*.neopets.com/questlog/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
..................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
    This userscript adds links to the description of each daily quest. That way you can complete them faster.
    Once you click "Purchase Items", you'll buy an Icy Snowball for 5NP. If you have to buy more than one item,
    a link to the General Store will be next to that one. You may buy a Blue Short Hair Brush for 50 NP there.
    Enjoy! Like all of my scripts, this is Unlicensed.

    Thank you Panda Crab for teaching me about MutationObserver, so many of my scripts are thanks to you

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆
..................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•
*/

const links = {
  "Purchase Item(s)":
    "https://www.neopets.com/faerieland/process_springs.phtml?obj_info_id=8428",
  "Spin the Wheel of Misfortune":
    "https://www.neopets.com/halloween/wheel/index.phtml",
  "Spin the Wheel of Excitement":
    "https://www.neopets.com/faerieland/wheel.phtml",
  "Spin the Wheel of Knowledge":
    "https://www.neopets.com/medieval/knowledge.phtml",
  "Spin the Wheel of Mediocrity":
    "https://www.neopets.com/prehistoric/mediocrity.phtml",
  "Customise your Neopet": "https://www.neopets.com/customise/",
  "Feed your Neopet": "https://www.neopets.com/safetydeposit.phtml?obj_name=&category=18",
  "Groom your Neopet":
    "https://www.neopets.com/safetydeposit.phtml?obj_name=&category=10",
  "Play a game": "https://www.neopets.com/games/favourites.phtml",
  "Fish at Ye Olde Fishing Vortex": "https://www.neopets.com/water/fishing.phtml",
  "Try on an NC Wearable": "https://ncmall.neopets.com/mall/search.phtml?type=browse&cat=43&page=1&limit=24",
  "Fight in the Battledome": "https://www.neopets.com/dome/fight.phtml",
  "Play with your Neopet": "https://www.neopets.com/safetydeposit.phtml?obj_name=&category=5",
  "Read to your Neopet": "https://www.neopets.com/safetydeposit.phtml?obj_name=&category=6",
  "View Popular NC Items": "https://ncmall.neopets.com/mall/search.phtml?type=popular_items&cat=54&page=1&limit=24",
  "Visit the NC Mall": "https://ncmall.neopets.com/mall/shop.phtml",
  "Grab an Omelette": "https://www.neopets.com/prehistoric/omelette.phtml",
  "Donate an Item": "https://www.neopets.com/inventory.phtml",
  "Deposit NP in the Bank": "https://www.neopets.com/bank.phtml",
  "Claim a Recycled Item": "https://www.neopets.com/medieval/rubbishdump.phtml",
  "Play Wise Old King": "https://www.neopets.com/medieval/wiseking.phtml",
  "Play Grumpy Old King": "https://www.neopets.com/medieval/grumpyking.phtml",
  "Discard an Item": "https://www.neopets.com/inventory.phtml",
  "Scratch a Scratchcard": "https://www.neopets.com/desert/sc/kiosk.phtml",
  "Vote in Customisation Spotlight": "https://www.neopets.com/spotlights/custompet/?tab=vote",
  // I couldn't get a source on the exact text on this one, so it probably doesn't work. I'll update when I get it
  "Claim your Bank Interest": "https://www.neopets.com/bank.phtml"
};

const makeLink = (quest) => {
  const text = quest.innerText;
  const url = links[text];
  if (!url) return;
  quest.innerHTML = `<a href="${url}">${text}</a>`;
  if (
    text === "Purchase Item(s)" &&
    document.querySelector(".ql-task-num").innerText[2] !== "1"
  ) {
    quest.insertAdjacentHTML(
      "beforeEnd",
      '<a href="https://www.neopets.com/generalstore.phtml"> (General Store)</a>',
    );
  }
};

const observe = (observer) => observer?.observe(document.getElementsByClassName('questlog-container')[0], { childList: true, subtree: true });

const editQuestLog = (observer) => {
  observer?.disconnect();
  const unprocessedQuests = document.querySelectorAll('.questlog-quest:not(.ql-tada, .ql-ff, :has(.ql-reward-newbie)) .ql-task-description:not(:has(a))');
  unprocessedQuests.forEach(quest => makeLink(quest));
  observe(observer);
}

(function () {
  "use strict";
    // waitForLogToLoad(processQuestLog); //processQuestLog is another function defined elsewhere
    editQuestLog();
    const observer = new MutationObserver(() => editQuestLog(observer));
    observe(observer);
})();
