// ==UserScript==
// @name         Neopets: Sorter for Safety Deposit Box
// @namespace    https://github.com/saahphire/NeopetsUserscripts
// @version      1.0.0
// @description  Allows you to click on each column header on your Safety Deposit Box to sort that page by its values
// @author       saahphire
// @homepageURL  https://github.com/saahphire/NeopetsUserscripts
// @homepage     https://github.com/saahphire/NeopetsUserscripts
// @downloadURL  https://github.com/saahphire/NeopetsUserscripts/blob/main/sorterForSafetyDepositBox.js
// @updateURL    https://github.com/saahphire/NeopetsUserscripts/blob/main/sorterForSafetyDepositBox.js
// @match        *://*.neopets.com/safetydeposit.phtml*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=neopets.com
// @license      The Unlicense
// @run-at       document-idle
// ==/UserScript==

/*
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
........................................................................................................................
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
    This script adds buttons to all SDB columns so you can sort by their values. Works with itemDB's SDB pricer.

    ✦ ⌇ saahphire
☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦ ⠂⠄⠄⠂⠁⠁⠂⠄⠂⠄⠄⠂☆ ⠂⠄⠄⠂⠁⠁⠂⠄⠄⠂✦
........................................................................................................................
•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•:•:•:•:•:•:•:•.•:•.•:•:•:•:•:•:•:••:•.•:•.•:•.•:•:•:•:•:•:•:•:•.•:•:•.•:•.••:•.•:•.••:
*/

const numberSorter = (a, b) => a - b
const textSorter = (a, b) =>  a.trim().localeCompare(b.trim())

const sorters = {
    'Image': {
        retrieveDataToSort: row => row.querySelector('img[width="80"]').src,
        sorter: textSorter
    },
    'Name': {
        retrieveDataToSort: row => row.querySelector('td[align="left"] b').textContent,
        sorter: textSorter
    },
    'Description': {
        retrieveDataToSort: row => row.querySelector('td[width="350"] i').textContent,
        sorter: textSorter
    },
    'Type': {
        retrieveDataToSort: row => row.querySelector('td[width="350"] ~ td[align="left"] b').textContent,
        sorter: textSorter
    },
    'Price': {
        retrieveDataToSort: row => parseInt(row.querySelector('[width="150px"] a').textContent.match(/\d+/g)?.join('') || 0),
        sorter: numberSorter
    },
    'Qty': {
        retrieveDataToSort: row => parseInt(row.querySelector('td[align="center"]:not([width="150px"]) b').textContent),
        sorter: numberSorter
    },
    'Remove?': {
        retrieveDataToSort: row => parseInt(row.querySelector('.remove_safety_deposit').name.match(/\d+/)[0]),
        sorter: numberSorter
    }
}

const states = ["asc", "desc", "off", "asc"];

const sortRow = (rowA, rowB, sortMethods, state) => {
    const a = sortMethods.retrieveDataToSort(rowA);
    const b = sortMethods.retrieveDataToSort(rowB);
    if(state === "off") return a;
    if(state === "desc") return sortMethods.sorter(b, a);
    return sortMethods.sorter(a, b);
}

const changeHeaderState = header => {
    const nextState = states[states.findIndex(state => state === header.dataset.state) + 1];
    header.dataset.state = nextState;
    header.dataset.timestamp = new Date().getTime();
}

const sortColumns = () => {
    const sibling = document.querySelector('[cellpadding="4"] tr:is([bgcolor="silver"], [bgcolor="#E4E4E4"], [bgcolor="#DFEAF7"])');
    let rows = [...document.querySelectorAll('[cellpadding="4"] script ~ tr:is([bgcolor="#F6F6F6"], [bgcolor="#FFFFFF"])')];
    [...document.querySelectorAll('[cellpadding="4"] tr:not(:has(th)) td.contentModuleHeaderAlt')]
        .map(header => [header.dataset.state, sorters[header.textContent.trim()], parseInt(header.dataset.timestamp), header])
        .concat([['asc', sorters['Remove?'], -1]])
        .sort((a, b) => a[2] - b[2])
        .forEach(([state, sortMethods]) => rows = rows.sort((a, b) => sortRow(a, b, sortMethods, state)));
    rows.forEach(row => sibling.insertAdjacentElement('beforebegin', row));
}

const onHeaderClick = (e) => {
    const header = e.target.classList.contains("contentModuleHeaderAlt") ? e.target : e.target.parentElement;
    changeHeaderState(header);
    sortColumns();
}

const addColumnSorterToHeader = header => {
    header.addEventListener('click', onHeaderClick);
    header.dataset.state = 'off';
    header.dataset.timestamp = 0;
}

const addColumnSorters = () => {
    document.querySelectorAll('[cellpadding="4"] tr:not(:has(th)) td.contentModuleHeaderAlt').forEach(addColumnSorterToHeader);
    const observer = new MutationObserver(() => {
        const itemDBHeader = document.querySelector('[cellpadding="4"] tr:not(:has(th)) td.contentModuleHeaderAlt:has([width="25px"])');
        if(itemDBHeader) {
            observer.disconnect();
            addColumnSorterToHeader(itemDBHeader);
        }
    });
    observer.observe(document.querySelector('[cellpadding="4"] tr:not(:has(th)):has(td.contentModuleHeaderAlt)'), {childList: true});
}

const init = () => {
    document.head.insertAdjacentHTML("beforeEnd", `<style>${css}</style>`);
    addColumnSorters();
}

const css = `
td.contentModuleHeaderAlt {
  text-align: center;
}

.contentModuleHeaderAlt[data-state] {
  cursor: pointer;
  position: relative;
  height: 3.5em;
}

.contentModuleHeaderAlt[data-state]:hover {
  text-decoration: underline;
}

.contentModuleHeaderAlt::before {
  display: inline-block;
  position: absolute;
  top: 0.25em;
  left: 0;
  width: 100%;
  text-align: center;
}

.contentModuleHeaderAlt[data-state="off"]::before {
  content: "-";
}

.contentModuleHeaderAlt[data-state="asc"]::before {
  content: "▲";
}

.contentModuleHeaderAlt[data-state="desc"]::before {
  content: "▼";
}
`;

(function() {
    'use strict';
    init();
})();
