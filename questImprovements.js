// ==UserScript==
// @name         Neopets: Quest Improvements
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Adds an estimated value for the items requested of you in every quest. Also remembers and fills your Brain Tree answers.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/questImprovements.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/questImprovements.js
// @match        *://*.neopets.com/halloween/esophagor.phtml*
// @match        *://*.neopets.com/island/kitchen.phtml*
// @match        *://*.neopets.com/winter/snowfaerie.phtml*
// @match        *://*.neopets.com/halloween/witchtower.phtml*
// @match        *://*.neopets.com/space/coincidence.phtml*
// @match        *://*.neopets.com/halloween/braintree.phtml*
// @match        *://*.neopets.com/medieval/earthfaerie.phtml*
// @match        *://*.neopets.com/faerieland/darkfaerie.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script does the following:
    - Adds price estimates for every quest in the game
    - Adds a link on the quest page to the Shop Wizard as soon as you get the item, no need to refresh
    - Saves and fills the Brain Tree's answers that you got from Esophagor
    - Adds a button to go to the Brain Tree as soon as you finish your second Esophagor quest
    Note that random events with Faerie quests don't get price estimates, but the Quests page where you turn them in does.
    
    Price estimates are retrieved from itemDB. Please consider contributing by adding a simple userscript:
      https://itemdb.com.br/contribute

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const slugify = (name) => name.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-');

const quests = [
    {
        url: "halloween/esophagor.phtml",
        itemSelector: ".item-name, .ingredient-grid p b",
        totalSelector: "h2 b"
    },
    {
        url: "halloween/witchtower.phtml",
        itemSelector: ".item-name, .ingredient-grid p b",
        totalSelector: "h2 b"
    },
    {
        url: "winter/snowfaerie.phtml",
        itemSelector: ".ingredient-grid p b",
        totalSelector: "h2 b"
    },
    {
        url: "island/kitchen.phtml",
        itemSelector: ".item-name, .ingredient-grid p b",
        totalSelector: "h2 b"
    },
    {
        url: "space/coincidence.phtml",
        itemSelector: "#questItems td",
        totalSelector: "#panelPopups + p"
    },
    {
        // TODO
        url: "medieval/earthfaerie.phtml",
        itemSelector: ".item-name, .ingredient-grid p b",
        totalSelector: "h2 b"
    },
    {
        url: "faerieland/darkfaerie.phtml",
        itemSelector: "#dark-container p:first-of-type b",
        totalSelector: "#dark-container p:nth-child(5) b"
    }
];

const resetBrainTree = () => ["Year", "Location"].forEach(info => GM.setValue(`brainTree${info}`, ""));

const setBrainTree = (value) => GM.setValue(`brainTree${isNaN(parseInt(value)) ? 'Location' : 'Year'}`, value ?? "");

const getBrainTree = () => Promise.all(["Year", "Location"].map(async info => await GM.getValue(`brainTree${info}`, "")));

const addInfo = (info, selector) => {
    const goToEsophagor = `<a href="https://www.neopets.com/halloween/esophagor.phtml">Ask the Esophagor</a>`;
    const label = document.querySelector(`label[for="${selector}"]`);
    label.innerHTML += ` (${info ?? goToEsophagor})`;
    if(info) label.addEventListener("click", () => document.getElementById(selector).value = info);
}

const onBrainTree = async () => {
    const inputs = document.getElementsByClassName("brain-input");
    if(inputs.length === 0) return;
    const [year, location] = await getBrainTree();
    addInfo(year, "answer_1");
    addInfo(location, "answer_2");
}

const onEsophagor = () => {
    document.querySelector("h2 b")?.insertAdjacentHTML("afterEnd", '<a href="https://www.neopets.com/halloween/braintree.phtml" target="_blank"> (Brain Tree)</a>');
    const container = document.getElementById("container__2020");
    const observer = new MutationObserver(() => {
        if(document.querySelector(".quest_dialogue__2021 u")) setBrainTree(document.querySelector(".quest_dialogue__2021 u").textContent);
    });
    observer.observe(container, {childList: true, subtree: true});
}

const getItemValues = (items) => {
  return new Promise((total) =>
    Promise.all(
      items.map((item) => {
        const slug = slugify(item.name);
        return new Promise((price) =>
          fetch(`https://itemdb.com.br/api/v1/items/${slug}`).then((res) => {
            res.json().then((json) => price(json.price.value) * item.quantity);
          }),
        );
      }),
    ).then((prices) => total(prices.reduce((a, c) => a + c, 0)))
  );
};

const gotValidItems = (items) => items && items.length > 0 && !items[0].dataset.questFoundItems;

const parseItem = (item, index, quantities) => {
    const name = item.textContent.trim().replace(/(.+)x\d$/, "$1");
    const a = document.createElement("a");
    a.href = `https://www.neopets.com/shops/wizard.phtml?string=${encodeURIComponent(name).replaceAll("%20", "+")}`;
    a.target = "_blank";
    item.insertAdjacentElement("afterEnd", a);
    a.appendChild(item);
    return {
        name: name,
        quantity: quantities[index] ?? 1
    };
}

const getItems = (query) => {
    const rawItems = document.querySelectorAll(query);
    if(!gotValidItems(rawItems)) return;
    rawItems[0].dataset.questFoundItems = "true";
    const quantities = [...document.querySelectorAll("#questItems td b")].map(b => parseInt(b.textContent.replace("x", "")));
    return [...rawItems].map((item, index) => parseItem(item, index, quantities));
}

const searchForItems = async (quest) => {
    const items = getItems(quest.itemSelector);
    if(!items) return false;
    document.querySelector(quest.totalSelector).textContent += ` (${await getItemValues(items)} NP)`;
    return true;
}

const getTotal = async (quest) => {
    if(!(await searchForItems(quest))) {
        const container = document.getElementById("container__2020");
        const observer = new MutationObserver(() => searchForItems(quest));
        observer.observe(container, {childList: true, subtree: true});
    }
}

(function() {
    'use strict';
    const url = window.location.href;
    if(url.includes("halloween/braintree.phtml")) onBrainTree();
    else getTotal(quests.find(quest => url.includes(quest.url)));
    if(url.includes("esophagor")) onEsophagor();
})();
