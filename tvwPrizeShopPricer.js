// ==UserScript==
// @name         Neopets: TVW Prize Shop Pricer
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Uses itemDB's database to estimate the neopoint value (and NP per point) of each prize
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/tvwPrizeShopPricer.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/tvwPrizeShopPricer.js
// @match        *://*.neopets.com/tvw/rewards*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      Unlicense
// @grant        GM.setValue
// @grant        GM.getValue
// @require      https://update.greasyfork.org/scripts/567036/1759045/itemDB%20Fetch%20Lib.js
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds both a price estimate for each prize (according to itemDB) and a NP/point calculation using it.
    It also allows you to order prizes by points (default), NP value, or NP/point. Prizes for which you've already
    reached the redemption limit will be at the very end. Prizes with no itemDB price are considered to be worth 1NP for
    sorting purposes.

    Price estimates are retrieved from itemDB every three days and cached in your storage. Please note that any script
    using itemDB will only work if it's been less than 14 days (if you're logged in) or 24 hours (if you aren't) since
    the last time you've accessed the website.

    If you can, consider contributing to itemDB by installing an invisible script: https://itemdb.com.br/contribute

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const isFetchDue = async () => Date.now() - (await GM.getValue('timestamp', 1)) >= 1000 * 60 * 60 * 24 * 3;
const saveFetchDate = () => GM.setValue('timestamp', Date.now());
// eslint-disable-next-line no-undef
const fetchPrices = () => fetchItemDb('https://itemdb.com.br/api/v1/lists/official/the-void-within-prize-shop/itemdata', 'TVW Prize Shop Pricer');
const mapPrices = (priceData) => priceData.reduce((agg, curr) => ({...agg, [curr.name]: curr.price?.value}), undefined);
const addCommasToThousands = (number) => number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const savePrices = (prices) => {
    GM.setValue('prices', prices);
    saveFetchDate();
    return prices;
}

const getPrices = async () => (await isFetchDue()) ? savePrices(mapPrices(await fetchPrices())) : GM.getValue('prices');

const addPriceToCell = (cell, price) => {
    const priceParagraph = document.createElement('p');
    priceParagraph.classList.add('plothub-item-price');
    priceParagraph.textContent = `${price ? addCommasToThousands(price) : '???'} NP`;
    cell.appendChild(priceParagraph);
    cell.dataset.itemdbValue = price ?? -1;
}

const addNpPerPointsToCell = (cell, npPerPoints) => {
    const npPerPointsParagraph = document.createElement('p');
    npPerPointsParagraph.classList.add('plothub-item-name');
    npPerPointsParagraph.textContent = `${npPerPoints ? addCommasToThousands(Math.round(npPerPoints)) : '???'} NP/points`;
    cell.appendChild(npPerPointsParagraph);
    cell.dataset.npPerPoints = npPerPoints ?? -1;
}

const assignPricesToCells = async () => {
    const prices = await getPrices();
    const cells = document.querySelectorAll('.plothub-shop-item');
    cells.forEach(cell => {
        const name = cell.getElementsByClassName('plothub-item-name')[0].textContent;
        const price = prices[name];
        addPriceToCell(cell, price);
        const npPerPoints = price ? price / parseInt(cell.dataset.price) : undefined;
        addNpPerPointsToCell(cell, npPerPoints);
    })
}

const isMaxBought = (item) => item.getElementsByClassName('plothub-max-buy')[0]?.textContent.match(/(\d+)\/\1/)

const sortByDataset = (a, b, direction, property) => isMaxBought(a) ? 1 : isMaxBought(b) ? -1 : parseInt((direction === 'asc' ? a : b).dataset[property]) - parseInt((direction === 'asc' ? b : a).dataset[property])

const sortItems = (event, datasetProperty) => {
    const direction = event.target.dataset.direction === 'asc' ? 'desc' : 'asc';
    document.querySelectorAll('.saahphire-tvw-prize-shop-pricer button').forEach(button => {
        button.dataset.state = 'off';
        button.dataset.direction = 'asc';
    });
    event.target.dataset.direction = direction;
    event.target.dataset.state = 'on';
    [...document.getElementsByClassName('plothub-shop-item')]
        .sort((a, b) => sortByDataset(a, b, direction, datasetProperty))
        .forEach(item => document.getElementsByClassName('plothub-prize-list')[0].appendChild(item));
}

const addSortButton = (text, datasetProperty) => {
    const button = document.createElement('button');
    button.textContent = text;
    button.dataset.state = 'off';
    button.dataset.direction = 'asc';
    button.addEventListener('click', (e) => sortItems(e, datasetProperty));
    return button;
}

const addSorting = () => {
    const wrapper = document.createElement('div');
    document.getElementsByClassName('plothub-prize-points')[0].insertAdjacentElement('afterend', wrapper);
    wrapper.classList.add('saahphire-tvw-prize-shop-pricer');
    const h3 = document.createElement('h3');
    h3.textContent = 'Sort by:';
    wrapper.appendChild(h3);
    const pointsButton = addSortButton('Points', 'price');
    pointsButton.dataset.state = 'on';
    wrapper.appendChild(pointsButton);
    wrapper.appendChild(addSortButton('NP', 'itemdbValue'));
    wrapper.appendChild(addSortButton('NP/Points', 'npPerPoints'));
}

const css = `<style>
.plothub-item-name:last-child, .plothub-item-price:nth-last-child(2) {
    color: #301F86!important;
    margin: 0!important;
}

.saahphire-tvw-prize-shop-pricer {
    display: flex;
    justify-content: center;
    gap: 1em;
    align-items: center;

    & h3 {
        margin: 0;
        color: #fff;
        font-family: Cafeteria, Arial, sans-serif;
    }

    & button {
        appearance: none;
        font-family: Cafeteria, Arial, sans-serif;
        background-color: #EC83FF;
        border: 2px solid #fff;
        box-shadow: 0 0 10px #FF46FF;
        cursor: pointer;
        border-radius: 10px;
        color: #5A0FD2;
        font-size: 12pt;
        font-weight: bold;
        padding: 0.25em 0.5em;

        &::after {
            content: "–";
            margin-left: 0.5em;
            font-size: 10pt;
            display: inline-block;
            width: 1em;
        }

        &[data-state="on"] {
            &[data-direction="asc"]::after {
                content: "⮝";
            }
            &[data-direction="desc"]::after {
                content: "⮟";
            }
        }
    }
}
</style>`;

(function() {
    'use strict';
    document.head.insertAdjacentHTML('beforeend', css);
    assignPricesToCells();
    addSorting();
})();
