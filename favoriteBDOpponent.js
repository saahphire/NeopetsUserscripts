// ==UserScript==
// @name         Neopets: Favorite Battledome Opponent
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      0.1.0
// @description  Allows you to favorite Battledome opponents so they'll be shown first in the list
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/favoriteBDOpponent.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/favoriteBDOpponent.js
// @match        *://*.neopets.com/dome/fight.phtml
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @grant        GM.setValue
// @grant        GM.getValue
// @license      The Unlicense
// ==/UserScript==

const removeFromArray = (arr, i) => arr.slice(0, i).concat(arr.slice(i + 1, arr.length));

const insertInOrder = (elementToInsert, id, elements) => {
    const bigger = elements.find(el => parseInt(el.dataset.oppid) > id);
    if(bigger) bigger.insertAdjacentElement("beforeBegin", elementToInsert);
    else elements[elements.length - 1].insertAdjacentElement("afterEnd", elementToInsert);
}

const addFavorite = (id) => {
    const originalRow = document.querySelector(`tr[data-oppid="${id}"]`);
    originalRow.dataset.saahfav = true;
    const favoriteRow = originalRow.cloneNode(true);
    const favoriteRows = [...document.querySelectorAll(".saah-favorites tr[data-oppid]")];
    if(favoriteRows.length === 0) {
        const tbody = document.querySelector(".saah-favorites tbody");
        tbody.children[0].remove();
        tbody.appendChild(favoriteRow);
    }
    else insertInOrder(favoriteRow, id, favoriteRows);
}

const toggleFavorite = async (event) => {
    let favorites = await GM.getValue("favorites", []);
    const id = parseInt(event.target.dataset.id);
    const index = favorites.findIndex(e => e === id);
    if(index !== -1) {
        favorites = removeFromArray(favorites, index);
        document.querySelector(`.saah-favorites tr[data-oppid="${id}"]`).remove();
        document.querySelector(`tr[data-oppid="${id}"]`).dataset.saahfav = false;
    }
    else {
        favorites.push(id);
        addFavorite(id);
    }
    GM.setValue("favorites", favorites.sort((a, b) => a - b));
}

const addButton = opponent => {
    const button = document.createElement("button");
    button.role = "button";
    button.addEventListener("click", toggleFavorite);
    button.classList.add("saah-favorite");
    button.dataset.id = opponent.dataset.oppid;
    opponent.getElementsByClassName("name")[0].appendChild(button);
}

const populateFavorites = async (tbody) => {
    const favorites = await GM.getValue("favorites", []);
    if(favorites.length === 0) tbody.insertAdjacentHTML("beforeEnd", '<tr class="npcRow"><td></td><td class="name">Nothing yet!</td><td></td><td></td></tr>');
    favorites.forEach(fav => {
        const favorite = document.querySelector(`tr[data-oppid="${fav}"]`);
        favorite.dataset.saahfav = true;
        tbody.appendChild(favorite.cloneNode(true));
    });
}

const createFavorites = () => {
    document.getElementsByClassName("filters")[0].insertAdjacentHTML("afterEnd", `<div class="saah-favorite-header"></div>
    <div class="npcContainer">
        ${css}
        <div class="borderUpper"></div>
        <div class="borderExpansion">
            <table class="npcTable saah-favorites">
                <thead></thead>
                <tbody></tbody>
            </table>
        </div>
        <div class="borderBottom"></div>
    </div>`);
    const thead = document.querySelector(".saah-favorites thead");
    thead.appendChild(document.getElementsByClassName("npcHeader")[0].cloneNode(true));
    thead.appendChild(document.getElementsByClassName("headerSeparator")[0].cloneNode(true));
    return document.querySelector(".saah-favorites tbody");
}

const init = async () => {
    document.querySelectorAll(".npcRow").forEach(addButton);
    const tbody = createFavorites();
    await populateFavorites(tbody);
}

const css = `<style>
#bdFightStep3UI div, #bdFightStep3UI, #bdFightStepContainer {
    position: relative;
}
#bdFightStep3UI {
    height: auto;
}
#bdFightStepContainer {
    height: 100%;
}
#bdFightStep3UI div#domeTitle, #bdFightStep3 div.npcContainer {
    top: 0;
}
.saah-favorite-header {
    background: url(data:image/png;base64,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);
    border-left: 2px solid black;
    height: 30px;
    width: 400px;
}
.saah-favorite {
    appearance: none;
    height: 15px;
    width: 17px;
    border: 0;
    cursor: pointer;
}
.saah-favorite, tr[data-saahfav="true"] .saah-favorite:hover {
    background-image: url("https://images.neopets.com/themes/h5/basic/images/fav-icon-false.svg");
}
.saah-favorite:hover, tr[data-saahfav="true"] .saah-favorite {
    background-image: url("https://images.neopets.com/themes/h5/basic/images/fav-icon-true.svg")
}

.npcContainer:has(.saah-favorites) {
    margin-bottom: 2em;
}

.npcTable { width: 540px; margin-left: 5px; border-collapse: collapse; }
.npcTable tr.npcHeader { background-color: #f8f2d0; height: 30px; }
.npcTable th, .npcTable td { border-left: 2px solid black; text-align: center; font-weight: bold; }
.npcTable th:first-child, .npcTable td:first-child { border-left: 0px; text-align: center; }
.npcTable tr.npcHeader th.diff { width: 75px; }
.npcTable tr.npcHeader th.tough { width: 151px; }

.npcTable tr.headerSeparator td { height: 4px; background-image: url(https://images.neopets.com/dome/pages/fight_smlframe_dome_seperator.png); text-align: center; background-position: -10px 0px; }

.npcTable td { height: 35px; border-bottom: 1px solid black; }

.npcTable div.oppImage { position: relative; width: 100px; height: 30px; margin: 2px; background-position: 0px 0px; }

.npcTable tr.npcRow.selectedPveNpc { background-color: #ffff80; }
.npcTable tr.npcRow td.diff { font-weight: normal; }
.npcTable tr.npcRow.selectedPveNpc td.diff { font-weight: bold; }
.npcTable tr.npcRow td.image { width: 110px; }
.npcTable tr.npcRow td.name { border-left: 0px; text-align: left; }

.npcTable div.tough { position: relative; width: 33px; height: 33px; display: inline-block; background-image: url(https://images.neopets.com/dome/pages/buttons/toughness.png); cursor: pointer; }
.npcTable div.tough1          { background-position:  -0px   0px; }
.npcTable div.tough1:hover    { background-position:  -0px -33px; }
.npcTable div.tough1.selected { background-position:  -0px -66px; }
.npcTable div.tough2          { background-position: -33px   0px; }
.npcTable div.tough2:hover    { background-position: -33px -33px; }
.npcTable div.tough2.selected { background-position: -33px -66px; }
.npcTable div.tough3          { background-position: -66px   0px; }
.npcTable div.tough3:hover    { background-position: -66px -33px; }
.npcTable div.tough3.selected { background-position: -66px -66px; }
</style>`;

(function() {
    'use strict';
    init();
})();
