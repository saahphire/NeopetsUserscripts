// ==UserScript==
// @name         Neopets: Quest Improvements
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      0.1.0
// @description  Adds an estimated value for the items requested of you in every quest. Also remembers and fills your Brain Tree answers.
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/questImprovements.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/questImprovements.js
// @match        *://*.neopets.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script is still in its testing phase! Testing random faerie quests is extremely hard. Use at your own risk!

    This script does the following:
    - Adds price estimates for every quest in the game
    - Adds a link on the quest page to the Shop Wizard as soon as you get the item, no need to refresh
    - Saves and the Brain Tree's answers that you got from Esophagor and fills them when you click their names
    - Adds a link from the Brain Tree to the Esophagor and another from the Esophagor to the Brain Tree
    
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
        url: 'quests.phtml',
        itemSelector: '',
        totalSelector: ''
    },
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
    if(!document.querySelector("div p b").textContent.startsWith("You've already")) document.querySelector('.container .button-default__2020.button-yellow__2020').insertAdjacentHTML("afterEnd", `<a class="button-default__2020 button-blue__2020 btn-single__2020" href="https://www.neopets.com/halloween/esophagor.phtml">To the Esophagor!</a>`);
    const inputs = document.getElementsByClassName("brain-input");
    if(inputs.length === 0) return;
    const [year, location] = await getBrainTree();
    addInfo(year, "answer_1");
    addInfo(location, "answer_2");
}

const addPricesToEsophagor = () => {
    if(document.querySelector(".quest_dialogue__2021 u")) setBrainTree(document.querySelector(".quest_dialogue__2021 u").textContent);
    if(!document.querySelector(".gotree")) document.querySelector('.container .button-default__2020.button-yellow__2020:not(.q-button__2020)')?.insertAdjacentHTML("afterEnd", `<a class="button-default__2020 button-blue__2020 btn-single__2020 gotree" href="https://www.neopets.com/halloween/braintree.phtml">To the Brain Tree!</a>`);
}

const onEsophagor = () => {
    addPricesToEsophagor();
    const observer = new MutationObserver(addPricesToEsophagor);
    observer.observe(document.getElementById("container__2020"), {childList: true, subtree: true});
}

const getItemValues = (items) => {
  return new Promise((total) =>
    Promise.all(
      items.map((item) => {
        const slug = slugify(item.name);
        return new Promise((price) =>
          fetch(`https://itemdb.com.br/api/v1/items/${slug}`).then((res) => {
            res.json().then((json) => price(json.price.value) * item.quantity).catch(() => total(-1));
          })
        );
      })
    ).then((prices) => total(prices.reduce((a, c) => a + c, 0).toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ',')))
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

const checkForFaerie = async () => {
    const re = document.getElementsByClassName("randomEvent")[0];
    if(!re || !re.innerText.match(/faerie /i)) return;
    const maybeItem = re.querySelector("p b");
    if(!maybeItem) return;
    const itemValue = await getItemValues([{name: maybeItem.textContent, quantity: 1}]);
    if(itemValue < 0) return;
    maybeItem.insertAdjacentHTML("afterEnd", ` (${itemValue} NP)`);
    parseItem(maybeItem, 0, []);
}

(function() {
    'use strict';
    checkForFaerie();
    const url = window.location.href;
    if(url.includes("halloween/braintree.phtml")) onBrainTree();
    else {
        const quest = quests.find(q => url.includes(q.url));
        if(quest) getTotal(quest);
        if(url.includes("esophagor")) onEsophagor();
    }
})();
