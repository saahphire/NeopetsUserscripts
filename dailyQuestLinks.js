// ==UserScript==
// @name         Neopets: Daily Quest Links
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds links to quickly complete daily quests
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
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
  "Feed your Neopet": "https://www.neopets.com/inventory.phtml",
  "Groom your Neopet":
    "https://www.neopets.com/safetydeposit.phtml?obj_name=&category=10",
  "Play a game": "https://www.neopets.com/games/favourites.phtml",
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

const makeInterval = () => {
  const interval = setInterval(() => {
    const quests = document.querySelectorAll(".ql-task-description");
    if (quests.length < 1) return;
    quests.forEach((quest) => makeLink(quest));
    clearInterval(interval);
  }, 100);
};

(function () {
  "use strict";
  makeInterval();
  document
    .getElementsByClassName("tab-2")[0]
    .addEventListener("click", () => makeInterval());
})();
